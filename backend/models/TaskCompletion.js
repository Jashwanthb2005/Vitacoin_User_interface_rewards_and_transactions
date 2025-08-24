const mongoose = require('mongoose');

const taskCompletionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game'
  },
  score: {
    type: Number,
    required: function() { return this.taskType === 'game_score'; }
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  reward: {
    coins: {
      type: Number,
      default: 0
    },
    badgeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge'
    },
    experience: {
      type: Number,
      default: 0
    }
  },
  taskType: {
    type: String,
    enum: ['game_score', 'game_win', 'daily_challenge', 'achievement'],
    required: true
  },
  gameSession: {
    duration: Number, // in seconds
    attempts: Number,
    finalScore: Number
  },
  metadata: {
    device: String,
    browser: String,
    ipAddress: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
taskCompletionSchema.index({ userId: 1, taskId: 1 }, { unique: true });
taskCompletionSchema.index({ completedAt: 1 });
taskCompletionSchema.index({ taskId: 1, completedAt: 1 });
taskCompletionSchema.index({ userId: 1, completedAt: 1 });

module.exports = mongoose.model('TaskCompletion', taskCompletionSchema);
