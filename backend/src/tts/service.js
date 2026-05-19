/**
 * service.js
 * 1098 AI Helpline — TTS Module
 *
 * Core business logic:
 *  1. Accepts text + language code
 *  2. Calls Google Cloud Text-to-Speech API
 *  3. Saves MP3 to /generated directory
 *  4. Returns a public-accessible audio URL
 *
 * In MOCK mode (USE_MOCK=true or GOOGLE_TTS_MOCK=true), skips real API call
 * and copies a pre-recorded sample file so the module works without credentials.
 */

const textToSpeech = require("@google-cloud/text-to-speech");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { getVoiceConfig } = require("./voices");

// ─── Configuration ─────────────────────────────────────────────────────────────

const GENERATED_DIR = path.join(__dirname, "generated");
const USE_MOCK = process.env.GOOGLE_TTS_MOCK === "true" || process.env.USE_MOCK === "true";

// Base URL for returning public audio links.
// In production set BASE_URL=https://yourdomain.com in your .env
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// ─── Ensure generated/ directory exists ────────────────────────────────────────

if (!fs.existsSync(GENERATED_DIR)) {
  fs.mkdirSync(GENERATED_DIR, { recursive: true });
  console.log(`[TTS] Created directory: ${GENERATED_DIR}`);
}

// ─── Google TTS Client ─────────────────────────────────────────────────────────

let ttsClient = null;

function getClient() {
  if (ttsClient) return ttsClient;

  if (USE_MOCK) return null; // No client needed in mock mode

  // Google client auto-discovers credentials from:
  //   GOOGLE_APPLICATION_CREDENTIALS env var (path to service account JSON)
  //   OR Application Default Credentials (gcloud auth)
  ttsClient = new textToSpeech.TextToSpeechClient();
  return ttsClient;
}

// ─── Mock Mode ─────────────────────────────────────────────────────────────────

/**
 * In mock mode, generate a silent/placeholder MP3 without hitting any API.
 * A real silent MP3 header is written so audio players don't break.
 *
 * @param {string} filePath - where to save the file
 */
async function generateMockMp3(filePath) {
  // Minimal valid MP3 frame (ID3v2 header + empty frame) — plays as ~0.1s silence
  // This allows Twilio and browsers to accept and play the file without errors.
  const silentMp3 = Buffer.from(
    "494433030000000000" + // ID3v2.3 header
    "FFFB9004" +           // MP3 frame header
    "0".repeat(384),       // empty frame data
    "hex"
  );

  fs.writeFileSync(filePath, silentMp3);
  console.log(`[TTS][MOCK] Wrote placeholder MP3 → ${filePath}`);
}

// ─── Core TTS Function ─────────────────────────────────────────────────────────

/**
 * Converts text to speech and saves as MP3.
 *
 * @param {string} text     - The AI-generated reply text
 * @param {string} langCode - Language code: "en" | "kn" | "hi" | "ta"
 * @returns {Promise<{
 *   audioUrl: string,       // Public URL to play/download the MP3
 *   fileName: string,       // e.g. "tts_en_<uuid>.mp3"
 *   filePath: string,       // Absolute path on disk
 *   language: string,       // e.g. "en-IN"
 *   mock: boolean           // Whether this was a mock response
 * }>}
 */
async function synthesizeSpeech(text, langCode = "en") {
  if (!text || typeof text !== "string" || text.trim() === "") {
    throw new Error("TTS Error: 'text' must be a non-empty string.");
  }

  const voice = getVoiceConfig(langCode);
  const fileName = `tts_${langCode}_${uuidv4()}.mp3`;
  const filePath = path.join(GENERATED_DIR, fileName);
  const audioUrl = `${BASE_URL}/tts/audio/${fileName}`;

  // ── Mock mode: skip API ──────────────────────────────────────────────────────
  if (USE_MOCK) {
    console.log(`[TTS][MOCK] Synthesizing (mock): "${text}" [${voice.languageCode}]`);
    await generateMockMp3(filePath);

    return {
      audioUrl,
      fileName,
      filePath,
      language: voice.languageCode,
      voiceName: voice.name,
      mock: true,
    };
  }

  // ── Real Google Cloud TTS ────────────────────────────────────────────────────
  console.log(`[TTS] Synthesizing: "${text.substring(0, 60)}..." [${voice.languageCode} / ${voice.name}]`);

  const client = getClient();

  const request = {
    input: { text },
    voice: {
      languageCode: voice.languageCode,
      name: voice.name,
      ssmlGender: voice.ssmlGender,
    },
    audioConfig: {
      audioEncoding: "MP3",
      speakingRate: 0.95,   // Slightly slower for clarity in emergency context
      pitch: 0.0,
      volumeGainDb: 2.0,    // Slightly louder for phone playback
      effectsProfileId: ["telephony-class-application"], // Optimized for phone
    },
  };

  const [response] = await client.synthesizeSpeech(request);

  if (!response.audioContent) {
    throw new Error("TTS Error: Google API returned empty audio content.");
  }

  fs.writeFileSync(filePath, response.audioContent, "binary");
  console.log(`[TTS] Saved MP3 → ${filePath}`);

  return {
    audioUrl,
    fileName,
    filePath,
    language: voice.languageCode,
    voiceName: voice.name,
    mock: false,
  };
}

// ─── Twilio TwiML Helper ───────────────────────────────────────────────────────

/**
 * Generates a Twilio TwiML <Play> XML string for the given audio URL.
 * Used by Twilio webhook responses to play TTS audio back to the caller.
 *
 * Future integration: return this from your Twilio webhook handler.
 *
 * @param {string} audioUrl - Public URL of the MP3 file
 * @param {number} [loop=1] - How many times to play (1 = once)
 * @returns {string} TwiML XML string
 *
 * @example
 * const twiml = buildTwimlPlay("https://yourdomain.com/tts/audio/tts_en_xxx.mp3");
 * res.type("text/xml").send(twiml);
 */
function buildTwimlPlay(audioUrl, loop = 1) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play loop="${loop}">${audioUrl}</Play>
</Response>`;
}

module.exports = {
  synthesizeSpeech,
  buildTwimlPlay,
  GENERATED_DIR,
};