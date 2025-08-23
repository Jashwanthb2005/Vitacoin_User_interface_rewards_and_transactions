const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game'
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'special', 'admin'],
    default: 'daily'
  },
  requirements: {
    minScore: {
      type: Number,
      default: 0
    },
    timeLimit: {
      type: Number,
      default: null
    },
    attempts: {
      type: Number,
      default: 1
    },
    completionCriteria: {
      type: String,
      enum: ['score', 'time', 'accuracy', 'custom'],
      default: 'score'
    }
  },
  rewards: {
    coins: {
      type: Number,
      default: 0
    },
    experience: {
      type: Number,
      default: 0
    },
    badgeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge'
    }
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Challenge statistics
  stats: {
    totalParticipants: {
      type: Number,
      default: 0
    },
    totalCompletions: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    bestScore: {
      type: Number,
      default: 0
    }
  },
  // Visual assets
  thumbnail: String,
  color: String,
  tags: [String]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
challengeSchema.index({ isActive: 1, type: 1 });
challengeSchema.index({ startDate: 1, endDate: 1 });
challengeSchema.index({ createdBy: 1 });

// Virtual for challenge status
challengeSchema.virtual('status').get(function() {
  const now = new Date();
  if (!this.isActive) return 'inactive';
  if (this.endDate && now > this.endDate) return 'expired';
  if (this.startDate && now < this.startDate) return 'upcoming';
  return 'active';
});

// Virtual for completion rate
challengeSchema.virtual('completionRate').get(function() {
  if (this.stats.totalParticipants === 0) return 0;
  return Math.round((this.stats.totalCompletions / this.stats.totalParticipants) * 100);
});

// Static method to get active challenges
challengeSchema.statics.getActiveChallenges = function() {
  const now = new Date();
  return this.find({
    isActive: true,
    $or: [
      { endDate: null },
      { endDate: { $gt: now } }
    ]
  }).populate('gameId', 'name thumbnail category');
};

// Static method to get challenges by type
challengeSchema.statics.getChallengesByType = function(type) {
  return this.find({ isActive: true, type })
    .populate('gameId', 'name thumbnail category')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Challenge', challengeSchema);
