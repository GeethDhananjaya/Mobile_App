const express = require('express');
const Notification = require('../models/Notification');
const protect = require('../middleware/authMiddleware');
const router = express.Router();

// Get notifications for current user
router.get('/', protect, async (req, res) => {
    try {
        const query = {
            $or: [
                { recipient: req.user._id },
                { targetRole: 'all' },
                { targetRole: req.user.role }
            ]
        };
        const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Mark all as read
router.put('/read', protect, async (req, res) => {
    try {
        // We only mark specific recipient notifications as read to avoid marking 'all' or 'admin' as read for everyone globally if we don't track per-user read state for global ones.
        // For simplicity, let's just mark the recipient ones.
        await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
        res.json({ message: 'Notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create generic notification (Internal use mainly, but keep here just in case)
router.post('/', protect, async (req, res) => {
    try {
        const notif = await Notification.create(req.body);
        res.status(201).json(notif);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
