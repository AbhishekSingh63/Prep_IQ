import dotenv from 'dotenv';
dotenv.config();

const callClaude = async (messages, systemPrompt, maxTokens = 1000, temperature = 0.7) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn("ANTHROPIC_API_KEY is not set. Generating mock response instead.");
    return null; // Signals to use fallback
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: maxTokens,
      temperature: temperature,
      system: systemPrompt,
      messages,
    }),
  });
  
  if (!res.ok) {
    const err = await res.text();
    console.error("Claude API Error:", err);
    throw new Error("Failed to call Claude API");
  }

  const data = await res.json();
  return data.content?.map(b => b.text || "").join("") || "";
};

export const parseResume = async (text) => {
  const raw = await callClaude(
    [{ role: "user", content: `Parse this resume and return ONLY a JSON object with keys: name (string), skills (array of strings), experience_years (number), projects (array of strings), education (string), level (junior/mid/senior). Resume:\n\n${text.slice(0, 3000)}` }],
    "You are a resume parser. Return ONLY valid JSON, no markdown, no extra text.",
    600
  );
  
  if (!raw) throw new Error("Mock");
  
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
};

export const analyzeGap = async (skills, role) => {
  const raw = await callClaude(
    [{ role: "user", content: `Given these candidate skills: ${(skills || []).join(", ")} and target role: ${role}, return ONLY JSON with: strong_skills (array), weak_skills (array of 3-5 missing skills for this role), recommendation (1 sentence string).` }],
    "You are a technical hiring expert. Return ONLY valid JSON.",
    400
  );

  if (!raw) throw new Error("Mock");

  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
};

export const generateQuestions = async (skills, role, difficulty, company) => {
  const companyContext = company ? ` The interview is for ${company}. Mimic ${company}'s core values, leadership principles, and specific interview style (e.g., if Amazon, include behavioral questions tied to leadership principles; if Google, highly scalable systems; if a matching startup, wearing multiple hats).` : "";
  const randomizer = `Ensure you select highly varied, distinct, and diverse questions. Do not repeat the same standard questions. Here is a random seed to ensure uniqueness: ${Math.random().toString(36).substring(7)}.`;
  const raw = await callClaude(
    [{ role: "user", content: `Generate exactly 6 interview questions for a ${role} role at ${difficulty} difficulty for someone with these skills: ${(skills || []).join(", ")}.${companyContext} ${randomizer} Return ONLY a JSON array of objects with: id (1-6), type ("DSA"|"System Design"|"HR"), question (string), hint (string), ideal_answer (string). Mix 3 DSA, 2 System Design, 1 HR. Make questions specific and technical.` }],
    "You are a senior engineering interviewer. Return ONLY valid JSON array.",
    1500,
    0.9
  );

  if (!raw) throw new Error("Mock");

  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
};

export const evaluateAnswer = async (question, answer, idealAnswer) => {
  const raw = await callClaude(
    [{ role: "user", content: `Question: "${question}"\nUser Answer: "${answer}"\nIdeal Answer: "${idealAnswer}"\n\nEvaluate this answer and return ONLY JSON with: score (0-10 integer), verdict ("Excellent"|"Good"|"Needs Work"|"Incorrect"), feedback (2-3 sentences of constructive feedback), missing_concepts (array of strings), improved_answer (1-2 sentence ideal response).` }],
    "You are a senior technical interviewer giving precise, fair feedback. Return ONLY valid JSON.",
    600
  );

  if (!raw) throw new Error("Mock");

  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
};
