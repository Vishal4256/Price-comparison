const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

async function testEmail() {
  console.log('Testing email connection...');
  console.log('User:', process.env.EMAIL_USER);
  console.log('Pass:', process.env.EMAIL_PASS ? '********' : 'NOT FOUND');

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'vishal42564256@gmail.com',
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `PriceSense AI <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // send to self
      subject: 'Test Email',
      text: 'This is a test email.',
    });
    console.log('✅ Email sent successfully:', info.messageId);
  } catch (err) {
    console.error('❌ Failed to send email:', err.message);
    if (err.response) console.error('Response:', err.response);
  }
}

testEmail();
