const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'classconnex_super_secret_jwt_key_12345');

      // Check if user still exists
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: 'User no longer exists' });
      }

      req.user = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        rollNumber: user.rollNumber
      };

      next();
    } catch (error) {
      console.error('Auth token verification error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

const isCR = (req, res, next) => {
  if (req.user && req.user.role === 'cr') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Requires Class Representative (CR) role' });
  }
};

module.exports = { protect, isCR };
