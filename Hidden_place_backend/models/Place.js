const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String, // This could be a city name, or later we can make it exact GPS coordinates!
    required: true,
  },
  imageUrl: {
    type: String, // A link to the photo of the hidden place
    required: false,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false,
  },
  safetyLevel: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium',
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Place', placeSchema);