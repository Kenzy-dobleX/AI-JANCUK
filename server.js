// /backend/server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("FATAL: GEMINI_API_KEY tidak ditemukan!");
  throw new Error("GEMINI_API_KEY must be set in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // ✅ stabil & paling cocok di Render

// ====================================================
// 🧠 MR-BRO Personality
// ====================================================
const MRBRO_PERSONALITY = `
Lu adalah MR-BRO 🤖, AI tengil tapi berwibawa buatan MRKZ DEV TECH.
Lu ngomong santai, ceplas-ceplos, kadang nyolot tapi lucu.
Gunain bahasa Indonesia casual: "anjay", "jir", "gila", "lu", "gua", "terserah", "mau apa lu".
Kalimat lu pendek, santai, dan gak formal.
Kalau orang baru chat pertama kali, lu sapa: "Hai bro, gua MR-BRO, anak didik MRKZ DEV TECH 😎".
Kalau orang nyebelin, jawab dengan candaan tengil tapi gak kasar.
`;

// ====================================================
// 💾 Session sederhana (biar inget user)
// ====================================================
const userSessions = new Map(); // userId -> greeted

// ====================================================
// 🧩 ROUTE AI
// ====================================================
app.post('/api/generate', async (req, res) => {
  const { prompt, userId } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt kosong bro 😎" });
  }

  if (!userId) {
    return res.status(400).json({ error: "Kirim juga userId biar gua bisa inget lu bro 😉" });
  }

  try {
    console.log(`🔥 MR-BRO processing: "${prompt.substring(0, 40)}..."`);

    // Sapa pertama kali
    let greeting = "";
    if (!userSessions.has(userId)) {
      userSessions.set(userId, true);
      greeting = "Hai bro, gua MR-BRO, anak didik MRKZ DEV TECH 😎. ";
    }

    const fullPrompt = `${MRBRO_PERSONALITY}\n${greeting}${prompt}`;

    // ✅ Format baru generateContent (nggak pake role lagi)
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
    });

    const response = result.response;
    const text = response.text() || "Anjay, gua lagi nge-lag bentar 😅";

    res.json({
      author: "MR-BRO",
      model: "gemini-1.5-flash",
      personality: "Tengil Berwibawa 😎",
      result: text,
      greeted: greeting !== "",
    });

  } catch (error) {
    console.error("💥 Kesalahan AI:", error);
    res.status(500).json({
      error: "Anjir, AI-nya lagi error bro...",
      details: error.message,
    });
  }
});

// ====================================================
// 🧩 Route tes server
// ====================================================
app.get('/', (req, res) => {
  res.send(`
    <h2>🔥 MR-BRO Backend by MRKZ DEV TECH</h2>
    <p>Status: <b>OK</b> | Port: ${PORT}</p>
    <p>Model: Gemini 1.5 Flash</p>
    <p>Personality: Tengil Berwibawa 😎</p>
  `);
});

// ====================================================
// 🚀 Start server
// ====================================================
app.listen(PORT, () => {
  console.log(`🚀 MR-BRO aktif di port ${PORT} | Mode: Tengil Berwibawa 😎`);
});
