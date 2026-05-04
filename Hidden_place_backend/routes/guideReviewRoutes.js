const express = require('express');
const router = express.Router();
const GuideReview = require('../models/GuideReview');
const protect = require('../middleware/authMiddleware');

// ==========================================
// 1. POST GUIDE REVIEW (Protected)
// ==========================================
router.post('/', protect, async (req, res) => {
  try {
    const { guide, rating, comment } = req.body;
    const newReview = new GuideReview({
      guide, rating, comment, user: req.user
    });
    await newReview.save();

    // Fetch guide to find the creator
    const Guide = require('../models/Guide');
    const guideData = await Guide.findById(guide);
    if (guideData && guideData.creator) {
        const Notification = require('../models/Notification');
        await Notification.create({
            recipient: guideData.creator,
            type: 'NEW_REVIEW',
            title: 'New Review Received!',
            message: `Someone just left a ${rating}-star review on your guide profile!`,
            relatedId: guide
        });
    }

    res.status(201).json({ message: 'Review successfully posted', review: newReview });
  } catch (error) {
    res.status(500).json({ message: 'Error posting review', error: error.message });
  }
});

// ==========================================
// 2. GET REVIEWS FOR A SPECIFIC GUIDE
// ==========================================
router.get('/:guideId', async (req, res) => {
  try {
    const reviews = await GuideReview.find({ guide: req.params.guideId }).populate('user', 'name');
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
});

module.exports = router;
