export async function askGroq(prompt, temperature = 0.3) {
  const response = await fetch(
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
            content: prompt,
          },
        ],
        temperature,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error(data);
    throw new Error(data.error?.message || "Groq API Error");
  }

  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Empty response from Groq");
  }

  return content.replace(/```json|```/g, "").trim();
}