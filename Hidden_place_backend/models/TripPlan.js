const mongoose = require('mongoose');

const TripPlanSchema = new mongoose.Schema({
  title: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  places: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Place' }],
  startDate: { type: Date },
  endDate: { type: Date },
  status: { type: String, enum: ['Planned', 'Completed'], default: 'Planned' },
}, { timestamps: true });

module.exports = mongoose.model('TripPlan', TripPlanSchema);
