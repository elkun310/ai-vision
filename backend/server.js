// backend/server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'Groq Proxy Server is running! 🚀' });
});

// Main analysis endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { image, prompt } = req.body;

    if (!image || !prompt) {
      return res.status(400).json({ 
        error: { message: 'Missing image or prompt' } 
      });
    }

    console.log('📸 Analyzing image with Groq AI...');

    const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
        {
            role: 'user',
            content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: image } }
            ]
        }
        ],
        max_tokens: 2000,
        temperature: 0.7
    },
    {
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        }
    }
    );

    console.log('✅ Analysis complete!');
    res.json(response.data);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: error.response?.data || { message: error.message } 
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🚀 Groq Proxy Server Running!       ║
║   📡 Port: ${PORT}                        ║
║   🔗 http://localhost:${PORT}            ║
╚════════════════════════════════════════╝
  `);
});
