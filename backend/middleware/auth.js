const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ error: 'User not found' });
      }

      if (!req.user.isActive) {
        return res.status(401).json({ error: 'User account is deactivated' });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token' });
  }
};

// Middleware to check if user is admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ error: 'Not authorized as admin' });
  }
};

// Middleware to check if user is admin or moderator
const adminOrModerator = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'moderator')) {
    next();
  } else {
    return res.status(403).json({ error: 'Not authorized as admin or moderator' });
  }
};

// Socket.IO authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    if (!user.isActive) {
      return next(new Error('Authentication error: User account is deactivated'));
    }

    socket.user = user;
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    return next(new Error('Authentication error: Invalid token'));
  }
};

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

module.exports = {
  protect,
  admin,
  adminOrModerator,
  authenticateSocket,
  generateToken
};
