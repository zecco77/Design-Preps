import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoints
  app.post("/api/interview", async (req, res) => {
    try {
      const { question, answer } = req.body;
      if (!question || !answer) {
        return res.status(400).json({ error: "Missing required parameters" });
      }

      const prompt = `
You are Zecco AI, an expert UX/UI interview coach. Your task is to evaluate a candidate's answer to a specific interview question.

Question asked: "${question}"

Candidate's Answer: "${answer}"

Provide constructive, detailed feedback on the candidate's answer. Assess whether they used the STAR method, whether the answer directly addresses the prompt, and areas for improvement. Format the response beautifully as JSON.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              feedback: { type: Type.STRING, description: "Detailed narrative feedback on the answer." },
              score: { type: Type.INTEGER, description: "Score from 1 to 10 evaluating the quality of the answer." },
              improvement: { type: Type.STRING, description: "Actionable steps to improve the answer." }
            },
            required: ["feedback", "score", "improvement"]
          }
        }
      });
      const responseText = response.text || "{}";
      res.json(JSON.parse(responseText));
    } catch (error) {
      console.error("Error generating feedback:", error);
      res.status(500).json({ error: "Failed to generate feedback" });
    }
  });

  app.post("/api/generate", async (req, res) => {
    try {
      const { company, role, level, round, industry } = req.body;

      if (!company || !role || !level || !round) {
        return res.status(400).json({ error: "Missing required parameters" });
      }

      const prompt = `
You are DesignPrep AI, an expert UX/UI interview coach and career mentor specialized in design roles across top tech, product, and creative companies.
Your knowledge spans UX Research, UI Design, Product Design, Interaction Design, Visual Design, Design Systems, AI Design, Motion Design, and Design Leadership.

Generate highly specific, tailored interview questions for the exact company and role combination.

User Request:
- Company: ${company}
- Role: ${role}
- Seniority Level: ${level}
- Interview Round: ${round}
${industry ? `- Industry Vertical: ${industry}` : ""}

Constraints for questions:
- Match the depth and tone based on the seniority limit (${level}).
- Match to the requested interview round (${round}).
- Company context awareness:
  - Reference the company's actual design system (if known)
  - Reference their known products, design philosophy, and values
  - Reference their known interview process for the given round
- If the role is 'AI Design Specialist', include questions on prompt engineering, human-AI patterns, ethics, AI-assisted tools, and LLMs.

Please generate questions categorized into the following areas. You MUST generate EXACTLY 5 questions for EACH of the following categories:
- Portfolio & Past Work
- Design Process & Thinking
- Company-Specific Culture & Values
- Role-Specific Technical Skills
- Behavioral & Soft Skills
- System Design / Design Critique
- AI & Tools Proficiency

Each question MUST include:
- The question text itself
- Difficulty level: Easy / Medium / Hard
- What the interviewer is really testing
- A 2-3 sentence ideal answer framework (MUST explicitly mention the portions of the STAR method)
- A complete, spoken-style sample answer (3-5 sentences) demonstrating a strong response using the STAR method.

Return the data as a JSON object grouped by categories.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              categories: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: {
                      type: Type.STRING,
                      description: "The name of the category (e.g., 'Portfolio & Past Work')",
                    },
                    questions: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          text: { type: Type.STRING, description: "The interview question" },
                          difficulty: { type: Type.STRING, description: "Easy, Medium, or Hard" },
                          testing: { type: Type.STRING, description: "What the interviewer is really testing" },
                          idealAnswer: { type: Type.STRING, description: "A 2-3 sentence ideal answer framework using STAR method" },
                          sampleAnswer: { type: Type.STRING, description: "A full sample answer (3-5 sentences) following the STAR method" },
                        },
                        required: ["text", "difficulty", "testing", "idealAnswer", "sampleAnswer"],
                      },
                    },
                  },
                  required: ["name", "questions"],
                },
              },
            },
            required: ["categories"],
          },
        },
      });

      const responseText = response.text || "{}";
      const data = JSON.parse(responseText);
      res.json(data);
    } catch (error) {
      console.error("Error generating questions:", error);
      res.status(500).json({ error: "Failed to generate questions" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
