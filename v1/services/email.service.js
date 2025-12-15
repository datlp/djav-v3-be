'use strict';
const nodemailer = require('nodemailer');
const config = require('../config');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASS,
  },
});

// Helper functions for sending emails
const sendEmail = async (mailOptions) => {
  return await transporter.sendMail(mailOptions);
};

const sendVerificationEmail = async (email, token) => {
  const mailOptions = {
    from: config.EMAIL_USER,
    to: email,
    subject: 'Verify Your Email',
    text: `Click this link to verify your email: ${config.SERVER_ENDPOINT}/auth/verify-email/${token}`,
    html: `<p>Click this link to verify your email: <a href="${config.SERVER_ENDPOINT}/auth/verify-email/${token}">Verify Email</a></p>`,
  };
  await sendEmail(mailOptions);
};

const sendResetEmail = async (email, token, req) => {
  const mailOptions = {
    from: config.EMAIL_USER,
    to: email,
    subject: 'Verify Your Email',
    text: `Click this link to reset your password: ${config.FRONT_END_ENDPOINT}/reset-password/${token}`,
    html: `<p>Click this link to reset your password: <a href="${config.FRONT_END_ENDPOINT}/reset-password/${token}">Reset Password</a></p>`,
  };
  await emailService.sendEmail(mailOptions);
};

// email when login in new device
const sendNewDeviceEmail = async (email, ipAddress, location) => {
  const mailOptions = {
    from: config.EMAIL_USER,
    to: email,
    subject: 'New Device Login',
    text: `A login to your account was detected from a new device.\nIP Address: ${ipAddress}\nLocation: ${location}\nIf this was you, no action is required. If this was not you, please change your password immediately.`,
    html: `<p>A login to your account was detected from a new device.</p><p>IP Address: ${ipAddress}</p><p>Location: ${location}</p><p>If this was you, no action is required. If this was not you, please change your password immediately.</p>`,
  };
  await sendEmail(mailOptions);
};

const emailService = {
  sendEmail,
  sendVerificationEmail,
  sendResetEmail,
  sendNewDeviceEmail,
};

module.exports = emailService;
