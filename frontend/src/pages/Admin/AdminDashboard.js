import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUsers, 
  FiAward, 
  FiTrendingUp, 
  FiSettings, 
  FiTarget,
  FiPlay,
  FiLogOut
} from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import AdminTasks from './AdminTasks';
import AdminChallenges from './AdminChallenges';
import AdminGames from './AdminGames';
import AdminUsers from './AdminUsers';
import AdminSettings from './AdminSettings';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const statsRes = await axios.get('/api/admin/stats');
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };



  const tabs = [
    { id: 'overview', name: 'Overview', icon: FiTrendingUp },
    { id: 'tasks', name: 'Tasks', icon: FiTarget },
    { id: 'challenges', name: 'Challenges', icon: FiTarget },
    { id: 'games', name: 'Games', icon: FiPlay },
    { id: 'users', name: 'Users', icon: FiUsers },
    { id: 'settings', name: 'Settings', icon: FiSettings }
  ];

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
      <div className="flex justify-between items-center">
        <div className="text-center flex-1">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🛡️ Admin Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Manage challenges, games, and monitor user activity
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
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap justify-center gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50 shadow-md'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <div className="card">
              <div className="card-body text-center">
                <FiUsers className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {stats.totalUsers || 0}
                </div>
                <div className="text-sm text-gray-500">Total Users</div>
              </div>
            </div>

            <div className="card">
              <div className="card-body text-center">
                <FiTarget className="w-8 h-8 text-success-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {stats.activeChallenges || 0}
                </div>
                <div className="text-sm text-gray-500">Active Challenges</div>
              </div>
            </div>

            <div className="card">
              <div className="card-body text-center">
                <FiPlay className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {stats.activeGames || 0}
                </div>
                <div className="text-sm text-gray-500">Active Games</div>
              </div>
            </div>

            <div className="card">
              <div className="card-body text-center">
                <FiAward className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {stats.totalCoins || 0}
                </div>
                <div className="text-sm text-gray-500">Total Coins Distributed</div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'challenges' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <AdminChallenges />
          </motion.div>
        )}

        {activeTab === 'tasks' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <AdminTasks />
          </motion.div>
        )}

        {activeTab === 'games' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <AdminGames />
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <AdminUsers />
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <AdminSettings />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
