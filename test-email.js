const nodemailer = require('nodemailer');

// Test SMTP connection
async function testEmail() {
  console.log('Testing SMTP connection...');

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'kaarekhairofficial@gmail.com',
      pass: 'iorfwzdbfigftbia'
    }
  });

  try {
    // Verify connection
    const info = await transporter.verify();
    console.log('✅ SMTP Server is ready to take messages');

    // Send test email
    console.log('Sending test email...');
    const mailOptions = {
      from: 'kaarekhairofficial@gmail.com',
      to: 'kaarekhairofficial@gmail.com',
      subject: 'Test Email from Durood Tracker',
      text: 'This is a test email to verify SMTP configuration works.',
      html: '<h1>Test Email</h1><p>This is a test email to verify SMTP configuration works.</p>'
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', result.messageId);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'EAUTH') {
      console.log('Authentication failed. Check your email and app password.');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('Connection refused. Check SMTP host and port.');
    }
  }
}

testEmail();