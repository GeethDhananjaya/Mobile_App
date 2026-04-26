const mongoose = require('mongoose');

const MediaAssetSchema = new mongoose.Schema({
  place: { type: mongoose.Schema.Types.ObjectId, ref: 'Place', required: true },
  url: { type: String, required: true },
  caption: { type: String },
  type: { type: String, enum: ['image', 'video'], default: 'image' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('MediaAsset', MediaAssetSchema);
