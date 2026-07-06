import CoverLetter from "../models/CoverLetter.js";
import Analysis from "../models/Analysis.js";

// POST /api/cover-letter/generate
export async function generateCoverLetter(req, res) {
  const { analysisId, companyName, jobTitle } = req.body;

  if (!analysisId) {
    return res.status(400).json({ message: "Analysis ID is required" });
  }

  try {
    // Fetch the analysis
    const analysis = await Analysis.findOne({
      _id: analysisId,
      userId: req.user.id,
    });

    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found" });
    }

    const prompt = `
You are an expert career coach and professional cover letter writer.

Write a compelling, personalized cover letter based on the resume and job description below.

Guidelines:
- Professional but warm tone
- 3-4 paragraphs: opening hook, relevant experience, why this company, call to action
- Highlight specific skills from the resume that match the JD
- Do NOT use generic filler phrases like "I am writing to apply"
- Make it sound human, confident and specific
- Keep it under 400 words
${companyName ? `- Address it to ${companyName}` : ""}
${jobTitle ? `- The role is: ${jobTitle}` : ""}

Respond with ONLY the cover letter text. No subject line, no labels, no markdown.

JOB DESCRIPTION:
${analysis.jobDescription}

RESUME:
${analysis.resumeText}
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
          temperature: 0.7,
        }),
      }
    );

    const groqData = await groqRes.json();
    const coverLetterText = groqData.choices?.[0]?.message?.content;

    if (!coverLetterText) {
      return res.status(500).json({ message: "AI returned empty response" });
    }

    // Save to DB
    const saved = await CoverLetter.create({
      userId: req.user.id,
      analysisId,
      jobDescription: analysis.jobDescription,
      resumeText: analysis.resumeText,
      coverLetter: coverLetterText,
      companyName: companyName || "",
      jobTitle: jobTitle || "",
    });

    res.status(201).json({
      message: "Cover letter generated",
      coverLetterId: saved._id,
      coverLetter: coverLetterText,
    });
  } catch (err) {
    res.status(500).json({ message: "Generation failed", error: err.message });
  }
}

// GET /api/cover-letter/history
export async function getCoverLetterHistory(req, res) {
  try {
    const letters = await CoverLetter.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select("companyName jobTitle createdAt coverLetter");

    res.json(letters);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
}

// GET /api/cover-letter/:id
export async function getCoverLetterById(req, res) {
  try {
    const letter = await CoverLetter.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!letter) {
      return res.status(404).json({ message: "Cover letter not found" });
    }

    res.json(letter);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch cover letter" });
  }
}