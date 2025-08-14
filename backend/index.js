const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 4000;


const allowedOrigins = [
  'http://localhost:5173',
  'https://schoolfund-5jziwauy5-oshis-projects-85a38774.vercel.app',
  'https://schoolfund.vercel.app',
  'schoolfund.vercel.app/',
  'schoolfund.vercel.app',
  'https://7260e523-1a93-48ed-a853-6f2674a9ec07.e1-us-east-azure.choreoapps.dev/api/'
];

app.use(cors({
  origin: function (origin, callback) {

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(cookieParser());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Increase body size limits for large image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Test route
app.get('/', (req, res) => {
  res.send('API is running');
});

// Routes
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const schoolRequestRoutes = require('./routes/schoolRequestRoutes');
app.use('/api/school-requests', schoolRequestRoutes);

const campaignRoutes = require('./routes/campaignRoutes');
app.use('/api/campaigns', campaignRoutes);

const principalRoutes = require('./routes/principalRoutes');
app.use('/api/principal', principalRoutes);

const donorRoutes = require('./routes/donorRoutes');
app.use('/api/donors', donorRoutes);

const donationRoutes = require('./routes/donationRoutes');
app.use('/api/donations', donationRoutes);

const webhookRoutes = require('./routes/webhooks');
app.use('/api/webhooks', webhookRoutes);

const paymentRoutes = require('./routes/paymentRoutes');
app.use('/api/payments', paymentRoutes);

const schoolDonationsRoutes = require('./routes/schoolDonations');
app.use('/api/school-donations', schoolDonationsRoutes);

// MongoDB connection
console.log('Connecting to MongoDB with URI:', process.env.MONGO_URI ? 'URI exists' : 'MONGO_URI is missing');
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('MongoDB connected successfully');
    console.log('Database name:', mongoose.connection.db.databaseName);
  })
  .catch((err) => console.error('MongoDB connection error:', err));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
