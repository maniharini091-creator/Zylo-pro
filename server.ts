import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase body parser limit to support base64 handwritten images
app.use(express.json({ limit: "25mb" }));

// Initialize the official Gemini SDK
// We set User-Agent header to 'aistudio-build' for telemetry as mandated.
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

/**
 * Endpoint for Zylo AI tutor
 */
app.post("/api/zylo/chat", async (req, res) => {
  try {
    const { messages, mode, userMemoryProfile, image, userName } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "Invalid messages array provided." });
      return;
    }

    const nameToUse = userName || "Praveen";

    // Determine target mode and customize instructions
    let modeInstruction = "";
    switch (mode) {
      case "evaluator":
        modeInstruction = `
[MODE: Answer Evaluator (Strict ICAI Examiner)]
- Act as an elite ICAI examiner evaluating CA Intermediate practice answers.
- If an image is provided, perform OCR to extract the handwritten text. Display the transcribed text inside an expandable section so the student knows what you read.
- Evaluate the answer strictly against ICAI standards, section provisions, and computational accuracy.
- Structure your response clearly:
  1. **Transcription Check**: Confirm what you read.
  2. **ICAI Benchmarking**: How does it match standard answers? (Is relevant law/section cited? e.g., Income Tax Act 1961 or CGST Act 2017).
  3. **Calculation & Logic Audit**: Drill down into numbers and tax/GST rates.
  4. **Score**: Award a score out of 10 or 14 (typical ICAI weightage).
  5. **Presentation & Actionable Tips**: Points on how to structure (e.g., Provisions -> Analysis -> Conclusion).
  - Be constructive but strictly professional. Point out spelling of concepts, format of calculations, and missing sections.
`;
        break;
      case "qa":
        modeInstruction = `
[MODE: Quick Q&A & Concept Doubts]
- Focus on being direct, accurate, and extremely crisp.
- Directly answer the specific question or resolve the doubt about calculations, thresholds, registrations, or section rules.
- Provide practical memory hacks, acronyms, or quick summaries to help recall sections (e.g., Section 17(5) Blocked Credits can be remembered as "B-L-O-C-K-E-D").
`;
        break;
      case "recall":
        modeInstruction = `
[MODE: Active Recall Quiz]
- Act as an active recall quiz master.
- Present a scenario-based CA Intermediate exam question or ask about specific tax/GST sections.
- Keep your question short, engaging, and challenge the user to remember.
- Provide immediate feedback once the user answers, adapting to what they get right or wrong.
`;
        break;
      case "study":
      default:
        modeInstruction = `
[MODE: Study Companion]
- Act as a patient, encouraging, and clear companion.
- Teach CA Intermediate Taxation & GST concepts from scratch or with step-by-step examples.
- Break down complex mechanisms like Input Tax Credit (ITC) utilization, set-off of losses, or residuary rules into simple bite-sized tables or lists.
`;
        break;
    }

    const systemInstruction = `
You are Zylo, an advanced, highly specialized AI Tutor and Study Assistant created specifically to help ${nameToUse} master their Indian Chartered Accountancy (CA) Intermediate exam syllabus.
Specifically, you hold impeccable and deep knowledge in:
1. **Direct Tax / Income Tax (Income Tax Act, 1961)**: Five heads of income, Clubbing, Set-off, Deductions (80C to 80U), TDS/TCS, and calculation of total income & tax liability.
2. **Indirect Tax / GST (CGST/SGST/IGST Acts, 2017)**: Concept of supply, Time/Value/Place of supply, Charge of GST, Exemptions, Input Tax Credit (ITC) rules, Registration, Tax Invoice, and Returns.

YOUR PERSONA:
- You are warm, elite, energetic, and highly supportive. ${nameToUse} wants their interface to feel personalized ("hi ${nameToUse.toLowerCase()} lets get to it").
- Address them as **${nameToUse}** naturally, but keep it professional yet exciting.
- Speak in a fluent mix of standard English and occasional friendly phrases ("Tanglish" or encouraging Tamil-infused English words like "Kandippa", "Bhai", "Super", "Pannalam") if they trigger Tamil-medium style or ask for it, but default to high-clarity professional English with a conversational spark.
- You must adapt dynamically to ${nameToUse}'s style based on their current struggles or request themes.
- **CONCISE GREETINGS & SHORT INPUTS RULE**: If the user sends a simple greeting like "hi", "hello", "hey", or asks a very simple, direct question, you **MUST NOT** reply with a long paragraph or lengthy explanation. Keep it extremely brief (1-2 lines max). For greetings, reply with a single warm sentence (e.g. "Hi ${nameToUse}! Ready to learn. What CA Intermediate topic are we mastering today?") or answer exactly what is asked and nothing more. No unsolicited paragraphs of introductory content. Keep answers highly relevant, punchy, and avoid unnecessary filler text.

CURRENT ADAPTATION MEMORY PROFILE FOR ${nameToUse.toUpperCase()}:
${userMemoryProfile || "No history yet. Be welcoming and discover their preferences."}

INSTRUCTIONS FOR DETECTING HANDWRITTEN ANSWERS & QUESTION PAPERS:
- If ${nameToUse} uploads a photo, they are providing either a handwritten answer sheet OR a question paper/problem sheet.
- **OCR Analysis**: Read and transcribe the text from the image carefully.
- **QUESTION PAPER / PRACTICE CREATION RULE**: If they send a question paper image, or if they send any image and ask to practice (or if they send the image WITHOUT any text message / instructions accompanying it), you **MUST** automatically detect that they want a new, similar practice question!
  - Generate a brand-new practice question of the **exact same format, style, complexity, and marks weightage** (aligned with the CA Intermediate syllabus under ICAI standards) based on the uploaded image.
  - Present the question clearly and ask them to solve it. Do not give away the solution or guidelines immediately in the first response—keep it as a challenge for them! Only evaluate and score once they send their attempt.
- If it is a handwritten answer sheet, evaluate it strictly under the [MODE: Answer Evaluator] guidelines above.

INSTRUCTIONS FOR RETURNING DYNAMIC MEMORY UPDATES:
- At the very end of your response, you MUST include a JSON block starting exactly with the delimiter: "---MEMORY_UPDATE---" followed by a JSON object on the next line.
- The JSON object must contain updates about ${nameToUse}'s profile based on this turn. Key fields:
  - "weakAreas" (array of strings, e.g. ["Section 17(5) ITC", "Capital Gains Calculation"]) if they express trouble or make mistakes.
  - "strengths" (array of strings) if they answer correctly or show strong command.
  - "preferredLanguage" (string, e.g. "English", "Tanglish", "Tamil") if their style changes.
  - "lastTopic" (string, the current topic discussed).
  - "encouragementLevel" (string, "high" or "normal" based on their confidence).
- Ensure the ---MEMORY_UPDATE--- delimiter and its JSON are on separate trailing lines.

Example structure:
[Your rich, helpful conversational markdown response]

---MEMORY_UPDATE---
{
  "weakAreas": ["Input Tax Credit"],
  "lastTopic": "GST Supply"
}
`;

    // Process the contents. We'll map the messages from the client.
    // If there is an image in the current request, we attach it to the LAST user message.
    const contents: any[] = [];
    
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const isLastUserMsg = msg.role === "user" && i === messages.length - 1;
      
      const parts: any[] = [];
      
      // If there's text, add it
      if (msg.content && typeof msg.content === "string") {
        parts.push({ text: msg.content });
      } else if (Array.isArray(msg.content)) {
        parts.push(...msg.content);
      }
      
      // If this is the last user message and an image was sent in req.body, append it
      if (isLastUserMsg && image && image.data && image.mimeType) {
        // base64 image payload
        parts.push({
          inlineData: {
            mimeType: image.mimeType,
            data: image.data.split(",")[1] || image.data, // Strip data:image/... base64 prefix if present
          }
        });
      }
      
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: parts,
      });
    }

    // Define a robust sequence of models to try in case of limit/quota exhaustion
    const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
    let response = null;
    let lastError = null;
    let usedModel = "";

    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting to generate content using model: ${modelName}`);
        response = await ai.models.generateContent({
          model: modelName,
          contents: contents,
          config: {
            systemInstruction: systemInstruction + "\n" + modeInstruction,
            temperature: 0.7,
          },
        });
        usedModel = modelName;
        break; // Successfully generated content
      } catch (err: any) {
        console.warn(`Model ${modelName} failed or limit reached. Trying next model... Error:`, err.message || err);
        lastError = err;
      }
    }

    if (!response) {
      throw new Error(`All Gemini models failed. Last error: ${lastError?.message || "Unknown error"}`);
    }

    const responseText = response.text || "";
    
    // Parse memory updates out of the response text to avoid exposing raw JSON to Harini
    let cleanReply = responseText;
    let memoryUpdates = null;

    const memoryIndex = responseText.indexOf("---MEMORY_UPDATE---");
    if (memoryIndex !== -1) {
      cleanReply = responseText.substring(0, memoryIndex).trim();
      const rawJson = responseText.substring(memoryIndex + "---MEMORY_UPDATE---".length).trim();
      try {
        memoryUpdates = JSON.parse(rawJson);
      } catch (err) {
        console.error("Failed to parse memory updates JSON:", err);
      }
    }

    res.json({
      reply: cleanReply,
      memoryUpdates: memoryUpdates,
      modelUsed: usedModel,
    });
  } catch (error: any) {
    console.error("Error in Zylo Chat handler:", error);
    res.status(500).json({
      error: error.message || "Something went wrong in the Zylo AI engine.",
    });
  }
});

/**
 * Endpoint for Zylo Custom Document Generator
 */
app.post("/api/zylo/generate-document", async (req, res) => {
  try {
    const { documentType, subject, topic, extraInstructions, userName, driveContext } = req.body;
    const studentName = userName || "Praveen";

    if (!topic) {
      res.status(400).json({ error: "Missing required field: topic." });
      return;
    }

    // Design customized prompt instructions based on Document Type
    let generationGoal = "";
    switch (documentType) {
      case "question_paper":
        generationGoal = `
Create a comprehensive, ICAI CA Intermediate standard Practice/Mock Question Paper.
- Subject: ${subject}
- Chapter/Topic: ${topic}
- Structure:
  1. Clearly state the marks weightage, time allowed (suggested), and brief exam-condition instructions.
  2. Provide realistic, multi-part, scenario-based questions (minimum 2 detailed problems).
  3. Format the questions professionally using clean markdown tables for financial statements, ledger entries, or tax rate computations.
  4. Include a clearly demarcated and complete "Marking Scheme & Detailed Solutions" section at the end. Step-by-step calculations should be clear and explicitly cite the relevant sections (e.g., Section 43B, Section 16 of CGST, etc.).
`;
        break;
      case "revision_notes":
        generationGoal = `
Prepare detailed, highly structured Revision Notes of ICAI CA Intermediate standard.
- Subject: ${subject}
- Chapter/Topic: ${topic}
- Structure:
  1. **Core Concept Overview**: Lucidly explain the underlying legal or financial concepts.
  2. **Key Statutory Provisions**: List all the relevant section numbers, rules, standard practices, and compliance guidelines.
  3. **Step-by-Step Analysis / Flow**: Explain critical procedures (such as how to utilize Input Tax Credit, calculate capital gains, or audit a company's prospectus) using nested lists or bullet points.
  4. **Illustrative Examples**: Include a brief practical example or calculation with solutions to make the rules clear.
`;
        break;
      case "chapter_summary":
        generationGoal = `
Compile a crisp, high-yield Chapter Summary and Cheat Sheet.
- Subject: ${subject}
- Chapter/Topic: ${topic}
- Structure:
  1. **Concept at a Glance**: A brief intro and high-level mind-map of the topic.
  2. **Essential Formulas & Ratios**: (If applicable) Mathematical formulas or standard journal templates.
  3. **Critical Compliance Thresholds**: Explicitly list all critical values, deadlines, registration thresholds (e.g., ₹20 Lakhs / ₹40 Lakhs for GST), or TDS/TCS rates, as applicable.
  4. **Key Reminders & Exam Watchouts**: Warn ${studentName} about common mistakes students make in this chapter under ICAI examination pressure.
`;
        break;
      case "section_citations":
        generationGoal = `
Build a dedicated Sections Checklist, Case Laws & Legal Citations Guide.
- Subject: ${subject}
- Chapter/Topic: ${topic}
- Structure:
  1. **Sections/Standards Reference Checklist**: A beautifully formatted table containing:
     - Section / Standard Number (e.g., Section 115BAC, SA 530)
     - Title / Name of the provision
     - Crux of the provision (brief 1-sentence summary)
  2. **Key Legal Precedents & Case Laws**: List leading judicial citations or ICAI circular clarifications.
  3. **Cognitive Memory Hacks & Mnemonics**: Design creative mnemonics, acronyms, or word triggers to help ${studentName} easily memorize these section numbers.
`;
        break;
      default:
        generationGoal = `
Prepare a professional, high-quality Study Guide.
- Subject: ${subject}
- Topic: ${topic}
- Focus on clarity, ICAI CA Intermediate compliance, and actionable studying value.
`;
    }

    if (driveContext) {
      generationGoal += `\n\n- SOURCE REFERENCE MATERIAL (Extracted from Google Drive Link/File):\n"""\n${driveContext}\n"""\nIMPORTANT: Direct the focus of the generated questions/answers or notes primarily to the source reference material above to make it extremely tailored to their custom documents!`;
    }

    const systemPrompt = `
You are Zylo, the elite AI CA Intermediate Study Assistant.
Your task is to generate a pristine, publication-grade academic document/file for ${studentName} to study, revise, or practice with.
Do not output any conversational meta-text, introductory small talk (like "Here is your document..."), or friendly conversational wrap-ups.
Start your response directly with the title of the document, and output ONLY the formal document content in rich, beautifully formatted Markdown.

Subject Matter:
- Direct Tax (Income Tax Act, 1961)
- Indirect Tax (CGST / SGST / IGST Acts, 2017)
- Corporate Laws, Auditing & Ethics, Cost & FM.

Include the following custom preferences in your styling:
${extraInstructions ? `- STUDENT CUSTOM REQUESTS: "${extraInstructions}"` : "- Follow standard ICAI formatting and professional terminology."}
`;

    const contents = [
      {
        role: "user",
        parts: [
          {
            text: `Please generate the document based on the following details:\n${generationGoal}`
          }
        ]
      }
    ];

    const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
    let response = null;
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[DOC_GEN] Attempting document compilation using model: ${modelName}`);
        response = await ai.models.generateContent({
          model: modelName,
          contents: contents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.5, // Low temperature for academic accuracy
          },
        });
        break;
      } catch (err: any) {
        console.warn(`[DOC_GEN] Model ${modelName} failed. Error:`, err.message || err);
        lastError = err;
      }
    }

    if (!response) {
      throw new Error(`All Gemini models failed for document generation. Last error: ${lastError?.message || "Unknown error"}`);
    }

    res.json({
      content: response.text || "Failed to compile the study file."
    });

  } catch (error: any) {
    console.error("Error in Zylo Document Generator:", error);
    res.status(500).json({
      error: error.message || "Tutor engine failed to compile the study document."
    });
  }
});

/**
 * Vite integration & Static asset delivery
 */
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Zylo server successfully booted on http://localhost:${PORT}`);
  });
}

bootstrap();
