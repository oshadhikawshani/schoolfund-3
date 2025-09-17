const fetch = require('node-fetch');

async function runMigration() {
  try {
    // Replace with your actual donor token
    const token = 'YOUR_DONOR_TOKEN_HERE';
    
    const response = await fetch('http://localhost:4000/api/donations/migrate/campaign-ids', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    console.log('Migration result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

runMigration();

