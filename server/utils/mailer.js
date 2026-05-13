const nodemailer = require('nodemailer');

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email credentials are not configured');
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    pool: true,
    maxConnections: 2,
    maxMessages: 50,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter;
}

function sendMail(options) {
  return getTransporter().sendMail({
    from: `"Smart Expense Tracker" <${process.env.EMAIL_USER}>`,
    ...options,
  });
}

module.exports = { sendMail };
