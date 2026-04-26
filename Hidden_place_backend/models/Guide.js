const mongoose = require('mongoose');

const GuideSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bio: { type: String, required: true },
  languages: [{ type: String }],
  experience: { type: String }, // e.g., "5 years"
  rates: { type: String, required: true }, // e.g., "$50 per day"
  contact: { type: String, required: true },
  profileImage: { type: String },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isApproved: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Guide', GuideSchema);
