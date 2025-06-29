// utils/sendVerificationEmail.js

const nodemailer = require('nodemailer');

const sendVerificationEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // ✅ FIXED: backend handles the token verification
  const verificationUrl = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"Smart Expense Tracker" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify your Email Address',
    html: `
      <p>Hi there!</p>
      <p>Please click the button below to verify your email address:</p>
      <p>
        <a href="${verificationUrl}" style="
          display: inline-block;
          padding: 10px 20px;
          background-color: #1976d2;
          color: white;
          text-decoration: none;
          border-radius: 5px;
        ">
          Verify Email
        </a>
      </p>
      <p>If the button doesn't work, you can also click this link:</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      <br/>
      <p>Thanks,<br/>Smart Expense Tracker Team</p>
    `
  });
};

module.exports = sendVerificationEmail;
