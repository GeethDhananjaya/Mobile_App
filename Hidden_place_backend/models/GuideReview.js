const mongoose = require('mongoose');

const GuideReviewSchema = new mongoose.Schema({
  guide: { type: mongoose.Schema.Types.ObjectId, ref: 'Guide', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('GuideReview', GuideReviewSchema);
