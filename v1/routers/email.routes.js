const express = require('express');
const asyncHandler = require('../helpers/asyncHandler');
const emailService = require('../services/email.service');
const router = express.Router();

async function sendEmail(req, res) {
  const { email, subject, text, html } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  if (!subject) {
    return res.status(400).json({ error: 'Subject is required' });
  }
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    text,
    html,
  };
  await emailService.sendEmail(mailOptions);

  // Placeholder for email sending logic
  console.log('Email sending endpoint hit');
  res.status(200).send('Email sending endpoint');
}

router.post('/send', asyncHandler(sendEmail));

module.exports = router;
