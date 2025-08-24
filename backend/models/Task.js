const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['game_score', 'game_win', 'daily_challenge', 'achievement'],
    required: true
  },
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: function() { return this.type === 'game_score' || this.type === 'game_win'; }
  },
  targetScore: {
    type: Number,
    required: function() { return this.type === 'game_score'; }
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
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  maxCompletions: {
    type: Number,
    default: -1 // -1 means unlimited
  },
  currentCompletions: {
    type: Number,
    default: 0
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert'],
    default: 'medium'
  },
  category: {
    type: String,
    required: true
  },
  requirements: {
    minLevel: {
      type: Number,
      default: 1
    },
    previousTasks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    }]
  }
}, {
  timestamps: true
});

// Index for efficient queries
taskSchema.index({ type: 1, isActive: 1, gameId: 1 });
taskSchema.index({ category: 1, isActive: 1 });
taskSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Task', taskSchema);
