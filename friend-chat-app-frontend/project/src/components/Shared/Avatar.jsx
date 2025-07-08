import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

const Avatar = ({
  src,
  alt,
  size = 'md',
  online = false,
  className = '',
  onClick,
}) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20',
  };

  const onlineSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5',
  };

  return (
    <motion.div
      className={`relative ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.05 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
    >
      <div
        className={`${sizes[size]} rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-gray-600`}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="w-1/2 h-1/2 text-gray-400" />
        )}
      </div>
      {online && (
        <div
          className={`absolute -bottom-0.5 -right-0.5 ${onlineSizes[size]} bg-green-500 rounded-full border-2 border-gray-900`}
        />
      )}
    </motion.div>
  );
};

export default Avatar;