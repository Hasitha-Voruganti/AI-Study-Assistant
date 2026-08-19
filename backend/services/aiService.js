const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = "openai/gpt-oss-20b";

const callAI = async (systemPrompt, userPrompt, maxTokens = 1024) => {
  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.3,
    });
    return completion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Groq API Error:", error.message);
    throw new Error("AI service temporarily unavailable. Please try again.");
  }
};

const extractJSON = (raw) => {
  if (!raw || !raw.trim()) throw new Error("Empty response from AI");
  let cleaned = raw
    .replace(/```(?:json)?/gi, "")
    .replace(/```/g, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {}
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start !== -1 && end !== -1 && end > start) {
    try {
      return JSON.parse(cleaned.slice(start, end + 1));
    } catch {
      const partial = cleaned.slice(start);
      const objects = [];
      const objRegex = /\{[^{}]*\}/g;
      let match;
      while ((match = objRegex.exec(partial)) !== null) {
        try {
          objects.push(JSON.parse(match[0]));
        } catch {}
      }
      if (objects.length > 0) return objects;
    }
  }
  const objStart = cleaned.indexOf("{");
  const objEnd = cleaned.lastIndexOf("}");
  if (objStart !== -1 && objEnd !== -1) {
    try {
      return [JSON.parse(cleaned.slice(objStart, objEnd + 1))];
    } catch {}
  }
  console.error("RAW AI OUTPUT:\n", raw.substring(0, 800));
  throw new Error(
    "Could not extract valid JSON from AI response. Please try again.",
  );
};

const answerQuestion = async (question, relevantChunks, mode = "default") => {
  const context = relevantChunks
    .filter((c) => c && c.trim())
    .join("\n\n")
    .substring(0, 4000);

  let modeInstruction = "Answer clearly and in detail.";
  if (mode === "simple")
    modeInstruction =
      "Explain in very simple language for a beginner. Use short sentences. Avoid jargon.";
  if (mode === "example")
    modeInstruction = "Give a real-world example to illustrate the answer.";

  const system = `You are an expert AI study assistant helping a student understand their study material.
${modeInstruction}
Always base your answer on the study material provided. If the topic is not covered, say so briefly then give a general answer.
Never ask the student for more context.`;

  const prompt = `STUDY MATERIAL:
${context}

---
QUESTION: ${question}

INSTRUCTIONS: Answer the question using the study material above. Be specific and helpful. Do not say the material is empty or missing.`;

  return callAI(system, prompt, 900);
};

const generateQuiz = async (text, difficulty, numQuestions = 5, topic = "") => {
  const safeText = text.substring(0, 2500);
  const safeNum = Math.min(numQuestions, 5);

  const system = `You are a quiz generator. Output ONLY raw JSON — no markdown, no explanation, no preamble.
Format: [{"question":"...","options":["A","B","C","D"],"correctAnswer":0,"explanation":"...","difficulty":"${difficulty}"}]
correctAnswer is a 0-based index (0=A, 1=B, 2=C, 3=D).`;

  const prompt = `Generate exactly ${safeNum} ${difficulty}-difficulty multiple-choice questions about "${topic}".

Study material:
${safeText}

Output ONLY the JSON array, starting with [ and ending with ].`;

  const response = await callAI(system, prompt, 3000);
  const parsed = extractJSON(response);

  return parsed.slice(0, numQuestions).map((q) => ({
    question: q.question || "Question unavailable",
    options:
      Array.isArray(q.options) && q.options.length === 4
        ? q.options
        : ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: typeof q.correctAnswer === "number" ? q.correctAnswer : 0,
    explanation: q.explanation || "",
    difficulty: q.difficulty || difficulty,
  }));
};

const generateFlashcards = async (text, topic = "", numCards = 10) => {
  const BATCH = 5;
  const safeText = text.substring(0, 2000);
  const allCards = [];
  const batches = Math.ceil(numCards / BATCH);

  for (let b = 0; b < batches; b++) {
    const count = Math.min(BATCH, numCards - allCards.length);
    if (count <= 0) break;

    const system = `You are a flashcard generator. Output ONLY raw JSON — no markdown, no explanation, no preamble.
Format: [{"front":"term or question","back":"definition or answer"}]
Output ONLY the JSON array starting with [ and ending with ].`;

    const prompt = `Generate exactly ${count} flashcards about "${topic}". Batch ${b + 1} of ${batches}.

Study material:
${safeText}

Output ONLY the JSON array.`;

    try {
      const response = await callAI(system, prompt, 1200);
      const parsed = extractJSON(response);
      const valid = parsed
        .filter((c) => c.front && c.back)
        .map((c) => ({
          front: String(c.front || c.question || c.term || "Term").trim(),
          back: String(
            c.back || c.answer || c.definition || "Definition",
          ).trim(),
        }));
      allCards.push(...valid);
    } catch (err) {
      console.error(`Flashcard batch ${b + 1} failed:`, err.message);
    }
  }

  if (allCards.length === 0)
    throw new Error("Failed to generate any flashcards. Please try again.");
  return allCards.slice(0, numCards);
};

const detectWeakTopics = async (quizHistory) => {
  const summary = quizHistory
    .map((q) => `Topic: ${q.topic}, Score: ${q.percentage}%`)
    .join("\n");
  const system =
    "You are a learning analytics assistant. Be concise and actionable.";
  const prompt = `Quiz history:\n${summary}\n\nList weak topics (below 60%) with one specific study tip each.`;
  return callAI(system, prompt, 400);
};

module.exports = {
  callAI,
  answerQuestion,
  generateQuiz,
  generateFlashcards,
  detectWeakTopics,
};
