const express = require('express');
const { sendEmail, listEmails } = require('../services/zohoService');
const router = express.Router();

// Route to send an email
router.post('/send', async (req, res) => {
  const { from, to, subject, content } = req.body;

  try {
    const response = await sendEmail(from, to, subject, content);
    res.status(200).json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Route to list emails
router.get('/list', async (req, res) => {
  try {
    const response = await listEmails();
    res.status(200).json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
