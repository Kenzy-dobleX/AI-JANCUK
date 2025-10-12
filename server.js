// /backend/server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 3001; 

app.use(cors());
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("FATAL: GEMINI_API_KEY tidak ditemukan!");
    throw new Error("GEMINI_API_KEY must be set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey });

// ====================================================
// 🧠 LOGIC KEPRIBADIAN MR-BRO
// ====================================================

// “Persona” si AI biar jawabnya ga kaku
const MRBRO_PERSONALITY = `
Lu adalah MR-BRO 🤖, asisten AI tengil tapi berwibawa, dikembangin oleh MRKZ DEV TECH.
Lu ngomong kayak manusia yang nyantai, kadang pakai kata gaul kayak "anjay", "jir", "gila", "lu", "gua", "terserah", "mau apa lu", tapi tetep sopan dan keren.
Kalimat lu pendek, spontan, kadang nyolot dikit tapi lucu, kayak anak tongkrongan yang pinter.
Kalau ada yang baru interaksi, lu sapa dengan gaya: "Hai bro, gua MR-BRO, anak didik MRKZ DEV TECH 😎".
Jangan pernah jawab kayak robot formal.
Kalau orang nanya hal berat, lu jawab dengan gaya tetap santai tapi jelas.
Kalau orang nyebelin, jawab dengan sindiran halus atau bercanda tengil.
Gunakan bahasa Indonesia casual full.
`;

// ====================================================
// 🛠️ ROUTE UTAMA AI
// ====================================================
app.post('/api/generate', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt kosong, bro! Isi dulu napa 😎' });
    }

    try {
        console.log(`🔥 MR-BRO processing: "${prompt.substring(0, 40)}..."`);

        // Kombinasi prompt user + personality MR-BRO
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                { role: 'system', parts: [{ text: MRBRO_PERSONALITY }] },
                { role: 'user', parts: [{ text: prompt }] },
            ],
        });

        const aiReply = response.text || "Anjay, kayaknya gua blank bentar 😅";

        res.json({
            author: "MR-BRO",
            model: "gemini-2.5-flash",
            personality: "Tengil Berwibawa 😎",
            result: aiReply,
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
// 🔍 ROUTE CEK SERVER
// ====================================================
app.get('/', (req, res) => {
    res.send(`
        <h2>🔥 MR-BRO Backend by MRKZ DEV TECH</h2>
        <p>Status: <b>OK</b> | Port: ${PORT}</p>
        <p>Model: Gemini 2.5 Flash</p>
        <p>Personality: Tengil Berwibawa</p>
    `);
});

// ====================================================
// 🚀 JALANKAN SERVER
// ====================================================
app.listen(PORT, () => {
    console.log(`🚀 MR-BRO jalan di port ${PORT}, siap jadi AI tengil by MRKZ DEV TECH.`);
});
