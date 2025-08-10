const express = require('express');
const {
  processWebhook,
  verifyWebhook,
  testWebhook
} = require('../controllers/webhookController');

const router = express.Router();

// Handle GET request for webhook verification
router.get('/', verifyWebhook);

// Handle POST request for webhook payload
router.post('/', processWebhook);

// Test webhook endpoint
router.post('/test', testWebhook);

module.exports = router;