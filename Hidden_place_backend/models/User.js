const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  // Password is no longer "required: true" because Google/Apple users won't have one
  password: { type: String }, 
  googleId: { type: String },
  appleId: { type: String },
  profileImageUrl: { type: String },
  // Roles: traveller, guide, admin
  role: { type: String, enum: ['traveller', 'guide', 'admin'], default: 'traveller' },
  // For guides: approval status
  isApproved: { type: Boolean, default: false }, 
  bio: { type: String }, // For guides to describe themselves
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);