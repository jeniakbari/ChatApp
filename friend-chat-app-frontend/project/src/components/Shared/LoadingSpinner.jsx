import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        className={`animate-spin ${sizes[size]}`}
        viewBox="0 0 50 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="spinner-gradient" x1="0" y1="0" x2="50" y2="50" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3b82f6" />
            <stop offset="1" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        <circle
          cx="25"
          cy="25"
          r="20"
          stroke="url(#spinner-gradient)"
          strokeWidth="5"
          strokeDasharray="90 60"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
};

export default LoadingSpinner;