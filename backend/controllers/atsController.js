import Analysis from "../models/Analysis.js";

async function runAtsSimulation(resumeText, jobDescription) {
  const prompt = `
You are an ATS (Applicant Tracking System) parser simulator.

Analyze the resume below and simulate what an ATS would extract and flag.

Respond ONLY with a valid JSON object. No markdown, no backticks, no explanation.

{
  "atsScore": <number 0-100, purely based on ATS readability and format, not content quality>,
  "sectionsFound": {
    "contactInfo": <true/false>,
    "summary": <true/false>,
    "experience": <true/false>,
    "education": <true/false>,
    "skills": <true/false>,
    "projects": <true/false>,
    "certifications": <true/false>
  },
  "formatIssues": [<list of specific format problems that confuse ATS, e.g. "Uses special characters in bullet points", "Missing clear section headers", "Date formats are inconsistent">],
  "keywordsFound": [<list of keywords from JD that ARE present in the resume>],
  "keywordsMissing": [<list of important keywords from JD that are NOT in the resume>],
  "keywordDensity": <number 0-100, percentage of JD keywords found in resume>,
  "tips": [<list of 3-4 specific actionable tips to improve ATS compatibility>]
}

JOB DESCRIPTION:
${jobDescription}

RESUME:
${resumeText}
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
        temperature: 0.2,
      }),
    }
  );

  const groqData = await groqRes.json();
  const rawText = groqData.choices?.[0]?.message?.content;
  if (!rawText) throw new Error("AI returned empty response");

  const cleaned = rawText.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

// POST /api/ats/simulate
export async function simulateAts(req, res) {
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

    const simulation = await runAtsSimulation(
      analysis.resumeText,
      analysis.jobDescription
    );

    res.json({
      message: "ATS simulation complete",
      simulation,
    });
  } catch (err) {
    res.status(500).json({ message: "Simulation failed", error: err.message });
  }
}