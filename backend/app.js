// backend/app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const rideRoutes = require('./routes/rideRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// CORS for your Next.js frontend
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

// Body parser
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);

app.use('/api/lost-items', require('./routes/lostItemRoutes'));

// Global error handler (must be last)
app.use(errorHandler);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

module.exports = app;
