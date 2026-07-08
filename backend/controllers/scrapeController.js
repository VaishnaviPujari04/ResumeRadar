import fetch from "node-fetch";
import * as cheerio from "cheerio";

async function extractJdWithAI(rawText) {
  try {
    const groqRes = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "user",
              content: `You are a job description extractor. From the following raw webpage text, extract ONLY the job description content including: job title, role overview, responsibilities, requirements, qualifications, and skills. Remove all navigation, headers, footers, cookie notices, and unrelated content. Return only the clean job description text. If no job description is found, return the most relevant professional content you can find.\n\nRAW TEXT:\n${rawText.slice(0, 6000)}`,
            },
          ],
          temperature: 0.1,
          max_tokens: 1500,
        }),
      }
    );
    const data = await groqRes.json();
    const result = data.choices?.[0]?.message?.content?.trim() || "";
    return result;
  } catch (err) {
    console.error("AI extraction failed:", err.message);
    return "";
  }
}

function extractLinkedInJobId(url) {
  const patterns = [
    /\/jobs\/view\/(\d+)/,
    /currentJobId=(\d+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

async function scrapeLinkedIn(url) {
  const jobId = extractLinkedInJobId(url);
  if (!jobId) throw new Error("Could not extract LinkedIn Job ID. Try opening the direct job page.");

  const apiUrl = `https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/${jobId}`;
  const response = await fetch(apiUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
  });

  const html = await response.text();
  const $ = cheerio.load(html);
  $("script, style").remove();

  let jobText = "";
  const selectors = [
    ".show-more-less-html__markup",
    ".description__text",
    ".job-description",
    "section.description",
    ".decorated-job-posting__details",
  ];

  for (const selector of selectors) {
    const el = $(selector);
    if (el.length > 0 && el.text().trim().length > 100) {
      jobText = el.text().trim();
      break;
    }
  }

  if (!jobText || jobText.length < 200) {
    const bodyText = $("body").text().trim();
    jobText = await extractJdWithAI(bodyText);
  }

  return jobText;
}

async function scrapeGeneric(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      "Cache-Control": "no-cache",
    },
  });

  if (!response.ok) {
    throw new Error(`Could not access this page (status ${response.status}). Try copying the JD manually.`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  $("script, style, nav, header, footer, iframe, noscript").remove();

  let jobText = "";

  const selectors = [
    // Naukri
    ".job-desc", ".dang-inner-html", "#job_description",
    // Indeed
    "#jobDescriptionText", ".jobsearch-jobDescriptionText",
    // Glassdoor
    ".jobDescriptionContent", "[data-test='jobDescriptionContent']",
    // Internshala
    ".internship_details", ".job_details",
    // Shine, Monster etc
    ".job-description", ".jobDescription", ".job_description",
    // Generic
    "[class*='description']", "[class*='job-detail']",
    "[id*='description']", "[id*='job-detail']",
    "article", "main",
  ];

  for (const selector of selectors) {
    const el = $(selector);
    if (el.length > 0 && el.text().trim().length > 200) {
      jobText = el.text().trim();
      break;
    }
  }

  // Always run AI fallback — it cleans up whatever we got OR extracts from body
  const bodyText = jobText.length > 200
    ? jobText
    : $("body").text().trim();

  const aiResult = await extractJdWithAI(bodyText);
  if (aiResult && aiResult.length > jobText.length) {
    jobText = aiResult;
  }

  return jobText;
}

export async function scrapeJobDescription(req, res) {
  const { url } = req.body;

  if (!url?.trim()) {
    return res.status(400).json({ message: "URL is required" });
  }

  try {
    new URL(url);
  } catch {
    return res.status(400).json({ message: "Invalid URL format" });
  }

  try {
    let jobText = "";

    if (url.includes("linkedin.com")) {
      jobText = await scrapeLinkedIn(url);
    } else {
      jobText = await scrapeGeneric(url);
    }

    // Clean whitespace
    jobText = jobText
      .replace(/\t/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/ {2,}/g, " ")
      .trim();

    if (!jobText || jobText.length < 50) {
      return res.status(400).json({
        message: "Could not extract job description from this page. Please switch to 'Type Manually' and paste the JD.",
        tooShort: true,
      });
    }

    const trimmed = jobText.slice(0, 4000);
    res.json({
      message: "Job description extracted",
      jobDescription: trimmed,
      charCount: trimmed.length,
    });
  } catch (err) {
    console.error("Scrape error:", err.message);
    res.status(500).json({
      message: err.message || "Failed to extract job description. Try copying the JD manually.",
    });
  }
}