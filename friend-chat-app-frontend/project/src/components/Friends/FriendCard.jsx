import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, UserMinus, UserX, MoreVertical } from 'lucide-react';
import Avatar from '../Shared/Avatar';
import Button from '../Shared/Button';
import { useSocket } from '../../context/SocketContext';
import { friendAPI } from '../../services/api';
import toast from 'react-hot-toast';

const FriendCard = ({ friend, onUpdate, onStartChat }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isUserOnline } = useSocket();

  const handleRemoveFriend = async () => {
    setLoading(true);
    try {
      await friendAPI.removeFriend(friend.id);
      toast.success(`${friend.username} removed from friends`);
      onUpdate();
    } catch (error) {
      toast.error('Failed to remove friend');
    } finally {
      setLoading(false);
      setShowMenu(false);
    }
  };

  const handleBlockUser = async () => {
    setLoading(true);
    try {
      await friendAPI.blockUser(friend.id);
      toast.success(`${friend.username} blocked`);
      onUpdate();
    } catch (error) {
      toast.error('Failed to block user');
    } finally {
      setLoading(false);
      setShowMenu(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="card p-4 relative"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar
            src={friend.avatar}
            alt={friend.username}
            size="md"
            online={isUserOnline(friend.id)}
          />
          <div>
            <h3 className="font-medium text-white">{friend.username}</h3>
            <p className="text-sm text-gray-400">{friend.email}</p>
            <p className="text-xs text-gray-500">
              {isUserOnline(friend.id) ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="primary"
            onClick={() => onStartChat(friend)}
            icon={MessageCircle}
          >
            Chat
          </Button>
          
          <div className="relative">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowMenu(!showMenu)}
              icon={MoreVertical}
            />
            
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-0 top-full mt-1 w-48 bg-gray-700 rounded-lg shadow-lg border border-gray-600 z-10"
              >
                <button
                  onClick={handleRemoveFriend}
                  disabled={loading}
                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-600 rounded-t-lg flex items-center space-x-2"
                >
                  <UserMinus className="w-4 h-4" />
                  <span>Remove Friend</span>
                </button>
                <button
                  onClick={handleBlockUser}
                  disabled={loading}
                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-600 rounded-b-lg flex items-center space-x-2"
                >
                  <UserX className="w-4 h-4" />
                  <span>Block User</span>
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {showMenu && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowMenu(false)}
        />
      )}
    </motion.div>
  );
};

export default FriendCard;