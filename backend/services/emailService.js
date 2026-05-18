const nodemailer = require('nodemailer');

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  // Prioritize real Gmail credentials if provided
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { 
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS 
      },
    });
  } else {
    // Fallback to Ethereal for testing
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: 'ethereal.user@ethereal.email', pass: 'ethereal_pass' },
    });
  }
  return transporter;
}

async function sendPriceAlert({ toEmail, userName, productName, currentPrice, targetPrice, website, link }) {
  const t = getTransporter();
  const saving = targetPrice - currentPrice;

  const mailOptions = {
    from: `"PriceSense AI 🛒" <${process.env.EMAIL_USER || 'noreply@pricesense.ai'}>`,
    to: toEmail,
    subject: `🎉 Price Drop Alert! ${productName} is now ₹${currentPrice.toLocaleString('en-IN')}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; color: white;">🛒 PriceSense AI</h1>
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
            <a href="${link}" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
              🛍️ Buy Now on ${website}
            </a>
          </div>
          <p style="margin-top: 24px; color: #64748b; font-size: 12px; text-align: center;">
            This alert was set by you on PriceSense AI. You can manage alerts in your dashboard.
          </p>
        </div>
      </div>
    `,
  };

  try {
    const info = await t.sendMail(mailOptions);
    console.log(`📧 Alert email sent to ${toEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('Email send error:', err.message);
    return { success: false, error: err.message };
  }
}

async function sendOTP({ toEmail, userName, otp }) {
  const t = getTransporter();

  const mailOptions = {
    from: `"PriceSense AI 🛒" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: '🔑 Password Reset OTP - PriceSense AI',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #6366f1; text-align: center;">PriceSense AI</h2>
        <p>Hello ${userName},</p>
        <p>You requested a password reset. Use the OTP below to reset your password:</p>
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 14px;">This code will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="text-align: center; color: #94a3b8; font-size: 12px;">&copy; 2024 PriceSense AI. All rights reserved.</p>
      </div>
    `,
  };

  try {
    const info = await t.sendMail(mailOptions);
    console.log(`📧 OTP email sent to ${toEmail}: ${info.messageId}`);
    return { success: true };
  } catch (err) {
    console.error('OTP Send error:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { sendPriceAlert, sendOTP };
