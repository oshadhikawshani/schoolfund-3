const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const cookieParser = require('cookie-parser');



const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));


app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running');
});

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const schoolRequestRoutes = require('./routes/schoolRequestRoutes');
app.use('/api/school-requests', schoolRequestRoutes);

// MongoDB connection (update .env with your URI)
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 