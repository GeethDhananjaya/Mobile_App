require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const connectDB = require('./config/db');

// Initialize Express
const app = express();

// 📂 Ensure 'uploads' directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log('📂 Created "uploads" directory.');
}

// Connect to Local MongoDB
connectDB();

// 🚨 Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve the photos/videos!

// 🚨 Routes
app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/places',     require('./routes/placeRoutes'));
app.use('/api/guides',     require('./routes/guideRoutes'));
app.use('/api/reviews',    require('./routes/reviewRoutes'));
app.use('/api/trips',      require('./routes/tripRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/media',      require('./routes/mediaRoutes'));
app.use('/api/comments',   require('./routes/commentRoutes'));
app.use('/api/guide-reviews', require('./routes/guideReviewRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// A simple test route to make sure the server is alive
app.get('/', (req, res) => {
  res.send('🚀 Hidden Place Backend is running perfectly!');
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🔥 Server is running on http://localhost:${PORT}`);
});