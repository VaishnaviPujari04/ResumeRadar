import InterviewPrep from "../models/InterviewPrep.js";
import Analysis from "../models/Analysis.js";

// POST /api/interview/generate
export async function generateQuestions(req, res) {
  const { analysisId } = req.body;

  if (!analysisId) {
    return res.status(400).json({ message: "Analysis ID is required" });
  }

  try {
    const analysis = await Analysis.findOne({
      _id: analysisId,
      userId: req.user.id,
    });

    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found" });
    }

    const prompt = `
You are an expert technical interviewer and career coach.

Based on the job description and resume below, generate 10 likely interview questions this candidate would face.

Mix of categories:
- 4 Technical (specific to skills/tools mentioned in JD and resume)
- 3 Behavioral (using resume experience)
- 3 Situational (hypothetical scenarios related to the role)

For each question, give a one-line tip on how to approach answering it (e.g. "Use the STAR method, focus on the result").

Respond ONLY with a valid JSON array, no markdown, no backticks, in this exact format:
[
  { "question": "...", "category": "Technical", "tip": "..." },
  { "question": "...", "category": "Behavioral", "tip": "..." }
]

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
          temperature: 0.6,
        }),
      }
    );

    const groqData = await groqRes.json();
    const rawText = groqData.choices?.[0]?.message?.content;

    if (!rawText) {
      return res.status(500).json({ message: "AI returned empty response" });
    }

    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const questions = JSON.parse(cleaned);

    const saved = await InterviewPrep.create({
      userId: req.user.id,
      analysisId,
      jobDescription: analysis.jobDescription,
      questions,
    });

    res.status(201).json({
      message: "Questions generated",
      prepId: saved._id,
      questions,
    });
  } catch (err) {
    res.status(500).json({ message: "Generation failed", error: err.message });
  }
}

// GET /api/interview/history
export async function getInterviewHistory(req, res) {
  try {
    const preps = await InterviewPrep.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select("jobDescription createdAt questions");
    res.json(preps);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
}