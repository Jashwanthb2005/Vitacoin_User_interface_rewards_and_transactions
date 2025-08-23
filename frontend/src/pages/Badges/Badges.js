import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiFilter, FiSearch } from 'react-icons/fi';
import axios from 'axios';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Badges = () => {
  const [badges, setBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    rarity: ''
  });

  useEffect(() => {
    fetchBadges();
  }, [filters]);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const [badgesRes, userBadgesRes] = await Promise.all([
        axios.get('/api/badges'),
        axios.get('/api/badges/user')
      ]);

      setBadges(badgesRes.data);
      setUserBadges(userBadgesRes.data.badges);
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getRarityColor = (rarity) => {
    const colors = {
      common: 'bg-gray-100 text-gray-800',
      uncommon: 'bg-green-100 text-green-800',
      rare: 'bg-blue-100 text-blue-800',
      epic: 'bg-purple-100 text-purple-800',
      legendary: 'bg-orange-100 text-orange-800'
    };
    return colors[rarity] || colors.common;
  };

  const getRarityBorder = (rarity) => {
    const borders = {
      common: 'border-gray-300',
      uncommon: 'border-green-300',
      rare: 'border-blue-300',
      epic: 'border-purple-300',
      legendary: 'border-orange-300'
    };
    return borders[rarity] || borders.common;
  };

  const hasBadge = (badgeId) => {
    return userBadges.some(badge => badge._id === badgeId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const filteredBadges = badges.filter(badge => {
    if (filters.category && badge.category !== filters.category) return false;
    if (filters.rarity && badge.rarity !== filters.rarity) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Badges & Achievements</h1>
          <p className="text-gray-600">
            Track your progress and unlock new achievements
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {userBadges.length}
              </div>
              <div className="text-sm text-gray-500">Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {badges.length}
              </div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FiFilter className="w-5 h-5 mr-2" />
            Filters
          </h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="input"
              >
                <option value="">All Categories</option>
                <option value="achievement">Achievement</option>
                <option value="milestone">Milestone</option>
                <option value="streak">Streak</option>
                <option value="special">Special</option>
                <option value="event">Event</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rarity
              </label>
              <select
                value={filters.rarity}
                onChange={(e) => handleFilterChange('rarity', e.target.value)}
                className="input"
              >
                <option value="">All Rarities</option>
                <option value="common">Common</option>
                <option value="uncommon">Uncommon</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
                <option value="legendary">Legendary</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Badges Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">
            Available Badges ({filteredBadges.length})
          </h3>
        </div>
        <div className="card-body">
          {filteredBadges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBadges.map((badge, index) => (
                <motion.div
                  key={badge._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative p-6 rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${
                    hasBadge(badge._id) 
                      ? `${getRarityBorder(badge.rarity)} bg-white` 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  {/* Earned indicator */}
                  {hasBadge(badge._id) && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-success-500 rounded-full flex items-center justify-center">
                      <FiAward className="w-5 h-5 text-white" />
                    </div>
                  )}

                  {/* Badge Icon */}
                  <div className="text-center mb-4">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl ${
                      hasBadge(badge._id) ? 'bg-gradient-to-r from-primary-500 to-secondary-500' : 'bg-gray-300'
                    }`}>
                      {badge.icon}
                    </div>
                  </div>

                  {/* Badge Info */}
                  <div className="text-center">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {badge.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      {badge.description}
                    </p>

                    {/* Rarity Badge */}
                    <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-3 ${getRarityColor(badge.rarity)}`}>
                      {badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)}
                    </div>

                    {/* Requirements */}
                    {badge.requirements && (
                      <div className="text-xs text-gray-500 space-y-1">
                        {badge.requirements.coinsRequired > 0 && (
                          <div>Requires {badge.requirements.coinsRequired} coins</div>
                        )}
                        {badge.requirements.tasksCompleted > 0 && (
                          <div>Complete {badge.requirements.tasksCompleted} tasks</div>
                        )}
                        {badge.requirements.loginStreak > 0 && (
                          <div>{badge.requirements.loginStreak} day login streak</div>
                        )}
                      </div>
                    )}

                    {/* Rewards */}
                    {badge.rewards && badge.rewards.coins > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-xs text-gray-500">
                          Reward: {badge.rewards.coins} coins
                        </div>
                      </div>
                    )}

                    {/* Status */}
                    <div className="mt-3">
                      {hasBadge(badge._id) ? (
                        <span className="text-success-600 text-sm font-medium">
                          ✓ Earned
                        </span>
                      ) : (
                        <span className="text-gray-500 text-sm">
                          Not earned yet
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FiSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No badges found</p>
              <p className="text-gray-400">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Badges;
