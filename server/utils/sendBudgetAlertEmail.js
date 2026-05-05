// server/utils/sendBudgetAlertEmail.js

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendBudgetAlertEmail(to, name, spent, budget) {
  console.log('📨 Email sending function triggered');
  const mailOptions = {
    from: `"Smart Expense Tracker" <${process.env.EMAIL_USER}>`,
    to,
    subject: '⚠️ Monthly Budget Exceeded!',
    html: `
      <h2>Hello ${name},</h2>
      <p>You’ve spent <b>₹${spent}</b> this month, which exceeds your budget of <b>₹${budget}</b>.</p>
      <p>Please review your expenses and plan accordingly.</p>
      <p>– Smart Expense Tracker</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('❌ Email send failed:', err);
  }
}

module.exports = sendBudgetAlertEmail;
