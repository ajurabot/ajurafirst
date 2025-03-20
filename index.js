const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// OpenRouter API Config
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY; // Store this in `.env`

// Enable JSON parsing for incoming requests
app.use(bodyParser.json());

// Webhook Endpoint for Telegram
app.post("/webhook", async (req, res) => {
    try {
        console.log("🔗 Incoming Webhook Request:", JSON.stringify(req.body, null, 2));

        const message = req.body.message || req.body.edited_message;
        if (!message || !message.text) {
            console.log("⚠️ No valid message found in webhook payload.");
            return res.sendStatus(200);
        }

        const userMessage = message.text;
        const chatId = message.chat.id;

        console.log(`📩 Message from ${chatId}: ${userMessage}`);

        // Send message to OpenRouter AI
        const response = await axios.post(
            OPENROUTER_API_URL,
            {
                model: "gpt-4",
                messages: [{ role: "user", content: userMessage }],
                max_tokens: 100,
            },
            {
                headers: {
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const aiResponse = response.data.choices[0].message.content;
        console.log(`🤖 AI Response: ${aiResponse}`);

        // Send response back to Telegram bot
        await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: chatId,
            text: aiResponse,
        });

        res.sendStatus(200);
    } catch (error) {
        console.error("🚨 Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Webhook Processing Failed" });
    }
});

// Test Route (For Debugging Without Telegram)
app.get("/", (req, res) => {
    res.send("Ajura AI Webhook is Live! 🚀");
});

// Start Server & Webhook Auto-Connect
app.listen(PORT, async () => {
    console.log(`✅ Server running on port ${PORT}`);

    try {
        // Automatically Set Webhook in Telegram Bot
        const webhookUrl = `${process.env.SERVER_URL}/webhook`; // Replace with Render's live URL
        const telegramWebhookResponse = await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/setWebhook`, {
            url: webhookUrl,
        });

        console.log("🔗 Webhook Set Response:", telegramWebhookResponse.data);
    } catch (error) {
        console.error("❌ Failed to Set Webhook:", error.response ? error.response.data : error.message);
    }
});
