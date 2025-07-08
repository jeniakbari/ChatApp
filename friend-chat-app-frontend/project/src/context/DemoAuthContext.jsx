import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { demoAuthAPI } from '../services/demoApi';
import { DemoSocketService } from '../services/demoApi';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
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

const demoSocketService = new DemoSocketService();

export const DemoAuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Auto-login for demo
    const autoLogin = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const response = await demoAuthAPI.login('demo@example.com', 'demo123');
        const { user, accessToken } = response.data;

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token: accessToken },
        });

        demoSocketService.connect(accessToken);
        toast.success('Demo mode activated!');
      } catch (error) {
        console.error('Demo auto-login failed:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    autoLogin();
  }, []);

  const register = async (email, password) => {
    try {
      const response = await demoAuthAPI.register(email, password);
      toast.success('Registration successful! Please verify your email.');
      return response.data;
    } catch (error) {
      const message = error.message || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const verifyEmail = async (otp) => {
    try {
      const response = await demoAuthAPI.verifyEmail(otp);
      toast.success('Email verified successfully!');
      return response.data;
    } catch (error) {
      const message = error.message || 'Verification failed';
      toast.error(message);
      throw error;
    }
  };

  const sendOtp = async (email) => {
    try {
      const response = await demoAuthAPI.sendOtp(email);
      toast.success('OTP sent to your email! Use: 123456');
      return response.data;
    } catch (error) {
      const message = error.message || 'Failed to send OTP';
      toast.error(message);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await demoAuthAPI.login(email, password);
      const { user, accessToken } = response.data;

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token: accessToken },
      });

      demoSocketService.connect(accessToken);
      toast.success('Login successful!');
      return response.data;
    } catch (error) {
      const message = error.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await demoAuthAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      demoSocketService.disconnect();
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully!');
    }
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const value = {
    ...state,
    register,
    verifyEmail,
    sendOtp,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useDemoAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useDemoAuth must be used within a DemoAuthProvider');
  }
  return context;
};