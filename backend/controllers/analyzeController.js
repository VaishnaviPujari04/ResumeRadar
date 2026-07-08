import Analysis from "../models/Analysis.js";
import { extractTextFromFile } from "../utils/extractText.js";

// ============================================================
// GROQ API CALLER
// ============================================================
async function callGroq(prompt) {
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
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    },
  );
  const data = await groqRes.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI returned empty response");
  return content;
}

// ============================================================
// BUILD PROMPT
// ============================================================
function buildPrompt(jobDescription, resumeText) {
  // Clean JD of common web noise
  const cleanJD = jobDescription
    .replace(
      /save this job|unsave this job|share this job|copy link|sign in|sign up|apply now|easy apply|job no\./gi,
      "",
    )
    .replace(/\n{3,}/g, "\n\n")
    .replace(/ {2,}/g, " ")
    .trim();

  return `You are an expert ATS (Applicant Tracking System) and resume coach.

Analyze the following resume against the job description carefully. Give an honest, accurate match score based on how well the resume matches THIS specific role.

Respond ONLY with a valid JSON object. No explanation, no markdown, no backticks — just raw JSON.

Rules:
- matchScore: honest 0-100 score based on keyword match, skills, experience relevance
- missingKeywords: specific technical skills, tools, certifications from JD not in resume (max 10)
- strengths: specific things in the resume that match this JD well (3-4 points)
- suggestions: concrete actionable improvements for this specific role (3-4 points)

JSON structure:
{
  "matchScore": <number 0-100>,
  "missingKeywords": [<specific missing skills/keywords>],
  "strengths": [<specific matching strengths>],
  "suggestions": [<specific actionable improvements>]
}

JOB DESCRIPTION:
${cleanJD.slice(0, 2500)}

RESUME:
${resumeText.slice(0, 2500)}`;
}

// ============================================================
// PARSE GROQ RESPONSE
// ============================================================
function parseGroqResponse(rawText) {
  try {
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    // Try to extract JSON block if there's extra text around it
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Failed to parse AI response. Please try again.");
  }
}

// ============================================================
// POST /api/analyze — text-based analysis
// ============================================================
export async function analyzeResume(req, res) {
  const { resumeText, jobDescription } = req.body;

  if (!resumeText || !jobDescription) {
    return res
      .status(400)
      .json({ message: "Resume and job description are required" });
  }

  try {
    const prompt = buildPrompt(jobDescription, resumeText);
    const rawText = await callGroq(prompt);
    const result = parseGroqResponse(rawText);

    const analysis = await Analysis.create({
      userId: req.user.id,
      jobDescription: jobDescription.slice(0, 3000),
      resumeText,
      result,
    });

    res.status(201).json({
      message: "Analysis complete",
      analysisId: analysis._id,
      result,
    });
  } catch (err) {
    console.error("analyzeResume error:", err.message);
    res.status(500).json({ message: "Analysis failed", error: err.message });
  }
}

// ============================================================
// POST /api/analyze/upload — file-based analysis
// ============================================================
export async function analyzeResumeFile(req, res) {
  const { jobDescription } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "Resume file is required" });
  }
  if (!jobDescription?.trim()) {
    return res.status(400).json({ message: "Job description is required" });
  }

  try {
    // Extract text from uploaded PDF/DOCX
    const resumeText = await extractTextFromFile(
      req.file.buffer,
      req.file.mimetype,
    );

    if (!resumeText || resumeText.trim().length < 30) {
      return res.status(400).json({
        message:
          "Couldn't extract readable text from this file. Try a different file.",
      });
    }

    // Clean JD before analysis and storage
    const cleanedJD = jobDescription
      .replace(
        /save this job|unsave this job|share this job|copy link|sign in|sign up|apply now|easy apply|job no\./gi,
        "",
      )
      .replace(/\n{3,}/g, "\n\n")
      .replace(/ {2,}/g, " ")
      .trim();

    const prompt = buildPrompt(cleanedJD, resumeText);
    const rawText = await callGroq(prompt);
    const result = parseGroqResponse(rawText);

    const analysis = await Analysis.create({
      userId: req.user.id,
      jobDescription: cleanedJD.slice(0, 3000), // store cleaned version
      resumeText,
      result,
    });

    res.status(201).json({
      message: "Analysis complete",
      analysisId: analysis._id,
      extractedResumeText: resumeText,
      result,
    });
  } catch (err) {
    console.error("analyzeResumeFile error:", err.message);
    res.status(500).json({ message: "Analysis failed", error: err.message });
  }
}

// ============================================================
// GET /api/analyze/history
// ============================================================
export async function getHistory(req, res) {
  try {
    const analyses = await Analysis.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select("result.matchScore jobDescription createdAt");
    res.json(analyses);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
}

// ============================================================
// GET /api/analyze/history/:id
// ============================================================
export async function getAnalysisById(req, res) {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found" });
    }
    res.json(analysis);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch analysis" });
  }
}
