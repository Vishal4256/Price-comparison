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

module.exports = { sendPriceAlert };
