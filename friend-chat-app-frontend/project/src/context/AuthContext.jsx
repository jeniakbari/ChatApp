import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';
import socketService from '../socket/socket';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || 'null');

      if (token && user) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token },
        });
        socketService.connect(token);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const register = async (first_name, last_name, username, email) => {
    try {
      const response = await authAPI.register(first_name, last_name, username, email);
      toast.success('Registration successful! Please verify your email.');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const verifyEmail = async (otp) => {
    try {
      const response = await authAPI.verifyEmail(otp);
      toast.success('Email verified successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Verification failed';
      toast.error(message);
      throw error;
    }
  };

  const sendOtp = async (email) => {
    try {
      const response = await authAPI.sendOtp(email);
      toast.success('OTP sent to your email!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send OTP';
      toast.error(message);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const { user, accessToken } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token: accessToken },
      });

      socketService.connect(accessToken);
      toast.success('Login successful!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const loginWithOtp = async (email, otp) => {
    try {
      const response = await authAPI.loginWithOtp(email, otp);
      const { user, accessToken } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token: accessToken },
      });

      socketService.connect(accessToken);
      toast.success('Login successful!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      socketService.disconnect();
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully!');
    }
  };

  const updateUser = (userData) => {
    const updatedUser = { ...state.user, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const value = {
    ...state,
    register,
    verifyEmail,
    sendOtp,
    login,
    loginWithOtp,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};