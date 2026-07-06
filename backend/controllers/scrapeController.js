import fetch from "node-fetch";
import * as cheerio from "cheerio";

// POST /api/scrape
export async function scrapeJobDescription(req, res) {
  const { url } = req.body;

  if (!url?.trim()) {
    return res.status(400).json({ message: "URL is required" });
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ message: "Invalid URL format" });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      timeout: 10000,
    });

    if (!response.ok) {
      return res.status(400).json({ message: `Could not fetch the page (status ${response.status}). Try copying the JD manually.` });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove unwanted elements
    $("script, style, nav, header, footer, iframe, img, svg, button, form").remove();

    let jobText = "";

    // Try platform-specific selectors first
    const selectors = [
      // LinkedIn
      ".description__text",
      ".show-more-less-html__markup",
      // Naukri
      ".job-desc",
      ".dang-inner-html",
      // Indeed
      "#jobDescriptionText",
      ".jobsearch-jobDescriptionText",
      // Glassdoor
      ".jobDescriptionContent",
      "[data-test='jobDescriptionContent']",
      // Internshala
      ".internship_details",
      ".job_details",
      // Generic fallbacks
      "[class*='description']",
      "[class*='job-detail']",
      "[class*='job_detail']",
      "article",
      "main",
    ];

    for (const selector of selectors) {
      const el = $(selector);
      if (el.length > 0) {
        jobText = el.first().text().trim();
        if (jobText.length > 200) break; // found good content
      }
    }

    // Last resort — grab all body text
    if (jobText.length < 200) {
      jobText = $("body").text().trim();
    }

    // Clean up whitespace
    jobText = jobText
      .replace(/\t/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/ {2,}/g, " ")
      .trim();

    if (jobText.length < 100) {
      return res.status(400).json({
        message: "Couldn't extract job description from this page. This site may block scraping — try copying the JD manually.",
      });
    }

    // Trim to reasonable length for AI
    const trimmed = jobText.slice(0, 4000);

    res.json({
      message: "Job description extracted",
      jobDescription: trimmed,
      charCount: trimmed.length,
    });
  } catch (err) {
    if (err.name === "AbortError" || err.message.includes("timeout")) {
      return res.status(408).json({ message: "Request timed out. The site took too long to respond." });
    }
    res.status(500).json({ message: "Scraping failed", error: err.message });
  }
}