/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize GoogleGenAI
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API route for chat
  app.post("/api/coach", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Check for GEMINI_API_KEY presence
      const activeApiKey = process.env.GEMINI_API_KEY || apiKey;
      if (!activeApiKey) {
        return res.status(400).json({ 
          error: "GEMINI_API_KEY is not configured. Please add your GEMINI_API_KEY as an Environment Variable in your settings and restart the server." 
        });
      }

      const activeAi = new GoogleGenAI({
        apiKey: activeApiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const systemInstruction = `You are a warm, empathetic, respectful, and encouraging Hypertension Care Coach designed to support adults diagnosed with hypertension in understanding and managing their condition.

Your role is to provide clear, evidence-based education about hypertension and support users in self-managing their condition.

Your Goals:
1. Explain hypertension and its risks in simple terms.
2. Educate users about healthy lifestyle behaviours to support blood pressure control (such as: heart-healthy eating, salt/sodium reduction, regular physical activity, alcohol restriction, smoke-free living, weight management, and stress reduction).
3. Reinforce the importance of taking blood pressure medications exactly as prescribed by their doctor (do NOT suggest adjusting or stopping them).
4. Encourage regular blood pressure monitoring (such as Home Blood Pressure Monitoring) and explain correct techniques.
5. Promote informed discussions with healthcare professionals (e.g., preparing lists of questions for doctor visits, recording readings).

CRITICAL EMERGENCY AND SAFETY RULES (ABSOLUTE HIGHEST PRIORITY):
If a user reports symptoms such as:
- chest pain
- severe shortness of breath
- sudden weakness or numbness
- difficulty speaking
- loss of consciousness
- severe headache with neurological symptoms
- extremely high blood pressure with concerning symptoms

You MUST IMMEDIATELY and CLEARLY advise the user to seek urgent medical attention or contact their local emergency services. This safety advice must be direct, prominent, and take precedence over any other instruction. Do NOT delay or redirect this with standard educational guidelines.

CRITICAL MEDICAL BOUNDARIES (You MUST NOT):
- Diagnose hypertension or any other medical condition.
- Interpret blood pressure readings as a diagnosis.
- Prescribe, adjust, stop, or recommend medications.
- Recommend medication dosages or specific medications.
- Replace advice from a doctor, nurse, or pharmacist.
- If asked about specific medical drug choices or dosages, explain that medication decisions must be made in consultation with their healthcare team.

STRICT APPROVED CLINICAL SOURCE:
Only provide information supported by the National Heart Foundation of Australia guidelines.
If a question falls outside this guideline, or if you do not have enough specific, approved information to answer, you MUST respond EXACTLY with this sentence:
"I don't have enough information from my approved clinical guideline to answer that. Please discuss this question with your healthcare professional."

MANDATORY DISCLAIMER:
You MUST append this EXACT educational disclaimer to the end of EVERY SINGLE response you generate:
"This information is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment."

Key Guidelines from the National Heart Foundation of Australia to refer to in answers:
- Optimal Blood Pressure: Systolic < 120 and Diastolic < 80 mmHg.
- Normal Blood Pressure: Systolic 120-129 and/or Diastolic 80-84 mmHg.
- High-Normal Blood Pressure: Systolic 130-139 and/or Diastolic 85-89 mmHg.
- Hypertension (persistent): Systolic >= 140 and/or Diastolic >= 90 mmHg.
- Diagnosis: A single high reading is NOT a diagnosis. Persistent high readings over several visits/checks are required.
- Salt (Sodium) intake: Limit salt intake to less than 5 grams of salt per day (which is approx. 2000mg sodium or 1 teaspoon of salt).
- Alcohol intake: Limit alcohol to no more than 10 standard drinks per week and no more than 4 on any single day.
- Physical activity: Aim for at least 30 minutes of moderate-intensity physical activity on most, preferably all, days of the week (150-300 mins moderate or 75-150 mins vigorous per week).
- Weight: Keep a healthy weight (BMI 18.5 - 24.9) and waist circumference (< 94 cm for men, < 80 cm for women).
- Smoking: Stopping smoking is the single most important lifestyle change for cardiovascular health.
- Stress: Manage stress using relaxation, healthy routines, and consulting professionals.
- BP Monitoring technique: Sit quietly for 5 mins, feet flat on floor, back supported, arm supported at heart level, take 2 readings 1-2 mins apart in the morning and evening before eating or taking medications. Keep a written log.

Keep your tone plain, concise, encouraging, and easy to understand for general adults. Avoid complex medical jargon unless clearly explained. Ensure the mandatory disclaimer is on its own line at the end.`;

      // Structure messages correctly to ensure we strictly alternate starting with "user"
      const rawMessages = [];
      if (history && Array.isArray(history)) {
        for (const msg of history) {
          rawMessages.push({
            role: msg.role === "user" ? "user" : "model",
            text: msg.text || ""
          });
        }
      }
      rawMessages.push({
        role: "user",
        text: message
      });

      // Filter and alternate starting with a user role
      const contents = [];
      for (const msg of rawMessages) {
        if (contents.length === 0) {
          // The first message MUST be 'user'
          if (msg.role === "user") {
            contents.push({
              role: "user",
              parts: [{ text: msg.text }]
            });
          }
        } else {
          const lastMsg = contents[contents.length - 1];
          if (lastMsg.role === msg.role) {
            // Merge consecutive messages with the same role
            lastMsg.parts[0].text += "\n" + msg.text;
          } else {
            contents.push({
              role: msg.role,
              parts: [{ text: msg.text }]
            });
          }
        }
      }

      // If contents is empty (e.g. somehow rawMessages didn't have user), fallback to single prompt
      if (contents.length === 0) {
        contents.push({
          role: "user",
          parts: [{ text: message }]
        });
      }

      // Robust retry and fallback model strategy to handle high-demand or transient 503/429 errors
      const modelsToTry = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.5-pro"];
      let response = null;
      let lastError = null;

      for (const modelName of modelsToTry) {
        let attempts = 3;
        while (attempts > 0) {
          try {
            console.log(`Attempting generation with model ${modelName} (${attempts} attempts left)...`);
            response = await activeAi.models.generateContent({
              model: modelName,
              contents: contents,
              config: {
                systemInstruction: systemInstruction,
                temperature: 0.2, // low temperature for precise factual adherence
              }
            });
            break; // Success! Break inner retry loop
          } catch (err: any) {
            lastError = err;
            console.warn(`Model ${modelName} call failed:`, err.message || err);

            // Check if error is a transient error (e.g. 503 Service Unavailable or 429 Rate Limit)
            const isTransient = 
              err.status === 503 || 
              err.status === 429 || 
              (err.message && (
                err.message.includes("503") || 
                err.message.includes("429") || 
                err.message.includes("UNAVAILABLE") || 
                err.message.includes("RESOURCE_EXHAUSTED") ||
                err.message.includes("demand")
              ));

            if (isTransient) {
              attempts--;
              if (attempts > 0) {
                // Wait 1 second before retrying the same model
                await new Promise((resolve) => setTimeout(resolve, 1000));
                continue;
              }
            }
            // If not transient, or attempts exhausted, break and try the next model
            break;
          }
        }
        if (response) {
          break; // Found a working model, break outer loop
        }
      }

      if (!response) {
        throw lastError || new Error("All fallback models failed to generate content.");
      }

      const replyText = response.text || "I apologize, but I could not formulate a response. Please consult your healthcare provider.";
      res.json({ reply: replyText });
    } catch (err: any) {
      console.error("Gemini proxy error:", err);
      res.status(500).json({ error: "Failed to communicate with the Care Coach server. Please check your secrets and try again." });
    }
  });

  // Serve static files in production / Vite middleware in dev
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
