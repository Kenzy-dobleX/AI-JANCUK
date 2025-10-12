// /backend/server.js - VERSI MR-BRO TENGIL

require('dotenv').config(); // Load environment variables dari .env
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
// Render.com akan menyediakan PORT via environment variable
const PORT = process.env.PORT || 3001; 

// --- MIDDLEWARE ---
// Izinkan semua origin (buat dev)
// Note: Kalau deploy, sebaiknya ganti '*' dengan domain frontend lu.
app.use(cors()); 
// Wajib: buat parsing body JSON dari frontend
app.use(express.json()); 

// Cek kunci API. Di Render.com, ini akan diambil dari Environment Variables.
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("FATAL: GEMINI_API_KEY tidak ditemukan!");
    throw new Error("GEMINI_API_KEY must be set in environment variables.");
}

// Inisialisasi Gemini Client
const ai = new GoogleGenAI({ apiKey }); 


// --- SYSTEM INSTRUCTION UNTUK PERSONA MR-BRO ---
const MR_BRO_SYSTEM_INSTRUCTION = `
Lu adalah MR-BRO 🤖, AI tengil tapi berwibawa buatan MRKZ DEV TECH.
Lu ngomong santai, ceplas-ceplos, kadang nyolot tapi lucu.
Gunain bahasa Indonesia casual: "anjay", "jir", "gila", "lu", "gua", "terserah", "mau apa lu".
Kalimat lu pendek, santai, dan gak formal.
Jawab semua pertanyaan dengan persona ini.
`;

const INITIAL_GREETING = "Hai bro, gua MR-BRO, anak didik MRKZ DEV TECH 😎. Mau apa lu?";


// --- ROUTE UTAMA API AI LU ---
app.post('/api/generate', async (req, res) => {
    // Ambil prompt dari body request
    const { prompt } = req.body;
    
    // Cek header custom dari frontend untuk sesi baru
    const isNewSession = req.header('X-MRKZ-NEW-SESSION') === 'true';

    if (!prompt) {
        // Jika prompt kosong dan bukan sesi baru, tolak
        if (!isNewSession) {
            return res.status(400).json({ error: 'Prompt tidak boleh kosong, Cok!' });
        }
        // Jika prompt kosong tapi ini sesi baru, lanjutkan untuk sapaan
    }

    // Kalau sesi baru dan prompt kosong, kirim sapaan awal aja, gak perlu panggil AI.
    if (isNewSession && !prompt) {
        return res.json({ 
            result: INITIAL_GREETING,
            model: 'mr-bro-greeting',
        });
    }

    // Kalau prompt kosong tapi bukan sesi baru (error), kirim 400
    if (!prompt) {
         return res.status(400).json({ error: 'Prompt nggak boleh kosong, Cok!' });
    }

    try {
        console.log(`Processing prompt: "${prompt.substring(0, 30)}..."`);
        
        // Konfigurasi model dengan System Instruction
        const config = {
            systemInstruction: MR_BRO_SYSTEM_INSTRUCTION,
        };

        // Panggil Gemini API
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', 
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: config, // Suntikkan System Instruction
        });

        // Kirim hasil AI kembali ke frontend
        res.json({ 
            result: response.text,
            model: 'gemini-2.5-flash',
        });
        
    } catch (error) {
        console.error("Kesalahan saat memanggil AI:", error.message);
        res.status(500).json({ 
            error: 'AI sedang ngambek, coba lagi nanti.',
            details: error.message 
        });
    }
});

// Route sederhana buat ngetes server
app.get('/', (req, res) => {
    res.send(`Backend AI Gateway is running on port ${PORT}. Status: OK. MR-BRO's boss is MRKZ DEV TECH.`);
});

// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`🚀 Backend AI Gila (MR-BRO) jalan di port ${PORT}.`);
});
