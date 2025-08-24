import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiAward, FiDollarSign, FiActivity, FiPlay, FiMinus, FiLogOut, FiGift } from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useSocket } from '../../contexts/SocketContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import CoinDisplay from '../../components/UI/CoinDisplay';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const { emit, socket } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Listen for real-time updates
  useEffect(() => {
    if (socket) {
      // Listen for balance updates
      socket.on('balance_updated', () => {
        fetchDashboardData();
      });

      // Listen for transaction updates
      socket.on('transactions_data', () => {
        fetchDashboardData();
      });

      return () => {
        socket.off('balance_updated');
        socket.off('transactions_data');
      };
    }
  }, [socket]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, transactionsRes] = await Promise.all([
        axios.get('/api/transactions/stats'),
        axios.get('/api/transactions?limit=5')
      ]);

      setStats(statsRes.data);
      setRecentTransactions(transactionsRes.data.transactions);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh dashboard data
  const refreshDashboard = () => {
    fetchDashboardData();
  };

  const handleQuickEarn = async () => {
    try {
      await emit('update_balance', { amount: 10, type: 'earning', description: 'Quick earn bonus' });
      fetchDashboardData();
    } catch (error) {
      console.error('Error earning coins:', error);
    }
  };

  const handleQuickDeduct = async () => {
    try {
      await emit('update_balance', { amount: 5, type: 'deduction', description: 'Quick deduction' });
      fetchDashboardData();
    } catch (error) {
      console.error('Error deducting coins:', error);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'earn':
      case 'bonus':
        return <FiTrendingUp className="w-5 h-5 text-green-600" />;
      case 'deduct':
      case 'penalty':
        return <FiMinus className="w-5 h-5 text-red-600" />;
      case 'transfer':
        return <FiActivity className="w-5 h-5 text-blue-600" />;
      default:
        return <FiActivity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'earn':
      case 'bonus':
        return 'text-green-600';
      case 'deduct':
      case 'penalty':
        return 'text-red-600';
      case 'transfer':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTransactionSign = (type) => {
    switch (type) {
      case 'earn':
      case 'bonus':
        return '+';
      case 'deduct':
      case 'penalty':
        return '-';
      default:
        return '';
    }
  };

  const formatTransactionAmount = (transaction) => {
    const amount = Math.abs(transaction.amount);
    const sign = getTransactionSign(transaction.type);
    return `${sign}${amount}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex justify-between items-center"
      >
        <div className="text-center flex-1">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-lg text-gray-600">
            Here's what's happening with your Vitacoin account
          </p>
        </div>
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to logout?')) {
              logout();
              navigate('/login');
            }
          }}
          className="btn btn-outline btn-error"
        >
          <FiLogOut className="w-4 h-4 mr-2" />
          Logout
        </button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid-auto-fit"
      >
        <div className="stats-card">
          <div className="stats-icon">
            <FiDollarSign className="w-6 h-6" />
          </div>
          <div className="stats-value">
            <CoinDisplay balance={user?.coinBalance || 0} size="sm" />
          </div>
          <div className="stats-label">Current Balance</div>
        </div>

        <div className="stats-card">
          <div className="stats-icon bg-green-100">
            <FiTrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div className="stats-value">
            <CoinDisplay balance={stats?.totalEarned || 0} size="sm" />
          </div>
          <div className="stats-label">Total Earned</div>
        </div>

        <div className="stats-card">
          <div className="stats-icon bg-red-100">
            <FiMinus className="w-6 h-6 text-red-600" />
          </div>
          <div className="stats-value">
            <CoinDisplay balance={Math.abs(stats?.totalDeducted || 0)} size="sm" />
          </div>
          <div className="stats-label">Total Spent</div>
        </div>

        <div className="stats-card">
          <div className="stats-icon">
            <FiAward className="w-6 h-6" />
          </div>
          <div className="stats-value">{user?.badgeCount || 0}</div>
          <div className="stats-label">Badges Earned</div>
        </div>

        <div className="stats-card">
          <div className="stats-icon">
            <FiActivity className="w-6 h-6" />
          </div>
          <div className="stats-value">{stats?.totalTransactions || 0}</div>
          <div className="stats-label">Total Transactions</div>
        </div>
      </motion.div>

      {/* Quick Actions - Only for regular users */}
      {user?.role !== 'admin' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="card-header">
            <h2 className="text-xl font-bold text-gray-900">Earn Coins</h2>
            <p className="text-gray-600">Complete challenges and play games to earn coins</p>
          </div>
          <div className="card-body">
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/play-games" className="flex-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-success w-full"
                >
                  <FiPlay className="w-5 h-5 mr-2" />
                  Play Games
                </motion.button>
              </Link>
              <Link to="/challenges" className="flex-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full"
                >
                  <FiAward className="w-5 h-5 mr-2" />
                  View Challenges
                </motion.button>
              </Link>
              <Link to="/coupons" className="flex-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-warning w-full"
                >
                  <FiGift className="w-5 h-5 mr-2" />
                  Spend Vitacoins
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Transaction Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <div className="card-header">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Transaction Summary</h2>
              <p className="text-gray-600">Your earning and spending overview</p>
            </div>
            <button
              onClick={refreshDashboard}
              className="btn-outline btn-sm"
              title="Refresh data"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total Earned</p>
                  <p className="text-2xl font-bold text-green-700">
                    <CoinDisplay balance={stats?.totalEarned || 0} size="lg" />
                  </p>
                </div>
                <FiTrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Total Spent</p>
                  <p className="text-2xl font-bold text-red-700">
                    <CoinDisplay balance={Math.abs(stats?.totalDeducted || 0)} size="lg" />
                  </p>
                </div>
                <FiMinus className="w-8 h-8 text-red-500" />
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Net Balance</p>
                  <p className="text-2xl font-bold text-blue-700">
                    <CoinDisplay balance={user?.coinBalance || 0} size="lg" />
                  </p>
                </div>
                <FiDollarSign className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
        <div className="card-header">
          <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
          <p className="text-gray-600">Your latest activity</p>
        </div>
        <div className="card-body p-0">
          {recentTransactions.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {recentTransactions.map((transaction, index) => (
                <motion.div
                  key={transaction._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString()} • {transaction.category.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${getTransactionColor(transaction.type)}`}>
                      {formatTransactionAmount(transaction)} coins
                    </p>
                    <p className="text-sm text-gray-500">
                      Balance: <CoinDisplay balance={transaction.balanceAfter} size="xs" />
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(transaction.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <FiActivity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No transactions yet</p>
              <p className="text-sm text-gray-400">Complete challenges, play games, or redeem coupons to see your activity here</p>
              <div className="mt-4 flex justify-center space-x-4">
                <Link to="/challenges" className="btn-primary btn-sm">
                  <FiAward className="w-4 h-4 mr-2" />
                  View Challenges
                </Link>
                <Link to="/play-games" className="btn-success btn-sm">
                  <FiPlay className="w-4 h-4 mr-2" />
                  Play Games
                </Link>
              </div>
            </div>
          )}
        </div>
        <div className="card-footer">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-outline w-full"
            onClick={() => window.location.href = '/transactions'}
          >
            View All Transactions
          </motion.button>
        </div>
      </motion.div>

      {/* Achievement Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <div className="card-header">
          <h2 className="text-xl font-bold text-gray-900">Achievement Progress</h2>
          <p className="text-gray-600">Track your badge progress</p>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <FiAward className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">First Steps</p>
                  <p className="text-sm text-gray-500">Earn your first 100 coins</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {Math.min(user?.coinBalance || 0, 100)} / 100
                </p>
                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((user?.coinBalance || 0) / 100 * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                  <FiTrendingUp className="w-4 h-4 text-success-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Active Trader</p>
                  <p className="text-sm text-gray-500">Complete 10 transactions</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {Math.min(stats?.totalTransactions || 0, 10)} / 10
                </p>
                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-success-500 to-success-600 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((stats?.totalTransactions || 0) / 10 * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card-footer">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-outline w-full"
            onClick={() => window.location.href = '/badges'}
          >
            View All Badges
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export default Dashboard;
