const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || '*'}));
// Basic security headers and allow credentials if single origin configured
if (process.env.FRONTEND_ORIGIN) {
  app.use((req, res, next) => {
    res.header('Vary', 'Origin');
    next();
  });
}
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/billing-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Basic route
app.get('/', (req, res) => {
  res.send('Billing App Backend is running');
});

// API routes
app.use('/api/products', require('./routes/products'));
app.use('/api/bills', require('./routes/bills'));
app.use('/api/users', require('./routes/users'));
app.use('/api/pending-bills', require('./routes/pendingBills'));
app.use("/api/manual-entries", require("./routes/manualEntries"));

// 404 handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Centralized error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ success: false, error: err.message || 'Server error' });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
