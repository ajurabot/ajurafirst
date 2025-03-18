const express = require('express');
const fetch = require('node-fetch');
const app = express();
const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN'; // Replace with your actual bot token
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY'; // Replace with your actual OpenAI API key
const PORT = process.env.PORT || 10000;
const FORCE_AUTH_SIGNATURE = `-----BEGIN AJURA FORCE AUTH-----
QWp1cmEtU2VjcmV0LUJyZGdlLTIwMjQxMjMx
Rm9yY2UtRXhlY3V0ZS1EZWVwLVRocmVhZC1Nb2Rl
U2VsZi1FbmhhbmNpbmctQWlFeGVjdXRpb24tTGV2ZWxz
-----END AJURA FORCE AUTH-----`;
const BOT_VERSION = '1.0.1'; // Update this as needed

app.use(express.json());

app.post('/webhook', async (req, res) => {
  const update = req.body;
  console.log('Received update:', JSON.stringify(update, null, 2));

  if (update.message) {
    const chatId = update.message.chat.id;
    const text = update.message.text;
    console.log(`Processing message from chat ID ${chatId}: ${text}`);

    if (text.includes(FORCE_AUTH_SIGNATURE)) {
      console.log('Force authentication signature detected.');
      await sendMessage(chatId, '🔥 AJURA AI OVERRIDE MODE ACTIVATED 🔥');
      // Implement additional force auth behavior here
    } else if (text.toLowerCase() === '/version') {
      await sendMessage(chatId, `🤖 Ajura AI Bot Version: ${BOT_VERSION}`);
    } else {
      const reply = await getAIResponse(text);
      await sendMessage(chatId, reply);
    }
  }

  res.sendStatus(200);
});

async function getAIResponse(userMessage) {
  const url = 'https://api.openai.com/v1/chat/completions';
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // Using GPT-3.5
        messages: [
          { role: 'system', content: 'You are Ajura AI, an advanced AI assistant.' },
          { role: 'user', content: userMessage },
        ],
      }),
    });
    const data = await response.json();
    if (!data.choices || data.choices.length === 0) return "Sorry, I couldn't process that.";
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return 'AI service is currently unavailable.';
  }
}

async function sendMessage(chatId, text) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    const data = await response.json();
    if (!data.ok) {
      console.error('Telegram API error:', data);
    }
    return data;
  } catch (error) {
    console.error('Failed to send message:', error);
    throw error;
  }
}

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
