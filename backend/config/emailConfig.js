// Email Configuration
// Update these values with your email service credentials

module.exports = {
  // Gmail Configuration (recommended for testing)
  emailService: 'gmail', // or 'outlook', 'yahoo', etc.
  emailUser: process.env.EMAIL_USER || 'your_email@gmail.com',
  emailPassword: process.env.EMAIL_PASSWORD || 'your_app_password_here',
  
  // Alternative: SMTP Configuration
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER || 'your_email@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'your_app_password_here'
    }
  }
};

/*
SETUP INSTRUCTIONS:

1. For Gmail:
   - Enable 2-factor authentication on your Gmail account
   - Generate an App Password: https://myaccount.google.com/apppasswords
   - Use the App Password as EMAIL_PASSWORD

2. For other email services:
   - Update emailService to your provider
   - Update emailUser and emailPassword accordingly

3. Environment Variables:
   Create a .env file in the backend directory with:
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password_here

4. Security Note:
   - Never commit your actual email credentials to version control
   - Use environment variables in production
   - Consider using email services like SendGrid, Mailgun, or AWS SES for production
*/ 