const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  // 1. Check if the token exists in the headers
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied! 🛑' });
  }

  try {
    // 2. Verify the token (remove the "Bearer " part from the string)
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    
    // 3. Attach the user ID to the request so the next route knows exactly who is making the request
    req.user = decoded.userId;
    next(); // Let them pass!
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid! 🛑' });
  }
};

module.exports = protect;