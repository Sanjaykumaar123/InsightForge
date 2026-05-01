require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.error('Missing EMAIL_USER or EMAIL_PASS in .env');
    return;
  }

  console.log(`Attempting to send test email from ${user}...`);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user,
      pass: pass
    }
  });

  const mailOptions = {
    from: `"InsightForge Test" <${user}>`,
    to: user, // Send to self
    subject: 'InsightForge Email Test',
    text: 'If you are reading this, the email system is working!'
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
  } catch (error) {
    console.error('❌ Email send failed:');
    console.error(error.message);
    if (error.code === 'EAUTH') {
      console.error('Hint: Invalid credentials. Check if your Gmail App Password is correct and has no spaces.');
    }
  }
}

testEmail();
