# Stripe Payment Integration Setup Guide

## Overview
This guide will help you set up Stripe payments for monetary donations in your SchoolFund application.

## Prerequisites
- Stripe account (test mode for development)
- Stripe publishable key and secret key
- Webhook endpoint URL

## Step 1: Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_CURRENCY=usd

# Frontend URL (for Stripe redirects)
CLIENT_URL=http://localhost:5173

# MongoDB Connection
MONGO_URI=your_mongodb_connection_string_here

# JWT Secret
JWT_SECRET=your_jwt_secret_here
```

## Step 2: Stripe Dashboard Setup

### 2.1 Get Your API Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** → **API keys**
3. Copy your **Publishable key** and **Secret key**
4. Replace the placeholder values in your `.env` file

### 2.2 Set Up Webhook
1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set the endpoint URL:
   - Development: `http://localhost:4000/api/webhooks/stripe`
   - Production: `https://your-domain.com/api/webhooks/stripe`
4. Select the event: `checkout.session.completed`
5. Copy the webhook signing secret and add it to your `.env` file as `STRIPE_WEBHOOK_SECRET`

## Step 3: Test Your Setup

Run the test script to verify your Stripe configuration:

```bash
cd backend
node test-stripe.js
```

You should see:
```
✅ Stripe connection successful!
Account ID: acct_xxxxxxxxxxxxx
Account type: standard
Currency: USD
✅ Test payment intent created successfully!
Payment Intent ID: pi_xxxxxxxxxxxxx
Status: requires_payment_method
```

## Step 4: Start Your Application

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Step 5: Test the Payment Flow

1. Navigate to a campaign page
2. Click "Donate Now"
3. Fill in the donation form
4. Click "Donate" to be redirected to Stripe Checkout
5. Complete the test payment using Stripe's test card numbers:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - **Requires Authentication**: `4000 0025 0000 3155`

## Payment Flow Overview

1. **Donation Creation**: User fills donation form → Backend creates pending donation record
2. **Stripe Checkout**: Backend creates Stripe checkout session → User redirected to Stripe
3. **Payment Processing**: User completes payment on Stripe
4. **Webhook Processing**: Stripe sends webhook → Backend updates donation status to "paid"
5. **Success Page**: User redirected to success page → Frontend verifies payment

## File Structure

```
backend/
├── routes/
│   ├── donationRoutes.js    # Creates Stripe checkout sessions
│   ├── webhooks.js          # Handles Stripe webhooks
│   └── paymentRoutes.js     # Verifies payments
├── models/
│   ├── MonetaryDonation.js  # Donation records
│   └── Payment.js           # Payment records
└── test-stripe.js          # Test script

frontend/
├── src/pages/
│   ├── MonetaryDonationPage.jsx  # Donation form
│   ├── PaymentSuccess.jsx        # Success page
│   └── PaymentCancel.jsx         # Cancel page
```

## Troubleshooting

### Common Issues

1. **"STRIPE_SECRET_KEY is missing"**
   - Check your `.env` file exists and has the correct key
   - Ensure the key starts with `sk_test_` (test mode) or `sk_live_` (live mode)

2. **Webhook signature verification failed**
   - Verify your `STRIPE_WEBHOOK_SECRET` is correct
   - Check that your webhook endpoint URL is accessible

3. **Payment not updating in database**
   - Check webhook logs in your server console
   - Verify webhook endpoint is receiving events from Stripe

4. **CORS errors**
   - Ensure your frontend URL is in the allowed origins list
   - Check that `CLIENT_URL` environment variable is set correctly

### Testing Webhooks Locally

For local development, you can use Stripe CLI to forward webhooks:

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:4000/api/webhooks/stripe
```

This will give you a webhook endpoint secret to use in your `.env` file.

## Security Notes

- Never commit your `.env` file to version control
- Use test keys for development
- Switch to live keys only for production
- Always verify webhook signatures
- Use HTTPS in production

## Support

For Stripe-specific issues, refer to the [Stripe Documentation](https://stripe.com/docs). 