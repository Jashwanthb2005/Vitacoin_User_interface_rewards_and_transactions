import React from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign } from 'react-icons/fi';

const CoinDisplay = ({ balance = 0, size = 'md', showIcon = true, animate = true }) => {
  const formatBalance = (value) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const sizeClasses = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
    '2xl': 'text-3xl'
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-7 h-7',
    '2xl': 'w-8 h-8'
  };

  const containerClasses = {
    xs: 'px-2 py-1',
    sm: 'px-3 py-1.5',
    md: 'px-4 py-2',
    lg: 'px-5 py-2.5',
    xl: 'px-6 py-3',
    '2xl': 'px-8 py-4'
  };

  const CoinContent = () => (
    <div className={`coin-display ${containerClasses[size]}`}>
      {showIcon && (
        <motion.div
          animate={animate ? { rotate: [0, 360] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <FiDollarSign className={`coin-icon ${iconSizes[size]} text-coin-600`} />
        </motion.div>
      )}
      <span className={`coin-amount ${sizeClasses[size]} font-bold`}>
        {formatBalance(balance)}
      </span>
      <span className={`text-coin-600 font-medium ${sizeClasses[size]}`}>
        coins
      </span>
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <CoinContent />
      </motion.div>
    );
  }

  return <CoinContent />;
};

export default CoinDisplay;
