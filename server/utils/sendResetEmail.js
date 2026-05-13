const { sendMail } = require('./mailer');

async function sendResetEmail(email, token) {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  return sendMail({
    to: email,
    subject: 'Reset your password',
    html: `
      <div style="font-family: Inter, Arial, sans-serif; color: #111827; line-height: 1.6;">
        <h2 style="margin: 0 0 12px;">Reset your password</h2>
        <p>Use the link below to choose a new password. This link expires in 15 minutes.</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="display:inline-block;padding:12px 18px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700;">
            Reset password
          </a>
        </p>
        <p style="color:#667085;font-size:14px;">If the button does not work, open this link:</p>
        <p style="word-break:break-all;"><a href="${resetUrl}">${resetUrl}</a></p>
      </div>
    `,
  });
}

module.exports = sendResetEmail;
