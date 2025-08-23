const express = require('express');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { protect, adminOrModerator } = require('../middleware/auth');
const router = express.Router();

// @desc    Get user transaction history
// @route   GET /api/transactions
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      category,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const transactions = await Transaction.getUserHistory(req.user._id, {
      page: parseInt(page),
      limit: parseInt(limit),
      type,
      category,
      startDate,
      endDate,
      sortBy,
      sortOrder
    });

    // Get total count for pagination
    const totalCount = await Transaction.countDocuments({
      user: req.user._id,
      isVisible: true
    });

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit)),
        hasNext: parseInt(page) < Math.ceil(totalCount / parseInt(limit)),
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Transaction history error:', error);
    res.status(500).json({ 
      error: 'Server error fetching transaction history',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get transaction statistics
// @route   GET /api/transactions/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const stats = await Transaction.getUserStats(req.user._id, startDate, endDate);
    
    // Get current user for additional stats
    const user = await User.findById(req.user._id);
    
    const transactionStats = stats[0] || {
      totalEarned: 0,
      totalDeducted: 0,
      transactionCount: 0,
      earningCount: 0,
      deductionCount: 0
    };

    res.json({
      ...transactionStats,
      currentBalance: user.coinBalance,
      totalEarned: user.totalEarned,
      netEarnings: transactionStats.totalEarned - transactionStats.totalDeducted
    });
  } catch (error) {
    console.error('Transaction stats error:', error);
    res.status(500).json({ 
      error: 'Server error fetching transaction statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('metadata.adminId', 'username firstName lastName');

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Check if user owns this transaction or is admin
    if (transaction.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view this transaction' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Transaction fetch error:', error);
    res.status(500).json({ 
      error: 'Server error fetching transaction',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Create transaction (Admin/Moderator only)
// @route   POST /api/transactions
// @access  Private (Admin/Moderator)
router.post('/', protect, adminOrModerator, async (req, res) => {
  try {
    const { userId, type, amount, description, category, metadata } = req.body;

    if (!userId || !type || !amount || !description) {
      return res.status(400).json({ 
        error: 'User ID, type, amount, and description are required' 
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create transaction
    const transaction = await Transaction.createTransaction(userId, {
      type,
      amount: parseInt(amount),
      description,
      category: category || 'admin_reward',
      metadata: {
        ...metadata,
        adminId: req.user._id,
        reason: description
      }
    });

    // Update user balance
    if (amount > 0) {
      await user.addCoins(amount, description);
    } else {
      await user.deductCoins(Math.abs(amount), description);
    }

    res.status(201).json({
      transaction,
      message: `Successfully ${amount > 0 ? 'awarded' : 'deducted'} ${Math.abs(amount)} coins to user`
    });
  } catch (error) {
    console.error('Transaction creation error:', error);
    res.status(500).json({ 
      error: 'Server error creating transaction',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Update transaction (Admin only)
// @route   PUT /api/transactions/:id
// @access  Private (Admin)
router.put('/:id', protect, adminOrModerator, async (req, res) => {
  try {
    const { description, category, isVisible, tags } = req.body;

    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Update allowed fields
    if (description) transaction.description = description;
    if (category) transaction.category = category;
    if (isVisible !== undefined) transaction.isVisible = isVisible;
    if (tags) transaction.tags = tags;

    const updatedTransaction = await transaction.save();

    res.json({
      transaction: updatedTransaction,
      message: 'Transaction updated successfully'
    });
  } catch (error) {
    console.error('Transaction update error:', error);
    res.status(500).json({ 
      error: 'Server error updating transaction',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Delete transaction (Admin only)
// @route   DELETE /api/transactions/:id
// @access  Private (Admin)
router.delete('/:id', protect, adminOrModerator, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Soft delete by setting isVisible to false
    transaction.isVisible = false;
    await transaction.save();

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Transaction deletion error:', error);
    res.status(500).json({ 
      error: 'Server error deleting transaction',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get transaction categories
// @route   GET /api/transactions/categories
// @access  Private
router.get('/categories', protect, async (req, res) => {
  try {
    const categories = [
      { value: 'task_completion', label: 'Task Completion' },
      { value: 'daily_login', label: 'Daily Login' },
      { value: 'streak_bonus', label: 'Streak Bonus' },
      { value: 'achievement', label: 'Achievement' },
      { value: 'referral', label: 'Referral' },
      { value: 'admin_reward', label: 'Admin Reward' },
      { value: 'admin_penalty', label: 'Admin Penalty' },
      { value: 'system_bonus', label: 'System Bonus' },
      { value: 'event_reward', label: 'Event Reward' },
      { value: 'other', label: 'Other' }
    ];

    res.json(categories);
  } catch (error) {
    console.error('Categories fetch error:', error);
    res.status(500).json({ 
      error: 'Server error fetching categories',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get transaction types
// @route   GET /api/transactions/types
// @access  Private
router.get('/types', protect, async (req, res) => {
  try {
    const types = [
      { value: 'earn', label: 'Earn' },
      { value: 'deduct', label: 'Deduct' },
      { value: 'transfer', label: 'Transfer' },
      { value: 'bonus', label: 'Bonus' },
      { value: 'penalty', label: 'Penalty' }
    ];

    res.json(types);
  } catch (error) {
    console.error('Types fetch error:', error);
    res.status(500).json({ 
      error: 'Server error fetching types',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
