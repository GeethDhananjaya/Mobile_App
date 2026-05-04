const User = require('../models/User');

const admin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);
    if (user && user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error during admin check' });
  }
};

module.exports = admin;
