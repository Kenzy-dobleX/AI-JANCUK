// /backend/server.js

require('dotenv').config(); // Load environment variables dari .env
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
// Render.com akan menyediakan PORT via environment variable
const PORT = process.env.PORT || 3001; 

// --- MIDDLEWARE ---
// Izinkan semua origin (buat dev)
app.use(cors()); 
// Wajib: buat parsing body JSON dari frontend
app.use(express.json()); 

// Cek kunci API. Di Render.com, ini akan diambil dari Environment Variables.
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("FATAL: GEMINI_API_KEY tidak ditemukan!");
    // Di Render, ini akan membuat service gagal deploy, yang bagus!
    throw new Error("GEMINI_API_KEY must be set in environment variables.");
}

// Inisialisasi Gemini Client
const ai = new GoogleGenAI({ apiKey }); 

// --- ROUTE UTAMA API AI LU ---
app.post('/api/generate', async (req, res) => {
    // Ambil prompt dari body request
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt tidak boleh kosong, Cok!' });
    }

    try {
        console.log(`Processing prompt: "${prompt.substring(0, 30)}..."`);
        
        // Panggil Gemini API
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', 
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });

        // Kirim hasil AI kembali ke frontend
        res.json({ 
            result: response.text,
            // Tambahin metadata biar keren
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
    res.send(`Backend AI Gateway is running on port ${PORT}. Status: OK.`);
});

// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`🚀 Backend AI Gila jalan di port ${PORT}.`);
});
