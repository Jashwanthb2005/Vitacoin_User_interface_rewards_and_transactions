const express = require('express');
const User = require('../models/User');
const { protect, adminOrModerator } = require('../middleware/auth');
const router = express.Router();

// @desc    Get current user
// @route   GET /api/users/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('badges', 'name icon description rarity category');

    res.json(user);
  } catch (error) {
    console.error('User fetch error:', error);
    res.status(500).json({ 
      error: 'Server error fetching user',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Update current user
// @route   PUT /api/users/me
// @access  Private
router.put('/me', protect, async (req, res) => {
  try {
    const { firstName, lastName, profilePicture } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update allowed fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    const updatedUser = await user.save();

    res.json({
      user: updatedUser,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({ 
      error: 'Server error updating user',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get all users (Admin/Moderator only)
// @route   GET /api/users
// @access  Private (Admin/Moderator)
router.get('/', protect, adminOrModerator, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      role, 
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let query = {};
    
    // Search filter
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Role filter
    if (role) {
      query.role = role;
    }

    // Active status filter
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Validate sort field
    const allowedSortFields = ['username', 'coinBalance', 'totalEarned', 'badgeCount', 'createdAt', 'lastLogin'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const users = await User.find(query)
      .select('-password')
      .populate('badges', 'name icon')
      .sort({ [sortField]: sortDirection })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const totalUsers = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalUsers,
        pages: Math.ceil(totalUsers / parseInt(limit)),
        hasNext: parseInt(page) < Math.ceil(totalUsers / parseInt(limit)),
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ 
      error: 'Server error fetching users',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Search users for transfer
// @route   GET /api/users/search
// @access  Private
router.get('/search', protect, async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ 
        error: 'Search query must be at least 2 characters long' 
      });
    }

    const searchQuery = {
      isActive: true,
      _id: { $ne: req.user._id }, // Exclude current user
      $or: [
        { username: { $regex: q.trim(), $options: 'i' } },
        { firstName: { $regex: q.trim(), $options: 'i' } },
        { lastName: { $regex: q.trim(), $options: 'i' } },
        { email: { $regex: q.trim(), $options: 'i' } }
      ]
    };

    const users = await User.find(searchQuery)
      .select('username firstName lastName email coinBalance profilePicture')
      .limit(parseInt(limit))
      .sort({ username: 1 });

    res.json({
      users: users.map(user => ({
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        coinBalance: user.coinBalance,
        profilePicture: user.profilePicture
      }))
    });
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ 
      error: 'Server error searching users',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get user by ID (Admin/Moderator only)
// @route   GET /api/users/:id
// @access  Private (Admin/Moderator)
router.get('/:id', protect, adminOrModerator, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('badges', 'name icon description rarity category');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('User fetch error:', error);
    res.status(500).json({ 
      error: 'Server error fetching user',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Update user (Admin/Moderator only)
// @route   PUT /api/users/:id
// @access  Private (Admin/Moderator)
router.put('/:id', protect, adminOrModerator, async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      role, 
      isActive, 
      coinBalance,
      profilePicture 
    } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update allowed fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (coinBalance !== undefined) user.coinBalance = coinBalance;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    const updatedUser = await user.save();

    res.json({
      user: updatedUser,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({ 
      error: 'Server error updating user',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
router.delete('/:id', protect, adminOrModerator, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Soft delete by setting isActive to false
    user.isActive = false;
    await user.save();

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('User deletion error:', error);
    res.status(500).json({ 
      error: 'Server error deleting user',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private (Admin/Moderator)
router.get('/stats', protect, adminOrModerator, async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
          inactiveUsers: { $sum: { $cond: ['$isActive', 0, 1] } },
          totalCoins: { $sum: '$coinBalance' },
          totalEarned: { $sum: '$totalEarned' },
          avgCoins: { $avg: '$coinBalance' },
          avgEarned: { $avg: '$totalEarned' },
          maxCoins: { $max: '$coinBalance' },
          minCoins: { $min: '$coinBalance' }
        }
      }
    ]);

    // Get role distribution
    const roleStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent registrations
    const recentUsers = await User.find({ isActive: true })
      .select('username firstName lastName createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    const userStats = stats[0] || {};

    res.json({
      totalUsers: userStats.totalUsers || 0,
      activeUsers: userStats.activeUsers || 0,
      inactiveUsers: userStats.inactiveUsers || 0,
      totalCoins: userStats.totalCoins || 0,
      totalEarned: userStats.totalEarned || 0,
      averageCoins: Math.round(userStats.avgCoins || 0),
      averageEarned: Math.round(userStats.avgEarned || 0),
      maxCoins: userStats.maxCoins || 0,
      minCoins: userStats.minCoins || 0,
      roleDistribution: roleStats,
      recentUsers
    });
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({ 
      error: 'Server error fetching user statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
