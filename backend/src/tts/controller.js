/**
 * controller.js
 * 1098 AI Helpline — TTS Module
 *
 * Handles HTTP requests for:
 *   POST /tts/synthesize   — Convert text → MP3, return audio URL
 *   POST /tts/twilio-play  — Return Twilio TwiML <Play> response
 *   GET  /tts/languages    — List supported languages
 *   GET  /tts/health       — Health check
 */

const { synthesizeSpeech, buildTwimlPlay } = require("./service");
const { getSupportedLanguages, VOICE_CONFIG } = require("./voices");
const mockReply = require("./mockReply.json");

// ─── POST /tts/synthesize ──────────────────────────────────────────────────────

/**
 * Main TTS endpoint.
 *
 * Request body:
 *   { "text": "Are you safe right now?", "language": "en" }
 *   OR empty body → uses mockReply.json values
 *
 * Response:
 *   {
 *     "success": true,
 *     "audioUrl": "http://localhost:3000/tts/audio/tts_en_<uuid>.mp3",
 *     "fileName": "tts_en_<uuid>.mp3",
 *     "language": "en-IN",
 *     "voiceName": "en-IN-Wavenet-D",
 *     "mock": true,
 *     "twimlPlay": "<Response><Play>...</Play></Response>"
 *   }
 */
async function synthesize(req, res) {
  try {
    // Use request body values; fall back to mockReply.json if not provided
    const text = req.body?.text || mockReply.reply;
    const langCode = req.body?.language || mockReply.language;

    if (!text || !langCode) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: 'text' and 'language'",
        example: { text: "Are you safe right now?", language: "en" },
      });
    }

    const result = await synthesizeSpeech(text, langCode);

    // Pre-build TwiML for convenience — caller can use this directly with Twilio
    const twimlPlay = buildTwimlPlay(result.audioUrl);

    return res.status(200).json({
      success: true,
      audioUrl: result.audioUrl,
      fileName: result.fileName,
      language: result.language,
      voiceName: result.voiceName,
      mock: result.mock,
      twimlPlay,            // Ready-to-use TwiML string
      inputText: text,
      inputLanguage: langCode,
    });
  } catch (err) {
    console.error("[TTS Controller] synthesize error:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message || "TTS synthesis failed",
    });
  }
}

// ─── POST /tts/twilio-play ────────────────────────────────────────────────────

/**
 * Twilio webhook-compatible endpoint.
 * Synthesizes speech and responds with raw TwiML XML.
 * Twilio will call this URL and play the resulting audio to the caller.
 *
 * Request body: { "text": "...", "language": "en" }
 * Response: TwiML XML (Content-Type: text/xml)
 *
 * Future integration:
 *   In Twilio Studio or your webhook handler, point a <Play> node to:
 *   POST https://yourdomain.com/tts/twilio-play
 */
async function twilioPlay(req, res) {
  try {
    const text = req.body?.text || mockReply.reply;
    const langCode = req.body?.language || mockReply.language;

    const result = await synthesizeSpeech(text, langCode);
    const twiml = buildTwimlPlay(result.audioUrl);

    res.type("text/xml");
    return res.status(200).send(twiml);
  } catch (err) {
    console.error("[TTS Controller] twilioPlay error:", err.message);

    // Return a safe TwiML error response so Twilio doesn't hang the call
    res.type("text/xml");
    return res.status(500).send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>We are experiencing technical difficulties. Please hold.</Say>
</Response>`);
  }
}

// ─── GET /tts/languages ───────────────────────────────────────────────────────

/**
 * Returns all supported language codes and their voice details.
 */
function listLanguages(req, res) {
  const languages = getSupportedLanguages().map((code) => ({
    code,
    ...VOICE_CONFIG[code],
  }));

  return res.status(200).json({
    success: true,
    supported: languages,
  });
}

// ─── GET /tts/health ─────────────────────────────────────────────────────────

/**
 * Health check — confirms the TTS module is running.
 */
function health(req, res) {
  return res.status(200).json({
    success: true,
    module: "TTS",
    project: "1098 AI Helpline",
    mock: process.env.GOOGLE_TTS_MOCK === "true" || process.env.USE_MOCK === "true",
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  synthesize,
  twilioPlay,
  listLanguages,
  health,
};