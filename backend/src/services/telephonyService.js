const axios = require('axios');
const config = require('../config');

const AI_SERVICE_URL = config.AI_SERVICE_URL;
const AGENT_PHONE_NUMBER = process.env.AGENT_PHONE_NUMBER || '+916363868580';

const handleIncomingCall = async (callData) => {
  const callSid = callData.CallSid || 'UNKNOWN';
  const callerNumber = callData.From || 'UNKNOWN';

  console.log(`📞 Incoming call received`);
  console.log(`Call SID: ${callSid}`);
  console.log(`Caller: ${callerNumber}`);

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">
    Welcome to 1092 Emergency Helpline. Please describe your emergency after the beep.
  </Say>
  <Record
    action="/api/v1/telephony/call-status"
    maxLength="30"
    playBeep="true"
    transcribe="true"
    transcribeCallback="/api/v1/telephony/call-status"
  />
</Response>`;

  return twiml;
};

const updateCallStatus = async (statusData) => {
  const transcriptionText = statusData.TranscriptionText || '';
  const recordingUrl = statusData.RecordingUrl || '';
  const callSid = statusData.CallSid || 'UNKNOWN';

  console.log(`📋 Call status update for: ${callSid}`);
  console.log(`Transcription: ${transcriptionText}`);
  console.log(`Recording URL: ${recordingUrl}`);

  if (!transcriptionText) {
    console.log(`⚠️ No transcription received yet for ${callSid} — waiting for Twilio callback`);
    return;
  }

  try {
    // Step 1 — Send transcription through input-service (language detect + translate)
    console.log(`🌐 Sending to input-service for language detection + translation...`);
    const inputResponse = await axios.post(
      `http://localhost:8001/api/v1/pipeline/input`,
      {
        text: transcriptionText,
        originalText: transcriptionText
      }
    );

    const translatedText = inputResponse.data.text;
    const detectedLanguage = inputResponse.data.language;
    console.log(`🌍 Language detected: ${detectedLanguage}`);
    console.log(`✅ Translated text: ${translatedText}`);

    // Step 2 — Send translated English text to AI severity service
    console.log(`🤖 Sending to AI service for severity check...`);
    const severityResponse = await axios.post(
      `${AI_SERVICE_URL}/analysis/severity`,
      { text: translatedText }
    );

    const severity = severityResponse.data.severity;
    console.log(`🚨 Severity detected: ${severity}`);

    // Step 3 — Escalate if HIGH or CRITICAL
    if (severity === 'HIGH' || severity === 'CRITICAL') {
      console.log(`🔴 ESCALATING to human agent!`);
      await forwardToAgent(callSid, severity);
    } else {
      console.log(`🟢 Severity is ${severity} — AI continues handling`);
    }

  } catch (error) {
    if (error.config && error.config.url && error.config.url.includes('8001')) {
      console.error(`❌ Input-service error (port 8001): ${error.message}`);
    } else {
      console.error(`❌ AI service error: ${error.message}`);
    }
  }
};

const forwardToAgent = async (callSid, severity) => {
  console.log(`📲 Forwarding call ${callSid} to agent`);
  console.log(`Severity: ${severity}`);
  console.log(`Agent number: ${AGENT_PHONE_NUMBER}`);

  return {
    callSid,
    severity,
    forwardedTo: AGENT_PHONE_NUMBER,
    status: 'FORWARDED',
    timestamp: new Date().toISOString()
  };
};

module.exports = { handleIncomingCall, updateCallStatus, forwardToAgent };