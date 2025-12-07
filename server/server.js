// server.js
import "dotenv/config";
import express from "express";
import cors from "cors";

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { roastComplimentPrompt } from "./prompt.js";

const app = express();

// --------- MIDDLEWARE ---------
app.use(express.json());

const allowedOrigin = process.env.FRONTEND_ORIGIN || "*";

app.use(
  cors({
    origin: allowedOrigin,
  })
);

// --------- LANGCHAIN MODEL & CHAIN ---------
const chatModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0.9,
  maxRetries: 2,
  // GOOGLE_API_KEY is read from env: process.env.GOOGLE_API_KEY
});

const chain = roastComplimentPrompt.pipe(chatModel);

// --------- HELPERS ---------
function sanitizeString(value, maxLen) {
  if (!value) return "";
  return String(value).slice(0, maxLen).trim();
}

// --------- ROUTES ---------

// Health check
app.get("/healthz", (req, res) => {
  res.json({ status: "ok" });
});

// Root route
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Roast & Compliment API running",
  });
});

// Main AI route (matches your frontend)
app.post("/api/generate", async (req, res) => {
  try {
    const {
      mode,          // "roast" | "compliment"
      tone,          // "soft" | "normal" | "savage"
      language,      // "english" | "hinglish"
      name,
      traits,        // string from frontend
      insideJoke,    // string from frontend
      relationship,  // optional
    } = req.body || {};

    // Basic required fields
    if (!mode || !tone || !language || !name) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "mode, tone, language, and name are required.",
      });
    }

    // Normalise enums
    const safeMode = mode === "compliment" ? "compliment" : "roast";
    const safeTone =
      tone === "soft" || tone === "savage" ? tone : "normal";
    const safeLanguage = language === "english" ? "english" : "hinglish";

    // Sanitize strings
    const safeName = sanitizeString(name, 40);
    const safeRelationship = sanitizeString(relationship || "friend", 40);
    const safeInsideJoke = sanitizeString(insideJoke || "none", 200);

    // Traits → traitsText
    let traitsText = "none";
    if (Array.isArray(traits)) {
      traitsText = traits
        .map((t) => sanitizeString(t, 60))
        .filter(Boolean)
        .join(", ");
    } else if (typeof traits === "string") {
      traitsText = sanitizeString(traits, 200) || "none";
    }

    console.log("Generate request:", {
      mode: safeMode,
      tone: safeTone,
      language: safeLanguage,
      name: safeName,
    });

    // Call LangChain chain
    const aiMsg = await chain.invoke({
      mode: safeMode,
      tone: safeTone,
      language: safeLanguage,
      name: safeName,
      relationship: safeRelationship,
      traitsText,
      insideJoke: safeInsideJoke,
    });

    // Extract text
    const line =
      typeof aiMsg.content === "string"
        ? aiMsg.content.trim()
        : String(aiMsg.content || "").trim();
    
    console.log("AI OUTPUT:", line);

    if (!line) {
      return res.status(500).json({
        error: "EMPTY_RESPONSE",
        message: "Model returned empty response.",
      });
    }

    return res.json({ line });
  } catch (err) {
    console.error("Error in /api/generate:", err);
    return res.status(500).json({
      error: "SERVER_ERROR",
      message: "Something went wrong on the server.",
    });
  }
});

// --------- START SERVER ---------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🔥 Roast & Compliment API listening on port ${PORT}`);
});
