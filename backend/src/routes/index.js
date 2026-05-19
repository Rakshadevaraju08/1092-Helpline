const express = require('express');
const router = express.Router();
const caseRoutes = require('./caseRoutes');
const telephonyRoutes = require('./telephonyRoutes');

router.use('/cases', caseRoutes);
router.use('/telephony', telephonyRoutes);

module.exports = router;