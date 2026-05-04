const express = require('express');
const Notification = require('../models/Notification');
const protect = require('../middleware/authMiddleware');
const router = express.Router();

// Get notifications for current user
router.get('/', protect, async (req, res) => {
    try {
        // req.user is a plain string ID set by authMiddleware (decoded.userId)
        const userId = req.user;
        const User = require('../models/User');
        const user = await User.findById(userId).select('role');
        const userRole = user ? user.role : 'user';

        const query = {
            $or: [
                { recipient: userId },
                { targetRole: 'all' },
                { targetRole: userRole }
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
        // req.user is a plain string ID set by authMiddleware
        await Notification.updateMany({ recipient: req.user, isRead: false }, { isRead: true });
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
