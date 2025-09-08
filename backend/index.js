const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const cookieParser = require('cookie-parser');

const app = express();

// Allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'https://schoolfund-5jziwauy5-oshis-projects-85a38774.vercel.app',
  'https://schoolfund.vercel.app',
  'https://7260e523-1a93-48ed-a853-6f2674a9ec07.e1-us-east-azure.choreoapps.dev'
];

// Middlewares
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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static('uploads'));

// Proxy route to forward requests to the remote API
app.use('/api/proxy/campaigns/:id', async (req, res) => {
  const { id } = req.params;
  const remoteUrl = `https://7260e523-1a93-48ed-a853-6f2674a9ec07.e1-us-east-azure.choreoapps.dev/api/campaigns/${id}`;

  try {
    const response = await axios.get(remoteUrl, {
      headers: { ...req.headers }
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Proxy error', details: error.message });
    }
  }
});

// Test route
app.get('/', (req, res) => {
  res.send('API is running');
});

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/school-requests', require('./routes/schoolRequestRoutes'));
app.use('/api/campaigns', require('./routes/campaignRoutes'));
app.use('/api/principal', require('./routes/principalRoutes'));
app.use('/api/donors', require('./routes/donorRoutes'));
app.use('/api/donations', require('./routes/donationRoutes'));
app.use('/api/webhooks', require('./routes/webhooks'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/school-donations', require('./routes/schoolDonations'));

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
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
