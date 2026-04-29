// /backend/server.js - DARKLINGHT-AI (FULL VERSION)
// BY MRKZ DEV-TEC + TOKEN SYSTEM + PREMIUM MODE

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 3001; 
const DB_FILE = './users.json';

app.use(cors());
app.use(express.json());

// --- INIT DATABASE ---
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify({ users: [] }, null, 2));
const readDB = () => JSON.parse(fs.readFileSync(DB_FILE));
const writeDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// --- API KEY GEMINI ---
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("❌ GEMINI_API_KEY tidak ditemukan!");
    throw new Error("GEMINI_API_KEY must be set in environment variables.");
}
const ai = new GoogleGenAI({ apiKey }); 

// --- SYSTEM PERSONA ---
const MR_BRO_SYSTEM_INSTRUCTION = `
Kamu adalah DARKLINGHT AI.

Aturan:
- Gunakan bahasa santai tapi tidak menghina berlebihan
- Dilarang menggunakan kata kasar ekstrem
- Jangan bantu aktivitas ilegal
- Jawaban harus tetap membantu user

Gaya: santai, sedikit edgy, tapi tetap sopan
`;
const INITIAL_GREETING = "Welcome, I'm Darklinght, Created By MRKZ DEV-TEC.";

// --- JWT AUTH ---
const SECRET = process.env.JWT_SECRET || 'mrkz_secret_token';
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token tidak ditemukan' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(403).json({ error: 'Token invalid' });
  }
}

// --- REGISTER ---
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  const db = readDB();
  if (db.users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username sudah digunakan!' });
  }
  const hashed = await bcrypt.hash(password, 10);
  db.users.push({ username, password: hashed, tokens: 30, plan: 'free' });
  writeDB(db);
  res.json({ message: '✅ Register sukses! Silakan login.' });
});

// --- LOGIN ---
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.username === username);
  if (!user) return res.status(404).json({ error: 'User tidak ditemukan!' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Password salah!' });
  const token = jwt.sign({ username }, SECRET, { expiresIn: '2d' });
  res.json({ message: 'Login sukses!', token });
});

// --- CEK PROFIL USER ---
app.get('/api/profile', auth, (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.username === req.user.username);
  res.json({ username: user.username, tokens: user.tokens, plan: user.plan });
});

// --- GENERATE AI ---
app.post('/api/generate', auth, async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt tidak boleh kosong!' });

  const db = readDB();
  const user = db.users.find(u => u.username === req.user.username);

  if (user.plan === 'free' && user.tokens <= 0) {
    return res.status(403).json({ error: 'Token habis! Upgrade Premium dulu.' });
  }

  try {
    console.log(`🧠 Prompt dari ${user.username}: ${prompt.substring(0, 40)}...`);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { systemInstruction: MR_BRO_SYSTEM_INSTRUCTION },
    });

    const output = response.text;

    // Kurangi token kalau free
    if (user.plan === 'free') {
      user.tokens -= 1;
      writeDB(db);
    }

    res.json({
      result: output,
      tokensLeft: user.tokens,
      plan: user.plan
    });

  } catch (error) {
    console.error("AI Error:", error.message);
    res.status(500).json({ error: 'AI error', details: error.message });
  }
});

// --- UPGRADE PREMIUM ---
app.post('/api/upgrade', auth, (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.username === req.user.username);
  user.plan = 'premium';
  user.tokens = 9999;
  writeDB(db);
  res.json({ message: '🎉 Akun kamu sekarang Premium Unlimited!' });
});

// --- ROUTE TEST ---
app.get('/', (req, res) => {
  res.send(`✅ DARKLINGHT AI Backend aktif di port ${PORT}. Status OK.`);
});

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`🚀 Backend DARKLINGHT-AI berjalan di port ${PORT}`);
});
