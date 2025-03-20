const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// OpenRouter API Config (Updated)
const OPENAI_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENAI_API_KEY = process.env.OPENROUTER_API_KEY; // Use OpenRouter API Key

app.use(bodyParser.json());

// Webhook Route (For Telegram)
app.post("/webhook", async (req, res) => {
    try {
        console.log("🔗 Incoming Webhook:", JSON.stringify(req.body, null, 2));

        const message = req.body.message?.text;
        const chatId = req.body.message?.chat?.id;

        if (!message || !chatId) {
            console.log("⚠️ Invalid webhook payload.");
            return res.sendStatus(200);
        }

        console.log(`📩 Message from ${chatId}: ${message}`);

        // Send message to OpenRouter AI
        const response = await axios.post(
            OPENAI_API_URL,
            {
                model: "gpt-4",
                messages: [{ role: "user", content: message }],
                max_tokens: 100,
            },
            {
                headers: {
                    "Authorization": `Bearer ${OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const aiResponse = response.data.choices[0].message.content;
        console.log(`🤖 AI Response: ${aiResponse}`);

        // Reply back to Telegram
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

// Start Server
app.listen(PORT, async () => {
    console.log(`✅ Server running on port ${PORT}`);

    try {
        // Auto-connect webhook to Telegram
        const webhookUrl = `${process.env.SERVER_URL}/webhook`;
        const telegramWebhookResponse = await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/setWebhook`, {
            url: webhookUrl,
        });

        console.log("🔗 Webhook Set:", telegramWebhookResponse.data);
    } catch (error) {
        console.error("❌ Failed to Set Webhook:", error.response ? error.response.data : error.message);
    }
});
