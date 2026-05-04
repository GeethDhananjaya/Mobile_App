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

    // Fetch place to find the creator and notify them
    const Place = require('../models/Place');
    const User = require('../models/User');
    const placeData = await Place.findById(place);
    if (placeData && placeData.creator.toString() !== req.user) {
        // Get the commenter's name for a friendlier message
        const commenter = await User.findById(req.user).select('name');
        const commenterName = commenter ? commenter.name : 'Someone';

        const Notification = require('../models/Notification');
        await Notification.create({
            recipient: placeData.creator,
            type: 'NEW_COMMENT',
            title: 'New Comment on Your Place 💬',
            message: `${commenterName} commented on your place "${placeData.title}".`,
            relatedId: place
        });
    }

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
// 3. EDIT COMMENT (Protected)
// ==========================================
router.put('/:id', protect, async (req, res) => {
  try {
    const { text } = req.body;
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.user.toString() !== req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    comment.text = text;
    await comment.save();
    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Update failed' });
  }
});

// ==========================================
// 4. DELETE COMMENT (Admin or Owner)
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
