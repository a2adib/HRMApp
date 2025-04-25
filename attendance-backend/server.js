// server.js

// 1. Import necessary modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// 2. Initialize the app
const app = express();

// 3. Use dotenv to manage environment variables
dotenv.config();

// 4. Import routes
const leaveRequestRoutes = require('./routes/leaveRequest'); // Make sure the path is correct

// 5. Middleware setup
app.use(cors());
app.use(express.json()); // For parsing application/json

// 6. Use the routes (important to do this **after** the app initialization)
app.use('/api/leaveRequest', leaveRequestRoutes);

// 7. Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// 8. Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
