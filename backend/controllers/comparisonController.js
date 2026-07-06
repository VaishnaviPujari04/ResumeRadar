import Comparison from "../models/Comparison.js";
import { extractTextFromFile } from "../utils/extractText.js";

async function compareWithGroq(textA, textB, jobDescription) {
  const prompt = `
You are an expert ATS specialist and resume evaluator.

Compare these TWO resumes against the same job description. Score them RELATIVE to each other — meaning if one is clearly stronger, reflect that in the scores. Do NOT give similar scores unless they are genuinely equal in quality.

Evaluate based on:
- Keyword match with the JD (most important)
- Relevant experience and skills
- Quantified achievements
- Role-specific technical skills
- Overall alignment with the job requirements

Respond ONLY with a valid JSON object. No markdown, no backticks, no explanation.

{
  "resumeA": {
    "matchScore": <number 0-100>,
    "missingKeywords": [<keywords from JD missing in Resume A>],
    "strengths": [<3 specific strengths of Resume A for this role>],
    "suggestions": [<3 specific improvements for Resume A>]
  },
  "resumeB": {
    "matchScore": <number 0-100>,
    "missingKeywords": [<keywords from JD missing in Resume B>],
    "strengths": [<3 specific strengths of Resume B for this role>],
    "suggestions": [<3 specific improvements for Resume B>]
  },
  "reasoning": "<2 sentence explanation of why one scores higher than the other>"
}

JOB DESCRIPTION:
${jobDescription}

RESUME A:
${textA.slice(0, 2000)}

RESUME B:
${textB.slice(0, 2000)}
`;

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
        temperature: 0.2, // lower = more deterministic, less wishy-washy
      }),
    }
  );

  const groqData = await groqRes.json();
  const rawText = groqData.choices?.[0]?.message?.content;
  if (!rawText) throw new Error("AI returned empty response");

  const cleaned = rawText.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

// POST /api/compare
export async function compareResumes(req, res) {
  const { jobDescription } = req.body;
  const files = req.files;

  if (!files?.resumeA?.[0] || !files?.resumeB?.[0]) {
    return res.status(400).json({ message: "Both resume files are required" });
  }
  if (!jobDescription?.trim()) {
    return res.status(400).json({ message: "Job description is required" });
  }

  try {
    // Extract text from both resumes in parallel
    const [textA, textB] = await Promise.all([
      extractTextFromFile(files.resumeA[0].buffer, files.resumeA[0].mimetype),
      extractTextFromFile(files.resumeB[0].buffer, files.resumeB[0].mimetype),
    ]);

    if (textA.trim().length < 30) {
      return res.status(400).json({ message: "Couldn't extract text from Resume A" });
    }
    if (textB.trim().length < 30) {
      return res.status(400).json({ message: "Couldn't extract text from Resume B" });
    }

    // Single prompt comparing both resumes together
    const comparison = await compareWithGroq(textA, textB, jobDescription);

    const { resumeA: resultA, resumeB: resultB, reasoning } = comparison;

    // 5 point threshold for tie
    let winner = "tie";
    if (resultA.matchScore > resultB.matchScore + 5) winner = "A";
    else if (resultB.matchScore > resultA.matchScore + 5) winner = "B";

    const saved = await Comparison.create({
      userId: req.user.id,
      jobDescription,
      resumeA: {
        filename: files.resumeA[0].originalname,
        resumeText: textA,
        result: resultA,
      },
      resumeB: {
        filename: files.resumeB[0].originalname,
        resumeText: textB,
        result: resultB,
      },
      winner,
    });

    res.status(201).json({
      message: "Comparison complete",
      comparisonId: saved._id,
      winner,
      reasoning,
      resumeA: {
        filename: files.resumeA[0].originalname,
        result: resultA,
      },
      resumeB: {
        filename: files.resumeB[0].originalname,
        result: resultB,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Comparison failed", error: err.message });
  }
}

// GET /api/compare/history
export async function getComparisonHistory(req, res) {
  try {
    const comparisons = await Comparison.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select("resumeA.filename resumeB.filename resumeA.result.matchScore resumeB.result.matchScore winner createdAt");
    res.json(comparisons);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
}