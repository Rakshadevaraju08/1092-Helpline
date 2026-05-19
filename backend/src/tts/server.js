/**
 * server.js  (example entry point)
 * 1098 AI Helpline
 *
 * Shows how to mount the TTS module in your existing Express app.
 * Adapt this to your actual backend/src/server.js or app.js.
 *
 * Run in mock mode (no Google credentials needed):
 *   GOOGLE_TTS_MOCK=true node server.js
 *
 * Run in production:
 *   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json node server.js
 */

require("dotenv").config();
const express = require("express");
const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Mount TTS Module ──────────────────────────────────────────────────────────
const ttsRoutes = require('./routes');
app.use("/tts", ttsRoutes);

// ─── Root ──────────────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    project: "1098 AI Helpline",
    modules: {
      tts: {
        health: "GET  /tts/health",
        languages: "GET  /tts/languages",
        synthesize: "POST /tts/synthesize",
        twilioPlay: "POST /tts/twilio-play",
        audio: "GET  /tts/audio/:filename",
      },
    },
  });
});

// ─── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  const isMock = process.env.GOOGLE_TTS_MOCK === "true" || process.env.USE_MOCK === "true";
  console.log(`\n🚀 1098 AI Helpline TTS Module`);
  console.log(`   Server  : http://localhost:${PORT}`);
  console.log(`   Mode    : ${isMock ? "🟡 MOCK (no Google API)" : "🟢 LIVE (Google Cloud TTS)"}`);
  console.log(`   Docs    : http://localhost:${PORT}/\n`);
});

module.exports = app;