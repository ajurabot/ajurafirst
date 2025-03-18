const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware to parse JSON
app.use(bodyParser.json());

// Webhook route
app.post('/webhook', async (req, res) => {
  const { message } = req.body;

  if (message) {
    const chatId = message.chat.id;
    const text = message.text;

    // Log the message
    console.log(`Received message from ${chatId}: ${text}`);

    // Send a reply
    try {
      await axios.post(`https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage`, {
        chat_id: chatId,
        text: `You said: ${text}`,
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  res.sendStatus(200);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
