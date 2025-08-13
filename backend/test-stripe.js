require('dotenv').config();
const Stripe = require('stripe');

// Test Stripe configuration
async function testStripe() {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY is not set in environment variables');
      return;
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    // Test API connection
    const account = await stripe.accounts.retrieve();
    console.log('✅ Stripe connection successful!');
    console.log('Account ID:', account.id);
    console.log('Account type:', account.type);
    
    // Test currency support
    const currency = process.env.STRIPE_CURRENCY || 'usd';
    console.log('Currency:', currency.toUpperCase());
    
    // Test creating a test payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000, // $10.00
      currency: currency,
      description: 'Test payment for SchoolFund',
    });
    
    console.log('✅ Test payment intent created successfully!');
    console.log('Payment Intent ID:', paymentIntent.id);
    console.log('Status:', paymentIntent.status);
    
  } catch (error) {
    console.error('❌ Stripe test failed:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      console.error('Please check your STRIPE_SECRET_KEY');
    }
  }
}

testStripe(); 