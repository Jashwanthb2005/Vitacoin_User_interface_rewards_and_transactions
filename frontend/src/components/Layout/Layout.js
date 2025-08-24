import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHome, 
  FiDollarSign, 
  FiAward, 
  FiTrendingUp, 
  FiUser, 
  FiSettings, 
  FiLogOut,
  FiMenu,
  FiX,
  FiWifi,
  FiWifiOff,
  FiPlay,
  FiTarget,
  FiUsers,
  FiGift
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import CoinDisplay from '../UI/CoinDisplay';
import NotificationDropdown from '../UI/NotificationDropdown';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = user?.role === 'admin' ? [
    { name: 'Admin Dashboard', href: '/admin', icon: FiTrendingUp },
    { name: 'Challenges', href: '/admin/challenges', icon: FiTarget },
    { name: 'Games', href: '/admin/games', icon: FiPlay },
    { name: 'Users', href: '/admin/users', icon: FiUsers },
    { name: 'Settings', href: '/admin/settings', icon: FiSettings },
  ] : [
    { name: 'Dashboard', href: '/dashboard', icon: FiTrendingUp },
    { name: 'Play Games', href: '/play-games', icon: FiPlay },
    { name: 'Challenges', href: '/challenges', icon: FiTarget },
    { name: 'Coupons', href: '/coupons', icon: FiGift },
    { name: 'My Coupons', href: '/my-coupons', icon: FiAward },
    { name: 'Transactions', href: '/transactions', icon: FiDollarSign },
    { name: 'Badges', href: '/badges', icon: FiAward },
    { name: 'Leaderboard', href: '/leaderboard', icon: FiTrendingUp },
    { name: 'Profile', href: '/profile', icon: FiUser },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -256 }}
        animate={{ x: sidebarOpen ? 0 : -256 }}
        className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'} lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center shadow-lg"
              >
                <span className="text-white font-bold text-lg">V</span>
              </motion.div>
              <div>
                <h1 className="text-xl font-bold gradient-text">Vitacoin</h1>
                <p className="text-xs text-gray-500">Rewards Dashboard</p>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FiX className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.name}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={item.href}
                    className={`nav-link ${isActive(item.href) ? 'nav-link-active' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Quick Actions - Only for regular users */}
          {user?.role !== 'admin' && (
            <div className="px-4 py-4 border-t border-gray-100">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/play-games"
                    className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <FiPlay className="w-4 h-4 mr-3" />
                    Quick Game
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/coupons"
                    className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <FiGift className="w-4 h-4 mr-3" />
                    Spend Coins
                  </Link>
                </motion.div>
              </div>
            </div>
          )}

          {/* User Info */}
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
                <span className="text-primary-700 font-semibold">
                  {user?.firstName?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  @{user?.username}
                </p>
              </div>
            </div>

            {/* Connection Status */}
            <div className="flex items-center justify-between mb-4 p-2 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <FiWifi className="w-4 h-4 text-success-600" />
                ) : (
                  <FiWifiOff className="w-4 h-4 text-danger-600" />
                )}
                <span className="text-xs font-medium">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success-500' : 'bg-danger-500'}`} />
            </div>

            {/* Logout Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="w-full btn-ghost text-left"
            >
              <FiLogOut className="w-5 h-5 mr-3" />
              Sign Out
            </motion.button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="main-content flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="header">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FiMenu className="w-6 h-6 text-gray-600" />
            </button>

            {/* Page Title and Search */}
            <div className="flex-1 lg:flex-none flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
              </h1>
              
              {/* Search Bar - Only for regular users */}
              {user?.role !== 'admin' && (
                <div className="hidden md:flex items-center">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search features..."
                      className="w-64 pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Coin Display */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <CoinDisplay balance={user?.coinBalance || 0} size="lg" />
              </motion.div>

              {/* Notifications */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="relative"
              >
                <NotificationDropdown />
                {/* Notification Badge */}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">3</span>
                </div>
              </motion.div>

              {/* User Menu */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="relative group"
              >
                <button className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                    <span className="text-primary-700 font-semibold text-sm">
                      {user?.firstName?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user?.firstName}
                  </span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* User Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FiUser className="w-4 h-4 mr-3" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FiSettings className="w-4 h-4 mr-3" />
                      Settings
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <FiLogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Top Navigation Menu - Only for regular users */}
          {user?.role !== 'admin' && (
            <div className="border-t border-gray-100 px-6 py-3">
              <div className="flex items-center justify-center space-x-6">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Link
                    to="/play-games"
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive('/play-games')
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                    }`}
                  >
                    <FiPlay className="w-4 h-4" />
                    <span className="text-sm font-medium">Play Games</span>
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Link
                    to="/challenges"
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive('/challenges')
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                    }`}
                  >
                    <FiTarget className="w-4 h-4" />
                    <span className="text-sm font-medium">Challenges</span>
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Link
                    to="/coupons"
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive('/coupons')
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                    }`}
                  >
                    <FiGift className="w-4 h-4" />
                    <span className="text-sm font-medium">Coupons</span>
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Link
                    to="/leaderboard"
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive('/leaderboard')
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                    }`}
                  >
                    <FiTrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">Leaderboard</span>
                  </Link>
                </motion.div>
              </div>
            </div>
          )}
        </header>

        {/* Breadcrumb Navigation */}
        <div className="border-b border-gray-100 bg-white">
          <div className="px-6 py-3">
            <nav className="flex items-center space-x-2 text-sm text-gray-500">
              <Link to="/dashboard" className="hover:text-primary-600 transition-colors">
                Dashboard
              </Link>
              {location.pathname !== '/dashboard' && (
                <>
                  <span>/</span>
                  <span className="text-gray-900 font-medium">
                    {navigation.find(item => isActive(item.href))?.name || 'Page'}
                  </span>
                </>
              )}
            </nav>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container-fluid py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {children}
            </motion.div>
          </div>
        </main>

        {/* Mobile Bottom Navigation - Only for regular users */}
        {user?.role !== 'admin' && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="flex items-center justify-around py-2">
              <Link
                to="/dashboard"
                className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                  isActive('/dashboard')
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                <FiTrendingUp className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">Dashboard</span>
              </Link>
              
              <Link
                to="/play-games"
                className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                  isActive('/play-games')
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                <FiPlay className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">Games</span>
              </Link>
              
              <Link
                to="/coupons"
                className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                  isActive('/coupons')
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                <FiGift className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">Coupons</span>
              </Link>
              
              <Link
                to="/profile"
                className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                  isActive('/profile')
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                <FiUser className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">Profile</span>
              </Link>
            </div>
          </div>
        )}

        {/* Floating Action Button - Only for regular users */}
        {user?.role !== 'admin' && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
            className="fixed bottom-6 right-6 z-40 lg:hidden"
          >
            <div className="relative group">
              <button className="w-14 h-14 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center text-white">
                <FiMenu className="w-6 h-6" />
              </button>
              
              {/* Floating Menu */}
              <div className="absolute bottom-16 right-0 mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 space-y-2">
                  <Link
                    to="/play-games"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <FiPlay className="w-4 h-4 text-primary-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Play Games</span>
                  </Link>
                  
                  <Link
                    to="/coupons"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <FiGift className="w-4 h-4 text-primary-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Coupons</span>
                  </Link>
                  
                  <Link
                    to="/challenges"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <FiTarget className="w-4 h-4 text-primary-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Challenges</span>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Layout;
