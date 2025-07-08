import React, { createContext, useContext, useEffect, useState } from 'react';
import { DemoSocketService } from '../services/demoApi';
import { useDemoAuth } from './DemoAuthContext';
import { mockOnlineUsers } from '../services/mockData';

const SocketContext = createContext();

const demoSocketService = new DemoSocketService();

export const DemoSocketProvider = ({ children }) => {
  const { isAuthenticated, token } = useDemoAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(mockOnlineUsers);
  const [typingUsers, setTypingUsers] = useState({});

  useEffect(() => {
    if (isAuthenticated && token) {
      const socketInstance = demoSocketService.connect(token);
      setSocket(socketInstance);

      // Listen for online users
      demoSocketService.on('onlineUsers', (users) => {
        setOnlineUsers(users);
      });

      // Listen for typing events
      demoSocketService.on('userTyping', ({ roomId, userId, username }) => {
        setTypingUsers(prev => ({
          ...prev,
          [roomId]: [...(prev[roomId] || []), { userId, username }]
        }));
      });

      demoSocketService.on('userStoppedTyping', ({ roomId, userId }) => {
        setTypingUsers(prev => ({
          ...prev,
          [roomId]: (prev[roomId] || []).filter(user => user.userId !== userId)
        }));
      });

      return () => {
        demoSocketService.disconnect();
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

export const useDemoSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useDemoSocket must be used within a DemoSocketProvider');
  }
  return context;
};