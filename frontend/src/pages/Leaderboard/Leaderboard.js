import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiAward, FiUsers, FiStar } from 'react-icons/fi';
import axios from 'axios';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import CoinDisplay from '../../components/UI/CoinDisplay';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState(null);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('coinBalance');

  useEffect(() => {
    fetchLeaderboardData();
  }, [sortBy]);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      const [leaderboardRes, statsRes, rankRes] = await Promise.all([
        axios.get(`/api/leaderboard?sortBy=${sortBy}&limit=20`),
        axios.get('/api/leaderboard/stats'),
        axios.get(`/api/leaderboard/rank?sortBy=${sortBy}`)
      ]);

      setLeaderboard(leaderboardRes.data.leaderboard);
      setStats(statsRes.data);
      setUserRank(rankRes.data);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'text-yellow-600';
    if (rank === 2) return 'text-gray-600';
    if (rank === 3) return 'text-orange-600';
    return 'text-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
          <p className="text-gray-600">See how you rank among other users</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input"
          >
            <option value="coinBalance">Sort by Coins</option>
            <option value="totalEarned">Sort by Total Earned</option>
            <option value="badgeCount">Sort by Badges</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="card-body text-center">
            <FiUsers className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {stats?.totalUsers || 0}
            </div>
            <div className="text-sm text-gray-500">Total Users</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="card-body text-center">
            <FiTrendingUp className="w-8 h-8 text-success-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              <CoinDisplay balance={stats?.totalCoins || 0} size="lg" showIcon={false} />
            </div>
            <div className="text-sm text-gray-500">Total Coins</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="card-body text-center">
            <FiAward className="w-8 h-8 text-secondary-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {stats?.totalBadges || 0}
            </div>
            <div className="text-sm text-gray-500">Total Badges</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="card-body text-center">
            <FiStar className="w-8 h-8 text-warning-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {userRank?.rank || 'N/A'}
            </div>
            <div className="text-sm text-gray-500">Your Rank</div>
          </div>
        </motion.div>
      </div>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 2nd Place */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🥈</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {leaderboard[1]?.firstName} {leaderboard[1]?.lastName}
                </h4>
                <p className="text-sm text-gray-500 mb-2">@{leaderboard[1]?.username}</p>
                <div className="text-lg font-bold text-gray-600">
                  <CoinDisplay balance={leaderboard[1]?.coinBalance || 0} size="lg" showIcon={false} />
                </div>
              </motion.div>

              {/* 1st Place */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                className="text-center"
              >
                <div className="w-24 h-24 bg-yellow-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🥇</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {leaderboard[0]?.firstName} {leaderboard[0]?.lastName}
                </h4>
                <p className="text-sm text-gray-500 mb-2">@{leaderboard[0]?.username}</p>
                <div className="text-xl font-bold text-yellow-600">
                  <CoinDisplay balance={leaderboard[0]?.coinBalance || 0} size="xl" showIcon={false} />
                </div>
              </motion.div>

              {/* 3rd Place */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-orange-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🥉</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {leaderboard[2]?.firstName} {leaderboard[2]?.lastName}
                </h4>
                <p className="text-sm text-gray-500 mb-2">@{leaderboard[2]?.username}</p>
                <div className="text-lg font-bold text-gray-600">
                  <CoinDisplay balance={leaderboard[2]?.coinBalance || 0} size="lg" showIcon={false} />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Full Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="card"
      >
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Complete Rankings</h3>
        </div>
        <div className="card-body">
          <div className="space-y-3">
            {leaderboard.map((user, index) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className={`text-lg font-bold ${getRankColor(index + 1)}`}>
                    {getRankIcon(index + 1)}
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {user.firstName} {user.lastName}
                    </h4>
                    <p className="text-sm text-gray-500">@{user.username}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    <CoinDisplay balance={user.coinBalance || 0} size="lg" showIcon={false} />
                  </div>
                  <div className="text-sm text-gray-500">
                    {user.badgeCount || 0} badges
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Leaderboard;
