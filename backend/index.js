require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const historyRoutes = require('./routes/historyRoutes');
const alertRoutes = require('./routes/alertRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
require('./utils/cronJobs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '10mb' })); // ensure large payload for base64 images
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
    res.send('PriceSense API is running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
