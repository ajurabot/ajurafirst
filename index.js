const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

// ✅ Verification Log for Proof
console.log("🚀 Ajura AI Secure Update: Proof of Access Confirmed!");

// ✅ Load Environment Variables
const BOT_TOKEN = process.env.BOT_TOKEN || "YOUR_TELEGRAM_BOT_TOKEN"; 
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "YOUR_OPENAI_API_KEY";
const WEBHOOK_URL = "https://chatgpt-telegram-bot-h
