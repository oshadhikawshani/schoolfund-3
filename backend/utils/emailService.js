const nodemailer = require('nodemailer');
const emailConfig = require('../config/emailConfig');

// Create transporter using configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    service: emailConfig.emailService,
    auth: {
      user: emailConfig.emailUser,
      pass: emailConfig.emailPassword
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Email template for school registration confirmation
const sendRegistrationEmail = async (schoolData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: emailConfig.emailUser,
      to: schoolData.Email,
      subject: 'School Registration Request Received - SchoolFund',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #2c3e50; margin-bottom: 10px;">School Registration Request Received</h2>
            <p style="color: #34495e; margin-bottom: 15px;">Dear ${schoolData.PrincipalName},</p>
            <p style="color: #34495e; margin-bottom: 15px;">Thank you for submitting your school registration request to SchoolFund. We have received your application and it is currently under review.</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #2c3e50; margin-bottom: 15px;">Registration Details:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; font-weight: bold; color: #2c3e50;">School Name:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; color: #34495e;">${schoolData.SchoolRequestID.replace(/_/g, ' ')}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; font-weight: bold; color: #2c3e50;">Principal:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; color: #34495e;">${schoolData.PrincipalName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; font-weight: bold; color: #2c3e50;">Contact Number:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; color: #34495e;">${schoolData.ContactNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; font-weight: bold; color: #2c3e50;">Email:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; color: #34495e;">${schoolData.Email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; font-weight: bold; color: #2c3e50;">Address:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; color: #34495e;">${schoolData.Address}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; font-weight: bold; color: #2c3e50;">Username:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; color: #34495e;">${schoolData.Username}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #e8f4fd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #2c3e50; margin-bottom: 10px;">What happens next?</h3>
            <ul style="color: #34495e; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Our admin team will review your application</li>
              <li style="margin-bottom: 8px;">We will verify the provided information and documents</li>
              <li style="margin-bottom: 8px;">You will receive an email notification once your application is approved or declined</li>
              <li style="margin-bottom: 8px;">If approved, you can log in to your school dashboard</li>
            </ul>
          </div>
          
          <div style="text-align: center; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
            <p style="color: #7f8c8d; margin: 0; font-size: 14px;">
              This is an automated message. Please do not reply to this email.<br>
              If you have any questions, please contact our support team.
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Registration email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending registration email:', error);
    throw error;
  }
};

// Email template for school approval notification
const sendApprovalEmail = async (schoolData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: emailConfig.emailUser,
      to: schoolData.Email,
      subject: 'Congratulations! Your School Account Has Been Approved - SchoolFund',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #c3e6cb;">
            <h2 style="color: #155724; margin-bottom: 10px;">🎉 Account Approved!</h2>
            <p style="color: #155724; margin-bottom: 15px;">Dear ${schoolData.PrincipalName},</p>
            <p style="color: #155724; margin-bottom: 15px;">Great news! Your school registration request has been approved by our admin team. Your school account is now active and ready to use.</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #2c3e50; margin-bottom: 15px;">Your School Account Details:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; font-weight: bold; color: #2c3e50;">School Name:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; color: #34495e;">${schoolData.SchoolRequestID.replace(/_/g, ' ')}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; font-weight: bold; color: #2c3e50;">Username:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; color: #34495e;">${schoolData.Username}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; font-weight: bold; color: #2c3e50;">Status:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; color: #28a745; font-weight: bold;">✅ APPROVED</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #ffeaa7;">
            <h3 style="color: #856404; margin-bottom: 15px;">🚀 Next Steps:</h3>
            <ol style="color: #856404; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Visit the SchoolFund platform</li>
              <li style="margin-bottom: 8px;">Log in using your username and password</li>
              <li style="margin-bottom: 8px;">Access your school dashboard</li>
              <li style="margin-bottom: 8px;">Start creating campaigns and managing your school's funding needs</li>
            </ol>
          </div>
          
          <div style="text-align: center; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
            <a href="http://localhost:5173/login" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-bottom: 15px;">
              Login to Your Dashboard
            </a>
            <p style="color: #7f8c8d; margin: 0; font-size: 14px;">
              Welcome to SchoolFund! We're excited to help you connect with donors and secure funding for your school's needs.<br>
              If you have any questions, please contact our support team.
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Approval email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending approval email:', error);
    throw error;
  }
};

// Email template for school rejection notification
const sendRejectionEmail = async (schoolData, reason = '') => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: emailConfig.emailUser,
      to: schoolData.Email,
      subject: 'School Registration Request Update - SchoolFund',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #f5c6cb;">
            <h2 style="color: #721c24; margin-bottom: 10px;">Application Status Update</h2>
            <p style="color: #721c24; margin-bottom: 15px;">Dear ${schoolData.PrincipalName},</p>
            <p style="color: #721c24; margin-bottom: 15px;">We regret to inform you that your school registration request has not been approved at this time.</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #2c3e50; margin-bottom: 15px;">Application Details:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; font-weight: bold; color: #2c3e50;">School Name:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; color: #34495e;">${schoolData.SchoolRequestID.replace(/_/g, ' ')}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; font-weight: bold; color: #2c3e50;">Status:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e9ecef; color: #dc3545; font-weight: bold;">❌ DECLINED</td>
              </tr>
            </table>
          </div>
          
          ${reason ? `
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #ffeaa7;">
            <h3 style="color: #856404; margin-bottom: 10px;">Reason for Decline:</h3>
            <p style="color: #856404; margin: 0;">${reason}</p>
          </div>
          ` : ''}
          
          <div style="background-color: #e8f4fd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #2c3e50; margin-bottom: 10px;">What you can do:</h3>
            <ul style="color: #34495e; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Review the information provided in your application</li>
              <li style="margin-bottom: 8px;">Ensure all required documents are properly uploaded</li>
              <li style="margin-bottom: 8px;">Contact our support team if you have questions</li>
              <li style="margin-bottom: 8px;">You may submit a new application with corrected information</li>
            </ul>
          </div>
          
          <div style="text-align: center; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
            <p style="color: #7f8c8d; margin: 0; font-size: 14px;">
              If you believe this decision was made in error or have questions, please contact our support team.<br>
              We appreciate your interest in SchoolFund and hope to work with you in the future.
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Rejection email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending rejection email:', error);
    throw error;
  }
};

module.exports = {
  sendRegistrationEmail,
  sendApprovalEmail,
  sendRejectionEmail
}; 