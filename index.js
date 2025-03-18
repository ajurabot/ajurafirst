const fetch = require('node-fetch'); // Ensure you have node-fetch installed

const BOT_TOKEN = '7588992407:AAGNwWGfP0bKtnLJUlyLH4kWamGGkvequWg';
const POLL_INTERVAL = 3000; // Poll every 3 seconds
let lastUpdateId = 0; // Track the last processed update ID

// Function to fetch updates from Telegram
async function getUpdates() {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.ok && data.result.length > 0) {
      for (const update of data.result) {
        console.log('Received update:', JSON.stringify(update, null, 2));

        // Process the update
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

// Start polling
setInterval(getUpdates, POLL_INTERVAL);
console.log('Bot is polling for updates...');
