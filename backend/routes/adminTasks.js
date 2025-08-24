const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const TaskCompletion = require('../models/TaskCompletion');
const User = require('../models/User');
const Game = require('../models/Game');
const Badge = require('../models/Badge');
const { protect, admin } = require('../middleware/auth');

// @desc    Get all tasks with completion statistics
// @route   GET /api/admin/tasks
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('gameId', 'name category')
      .populate('reward.badgeId', 'name icon')
      .sort({ createdAt: -1 });

    // Get completion statistics for each task
    const tasksWithStats = await Promise.all(
      tasks.map(async (task) => {
        const completions = await TaskCompletion.find({ taskId: task._id });
        const uniqueUsers = [...new Set(completions.map(c => c.userId.toString()))];
        
        return {
          ...task.toObject(),
          completionStats: {
            totalCompletions: completions.length,
            uniqueUsers: uniqueUsers.length,
            completionRate: uniqueUsers.length > 0 ? 
              ((uniqueUsers.length / (await User.countDocuments())) * 100).toFixed(2) : 0
          }
        };
      })
    );

    res.json(tasksWithStats);
  } catch (error) {
    console.error('Admin tasks fetch error:', error);
    res.status(500).json({
      error: 'Server error fetching tasks',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Create a new task
// @route   POST /api/admin/tasks
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      gameId,
      targetScore,
      reward,
      startDate,
      endDate,
      maxCompletions,
      difficulty,
      category,
      requirements
    } = req.body;

    // Validate required fields
    if (!title || !description || !type || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate game-related fields
    if ((type === 'game_score' || type === 'game_win') && !gameId) {
      return res.status(400).json({ error: 'Game ID is required for game-based tasks' });
    }

    if (type === 'game_score' && !targetScore) {
      return res.status(400).json({ error: 'Target score is required for score-based tasks' });
    }

    const task = new Task({
      title,
      description,
      type,
      gameId,
      targetScore,
      reward,
      startDate: startDate || new Date(),
      endDate,
      maxCompletions: maxCompletions || -1,
      difficulty: difficulty || 'medium',
      category,
      requirements: requirements || {}
    });

    await task.save();
    
    const populatedTask = await Task.findById(task._id)
      .populate('gameId', 'name category')
      .populate('reward.badgeId', 'name icon');

    res.status(201).json(populatedTask);
  } catch (error) {
    console.error('Task creation error:', error);
    res.status(500).json({
      error: 'Server error creating task',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Update a task
// @route   PUT /api/admin/tasks/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('gameId', 'name category')
     .populate('reward.badgeId', 'name icon');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Task update error:', error);
    res.status(500).json({
      error: 'Server error updating task',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Toggle task status
// @route   PUT /api/admin/tasks/:id/toggle
// @access  Private/Admin
router.put('/:id/toggle', protect, admin, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.isActive = !task.isActive;
    await task.save();

    res.json({ message: `Task ${task.isActive ? 'activated' : 'deactivated'}`, task });
  } catch (error) {
    console.error('Task toggle error:', error);
    res.status(500).json({
      error: 'Server error toggling task',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Delete a task
// @route   DELETE /api/admin/tasks/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if task has completions
    const completions = await TaskCompletion.countDocuments({ taskId: req.params.id });
    if (completions > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete task with existing completions',
        completions
      });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Task deletion error:', error);
    res.status(500).json({
      error: 'Server error deleting task',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get task completion details
// @route   GET /api/admin/tasks/:id/completions
// @access  Private/Admin
router.get('/:id/completions', protect, admin, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const completions = await TaskCompletion.find({ taskId: req.params.id })
      .populate('userId', 'firstName lastName username email')
      .populate('gameId', 'name category')
      .populate('reward.badgeId', 'name icon')
      .sort({ completedAt: -1 });

    res.json({
      task,
      completions,
      totalCompletions: completions.length,
      uniqueUsers: [...new Set(completions.map(c => c.userId._id.toString()))].length
    });
  } catch (error) {
    console.error('Task completions fetch error:', error);
    res.status(500).json({
      error: 'Server error fetching task completions',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get user task completion statistics
// @route   GET /api/admin/tasks/user/:userId
// @access  Private/Admin
router.get('/user/:userId', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const completions = await TaskCompletion.find({ userId: req.params.userId })
      .populate('taskId', 'title description type category difficulty')
      .populate('gameId', 'name category')
      .populate('reward.badgeId', 'name icon')
      .sort({ completedAt: -1 });

    const totalRewards = completions.reduce((acc, completion) => {
      acc.coins += completion.reward.coins || 0;
      acc.experience += completion.reward.experience || 0;
      acc.badges += completion.reward.badgeId ? 1 : 0;
      return acc;
    }, { coins: 0, experience: 0, badges: 0 });

    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        coinBalance: user.coinBalance
      },
      completions,
      totalRewards,
      totalTasks: completions.length,
      completionRate: completions.length > 0 ? 
        ((completions.length / (await Task.countDocuments({ isActive: true }))) * 100).toFixed(2) : 0
    });
  } catch (error) {
    console.error('User task statistics error:', error);
    res.status(500).json({
      error: 'Server error fetching user task statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get task analytics and statistics
// @route   GET /api/admin/tasks/analytics/overview
// @access  Private/Admin
router.get('/analytics/overview', protect, admin, async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments();
    const activeTasks = await Task.countDocuments({ isActive: true });
    const totalCompletions = await TaskCompletion.countDocuments();
    const totalUsers = await User.countDocuments();

    // Get completion statistics by task type
    const typeStats = await TaskCompletion.aggregate([
      {
        $lookup: {
          from: 'tasks',
          localField: 'taskId',
          foreignField: '_id',
          as: 'task'
        }
      },
      {
        $unwind: '$task'
      },
      {
        $group: {
          _id: '$task.type',
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          type: '$_id',
          completions: '$count',
          uniqueUsers: { $size: '$uniqueUsers' }
        }
      }
    ]);

    // Get daily completion trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyCompletions = await TaskCompletion.aggregate([
      {
        $match: {
          completedAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$completedAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      overview: {
        totalTasks,
        activeTasks,
        totalCompletions,
        totalUsers,
        averageCompletionsPerUser: totalUsers > 0 ? (totalCompletions / totalUsers).toFixed(2) : 0
      },
      typeStats,
      dailyCompletions
    });
  } catch (error) {
    console.error('Task analytics error:', error);
    res.status(500).json({
      error: 'Server error fetching task analytics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
