import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://13.60.64.58/';

// Global configuration for all axios requests
axios.defaults.withCredentials = true;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


// === Auth API ===
export const authAPI = {
  register: (first_name, last_name, username, email) =>
    api.post('/api/auth/register', { first_name, last_name, username, email }),
  verifyEmail: (otp) => api.post('/auth/verify-email', { otp }),
  sendOtp: (email) => api.post('/api/auth/send-otp', { email }),
  loginWithOtp: (email, otp) => api.post('/api/auth/login', { email, otp }),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
};

// === User API ===
export const userAPI = {
  getProfile: () => api.get('/api/user/profile'),
  updateProfile: (data) => api.patch('/api/user/profile', data),
  searchUsers: (query) => api.get(`/api/user/search?search=${query}`),
  getUsers: () => api.get('/user/all'),
};

// === Friend API ===
export const friendAPI = {
  sendRequest: (userId) => api.post('/friends/request', { userId }),
  acceptRequest: (requestId) => api.put(`/friends/accept/${requestId}`),
  rejectRequest: (requestId) => api.put(`/friends/reject/${requestId}`),
  removeFriend: (userId) => api.delete(`/friends/remove/${userId}`),
  blockUser: (userId) => api.post('/friends/block', { userId }),
  unblockUser: (userId) => api.post('/friends/unblock', { userId }),
  getFriends: () => api.get('/friends'),
  getPendingRequests: () => api.get('/friends/requests'),
  getBlockedUsers: () => api.get('/friends/blocked'),
};

// === Chat API ===
export const chatAPI = {
  getChats: () => api.get('/chat'),
  getChatById: (chatId) => api.get(`/chat/${chatId}`),
  sendMessage: (chatId, content, type = 'text') =>
    api.post(`/chat/${chatId}/message`, { content, type }),
  createGroupChat: (name, participants) =>
    api.post('/chat/group', { name, participants }),
  getMessages: (chatId, page = 1, limit = 50) =>
    api.get(`/chat/${chatId}/messages?page=${page}&limit=${limit}`),
};

export default api;
