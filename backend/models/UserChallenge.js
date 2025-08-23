const mongoose = require('mongoose');

const userChallengeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'failed'],
    default: 'not_started'
  },
  attempts: {
    type: Number,
    default: 0
  },
  bestScore: {
    type: Number,
    default: 0
  },
  bestTime: {
    type: Number,
    default: null
  },
  completionDate: {
    type: Date,
    default: null
  },
  rewards: {
    coinsEarned: {
      type: Number,
      default: 0
    },
    experienceEarned: {
      type: Number,
      default: 0
    },
    badgeEarned: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge'
    }
  },
  // Game session data
  gameSessions: [{
    score: Number,
    time: Number,
    accuracy: Number,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  // Metadata
  startedAt: {
    type: Date,
    default: Date.now
  },
  lastAttemptAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userChallengeSchema.index({ user: 1, challenge: 1 }, { unique: true });
userChallengeSchema.index({ user: 1, status: 1 });
userChallengeSchema.index({ challenge: 1, status: 1 });

// Virtual for progress percentage
userChallengeSchema.virtual('progressPercentage').get(function() {
  if (this.status === 'completed') return 100;
  if (this.status === 'not_started') return 0;
  if (this.status === 'in_progress') return 50;
  return 0;
});

// Virtual for time remaining
userChallengeSchema.virtual('timeRemaining').get(function() {
  if (!this.challenge || !this.challenge.endDate) return null;
  const now = new Date();
  const endDate = new Date(this.challenge.endDate);
  return Math.max(0, endDate - now);
});

// Static method to get user's active challenges
userChallengeSchema.statics.getUserActiveChallenges = function(userId) {
  return this.find({ user: userId, status: { $in: ['not_started', 'in_progress'] } })
    .populate('challenge')
    .sort({ 'challenge.startDate': 1 });
};

// Static method to get user's completed challenges
userChallengeSchema.statics.getUserCompletedChallenges = function(userId) {
  return this.find({ user: userId, status: 'completed' })
    .populate('challenge')
    .sort({ completionDate: -1 });
};

// Static method to get challenge leaderboard
userChallengeSchema.statics.getChallengeLeaderboard = function(challengeId, limit = 10) {
  return this.find({ challenge: challengeId, status: 'completed' })
    .populate('user', 'username firstName lastName profilePicture')
    .sort({ bestScore: -1, bestTime: 1 })
    .limit(limit);
};

module.exports = mongoose.model('UserChallenge', userChallengeSchema);
