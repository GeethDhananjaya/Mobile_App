const express = require('express');
const router = express.Router();
const Place = require('../models/Place');
const User = require('../models/User');
const protect = require('../middleware/authMiddleware');

// ==========================================
// 1. GET ALL PLACES (Public - anyone can view)
// ==========================================
router.get('/', async (req, res) => {
  try {
    // .populate() is magic! It fetches the Place, but also grabs the Creator's name from the User database!
    const places = await Place.find().populate('creator', 'name');
    res.status(200).json(places);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error while fetching places' });
  }
});

// ==========================================
// 2. ADD A NEW PLACE (Protected - must be logged in)
// ==========================================
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, location, imageUrl, category, safetyLevel } = req.body;
    const newPlace = new Place({
      title,
      description,
      location,
      imageUrl,
      category: category || null,
      safetyLevel: safetyLevel || 'Medium',
      creator: req.user,
    });

    const savedPlace = await newPlace.save();
    
    // Notify all users about the new place
    const Notification = require('../models/Notification');
    await Notification.create({
        targetRole: 'all',
        type: 'NEW_PLACE',
        title: 'New Hidden Gem!',
        message: `A new place "${title}" was just added. Go check it out!`,
        relatedId: savedPlace._id
    });

    res.status(201).json({ message: 'Place added successfully!', place: savedPlace });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error while adding place' });
  }
});

// ==========================================
// 3. GET PLACE BY ID (Public)
// ==========================================
router.get('/:id', async (req, res) => {
  try {
    const place = await Place.findById(req.params.id)
      .populate('creator', 'name role email')
      .populate('category', 'name icon');
    if (!place) return res.status(404).json({ message: 'Place not found' });
    res.status(200).json(place);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching place details' });
  }
});

// ==========================================
// 4. UPDATE PLACE (Protected)
// ==========================================
router.put('/:id', protect, async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ message: 'Place not found' });
    
    // Check ownership or admin status
    const userObj = await User.findById(req.user);
    if (!userObj) return res.status(401).json({ message: 'User not found' });

    if (place.creator.toString() !== req.user && userObj.role !== 'admin') {
      return res.status(401).json({ message: 'Unauthorized. Only the owner or an admin can edit.' });
    }

    const updated = await Place.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: 'Place updated!', place: updated });
  } catch (error) {
    res.status(500).json({ message: 'Update failed' });
  }
});

// ==========================================
// 5. ARCHIVE / DELETE PLACE (Admin or Creator)
// ==========================================
router.delete('/:id', protect, async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ message: 'Place not found' });

    // Check if requester is Admin or the Creator
    const userObj = await User.findById(req.user);
    if (!userObj) return res.status(401).json({ message: 'User not found' });

    if (place.creator.toString() !== req.user && userObj.role !== 'admin') {
       return res.status(401).json({ message: 'Not authorized to delete this post' });
    }

    await Place.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Place successfully removed' });
  } catch (error) {
    res.status(500).json({ message: 'Deletion failed' });
  }
});

module.exports = router;