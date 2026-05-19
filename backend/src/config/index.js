require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'http://localhost:8000/api/v1',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || ''
};
