const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Updated API URL (Only This Changed)
const OPENAI_API_URL = "https://openrouter.ai/api/v1";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.use(bodyParser.json());

// ✅ Telegram Webhook Route (Working Version)
app.post("/webhook", async (req, res) => {
    try {
        console.log("📩 Incoming Webhook:", req.body);

        const message = req.body.message?.text;
        const chatId = req.body.message?.chat?.id;

        if (!message || !chatId) {
            return res.status(400).send("Invalid request format.");
        }

        // ✅ Call OpenRouter API (Same as Before)
        const response = await axios.post(
            OPENAI_API_URL,
            {
                model: "gpt-4-turbo",
                messages: [{ role: "user", content: message }],
            },
            {
                headers: {
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const replyText = response.data.choices[0].message.content;

        // ✅ Send Response Back to Telegram
        await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: chatId,
            text: replyText,
        });

        res.send("Message processed successfully.");
    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        res.status(500).send("Internal Server Error");
    }
});

// ✅ Start Server (Same as Before)
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
