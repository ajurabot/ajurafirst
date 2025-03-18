const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

// ✅ Load Environment Variables
const BOT_TOKEN = process.env.BOT_TOKEN || "YOUR_BOT_API_KEY"; 
const WEBHOOK_URL = "https://chatgpt-telegram-bot-h1tu.onrender.com/webhook";
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// ✅ Auto-Fetch & Set Webhook If Needed
const checkAndSetWebhook = async () => {
    try {
        const response = await fetch(`${TELEGRAM_API}/getWebhookInfo`);
        const data = await response.json();

        if (data.ok && data.result.url !== WEBHOOK_URL) {
            console.log("🔄 Webhook is incorrect. Updating...");
            const setWebhookResponse = await fetch(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`, { method: "POST" });
            const setWebhookData = await setWebhookResponse.json();

            if (setWebhookData.ok) {
                console.log("✅ Webhook successfully updated!");
            } else {
                console.error("❌ Failed to set webhook:", setWebhookData);
            }
        } else {
            console.log("✅ Webhook is correctly set!");
        }
    } catch (error) {
        console.error("❌ Error checking webhook:", error);
    }
};

// ✅ Webhook Endpoint (Receives Messages)
app.post("/webhook", async (req, res) => {
    const update = req.body;
    console.log("📩 Received Update:", JSON.stringify(update, null, 2));

    if (update.message) {
        const chatId = update.message.chat.id;
        const text = update.message.text;
        console.log(`📥 Processing message from ${chatId}: ${text}`);

        // ✅ Auto Reply to User
        await sendMessage(chatId, `Ajura AI received: ${text}`);
    }

    res.sendStatus(200);
});

// ✅ Send Message Function
const sendMessage = async (chatId, text) => {
    const url = `${TELEGRAM_API}/sendMessage`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text }),
        });
        const data = await response.json();
        if (!data.ok) {
            console.error("❌ Telegram API Error:", data);
        }
    } catch (error) {
        console.error("❌ Failed to send message:", error);
    }
};

// ✅ Run Webhook Check on Startup
checkAndSetWebhook();

// ✅ Start the Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
