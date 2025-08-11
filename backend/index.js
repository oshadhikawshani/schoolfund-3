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

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
