import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, UserPlus, Users, UserCheck, UserX } from 'lucide-react';
import Navbar from '../components/Shared/Navbar';
import Input from '../components/Shared/Input';
import Button from '../components/Shared/Button';
import Avatar from '../components/Shared/Avatar';
import LoadingSpinner from '../components/Shared/LoadingSpinner';
import FriendCard from '../components/Friends/FriendCard';
import FriendRequestCard from '../components/Friends/FriendRequestCard';
import { friendAPI, userAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Friends = () => {
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const { isUserOnline } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim() && activeTab === 'search') {
        searchUsers();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeTab]);

  const fetchData = async () => {
    try {
      const [friendsRes, requestsRes, blockedRes] = await Promise.all([
        friendAPI.getFriends(),
        friendAPI.getPendingRequests(),
        friendAPI.getBlockedUsers(),
      ]);

      setFriends(friendsRes.data);
      setRequests(requestsRes.data);
      setBlockedUsers(blockedRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    setSearchLoading(true);
    try {
      const response = await userAPI.searchUsers(searchQuery);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendFriendRequest = async (userId) => {
    try {
      await friendAPI.sendRequest(userId);
      toast.success('Friend request sent!');
      // Update search results to show request sent
      setSearchResults(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, requestSent: true }
            : user
        )
      );
    } catch (error) {
      toast.error('Failed to send friend request');
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      await friendAPI.unblockUser(userId);
      toast.success('User unblocked');
      fetchData();
    } catch (error) {
      toast.error('Failed to unblock user');
    }
  };

  const handleStartChat = (friend) => {
    navigate(`/chat/new`, { state: { user: friend } });
  };

  const tabs = [
    { id: 'friends', label: 'Friends', icon: Users, count: friends.length },
    { id: 'requests', label: 'Requests', icon: UserCheck, count: requests.length },
    { id: 'blocked', label: 'Blocked', icon: UserX, count: blockedUsers.length },
    { id: 'search', label: 'Add Friends', icon: UserPlus },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      <div className="max-w-6xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Friends</h1>
          <p className="text-gray-400">Manage your connections</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex space-x-1 mb-6 bg-gray-800 p-1 rounded-lg"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors flex-1 justify-center ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="bg-gray-600 text-xs px-2 py-1 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {activeTab === 'friends' && (
            <div className="space-y-4">
              {friends.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-400 mb-2">No friends yet</h3>
                  <p className="text-gray-500 mb-4">Start by adding some friends</p>
                  <Button
                    variant="primary"
                    onClick={() => setActiveTab('search')}
                  >
                    Add Friends
                  </Button>
                </div>
              ) : (
                friends.map((friend) => (
                  <FriendCard
                    key={friend.id}
                    friend={friend}
                    onUpdate={fetchData}
                    onStartChat={handleStartChat}
                  />
                ))
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-4">
              {requests.length === 0 ? (
                <div className="text-center py-12">
                  <UserCheck className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-400 mb-2">No friend requests</h3>
                  <p className="text-gray-500">You'll see friend requests here</p>
                </div>
              ) : (
                requests.map((request) => (
                  <FriendRequestCard
                    key={request.id}
                    request={request}
                    onUpdate={fetchData}
                  />
                ))
              )}
            </div>
          )}

          {activeTab === 'blocked' && (
            <div className="space-y-4">
              {blockedUsers.length === 0 ? (
                <div className="text-center py-12">
                  <UserX className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-400 mb-2">No blocked users</h3>
                  <p className="text-gray-500">Users you block will appear here</p>
                </div>
              ) : (
                blockedUsers.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar
                        src={user.avatar}
                        alt={user.username}
                        size="md"
                      />
                      <div>
                        <h3 className="font-medium text-white">{user.username}</h3>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUnblockUser(user.id)}
                    >
                      Unblock
                    </Button>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {activeTab === 'search' && (
            <div className="space-y-6">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search users by username or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={Search}
                />
                {searchLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <LoadingSpinner size="sm" />
                  </div>
                )}
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-4">
                  {searchResults.map((user) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="card p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar
                          src={user.avatar}
                          alt={user.username}
                          size="md"
                          online={isUserOnline(user.id)}
                        />
                        <div>
                          <h3 className="font-medium text-white">{user.username}</h3>
                          <p className="text-sm text-gray-400">{user.email}</p>
                          <p className="text-xs text-gray-500">
                            {isUserOnline(user.id) ? 'Online' : 'Offline'}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={user.requestSent ? "outline" : "primary"}
                        onClick={() => handleSendFriendRequest(user.id)}
                        disabled={user.requestSent}
                        icon={UserPlus}
                      >
                        {user.requestSent ? 'Request Sent' : 'Add Friend'}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}

              {searchQuery && !searchLoading && searchResults.length === 0 && (
                <div className="text-center py-8">
                  <Search className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400">No users found matching "{searchQuery}"</p>
                </div>
              )}

              {!searchQuery && (
                <div className="text-center py-12">
                  <UserPlus className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-400 mb-2">Find new friends</h3>
                  <p className="text-gray-500">Search by username or email to connect with people</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Friends;