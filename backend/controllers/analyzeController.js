import Analysis from "../models/Analysis.js";
import { extractTextFromFile } from "../utils/extractText.js";
import { askGroq } from "../services/groqService.js";

// POST /api/analyze/upload
export async function analyzeResumeFile(req, res) {
  const { jobDescription } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "Resume file is required" });
  }
  if (!jobDescription?.trim()) {
    return res.status(400).json({ message: "Job description is required" });
  }

  try {
    // Extract text from uploaded file
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

    // Reuse the same analysis logic
    const prompt = `
You are an expert ATS (Applicant Tracking System) and resume coach.

Analyze the following resume against the job description and respond ONLY with a valid JSON object. No explanation, no markdown, no backticks — just raw JSON.

The JSON must follow this exact structure:
{
  "matchScore": <number between 0 and 100>,
  "missingKeywords": [<list of important keywords from JD missing in resume>],
  "strengths": [<list of 3-4 things the resume does well for this JD>],
  "suggestions": [<list of 3-4 specific actionable improvements>]
}

JOB DESCRIPTION:
${jobDescription}

RESUME:
${resumeText}
`;

    const rawText = await askGroq(prompt);
    const result = JSON.parse(rawText);

    const analysis = await Analysis.create({
      userId: req.user.id,
      jobDescription,
      resumeText,
      result,
    });

    res.status(201).json({
      message: "Analysis complete",
      analysisId: analysis._id,
      extractedResumeText: resumeText, // send back so frontend can show/edit it
      result,
    });
  } catch (err) {
    res.status(500).json({ message: "Analysis failed", error: err.message });
  }
}

export async function analyzeResume(req, res) {
  const { resumeText, jobDescription } = req.body;

  if (!resumeText || !jobDescription) {
    return res
      .status(400)
      .json({ message: "Resume and job description are required" });
  }

  try {
    const prompt = `
You are an expert ATS (Applicant Tracking System) and resume coach.

Analyze the following resume against the job description and respond ONLY with a valid JSON object. No explanation, no markdown, no backticks — just raw JSON.

The JSON must follow this exact structure:
{
  "matchScore": <number between 0 and 100>,
  "missingKeywords": [<list of important keywords from JD missing in resume>],
  "strengths": [<list of 3-4 things the resume does well for this JD>],
  "suggestions": [<list of 3-4 specific actionable improvements>]
}

JOB DESCRIPTION:
${jobDescription}

RESUME:
${resumeText}
`;

    // Call Groq API
    const rawText = await askGroq(prompt);
    const result = JSON.parse(rawText);

    // Save to MongoDB
    const analysis = await Analysis.create({
      userId: req.user.id,
      jobDescription,
      resumeText,
      result,
    });

    res.status(201).json({
      message: "Analysis complete",
      analysisId: analysis._id,
      result,
    });
  } catch (err) {
    res.status(500).json({ message: "Analysis failed", error: err.message });
  }
}

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
