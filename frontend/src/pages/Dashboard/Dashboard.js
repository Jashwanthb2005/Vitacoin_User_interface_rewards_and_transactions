import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiAward, FiDollarSign, FiActivity, FiPlus, FiMinus } from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import CoinDisplay from '../../components/UI/CoinDisplay';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { emit } = useSocket();

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
      case 'earning':
        return <FiTrendingUp className="w-5 h-5 text-success-600" />;
      case 'deduction':
        return <FiTrendingUp className="w-5 h-5 text-danger-600 rotate-180" />;
      default:
        return <FiActivity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'earning':
        return 'text-success-600';
      case 'deduction':
        return 'text-danger-600';
      default:
        return 'text-gray-600';
    }
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
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-lg text-gray-600">
          Here's what's happening with your Vitacoin account
        </p>
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
          <div className="stats-icon">
            <FiTrendingUp className="w-6 h-6" />
          </div>
          <div className="stats-value">
            <CoinDisplay balance={stats?.totalEarned || 0} size="sm" />
          </div>
          <div className="stats-label">Total Earned</div>
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

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <div className="card-header">
          <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
          <p className="text-gray-600">Earn or spend coins instantly</p>
        </div>
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleQuickEarn}
              className="btn-success flex-1"
            >
              <FiPlus className="w-5 h-5 mr-2" />
              Earn 10 Coins
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleQuickDeduct}
              className="btn-danger flex-1"
            >
              <FiMinus className="w-5 h-5 mr-2" />
              Spend 5 Coins
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
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
                        {new Date(transaction.createdAt).toLocaleDateString()} • {transaction.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${getTransactionColor(transaction.type)}`}>
                      {transaction.type === 'earning' ? '+' : '-'}
                      <CoinDisplay balance={transaction.amount} size="sm" />
                    </p>
                    <p className="text-sm text-gray-500">
                      Balance: <CoinDisplay balance={transaction.balanceAfter} size="xs" />
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <FiActivity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No transactions yet</p>
              <p className="text-sm text-gray-400">Start earning coins to see your activity here</p>
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
        transition={{ delay: 0.5 }}
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
};

export default Dashboard;
