import axios from "axios";
import * as cheerio from "cheerio";
import { askGroq } from "../services/groqService.js";

export const extractJobDescription = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        message: "Job URL is required",
      });
    }

    // Fetch webpage
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/137.0 Safari/537.36",
      },
      timeout: 15000,
    });

    // Load HTML
    const $ = cheerio.load(data);

    // Remove unwanted elements
    $("script").remove();
    $("style").remove();
    $("noscript").remove();
    $("svg").remove();
    $("header").remove();
    $("footer").remove();
    $("nav").remove();

    // Extract all visible text
    const pageText = $("body")
      .text()
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 20000);

    const prompt = `
You are an expert recruiter.

Below is raw text extracted from a careers webpage.

Extract ONLY the job information.

Return ONLY valid JSON.

{
  "title":"",
  "company":"",
  "location":"",
  "experience":"",
  "employmentType":"",
  "skills":[],
  "jobDescription":"",
  "responsibilities":[],
  "requirements":[]
}

RAW PAGE:

${pageText}
`;

    const raw = await askGroq(prompt);

    const result = JSON.parse(raw);

    res.json(result);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message:
        "Unable to extract the job details. Some websites may block automated access.",
    });
  }
};