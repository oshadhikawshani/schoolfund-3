// Test script for email functionality
require('dotenv').config();
const { sendRegistrationEmail, sendApprovalEmail, sendRejectionEmail } = require('./utils/emailService');

// Test data
const testSchoolData = {
  SchoolRequestID: 'Test_School_123',
  Username: 'testschool',
  Password: 'testpassword',
  Address: '123 Test Street, Test City, TC 12345',
  ContactNumber: '+1234567890',
  Email: 'test@example.com', // Replace with your email for testing
  PrincipalName: 'John Doe',
  SchoolLogo: 'test-logo.jpg',
  Certificate: 'test-certificate.pdf',
  Status: 'pending'
};

async function testEmails() {
  console.log('Testing email functionality...\n');

  try {
    // Test registration email
    console.log('1. Testing registration email...');
    await sendRegistrationEmail(testSchoolData);
    console.log('✅ Registration email sent successfully!\n');

    // Test approval email
    console.log('2. Testing approval email...');
    await sendApprovalEmail(testSchoolData);
    console.log('✅ Approval email sent successfully!\n');

    // Test rejection email
    console.log('3. Testing rejection email...');
    await sendRejectionEmail(testSchoolData, 'Test rejection reason');
    console.log('✅ Rejection email sent successfully!\n');

    console.log('🎉 All email tests passed!');
    console.log('Check your email inbox for the test messages.');

  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.log('\nTroubleshooting tips:');
    console.log('1. Check your .env file has correct EMAIL_USER and EMAIL_PASSWORD');
    console.log('2. For Gmail, make sure you\'re using an App Password');
    console.log('3. Verify 2-factor authentication is enabled on your Gmail account');
    console.log('4. Check the EMAIL_SETUP.md file for detailed instructions');
  }
}

// Run the test
testEmails(); 