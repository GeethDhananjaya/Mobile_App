const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  icon: { type: String }, // Can be a string like 'waterfall' or an emoji
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);
