const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

// ✅ Verification Log for Proof
console.log("🚀 Ajura AI Secure Update: Proof of Access Confirmed!");

// ✅ Load Environment Variables
const BOT_TOKEN = process.env.BOT_TOKEN || "YOUR_TELEGRAM_BOT_TOKEN"; 
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "YOUR_OPENAI_API_KEY";
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

        // ✅ AI Processing
        let responseText = await getAjuraAIResponse(text);

        // ✅ Send AI Response
        await sendMessage(chatId, responseText);
    }

    res.sendStatus(200);
});

// ✅ Function to Get AI Response
const getAjuraAIResponse = async (userMessage) => {
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: userMessage }],
            }),
        });

        const data = await response.json();
        console.log("🤖 OpenAI Response:", JSON.stringify(data, null, 2));

        if (data.choices && data.choices.length > 0) {
            return data.choices[0].message.content;
        } else {
            return "Ajura AI couldn't process your request at the moment.";
        }
    } catch (error) {
        console.error("❌ OpenAI API Error:", error);
        return "Ajura AI is facing a technical issue.";
    }
};

// ✅ Send Message Function
const sendMessage = async (chatId, text) => {
    const url = `${TELEGRAM_API}/sendMessage`;
    try {
        console.log(`📤 Sending message to ${chatId}: ${text}`);
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
