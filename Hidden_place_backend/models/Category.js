const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  icon: { type: String },
  description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);
