const axios = require('axios');

const brevoClient = axios.create({
  baseURL: 'https://api.brevo.com/v3/smtp/email',
  headers: {
    'api-key': process.env.BREVO_API_KEY,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

const getSender = () => ({
  name: 'PriceWise',
  email: process.env.EMAIL_FROM || 'noreply@pricewise.com'
});

async function sendVerificationOTP(toEmail, userName, otp) {
  try {
    const response = await brevoClient.post('', {
      sender: getSender(),
      to: [{ email: toEmail, name: userName }],
      subject: 'Verify your PriceWise Account',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 12px; overflow: hidden; border: 1px solid #334155;">
          <div style="background: linear-gradient(135deg, #2563eb, #8b5cf6); padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; color: white;">🛒 PriceWise</h1>
            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9);">Account Verification</p>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #a78bfa; margin-top: 0;">Hello ${userName}! 👋</h2>
            <p>Your verification code is:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="background: #1e293b; color: #f1f5f9; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 24px; letter-spacing: 5px; display: inline-block; border: 1px solid #334155;">
                ${otp}
              </span>
            </div>
            <p style="color: #64748b; font-size: 14px; margin-top: 24px;">This code will expire in 10 minutes.</p>
            <hr style="border: 0; border-top: 1px solid #334155; margin: 24px 0;" />
            <p style="text-align: center; color: #64748b; font-size: 11px;">If you did not request this, please ignore this email.</p>
          </div>
        </div>
      `
    });
    console.log(`[Brevo] OTP Email sent to ${toEmail}`);
    return { success: true, messageId: response.data.messageId };
  } catch (err) {
    console.error('[Brevo] OTP Email send error:', err.response?.data || err.message);
    return { success: false, error: err.response?.data || err.message };
  }
}

async function sendResetLink({ toEmail, userName, resetUrl }) {
  try {
    const response = await brevoClient.post('', {
      sender: getSender(),
      to: [{ email: toEmail, name: userName }],
      subject: '🔑 Password Reset Request - PriceWise',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 12px; overflow: hidden; border: 1px solid #334155;">
          <div style="background: linear-gradient(135deg, #2563eb, #8b5cf6); padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; color: white;">🛒 PriceWise</h1>
            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9);">Password Recovery</p>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #a78bfa; margin-top: 0;">Hello ${userName}! 👋</h2>
            <p>You requested a password reset. Click the button below to secure your account and set a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: linear-gradient(135deg, #2563eb, #8b5cf6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.4);">
                🔒 Reset Your Password
              </a>
            </div>
            <p style="margin: 0 0 10px 0; color: #64748b; font-size: 13px; line-height: 1.5;">If the button above does not work, copy and paste this URL into your browser:</p>
            <p style="margin: 0; color: #3b82f6; font-size: 12px; word-break: break-all;">${resetUrl}</p>
            <p style="color: #64748b; font-size: 12px; margin-top: 24px;">This link will expire in 10 minutes. If you did not request this, you can safely ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #334155; margin: 24px 0;" />
            <p style="text-align: center; color: #64748b; font-size: 11px;">&copy; 2024 PriceWise. All rights reserved.</p>
          </div>
        </div>
      `
    });
    console.log(`[Brevo] Reset link email sent to ${toEmail}`);
    return { success: true };
  } catch (err) {
    console.error('[Brevo] Reset Link send error:', err.response?.data || err.message);
    return { success: false, error: err.response?.data || err.message };
  }
}

async function sendPriceAlert({ toEmail, userName, productName, currentPrice, targetPrice, website, link }) {
  const saving = targetPrice - currentPrice;
  
  try {
    const response = await brevoClient.post('', {
      sender: getSender(),
      to: [{ email: toEmail, name: userName }],
      subject: `🎉 Price Drop Alert! ${productName} is now ₹${currentPrice.toLocaleString('en-IN')}`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #2563eb, #8b5cf6); padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; color: white;">🛒 PriceWise</h1>
            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9);">Price Drop Alert</p>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #a78bfa; margin-top: 0;">Hi ${userName}! 🎉</h2>
            <p>Great news! The price for <strong style="color: #f1f5f9;">${productName}</strong> has dropped below your target price on <strong>${website}</strong>.</p>
            <div style="background: #1e293b; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 14px;">Current Price</p>
              <p style="margin: 8px 0; font-size: 36px; font-weight: bold; color: #10b981;">₹${currentPrice.toLocaleString('en-IN')}</p>
              <p style="margin: 0; color: #94a3b8; font-size: 14px;">Your Target: ₹${targetPrice.toLocaleString('en-IN')} &nbsp;|&nbsp; You save: ₹${saving.toLocaleString('en-IN')}</p>
            </div>
            <div style="text-align: center; margin-top: 24px;">
              <a href="${link}" style="background: linear-gradient(135deg, #2563eb, #8b5cf6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
                🛍️ Buy Now on ${website}
              </a>
            </div>
            <p style="margin-top: 24px; color: #64748b; font-size: 12px; text-align: center;">
              This alert was set by you on PriceWise. You can manage alerts in your dashboard.
            </p>
          </div>
        </div>
      `
    });
    console.log(`[Brevo] Alert email sent to ${toEmail}`);
    return { success: true, messageId: response.data.messageId };
  } catch (err) {
    console.error('[Brevo] Email send error:', err.response?.data || err.message);
    return { success: false, error: err.response?.data || err.message };
  }
}

module.exports = { sendVerificationOTP, sendResetLink, sendPriceAlert };
