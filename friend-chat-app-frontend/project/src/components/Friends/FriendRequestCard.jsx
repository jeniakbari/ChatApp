import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Clock } from 'lucide-react';
import Avatar from '../Shared/Avatar';
import Button from '../Shared/Button';
import { friendAPI } from '../../services/api';
import toast from 'react-hot-toast';

const FriendRequestCard = ({ request, onUpdate }) => {
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      await friendAPI.acceptRequest(request.id);
      toast.success(`Friend request from ${request.sender.username} accepted!`);
      onUpdate();
    } catch (error) {
      toast.error('Failed to accept friend request');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await friendAPI.rejectRequest(request.id);
      toast.success('Friend request rejected');
      onUpdate();
    } catch (error) {
      toast.error('Failed to reject friend request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4 flex items-center justify-between"
    >
      <div className="flex items-center space-x-3">
        <Avatar
          src={request.sender.avatar}
          alt={request.sender.username}
          size="md"
        />
        <div>
          <h3 className="font-medium text-white">{request.sender.username}</h3>
          <p className="text-sm text-gray-400">{request.sender.email}</p>
          <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
            <Clock className="w-3 h-3" />
            <span>Received {new Date(request.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          size="sm"
          variant="success"
          onClick={handleAccept}
          loading={loading}
          disabled={loading}
          icon={Check}
        >
          Accept
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={handleReject}
          loading={loading}
          disabled={loading}
          icon={X}
        >
          Reject
        </Button>
      </div>
    </motion.div>
  );
};

export default FriendRequestCard;