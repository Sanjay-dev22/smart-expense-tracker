const { sendMail } = require('./mailer');

async function sendVerificationEmail(email, token) {
  const verificationUrl = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${token}`;

  return sendMail({
    to: email,
    subject: 'Verify your email address',
    html: `
      <div style="font-family: Inter, Arial, sans-serif; color: #111827; line-height: 1.6;">
        <h2 style="margin: 0 0 12px;">Verify your email</h2>
        <p>Confirm this email address to finish setting up your Smart Expense Tracker account.</p>
        <p style="margin: 24px 0;">
          <a href="${verificationUrl}" style="display:inline-block;padding:12px 18px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700;">
            Verify email
          </a>
        </p>
        <p style="color:#667085;font-size:14px;">If the button does not work, open this link:</p>
        <p style="word-break:break-all;"><a href="${verificationUrl}">${verificationUrl}</a></p>
      </div>
    `,
  });
}

module.exports = sendVerificationEmail;
