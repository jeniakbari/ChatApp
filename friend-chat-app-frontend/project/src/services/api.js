import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://13.60.64.58/';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await api.post('/auth/refresh');
        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (email, password) => api.post('/auth/register', { email, password }),
  verifyEmail: (otp) => api.post('/auth/verify-email', { otp }),
  sendOtp: (email) => api.post('api/auth/send-otp', { email }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  loginWithOtp: (email, otp) => api.post('/api/auth/login', { email, otp }),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
};

// User API calls
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  searchUsers: (query) => api.get(`/user/search?q=${query}`),
  getUsers: () => api.get('/user/all'),
};

// Friend API calls
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

// Chat API calls
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