const express = require('express');
const router = express.Router();
const Guide = require('../models/Guide');
const User = require('../models/User');
const protect = require('../middleware/authMiddleware');

// ==========================================
// 1. REGISTER NEW GUIDE (Protected)
// ==========================================
router.post('/', protect, async (req, res) => {
  try {
    const { name, bio, languages, experience, rates, contact, profileImage } = req.body;
    const newGuide = new Guide({
      name, bio, languages, experience, rates, contact, profileImage,
      creator: req.user,
      isApproved: true // User is already an approved guide if they can log in to reach this
    });
    await newGuide.save();
    res.status(201).json({ message: 'Guide registered successfully', guide: newGuide });
  } catch (error) {
    res.status(500).json({ message: 'Error registering guide', error: error.message });
  }
});

// ==========================================
// 2. GET ALL GUIDES (Public)
// ==========================================
router.get('/', async (req, res) => {
  try {
    // Only fetch approved guide profiles
    const guides = await Guide.find({ isApproved: { $ne: false } })
      .populate({
        path: 'creator',
        select: 'name email profileImageUrl'
      });
    
    res.status(200).json(guides);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching guides', error: error.message });
  }
});

// ==========================================
// 3. UPDATE GUIDE PROFILE (Protected)
// ==========================================
router.put('/:id', protect, async (req, res) => {
  try {
    const guide = await Guide.findById(req.params.id);
    if (!guide) return res.status(404).json({ message: 'Guide not found' });
    
    // Check if user is the creator
    if (guide.creator.toString() !== req.user) {
      return res.status(401).json({ message: 'Not authorized to update this guide' });
    }

    const updated = await Guide.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: 'Guide updated successfully', guide: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error updating guide', error: error.message });
  }
});

// ==========================================
// 4. REMOVE GUIDE (Protected)
// ==========================================
router.delete('/:id', protect, async (req, res) => {
  try {
    console.log(`🗑 Attempting to remove guide with ID: ${req.params.id}`);
    
    // 1. Try to find the guide by Guide ID OR by Creator ID (just in case)
    let guide = await Guide.findById(req.params.id);
    if (!guide) {
      guide = await Guide.findOne({ creator: req.params.id });
    }

    if (!guide) {
      console.log('❌ Guide profile not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Guide profile not found' });
    }

    // 2. Permission Check
    const adminUser = await User.findById(req.user);
    const isOwner = guide.creator.toString() === req.user;
    const isAdmin = adminUser && adminUser.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(401).json({ message: 'Not authorized to remove this guide' });
    }

    // 3. Delete the profile
    const creatorId = guide.creator;
    await Guide.findByIdAndDelete(guide._id);

    // 4. Reset User Role to traveller
    await User.findByIdAndUpdate(creatorId, { role: 'traveller' });

    console.log('✅ Guide profile successfully removed for user:', creatorId);
    res.status(200).json({ message: 'Guide profile removed.' });
  } catch (error) {
    console.error('🔥 Error removing guide:', error);
    res.status(500).json({ message: 'Error removing guide', error: error.message });
  }
});

module.exports = router;
