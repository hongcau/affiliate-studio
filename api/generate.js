const axios = require('axios');
const cors = require('cors');

const allowCors = fn => cors({ origin: '*' })(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  return await fn(req, res);
});

const generateImage = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, apiKey } = req.body;

  if (!prompt || !apiKey) {
    return res.status(400).json({ error: 'Missing prompt or API key' });
  }

  try {
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        contents: [
          {
            parts: [
              {
                text: `You are a professional product photographer AI. Generate a detailed, photorealistic product photography prompt based on this request:\n\n${prompt}\n\nRespond with ONLY the enhanced prompt text, nothing else. Make it vivid, detailed, and suitable for image generation AI.`
              }
            ]
          }
        ]
      },
      {
        headers: {
          'x-goog-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    const enhancedPrompt = response.data.candidates?.[0]?.content?.parts?.[0]?.text || prompt;

    return res.status(200).json({
      success: true,
      enhancedPrompt: enhancedPrompt,
      message: 'Prompt enhanced successfully'
    });
  } catch (error) {
    console.error('Gemini API Error:', error.response?.data || error.message);
    return res.status(500).json({
      error: 'Failed to generate prompt',
      details: error.response?.data || error.message
    });
  }
};

module.exports = allowCors(generateImage);
