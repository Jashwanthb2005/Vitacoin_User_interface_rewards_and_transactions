import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiX } from 'react-icons/fi';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications] = useState([
    {
      id: 1,
      type: 'success',
      title: 'Coins Earned!',
      message: 'You earned 50 coins for completing a task',
      time: '2 minutes ago'
    },
    {
      id: 2,
      type: 'info',
      title: 'New Badge Available',
      message: 'Check out the new "Early Bird" badge',
      time: '1 hour ago'
    }
  ]);

  const unreadCount = notifications.length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-success-400 bg-success-50';
      case 'warning':
        return 'border-warning-400 bg-warning-50';
      case 'error':
        return 'border-danger-400 bg-danger-50';
      default:
        return 'border-primary-400 bg-primary-50';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md"
      >
        <FiBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-danger-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20"
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 border-l-4 ${getNotificationColor(notification.type)} hover:bg-gray-50 cursor-pointer`}
                    >
                      <div className="flex items-start">
                        <span className="text-lg mr-3">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <FiBell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No notifications</p>
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200">
                  <button className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium">
                    Mark all as read
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
