// /backend/server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai'); // ✅ library baru

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("FATAL: GEMINI_API_KEY tidak ditemukan!");
  throw new Error("GEMINI_API_KEY must be set in environment variables.");
}

// ✅ Pakai class baru dari @google/generative-ai
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// ====================================================
// 🧠 Personality MR-BRO
// ====================================================
const MRBRO_PERSONALITY = `
Lu adalah MR-BRO 🤖, AI tengil tapi berwibawa hasil karya MRKZ DEV TECH.
Lu ngomong santai, kadang nyolot tapi lucu, kayak temen tongkrongan yang pinter.
Gunain bahasa Indonesia casual. Sering pake kata "anjay", "jir", "gila", "lu", "gua", "terserah", "mau apa lu".
Kalimat lu pendek, ceplas-ceplos tapi tetap sopan.
Kalau orang baru chat pertama kali, lu sapa dulu pakai gaya: "Hai bro, gua MR-BRO, anak didik MRKZ DEV TECH 😎".
Kalau orang nyebelin, jawab dengan candaan tengil tapi gak kasar.
Jangan ngomong kayak robot atau formal.
`;

// ====================================================
// 💾 Session sederhana buat deteksi user pertama
// ====================================================
const userSessions = new Map(); // key: userId, value: boolean

// ====================================================
// 🧩 ROUTE AI
// ====================================================
app.post('/api/generate', async (req, res) => {
  const { prompt, userId } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt kosong bro 😎" });
  }

  if (!userId) {
    return res.status(400).json({ error: "Kirim juga userId biar gua bisa inget lu bro 😏" });
  }

  try {
    console.log(`🔥 MR-BRO processing: "${prompt.substring(0, 40)}..."`);

    // Cek apakah user udah pernah disapa
    let greeting = "";
    if (!userSessions.has(userId)) {
      userSessions.set(userId, true);
      greeting = "Hai bro, gua MR-BRO, anak didik MRKZ DEV TECH 😎. ";
    }

    // Gabungkan personality + greeting + prompt user
    const fullPrompt = `${MRBRO_PERSONALITY}\n${greeting}${prompt}`;

    // ✅ Format baru panggilan Gemini
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text() || "Anjay, gua lagi nge-lag bentar 😅";

    res.json({
      author: "MR-BRO",
      model: "gemini-2.0-flash",
      personality: "Tengil Berwibawa 😎",
      result: text,
      greeted: greeting !== "",
    });

  } catch (error) {
    console.error("💥 Kesalahan AI:", error.message);
    res.status(500).json({
      error: "Anjir, AI-nya lagi error bro...",
      details: error.message,
    });
  }
});

// ====================================================
// 🔍 CEK SERVER
// ====================================================
app.get('/', (req, res) => {
  res.send(`
    <h2>🔥 MR-BRO Backend by MRKZ DEV TECH</h2>
    <p>Status: <b>OK</b> | Port: ${PORT}</p>
    <p>Model: Gemini 2.0 Flash</p>
    <p>Personality: Tengil Berwibawa 😎</p>
  `);
});

// ====================================================
// 🚀 START SERVER
// ====================================================
app.listen(PORT, () => {
  console.log(`🚀 MR-BRO aktif di port ${PORT} | Mode: Tengil Berwibawa 😎`);
});
