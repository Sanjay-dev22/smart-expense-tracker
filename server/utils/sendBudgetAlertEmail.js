const { sendMail } = require('./mailer');

async function sendBudgetAlertEmail(to, name, spent, budget) {
  return sendMail({
    to,
    subject: 'Monthly budget exceeded',
    html: `
      <div style="font-family: Inter, Arial, sans-serif; color: #111827; line-height: 1.6;">
        <h2 style="margin: 0 0 12px;">Monthly budget exceeded</h2>
        <p>Hi ${name || 'there'},</p>
        <p>Your spending for this month is now <strong>INR ${Number(spent).toFixed(2)}</strong>, above your budget of <strong>INR ${Number(budget).toFixed(2)}</strong>.</p>
        <p>Open Smart Expense Tracker to review recent expenses and adjust the plan.</p>
      </div>
    `,
  });
}

module.exports = sendBudgetAlertEmail;
