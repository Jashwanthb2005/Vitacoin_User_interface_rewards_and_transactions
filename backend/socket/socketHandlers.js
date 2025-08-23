const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Badge = require('../models/Badge');

// Store connected users
const connectedUsers = new Map();

const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username} (${socket.id})`);
    
    // Add user to connected users map
    connectedUsers.set(socket.user._id.toString(), {
      socketId: socket.id,
      user: socket.user,
      connectedAt: new Date()
    });

    // Join user to their personal room
    socket.join(`user_${socket.user._id}`);

    // Send initial user data
    socket.emit('user_data', {
      user: socket.user,
      connectedUsers: connectedUsers.size
    });

    // Handle user joining leaderboard room
    socket.on('join_leaderboard', () => {
      socket.join('leaderboard');
      console.log(`${socket.user.username} joined leaderboard room`);
    });

    // Handle user leaving leaderboard room
    socket.on('leave_leaderboard', () => {
      socket.leave('leaderboard');
      console.log(`${socket.user.username} left leaderboard room`);
    });

    // Handle coin balance updates
    socket.on('update_balance', async (data) => {
      try {
        const { amount, reason, category = 'other' } = data;
        
        if (!amount || amount === 0) {
          socket.emit('error', { message: 'Invalid amount' });
          return;
        }

        const user = await User.findById(socket.user._id);
        if (!user) {
          socket.emit('error', { message: 'User not found' });
          return;
        }

        let updatedUser;
        if (amount > 0) {
          updatedUser = await user.addCoins(amount, reason);
        } else {
          updatedUser = await user.deductCoins(Math.abs(amount), reason);
        }

        // Create transaction record
        const transaction = await Transaction.createTransaction(socket.user._id, {
          type: amount > 0 ? 'earn' : 'deduct',
          amount: amount,
          description: reason,
          category: category
        });

        // Emit balance update to user
        socket.emit('balance_updated', {
          newBalance: updatedUser.coinBalance,
          transaction: transaction,
          message: `${amount > 0 ? 'Earned' : 'Deducted'} ${Math.abs(amount)} coins`
        });

        // Broadcast to leaderboard room
        io.to('leaderboard').emit('leaderboard_update', {
          userId: socket.user._id,
          newBalance: updatedUser.coinBalance,
          username: socket.user.username
        });

        // Send notification
        socket.emit('notification', {
          type: amount > 0 ? 'success' : 'warning',
          title: amount > 0 ? 'Coins Earned!' : 'Coins Deducted',
          message: `${amount > 0 ? 'Earned' : 'Deducted'} ${Math.abs(amount)} coins`,
          data: {
            amount: amount,
            reason: reason,
            newBalance: updatedUser.coinBalance
          }
        });

      } catch (error) {
        console.error('Balance update error:', error);
        socket.emit('error', { message: error.message });
      }
    });

    // Handle badge award
    socket.on('award_badge', async (data) => {
      try {
        const { badgeId } = data;
        
        const badge = await Badge.findById(badgeId);
        if (!badge) {
          socket.emit('error', { message: 'Badge not found' });
          return;
        }

        const user = await User.findById(socket.user._id).populate('badges');
        
        if (!badge.canUserEarn(user)) {
          socket.emit('error', { message: 'Cannot earn this badge' });
          return;
        }

        const updatedUser = await badge.awardToUser(socket.user._id);

        // Emit badge award to user
        socket.emit('badge_awarded', {
          badge: badge,
          user: updatedUser,
          message: `Congratulations! You earned the ${badge.name} badge!`
        });

        // Send notification
        socket.emit('notification', {
          type: 'success',
          title: 'Badge Earned!',
          message: `You earned the ${badge.name} badge!`,
          data: {
            badge: badge,
            reward: badge.rewards.coins
          }
        });

        // Broadcast to leaderboard room
        io.to('leaderboard').emit('badge_update', {
          userId: socket.user._id,
          username: socket.user.username,
          badge: badge,
          badgeCount: updatedUser.badges.length
        });

      } catch (error) {
        console.error('Badge award error:', error);
        socket.emit('error', { message: error.message });
      }
    });

    // Handle transaction history request
    socket.on('get_transactions', async (data) => {
      try {
        const { page = 1, limit = 20, type, category } = data;
        
        const transactions = await Transaction.getUserHistory(socket.user._id, {
          page: parseInt(page),
          limit: parseInt(limit),
          type,
          category
        });

        socket.emit('transactions_data', {
          transactions: transactions,
          page: parseInt(page),
          hasMore: transactions.length === parseInt(limit)
        });

      } catch (error) {
        console.error('Transaction history error:', error);
        socket.emit('error', { message: error.message });
      }
    });

    // Handle leaderboard request
    socket.on('get_leaderboard', async (data) => {
      try {
        const { limit = 10 } = data;
        
        const leaderboard = await User.getLeaderboard(parseInt(limit));

        socket.emit('leaderboard_data', {
          leaderboard: leaderboard,
          userRank: await getUserRank(socket.user._id)
        });

      } catch (error) {
        console.error('Leaderboard error:', error);
        socket.emit('error', { message: error.message });
      }
    });

    // Handle user activity
    socket.on('user_activity', (data) => {
      // Log user activity for analytics
      console.log(`User activity from ${socket.user.username}:`, data);
      
      // Broadcast to admin room if needed
      socket.to('admin_room').emit('user_activity_log', {
        userId: socket.user._id,
        username: socket.user.username,
        activity: data,
        timestamp: new Date()
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.username} (${socket.id})`);
      
      // Remove user from connected users map
      connectedUsers.delete(socket.user._id.toString());
      
      // Broadcast user count update
      io.emit('connected_users_count', connectedUsers.size);
    });
  });
};

// Helper function to get user rank
const getUserRank = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    const rank = await User.countDocuments({
      coinBalance: { $gt: user.coinBalance },
      isActive: true
    });

    return rank + 1;
  } catch (error) {
    console.error('Error getting user rank:', error);
    return null;
  }
};

// Function to broadcast system notifications
const broadcastSystemNotification = (io, notification) => {
  io.emit('system_notification', {
    ...notification,
    timestamp: new Date()
  });
};

// Function to broadcast to specific user
const sendToUser = (io, userId, event, data) => {
  const userData = connectedUsers.get(userId.toString());
  if (userData) {
    io.to(userData.socketId).emit(event, data);
  }
};

// Function to broadcast to all users
const broadcastToAll = (io, event, data) => {
  io.emit(event, {
    ...data,
    timestamp: new Date()
  });
};

module.exports = {
  setupSocketHandlers,
  connectedUsers,
  broadcastSystemNotification,
  sendToUser,
  broadcastToAll
};
