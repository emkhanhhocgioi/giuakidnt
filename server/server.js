// app.js
const express = require('express');
const mongoose = require('mongoose');
const accountRoutes = require('./routes/accountRoutes');
const cors = require('cors');
const app = express();

// Middleware to parse JSON bodies
app.use(cors())
app.use(express.json());

// Use account routes for handling signup
app.use('/api/', accountRoutes);

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/hardwaredb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err));

// Start the server
app.listen(5000, () => {
  console.log('Server running on port 5000');
});