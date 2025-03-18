const express = require('express');
const fetch = require('node-fetch');
const app = express();

const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN'; // Replace with actual API key
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY'; // Replace with your actual OpenAI API key
const POLL_INTERVAL = 3000; // Poll every 3 seconds
let lastUpdateId = 0; // Track the last processed update ID

app.use(express.json());

app.post('/webhook', (req, res) => {
  const update = req.body;
  console.log('Received update:', JSON.stringify(update, null, 2));

  if (update.message) {
    const chatId = update.message.chat.id;
    const text = update.message.text;
    console.log(`Processing message from chat ID ${chatId}: ${text}`);

    getAIResponse(text)
      .then((reply) => sendMessage(chatId, reply))
      .then(() => res.sendStatus(200))
      .catch((err) => {
        console.error('Error:', err);
        res.sendStatus(500);
      });
  } else {
    res.sendStatus(200);
  }
});

// OpenAI GPT-3.5 API Request
async function getAIResponse(userMessage) {
  const url = "https://api.openai.com/v1/chat/completions";
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",  // ✅ Updated to GPT-3.5
        messages: [{ role: "system", content: "You are Ajura AI, an advanced AI assistant." },
                   { role: "user", content: userMessage }],
      }),
    });
    const data = await response.json();
    if (!data.choices || data.choices.length === 0) return "Sorry, I couldn't process that.";
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return "AI service is currently unavailable.";
  }
}

// Function to send a message via Telegram Bot API
async function sendMessage(chatId, text) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    const data = await response.json();
    if (!data.ok) {
      console.error("Telegram API error:", data);
    }
    return data;
  } catch (error) {
    console.error("Failed to send message:", error);
    throw error;
  }
}

// Start the server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
