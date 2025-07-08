import { 
  mockUser, 
  mockFriends, 
  mockChats, 
  mockMessages, 
  mockFriendRequests, 
  mockSearchResults,
  mockOnlineUsers 
} from './mockData';
import toast from 'react-hot-toast';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Demo Auth API
export const demoAuthAPI = {
  register: async (email, password) => {
    await delay(1000);
    return { data: { message: 'Registration successful' } };
  },
  
  verifyEmail: async (otp) => {
    await delay(800);
    if (otp === '123456') {
      return { data: { message: 'Email verified' } };
    }
    throw new Error('Invalid OTP');
  },
  
  sendOtp: async (email) => {
    await delay(500);
    return { data: { message: 'OTP sent' } };
  },
  
  login: async (email, password) => {
    await delay(1200);
    if (email === 'demo@example.com' && password === 'demo123') {
      const accessToken = 'demo-token-' + Date.now();
      return {
        data: {
          user: mockUser,
          accessToken,
        }
      };
    }
    throw new Error('Invalid credentials');
  },
  
  logout: async () => {
    await delay(300);
    return { data: { message: 'Logged out' } };
  },
};

// Demo User API
export const demoUserAPI = {
  getProfile: async () => {
    await delay(500);
    return { data: mockUser };
  },
  
  updateProfile: async (data) => {
    await delay(800);
    const updatedUser = { ...mockUser, ...data };
    return { data: updatedUser };
  },
  
  searchUsers: async (query) => {
    await delay(600);
    if (!query.trim()) return { data: [] };
    
    const filtered = mockSearchResults.filter(user => 
      user.username.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase())
    );
    return { data: filtered };
  },
};

// Demo Friend API
export const demoFriendAPI = {
  sendRequest: async (userId) => {
    await delay(500);
    return { data: { message: 'Friend request sent' } };
  },
  
  acceptRequest: async (requestId) => {
    await delay(600);
    return { data: { message: 'Friend request accepted' } };
  },
  
  rejectRequest: async (requestId) => {
    await delay(400);
    return { data: { message: 'Friend request rejected' } };
  },
  
  removeFriend: async (userId) => {
    await delay(500);
    return { data: { message: 'Friend removed' } };
  },
  
  blockUser: async (userId) => {
    await delay(500);
    return { data: { message: 'User blocked' } };
  },
  
  unblockUser: async (userId) => {
    await delay(500);
    return { data: { message: 'User unblocked' } };
  },
  
  getFriends: async () => {
    await delay(700);
    return { data: mockFriends };
  },
  
  getPendingRequests: async () => {
    await delay(600);
    return { data: mockFriendRequests };
  },
  
  getBlockedUsers: async () => {
    await delay(500);
    return { data: [] };
  },
};

// Demo Chat API
export const demoChatAPI = {
  getChats: async () => {
    await delay(800);
    return { data: mockChats };
  },
  
  getChatById: async (chatId) => {
    await delay(500);
    const chat = mockChats.find(c => c.id === chatId);
    if (!chat) throw new Error('Chat not found');
    return { data: chat };
  },
  
  sendMessage: async (chatId, content) => {
    await delay(300);
    const newMessage = {
      id: 'msg-' + Date.now(),
      content,
      sender: mockUser,
      timestamp: new Date().toISOString(),
      status: 'sent',
    };
    return { data: newMessage };
  },
  
  getMessages: async (chatId) => {
    await delay(600);
    return { data: mockMessages[chatId] || [] };
  },
  
  createGroupChat: async (name, participants) => {
    await delay(700);
    const newChat = {
      id: 'chat-' + Date.now(),
      type: 'group',
      name,
      participants: [mockUser, ...participants],
      lastMessage: null,
      unreadCount: 0,
    };
    return { data: newChat };
  },
};

// Demo Socket Service
export class DemoSocketService {
  constructor() {
    this.isConnected = false;
    this.onlineUsers = mockOnlineUsers;
    this.typingUsers = {};
    this.eventListeners = {};
  }

  connect(token) {
    console.log('Demo: Connected to socket');
    this.isConnected = true;
    
    // Simulate connection event
    setTimeout(() => {
      this.emit('onlineUsers', this.onlineUsers);
    }, 1000);
    
    return this;
  }

  disconnect() {
    console.log('Demo: Disconnected from socket');
    this.isConnected = false;
    this.eventListeners = {};
  }

  joinRoom(roomId) {
    console.log('Demo: Joined room', roomId);
  }

  leaveRoom(roomId) {
    console.log('Demo: Left room', roomId);
  }

  sendMessage(roomId, message) {
    console.log('Demo: Sent message to room', roomId, message);
    
    // Simulate receiving the message back
    setTimeout(() => {
      this.emit('receiveMessage', message);
    }, 100);
  }

  startTyping(roomId, userId) {
    console.log('Demo: User started typing', userId, 'in room', roomId);
  }

  stopTyping(roomId, userId) {
    console.log('Demo: User stopped typing', userId, 'in room', roomId);
  }

  on(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  off(event, callback) {
    if (this.eventListeners[event]) {
      if (callback) {
        this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
      } else {
        delete this.eventListeners[event];
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
  }

  onMessage(callback) {
    this.on('receiveMessage', callback);
  }

  offMessage() {
    this.off('receiveMessage');
  }
}