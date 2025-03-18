const express = require('express');
const fetch = require('node-fetch');
const app = express();

const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_BOT_API_KEY'; // Replace with your actual API key
const POLL_INTERVAL = 3000; // Poll every 3 seconds
let lastUpdateId = 0; // Track the last processed update ID

// Middleware to parse JSON
app.use(express.json());

// Webhook endpoint (optional, if you switch back to webhooks)
app.post('/webhook', (req, res) => {
  const update = req.body;
  console.log('Received update:', JSON.stringify(update, null, 2));

  if (update.message) {
    const chatId = update.message.chat.id;
    const text = update.message.text;
    console.log(`Processing message from chat ID ${chatId}: ${text}`);

    // Send a response back to the user
    sendMessage(chatId, `You said: ${text}`)
      .then(() => res.sendStatus(200))
      .catch((err) => {
        console.error('Failed to send message:', err);
        res.sendStatus(500);
      });
  } else {
    res.sendStatus(200);
  }
});

// Function to fetch updates from Telegram (for polling)
async function getUpdates() {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.ok && data.result.length > 0) {
      for (const update of data.result) {
        console.log('Received update:', JSON.stringify(update, null, 2));

        if (update.message) {
          const chatId = update.message.chat.id;
          const text = update.message.text;
          console.log(`Processing message from chat ID ${chatId}: ${text}`);

          // Send a response back to the user
          await sendMessage(chatId, `You said: ${text}`);
        }

        // Update the last processed update ID
        lastUpdateId = update.update_id;
      }
    }
  } catch (error) {
    console.error('Error fetching updates:', error);
  }
}

// Function to send a message via the Telegram Bot API
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

// Start polling (if using polling instead of webhooks)
setInterval(getUpdates, POLL_INTERVAL);

// Start the server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
