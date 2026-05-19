/**
 * voices.js
 * 1098 AI Helpline — TTS Module
 *
 * Maps language codes to Google Cloud Text-to-Speech voice configurations.
 * Each voice is tuned for natural, clear speech suitable for emergency helpline playback.
 *
 * Supported languages: English (en), Kannada (kn), Hindi (hi), Tamil (ta)
 */

const VOICE_CONFIG = {
  en: {
    languageCode: "en-IN",
    name: "en-IN-Wavenet-D",       // Female, warm and clear — ideal for helpline
    ssmlGender: "FEMALE",
    label: "English (India)",
  },
  kn: {
    languageCode: "kn-IN",
    name: "kn-IN-Wavenet-A",       // Female Kannada voice
    ssmlGender: "FEMALE",
    label: "Kannada",
  },
  hi: {
    languageCode: "hi-IN",
    name: "hi-IN-Wavenet-D",       // Female Hindi — natural cadence
    ssmlGender: "FEMALE",
    label: "Hindi",
  },
  ta: {
    languageCode: "ta-IN",
    name: "ta-IN-Wavenet-C",       // Female Tamil voice
    ssmlGender: "FEMALE",
    label: "Tamil",
  },
};

/**
 * Fallback voice used when an unsupported language code is received.
 */
const FALLBACK_VOICE = VOICE_CONFIG["en"];

/**
 * Returns the voice config for a given language code.
 * Falls back to English if language is unsupported.
 *
 * @param {string} langCode - e.g. "en", "kn", "hi", "ta"
 * @returns {object} Google TTS voice config
 */
function getVoiceConfig(langCode) {
  const voice = VOICE_CONFIG[langCode];
  if (!voice) {
    console.warn(
      `[TTS] Unsupported language code "${langCode}". Falling back to English.`
    );
    return FALLBACK_VOICE;
  }
  return voice;
}

/**
 * Returns a list of all supported language codes.
 * @returns {string[]}
 */
function getSupportedLanguages() {
  return Object.keys(VOICE_CONFIG);
}

module.exports = {
  VOICE_CONFIG,
  FALLBACK_VOICE,
  getVoiceConfig,
  getSupportedLanguages,
};