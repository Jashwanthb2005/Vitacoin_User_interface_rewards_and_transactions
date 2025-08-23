const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const router = express.Router();

// @desc    Get leaderboard
// @route   GET /api/leaderboard
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { limit = 10, offset = 0, sortBy = 'coinBalance' } = req.query;

    let sortField = 'coinBalance';
    let sortOrder = -1;

    // Validate sort field
    const allowedSortFields = ['coinBalance', 'totalEarned', 'badgeCount', 'createdAt'];
    if (allowedSortFields.includes(sortBy)) {
      sortField = sortBy;
    }

    const leaderboard = await User.find({ isActive: true })
      .select('username firstName lastName coinBalance totalEarned badges profilePicture createdAt')
      .populate('badges', 'name icon rarity')
      .sort({ [sortField]: sortOrder })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    // Get user's rank
    const userRank = await getUserRank(req.user._id, sortField, sortOrder);

    // Get total count for pagination
    const totalUsers = await User.countDocuments({ isActive: true });

    res.json({
      leaderboard,
      userRank,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: totalUsers,
        hasMore: parseInt(offset) + parseInt(limit) < totalUsers
      }
    });
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    res.status(500).json({ 
      error: 'Server error fetching leaderboard',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get user's rank
// @route   GET /api/leaderboard/rank
// @access  Private
router.get('/rank', protect, async (req, res) => {
  try {
    const { sortBy = 'coinBalance' } = req.query;

    let sortField = 'coinBalance';
    let sortOrder = -1;

    // Validate sort field
    const allowedSortFields = ['coinBalance', 'totalEarned', 'badgeCount', 'createdAt'];
    if (allowedSortFields.includes(sortBy)) {
      sortField = sortBy;
    }

    const userRank = await getUserRank(req.user._id, sortField, sortOrder);
    const totalUsers = await User.countDocuments({ isActive: true });

    res.json({
      rank: userRank,
      totalUsers,
      percentile: totalUsers > 0 ? Math.round(((totalUsers - userRank + 1) / totalUsers) * 100) : 0
    });
  } catch (error) {
    console.error('User rank fetch error:', error);
    res.status(500).json({ 
      error: 'Server error fetching user rank',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get leaderboard statistics
// @route   GET /api/leaderboard/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    // Get top 3 users
    const topUsers = await User.find({ isActive: true })
      .select('username firstName lastName coinBalance')
      .sort({ coinBalance: -1 })
      .limit(3);

    // Get total statistics
    const stats = await User.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          totalCoins: { $sum: '$coinBalance' },
          totalEarned: { $sum: '$totalEarned' },
          avgCoins: { $avg: '$coinBalance' },
          avgEarned: { $avg: '$totalEarned' },
          maxCoins: { $max: '$coinBalance' },
          minCoins: { $min: '$coinBalance' }
        }
      }
    ]);

    // Get badge statistics
    const badgeStats = await User.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalBadges: { $sum: { $size: '$badges' } },
          avgBadges: { $avg: { $size: '$badges' } },
          maxBadges: { $max: { $size: '$badges' } }
        }
      }
    ]);

    const leaderboardStats = stats[0] || {};
    const badgeData = badgeStats[0] || {};

    res.json({
      topUsers,
      totalUsers: leaderboardStats.totalUsers || 0,
      totalCoins: leaderboardStats.totalCoins || 0,
      totalEarned: leaderboardStats.totalEarned || 0,
      averageCoins: Math.round(leaderboardStats.avgCoins || 0),
      averageEarned: Math.round(leaderboardStats.avgEarned || 0),
      maxCoins: leaderboardStats.maxCoins || 0,
      minCoins: leaderboardStats.minCoins || 0,
      totalBadges: badgeData.totalBadges || 0,
      averageBadges: Math.round(badgeData.avgBadges || 0),
      maxBadges: badgeData.maxBadges || 0
    });
  } catch (error) {
    console.error('Leaderboard stats error:', error);
    res.status(500).json({ 
      error: 'Server error fetching leaderboard statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get users around current user
// @route   GET /api/leaderboard/around-me
// @access  Private
router.get('/around-me', protect, async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const currentUser = await User.findById(req.user._id);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get users with similar coin balance (above and below)
    const usersAbove = await User.find({
      isActive: true,
      coinBalance: { $gt: currentUser.coinBalance }
    })
      .select('username firstName lastName coinBalance')
      .sort({ coinBalance: 1 })
      .limit(parseInt(limit));

    const usersBelow = await User.find({
      isActive: true,
      coinBalance: { $lt: currentUser.coinBalance }
    })
      .select('username firstName lastName coinBalance')
      .sort({ coinBalance: -1 })
      .limit(parseInt(limit));

    // Combine and sort
    const aroundMe = [...usersAbove.reverse(), currentUser, ...usersBelow];

    res.json({
      users: aroundMe,
      currentUserIndex: usersAbove.length
    });
  } catch (error) {
    console.error('Around me fetch error:', error);
    res.status(500).json({ 
      error: 'Server error fetching users around current user',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get leaderboard by category
// @route   GET /api/leaderboard/category/:category
// @access  Private
router.get('/category/:category', protect, async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    let sortField = 'coinBalance';
    let sortOrder = -1;

    // Validate category and set appropriate sort field
    switch (category) {
      case 'coins':
        sortField = 'coinBalance';
        break;
      case 'earned':
        sortField = 'totalEarned';
        break;
      case 'badges':
        sortField = 'badgeCount';
        break;
      case 'newest':
        sortField = 'createdAt';
        sortOrder = 1;
        break;
      default:
        return res.status(400).json({ error: 'Invalid category' });
    }

    const leaderboard = await User.find({ isActive: true })
      .select('username firstName lastName coinBalance totalEarned badges profilePicture createdAt')
      .populate('badges', 'name icon rarity')
      .sort({ [sortField]: sortOrder })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    // Get user's rank in this category
    const userRank = await getUserRank(req.user._id, sortField, sortOrder);

    res.json({
      category,
      leaderboard,
      userRank
    });
  } catch (error) {
    console.error('Category leaderboard error:', error);
    res.status(500).json({ 
      error: 'Server error fetching category leaderboard',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper function to get user rank
const getUserRank = async (userId, sortField = 'coinBalance', sortOrder = -1) => {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    let query = { isActive: true };
    
    if (sortOrder === -1) {
      query[sortField] = { $gt: user[sortField] };
    } else {
      query[sortField] = { $lt: user[sortField] };
    }

    const rank = await User.countDocuments(query);
    return rank + 1;
  } catch (error) {
    console.error('Error getting user rank:', error);
    return null;
  }
};

module.exports = router;
