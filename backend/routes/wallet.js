const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');
const router = express.Router();

// @desc    Get user wallet balance
// @route   GET /api/wallet/balance
// @access  Private
router.get('/balance', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('coinBalance totalEarned');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      balance: user.coinBalance,
      totalEarned: user.totalEarned
    });
  } catch (error) {
    console.error('Wallet balance error:', error);
    res.status(500).json({ 
      error: 'Server error fetching wallet balance',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Spend coins from wallet
// @route   POST /api/wallet/spend
// @access  Private
router.post('/spend', protect, async (req, res) => {
  try {
    const { amount, description, category = 'coupon_redemption' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.coinBalance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update user balance
      user.coinBalance -= amount;
      await user.save({ session });

      // Create transaction record
      const transaction = new Transaction({
        user: req.user._id,
        type: 'deduct',
        amount: -amount, // Make amount negative for deductions
        description: description,
        category: category,
        balanceBefore: user.coinBalance + amount,
        balanceAfter: user.coinBalance
      });

      await transaction.save({ session });

      await session.commitTransaction();
      session.endSession();

      res.json({
        success: true,
        newBalance: user.coinBalance,
        transaction: transaction
      });

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }

  } catch (error) {
    console.error('Wallet spend error:', error);
    res.status(500).json({ 
      error: 'Server error processing wallet spend',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
