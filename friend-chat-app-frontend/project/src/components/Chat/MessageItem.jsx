import React from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';
import Avatar from '../Shared/Avatar';

const MessageItem = ({ message, isOwn, showAvatar = true, user }) => {
  const formatTime = (timestamp) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-end space-x-2 mb-4 ${
        isOwn ? 'flex-row-reverse space-x-reverse' : 'flex-row'
      }`}
    >
      {showAvatar && !isOwn && (
        <Avatar
          src={user?.avatar}
          alt={user?.username}
          size="sm"
        />
      )}
      
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn && showAvatar && (
          <span className="text-xs text-gray-400 mb-1 px-2">
            {user?.username}
          </span>
        )}
        
        <div
          className={`chat-bubble ${
            isOwn ? 'chat-bubble-sent' : 'chat-bubble-received'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
        
        <div className={`flex items-center space-x-1 mt-1 px-2 ${
          isOwn ? 'flex-row-reverse space-x-reverse' : 'flex-row'
        }`}>
          <span className="text-xs text-gray-400">
            {formatTime(message.timestamp)}
          </span>
          
          {isOwn && (
            <div className="flex items-center">
              {message.status === 'sent' && (
                <Check className="w-3 h-3 text-gray-400" />
              )}
              {message.status === 'delivered' && (
                <CheckCheck className="w-3 h-3 text-gray-400" />
              )}
              {message.status === 'read' && (
                <CheckCheck className="w-3 h-3 text-blue-400" />
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageItem;