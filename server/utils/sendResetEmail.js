const nodemailer = require('nodemailer');

const sendResetEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"Smart Expense Tracker" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your Password',
    html: `
      <p>Hello,</p>
      <p>We received a request to reset your password. Click the button below to proceed:</p>
      <p>
        <a href="${resetUrl}" style="
          display: inline-block;
          padding: 10px 20px;
          background-color: #1976d2;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        ">
          Reset Password
        </a>
      </p>
      <p>If the button doesn't work, you can also click this link:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <br/>
      <p><strong>This link will expire in 15 minutes.</strong></p>
      <br/>
      <p>Thanks,<br/>Smart Expense Tracker Team</p>
    `,
  });
};

module.exports = sendResetEmail;
