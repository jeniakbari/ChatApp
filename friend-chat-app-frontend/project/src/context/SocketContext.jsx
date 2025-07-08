import React, { createContext, useContext, useEffect, useState } from 'react';
import socketService from '../socket/socket';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});

  useEffect(() => {
    if (isAuthenticated && token) {
      const socketInstance = socketService.connect(token);
      setSocket(socketInstance);

      // Listen for online users
      socketService.on('onlineUsers', (users) => {
        setOnlineUsers(users);
      });

      // Listen for typing events
      socketService.on('userTyping', ({ roomId, userId, username }) => {
        setTypingUsers(prev => ({
          ...prev,
          [roomId]: [...(prev[roomId] || []), { userId, username }]
        }));
      });

      socketService.on('userStoppedTyping', ({ roomId, userId }) => {
        setTypingUsers(prev => ({
          ...prev,
          [roomId]: (prev[roomId] || []).filter(user => user.userId !== userId)
        }));
      });

      return () => {
        socketService.disconnect();
        setSocket(null);
        setOnlineUsers([]);
        setTypingUsers({});
      };
    }
  }, [isAuthenticated, token]);

  const value = {
    socket,
    onlineUsers,
    typingUsers,
    isUserOnline: (userId) => onlineUsers.includes(userId),
    getTypingUsers: (roomId) => typingUsers[roomId] || [],
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};