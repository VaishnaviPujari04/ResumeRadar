import Rewrite from "../models/Rewrite.js";
import Analysis from "../models/Analysis.js";

async function callGroq(prompt, temperature = 0.5) {
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
        temperature,
      }),
    }
  );
  const data = await groqRes.json();
  return data.choices?.[0]?.message?.content;
}

// POST /api/rewrite/bullet
export async function rewriteBullet(req, res) {
  const { bulletText, jobDescription } = req.body;

  if (!bulletText?.trim()) {
    return res.status(400).json({ message: "Bullet text is required" });
  }

  try {
    const prompt = `
You are an expert resume writer. Rewrite the following resume bullet point to be:
- Action-oriented (start with a strong verb)
- Quantified with metrics where plausible (if no numbers given, suggest realistic ones with brackets like [X%])
- ATS-friendly and concise (one line, under 30 words)
- Impact-focused, not just task-listing

${jobDescription ? `Tailor it to align with this job description:\n${jobDescription}\n` : ""}

Respond with ONLY the rewritten bullet point. No quotes, no explanation, no markdown.

ORIGINAL BULLET:
${bulletText}
`;

    const rewritten = await callGroq(prompt, 0.6);

    if (!rewritten) {
      return res.status(500).json({ message: "AI returned empty response" });
    }

    const saved = await Rewrite.create({
      userId: req.user.id,
      type: "bullet",
      original: bulletText,
      rewritten: rewritten.trim(),
      jobDescription: jobDescription || "",
    });

    res.status(201).json({
      message: "Bullet rewritten",
      rewriteId: saved._id,
      original: bulletText,
      rewritten: rewritten.trim(),
    });
  } catch (err) {
    res.status(500).json({ message: "Rewrite failed", error: err.message });
  }
}

// POST /api/rewrite/resume
export async function rewriteFullResume(req, res) {
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
You are an expert resume writer and ATS optimization specialist.

Rewrite the resume below to better match the job description. Use the missing keywords and suggestions as a guide.

Rules:
- Keep the same overall structure and facts — do NOT invent fake companies, degrees, or experiences
- Strengthen weak bullet points with action verbs and quantified impact
- Naturally weave in missing keywords ONLY where truthful and relevant
- Keep it concise and professional
- Do NOT add a header/contact info section, just the body content

Respond with ONLY the rewritten resume text. No markdown, no explanation, no headers like "Rewritten Resume:".

JOB DESCRIPTION:
${analysis.jobDescription}

MISSING KEYWORDS TO CONSIDER: ${analysis.result?.missingKeywords?.join(", ") || "none"}

SUGGESTIONS TO APPLY: ${analysis.result?.suggestions?.join(" | ") || "none"}

ORIGINAL RESUME:
${analysis.resumeText}
`;

    const rewritten = await callGroq(prompt, 0.5);

    if (!rewritten) {
      return res.status(500).json({ message: "AI returned empty response" });
    }

    const saved = await Rewrite.create({
      userId: req.user.id,
      type: "full_resume",
      original: analysis.resumeText,
      rewritten: rewritten.trim(),
      jobDescription: analysis.jobDescription,
    });

    res.status(201).json({
      message: "Resume rewritten",
      rewriteId: saved._id,
      original: analysis.resumeText,
      rewritten: rewritten.trim(),
    });
  } catch (err) {
    res.status(500).json({ message: "Rewrite failed", error: err.message });
  }
}

// GET /api/rewrite/history
export async function getRewriteHistory(req, res) {
  try {
    const rewrites = await Rewrite.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select("type original rewritten createdAt");
    res.json(rewrites);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
}