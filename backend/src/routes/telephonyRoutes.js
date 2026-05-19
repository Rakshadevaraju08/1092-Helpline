const express = require('express');
const router = express.Router();
const telephonyController = require('../controllers/telephonyController');

router.post('/incoming-call', telephonyController.incomingCall);
router.post('/call-status', telephonyController.callStatus);
router.post('/forward-agent', telephonyController.forwardAgent);
router.get('/health', telephonyController.health);

module.exports = router;
