const express = require('express');
const mongoose = require('mongoose');
const Challenge = require('../models/Challenge');
const UserChallenge = require('../models/UserChallenge');
const Game = require('../models/Game');
const { protect, adminOrModerator } = require('../middleware/auth');
const router = express.Router();

// @desc    Get all active challenges
// @route   GET /api/challenges
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { type, status, limit = 20 } = req.query;
    let query = { isActive: true };
    
    if (type) query.type = type;

    const challenges = await Challenge.find(query)
      .populate('gameId', 'name thumbnail category')
      .populate('rewards.badgeId', 'name icon')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Get user's progress for each challenge
    const userProgress = await UserChallenge.find({
      user: req.user._id,
      challenge: { $in: challenges.map(c => c._id) }
    });

    const challengesWithProgress = challenges.map(challenge => {
      const progress = userProgress.find(p => p.challenge.toString() === challenge._id.toString());
      return {
        ...challenge.toObject(),
        userProgress: progress || null
      };
    });

    res.json(challengesWithProgress);
  } catch (error) {
    console.error('Challenges fetch error:', error);
    res.status(500).json({ 
      error: 'Server error fetching challenges',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get challenge by ID
// @route   GET /api/challenges/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('gameId', 'name thumbnail category description')
      .populate('rewards.badgeId', 'name icon description');

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Get user's progress
    const userProgress = await UserChallenge.findOne({
      user: req.user._id,
      challenge: challenge._id
    });

    // Get leaderboard
    const leaderboard = await UserChallenge.getChallengeLeaderboard(challenge._id, 10);

    res.json({
      challenge,
      userProgress,
      leaderboard
    });
  } catch (error) {
    console.error('Challenge fetch error:', error);
    res.status(500).json({ 
      error: 'Server error fetching challenge',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Create challenge (Admin only)
// @route   POST /api/challenges
// @access  Private (Admin)
router.post('/', protect, adminOrModerator, async (req, res) => {
  try {
    const {
      title,
      description,
      gameId,
      type,
      requirements,
      rewards,
      startDate,
      endDate,
      thumbnail,
      color,
      tags
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ 
        error: 'Title and description are required' 
      });
    }

    const challenge = await Challenge.create({
      title,
      description,
      gameId,
      type,
      requirements,
      rewards,
      startDate,
      endDate,
      thumbnail,
      color,
      tags,
      createdBy: req.user._id
    });

    res.status(201).json({
      challenge,
      message: 'Challenge created successfully'
    });
  } catch (error) {
    console.error('Challenge creation error:', error);
    res.status(500).json({ 
      error: 'Server error creating challenge',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Update challenge (Admin only)
// @route   PUT /api/challenges/:id
// @access  Private (Admin)
router.put('/:id', protect, adminOrModerator, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Update allowed fields
    const allowedFields = [
      'title', 'description', 'gameId', 'type', 'requirements',
      'rewards', 'startDate', 'endDate', 'isActive', 'isFeatured',
      'thumbnail', 'color', 'tags'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        challenge[field] = req.body[field];
      }
    });

    const updatedChallenge = await challenge.save();

    res.json({
      challenge: updatedChallenge,
      message: 'Challenge updated successfully'
    });
  } catch (error) {
    console.error('Challenge update error:', error);
    res.status(500).json({ 
      error: 'Server error updating challenge',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Delete challenge (Admin only)
// @route   DELETE /api/challenges/:id
// @access  Private (Admin)
router.delete('/:id', protect, adminOrModerator, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Soft delete
    challenge.isActive = false;
    await challenge.save();

    res.json({ message: 'Challenge deleted successfully' });
  } catch (error) {
    console.error('Challenge deletion error:', error);
    res.status(500).json({ 
      error: 'Server error deleting challenge',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get user's challenges
// @route   GET /api/challenges/user/progress
// @access  Private
router.get('/user/progress', protect, async (req, res) => {
  try {
    const { status, limit = 20 } = req.query;
    let query = { user: req.user._id };
    
    if (status) query.status = status;

    const userChallenges = await UserChallenge.find(query)
      .populate('challenge')
      .populate('challenge.gameId', 'name thumbnail category')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(userChallenges);
  } catch (error) {
    console.error('User challenges fetch error:', error);
    res.status(500).json({ 
      error: 'Server error fetching user challenges',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Start challenge
// @route   POST /api/challenges/:id/start
// @access  Private
router.post('/:id/start', protect, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge || !challenge.isActive) {
      return res.status(404).json({ error: 'Challenge not found or inactive' });
    }

    // Check if user can start the challenge
    const userChallenge = await UserChallenge.findOne({
      user: req.user._id,
      challenge: challenge._id
    });

    if (userChallenge && userChallenge.status === 'completed') {
      return res.status(400).json({ error: 'Challenge already completed' });
    }

    // Create or update user challenge
    const updatedUserChallenge = await UserChallenge.findOneAndUpdate(
      { user: req.user._id, challenge: challenge._id },
      {
        status: 'in_progress',
        startedAt: new Date(),
        lastAttemptAt: new Date()
      },
      { new: true, upsert: true }
    ).populate('challenge');

    res.json({
      userChallenge: updatedUserChallenge,
      message: 'Challenge started successfully'
    });
  } catch (error) {
    console.error('Challenge start error:', error);
    res.status(500).json({ 
      error: 'Server error starting challenge',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get challenge statistics
// @route   GET /api/challenges/:id/stats
// @access  Private
router.get('/:id/stats', protect, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Get challenge statistics
    const stats = await UserChallenge.aggregate([
      { $match: { challenge: challenge._id } },
      {
        $group: {
          _id: null,
          totalParticipants: { $sum: 1 },
          completedParticipants: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          averageScore: { $avg: '$bestScore' },
          maxScore: { $max: '$bestScore' },
          averageTime: { $avg: '$bestTime' }
        }
      }
    ]);

    const challengeStats = stats[0] || {
      totalParticipants: 0,
      completedParticipants: 0,
      averageScore: 0,
      maxScore: 0,
      averageTime: 0
    };

    res.json({
      challenge,
      stats: challengeStats
    });
  } catch (error) {
    console.error('Challenge stats error:', error);
    res.status(500).json({ 
      error: 'Server error fetching challenge statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
