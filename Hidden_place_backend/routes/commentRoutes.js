const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const protect = require('../middleware/authMiddleware');

// ==========================================
// 1. ADD COMMENT (Protected)
// ==========================================
router.post('/', protect, async (req, res) => {
  try {
    const { place, text } = req.body;
    const comment = new Comment({ place, user: req.user, text });
    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment' });
  }
});

// ==========================================
// 2. GET PLACE COMMENTS (Public)
// ==========================================
router.get('/:placeId', async (req, res) => {
  try {
    const comments = await Comment.find({ place: req.params.placeId }).populate('user', 'name');
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments' });
  }
});

// ==========================================
// 3. DELETE COMMENT (Admin or Owner)
// ==========================================
router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Not found' });

    const User = require('../models/User');
    const user = await User.findById(req.user);

    if (comment.user.toString() !== req.user && !user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Comment.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Comment removed' });
  } catch (error) {
    res.status(500).json({ message: 'Deletion failed' });
  }
});

module.exports = router;
