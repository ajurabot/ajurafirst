const express = require('express');
const fetch = require('node-fetch');
const app = express();

const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_BOT_API_KEY'; // Replace with your actual API key
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'YOUR_OPENAI_KEY'; // OpenAI API Key
const PORT = process.env.PORT || 10000;
const POLL_INTERVAL = 3000; // Poll every 3 seconds

let lastUpdateId = 0; // Track the last processed update ID

// Middleware to parse JSON
app.use(express.json());

// Webhook endpoint (if using webhooks)
app.post('/webhook', async (req, res) => {
    const update = req.body;
    console.log('Received update:', JSON.stringify(update, null, 2));

    if (update.message) {
        const chatId = update.message.chat.id;
        const text = update.message.text;
        console.log(`Processing message from chat ID ${chatId}: ${text}`);

        // Get AI-generated response
        const aiResponse = await getOpenAIResponse(text);
        await sendMessage(chatId, aiResponse);

        res.sendStatus(200);
    } else {
        res.sendStatus(200);
    }
});

// Function to fetch OpenAI-generated responses
async function getOpenAIResponse(userMessage) {
    try {
        const url = 'https://api.openai.com/v1/chat/completions';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",  // Change to "gpt-4" if you have access
                messages: [{ role: "user", content: userMessage }],
            }),
        });

        if (!response.ok) {
            console.error('OpenAI API Error:', await response.text());
            return "Error: AI service is unavailable.";
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || "No response from AI.";
    } catch (error) {
        console.error('Failed to fetch OpenAI response:', error);
        return "Error: AI service failed.";
    }
}

// Function to send a message via Telegram Bot API
async function sendMessage(chatId, text) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text }),
        });
        const data = await response.json();
        if (!data.ok) console.error('Telegram API error:', data);
        return data;
    } catch (error) {
        console.error('Failed to send message:', error);
        throw error;
    }
}

// Polling function (if not using webhooks)
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

                    // Get AI-generated response
                    const aiResponse = await getOpenAIResponse(text);
                    await sendMessage(chatId, aiResponse);
                }

                // Update last processed ID
                lastUpdateId = update.update_id;
            }
        }
    } catch (error) {
        console.error('Error fetching updates:', error);
    }
}

// Start polling (if using polling instead of webhooks)
setInterval(getUpdates, POLL_INTERVAL);

// Start the server
app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`✅ Bot Token: ${BOT_TOKEN ? "Loaded ✅" : "Missing ❌"}`);
    console.log(`✅ OpenAI API Key: ${OPENAI_API_KEY ? "Loaded ✅" : "Missing ❌"}`);
});
