import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Users, MessageCircle } from 'lucide-react';
import Navbar from '../components/Shared/Navbar';
import Input from '../components/Shared/Input';
import Button from '../components/Shared/Button';
import Avatar from '../components/Shared/Avatar';
import LoadingSpinner from '../components/Shared/LoadingSpinner';
import { chatAPI, userAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const Dashboard = () => {
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const { user } = useAuth();
  const { isUserOnline } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const fetchChats = async () => {
    try {
      const response = await chatAPI.getChats();
      setChats(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
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

  const handleChatClick = (chat) => {
    navigate(`/chat/${chat.id}`);
  };

  const handleUserClick = (selectedUser) => {
    // Find existing chat or create new one
    const existingChat = chats.find(chat => 
      chat.type === 'private' && 
      chat.participants.some(p => p.id === selectedUser.id)
    );

    if (existingChat) {
      navigate(`/chat/${existingChat.id}`);
    } else {
      // Navigate to chat with user info to create new chat
      navigate(`/chat/new`, { state: { user: selectedUser } });
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const formatLastMessage = (message) => {
    if (!message) return 'No messages yet';
    
    const isOwn = message.sender.id === user.id;
    const prefix = isOwn ? 'You: ' : `${message.sender.username}: `;
    const content = message.content.length > 50 
      ? message.content.substring(0, 50) + '...' 
      : message.content;
    
    return prefix + content;
  };

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
          <h1 className="text-3xl font-bold text-white mb-2">Chats</h1>
          <p className="text-gray-400">Stay connected with your friends</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat List */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Recent Chats</h2>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Plus}
                  onClick={() => navigate('/friends')}
                >
                  New Chat
                </Button>
              </div>

              {chats.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-400 mb-2">No chats yet</h3>
                  <p className="text-gray-500 mb-4">Start a conversation with your friends</p>
                  <Button
                    variant="primary"
                    onClick={() => navigate('/friends')}
                  >
                    Find Friends
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {chats.map((chat) => {
                    const otherParticipant = chat.participants.find(p => p.id !== user.id);
                    const isOnline = isUserOnline(otherParticipant?.id);
                    
                    return (
                      <motion.div
                        key={chat.id}
                        whileHover={{ scale: 1.02 }}
                        className="p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                        onClick={() => handleChatClick(chat)}
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar
                            src={chat.type === 'group' ? null : otherParticipant?.avatar}
                            alt={chat.name || otherParticipant?.username}
                            size="md"
                            online={chat.type === 'private' && isOnline}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-white truncate">
                                {chat.name || otherParticipant?.username}
                              </h3>
                              {chat.lastMessage && (
                                <span className="text-xs text-gray-400">
                                  {formatDistanceToNow(new Date(chat.lastMessage.timestamp), { addSuffix: true })}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-400 truncate">
                              {formatLastMessage(chat.lastMessage)}
                            </p>
                            {chat.type === 'private' && (
                              <p className="text-xs text-gray-500">
                                {isOnline ? 'Online' : 'Offline'}
                              </p>
                            )}
                          </div>
                          {chat.unreadCount > 0 && (
                            <div className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {chat.unreadCount}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>

          {/* Search Users */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-4">Find People</h2>
              
              <div className="relative mb-4">
                <Input
                  type="text"
                  placeholder="Search users..."
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
                <div className="space-y-2">
                  {searchResults.map((user) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                      onClick={() => handleUserClick(user)}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar
                          src={user.avatar}
                          alt={user.username}
                          size="sm"
                          online={isUserOnline(user.id)}
                        />
                        <div>
                          <h4 className="font-medium text-white text-sm">{user.username}</h4>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {searchQuery && !searchLoading && searchResults.length === 0 && (
                <div className="text-center py-4">
                  <Users className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No users found</p>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6"
            >
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/friends')}
                icon={Users}
              >
                Manage Friends
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;