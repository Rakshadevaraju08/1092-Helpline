const telephonyService = require('../services/telephonyService');

const incomingCall = async (req, res) => {
  try {
    const callData = req.body;
    const twiml = await telephonyService.handleIncomingCall(callData);
    res.set('Content-Type', 'text/xml');
    res.send(twiml);
  } catch (error) {
    console.error('❌ incomingCall error:', error.message);
    res.set('Content-Type', 'text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Welcome to 1092 Emergency Helpline. Please hold.</Say>
</Response>`);
  }
};

const callStatus = async (req, res) => {
  try {
    const statusData = req.body;
    await telephonyService.updateCallStatus(statusData);
    res.set('Content-Type', 'text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Thank you. Your emergency has been recorded. Help is on the way.</Say>
</Response>`);
  } catch (error) {
    console.error('❌ callStatus error:', error.message);
    res.set('Content-Type', 'text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Thank you for calling 1092. Please stay on the line.</Say>
</Response>`);
  }
};

const forwardAgent = async (req, res) => {
  try {
    const { callSid, severity } = req.body;
    if (!callSid || !severity) {
      return res.status(400).json({ success: false, error: 'callSid and severity are required' });
    }
    const result = await telephonyService.forwardToAgent(callSid, severity);
    res.json({ success: true, message: 'Call forwarded to agent', data: result });
  } catch (error) {
    console.error('❌ forwardAgent error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

const health = (req, res) => {
  res.json({ success: true, message: 'Telephony service is running', timestamp: new Date().toISOString() });
};

module.exports = { incomingCall, callStatus, forwardAgent, health };