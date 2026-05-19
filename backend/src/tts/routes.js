/**
 * routes.js
 * 1098 AI Helpline — TTS Module
 *
 * Defines all TTS-related routes and mounts static file serving
 * for generated MP3 audio files.
 *
 * Mount this router in your main app.js / server.js:
 *   const ttsRoutes = require("./src/tts/routes");
 *   app.use("/tts", ttsRoutes);
 */

const express = require("express");
const path = require("path");
const router = express.Router();

const { synthesize, twilioPlay, listLanguages, health } = require("./controller");
const { GENERATED_DIR } = require("./service");

// ─── Rate limiting (optional, recommended for production) ─────────────────────
// Uncomment and install express-rate-limit if needed:
//
// const rateLimit = require("express-rate-limit");
// const ttsLimiter = rateLimit({
//   windowMs: 60 * 1000,  // 1 minute
//   max: 30,              // max 30 TTS requests per minute per IP
//   message: { success: false, error: "Too many requests, slow down." },
// });
// router.use(ttsLimiter);

// ─── Serve generated MP3 files statically ─────────────────────────────────────
// GET /tts/audio/:filename
// e.g. http://localhost:3000/tts/audio/tts_en_abc123.mp3
router.use(
  "/audio",
  express.static(GENERATED_DIR, {
    maxAge: "1d",
    setHeaders(res, filePath) {
      if (filePath.endsWith(".mp3")) {
        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader("Accept-Ranges", "bytes"); // Enables Twilio streaming
      }
    },
  })
);

// ─── API Routes ───────────────────────────────────────────────────────────────

/**
 * GET /tts/health
 * Health check — confirms TTS module is alive.
 */
router.get("/health", health);

/**
 * GET /tts/languages
 * List all supported language codes + voice configurations.
 */
router.get("/languages", listLanguages);

/**
 * POST /tts/synthesize
 * Main TTS conversion endpoint.
 *
 * Body: { "text": "Are you safe right now?", "language": "en" }
 * Returns: JSON with audioUrl, fileName, TwiML string, etc.
 */
router.post("/synthesize", synthesize);

/**
 * POST /tts/twilio-play
 * Twilio-compatible webhook endpoint.
 * Returns raw TwiML XML with <Play> tag pointing to the generated MP3.
 *
 * Twilio calls this URL → gets TwiML → plays audio to caller.
 *
 * Body: { "text": "Are you safe right now?", "language": "en" }
 * Returns: Content-Type: text/xml
 */
router.post("/twilio-play", twilioPlay);

module.exports = router;