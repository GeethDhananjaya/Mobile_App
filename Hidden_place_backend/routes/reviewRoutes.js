const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const protect = require('../middleware/authMiddleware');

// ==========================================
// 1. POST REVIEW (Protected)
// ==========================================
router.post('/', protect, async (req, res) => {
  try {
    const { place, rating, comment } = req.body;
    const newReview = new Review({
      place, rating, comment, user: req.user
    });
    await newReview.save();
    res.status(201).json({ message: 'Review successfully posted', review: newReview });
  } catch (error) {
    res.status(500).json({ message: 'Error posting review', error: error.message });
  }
});

// ==========================================
// 2. GET PLACE REVIEWS (Public)
// ==========================================
router.get('/:placeId', async (req, res) => {
  try {
    const reviews = await Review.find({ place: req.params.placeId }).populate('user', 'name');
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
});

// ==========================================
// 3. EDIT REVIEW (Protected)
// ==========================================
router.put('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.user.toString() !== req.user) return res.status(401).json({ message: 'Not authorized' });

    const updated = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: 'Review updated', review: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error updating review', error: error.message });
  }
});

// ==========================================
// 4. DELETE REVIEW (Protected)
// ==========================================
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.user.toString() !== req.user) return res.status(401).json({ message: 'Not authorized' });

    await Review.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
});

module.exports = router;
