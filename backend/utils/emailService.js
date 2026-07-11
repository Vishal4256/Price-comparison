const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendPriceAlert = async (email, productTitle, currentPrice, targetPrice, productUrl) => {
    const mailOptions = {
        from: `"PriceSense" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Price Drop Alert: ${productTitle}`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #2563eb;">Price Drop Alert!</h2>
                <p>Good news! The product you're tracking has dropped in price.</p>
                <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin: 0; font-size: 18px;">${productTitle}</h3>
                    <p style="font-size: 24px; font-weight: bold; color: #16a34a; margin: 10px 0;">₹${currentPrice.toLocaleString()}</p>
                    <p style="color: #64748b; font-size: 14px;">Your target price was ₹${targetPrice.toLocaleString()}</p>
                </div>
                <a href="${productUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Buy Now</a>
                <p style="margin-top: 20px; color: #94a3b8; font-size: 12px;">You are receiving this because you set a price alert on PriceSense.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Price alert sent to ${email} for ${productTitle}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

const sendVerificationEmail = async (email, verificationToken) => {
    // Determine the frontend URL based on the environment
    // For local dev, usually localhost:5173
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verifyUrl = `${frontendUrl}/verify-email/${verificationToken}`;

    const mailOptions = {
        from: `"PriceWise" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Verify your PriceWise Account`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #0B1E36;">Welcome to PriceWise!</h2>
                <p>Please click the button below to verify your email address and secure your account.</p>
                <div style="margin: 30px 0; text-align: center;">
                    <a href="${verifyUrl}" style="display: inline-block; background: #0B1E36; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Verify Email Address</a>
                </div>
                <p style="color: #64748b; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="color: #2563eb; font-size: 14px; word-break: break-all;">${verifyUrl}</p>
                <p style="margin-top: 20px; color: #94a3b8; font-size: 12px;">This link will expire in 24 hours.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${email}`);
    } catch (error) {
        console.error('Error sending verification email:', error);
    }
};

module.exports = { sendPriceAlert, sendVerificationEmail };
