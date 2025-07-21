import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/Auth/AuthLayout';
import Input from '../components/Shared/Input';
import Button from '../components/Shared/Button';
import LoadingSpinner from '../components/Shared/LoadingSpinner';

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyToken, setVerifyToken] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [verifySuccess, setVerifySuccess] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name) {
      newErrors.first_name = 'First name is required';
    }
    if (!formData.last_name) {
      newErrors.last_name = 'Last name is required';
    }
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    try {
      // Call the new register API with all fields
      const response = await register(
        formData.first_name,
        formData.last_name,
        formData.username,
        formData.email
      );
      console.log('Register API response:', response);
      // Show popup/modal for email verification with response.user.token
      if (response && response.user && response.user.token) {
        setShowVerifyModal(true);
        setVerifyToken(response.user.token);
      } else if (response && response.user) {
        // Fallback: show modal if user exists, even if token is missing, for debugging
        setShowVerifyModal(true);
        setVerifyToken(response.user.token || '');
      } else {
        // Fallback: always show modal for debugging
        setShowVerifyModal(true);
        setVerifyToken('');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ api: error.response?.data?.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    setVerifyLoading(true);
    setVerifyError('');
    try {
      // Call the verify API with the token
      const res = await fetch(`http://13.60.64.58/api/auth/verify/${verifyToken}`);
      const data = await res.json();
      if (res.ok) {
        setTimeout(() => {
          setShowVerifyModal(false);
          navigate('/login');
        }, 2000);
      } else {
        setVerifyError(data.message || 'Verification failed');
      }
    } catch (err) {
      setVerifyError('Verification failed');
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Sign up to start chatting with friends"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          type="text"
          name="first_name"
          placeholder="Enter your first name"
          value={formData.first_name}
          onChange={handleChange}
          error={errors.first_name}
          icon={User}
        />
        <Input
          type="text"
          name="last_name"
          placeholder="Enter your last name"
          value={formData.last_name}
          onChange={handleChange}
          error={errors.last_name}
          icon={User}
        />
        <Input
          type="text"
          name="username"
          placeholder="Enter your username"
          value={formData.username}
          onChange={handleChange}
          error={errors.username}
          icon={User}
        />
        <Input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          icon={Mail}
        />
        {errors.api && (
          <p className="text-red-500 text-sm text-center">{errors.api}</p>
        )}
        <Button
          type="submit"
          className="w-full"
          loading={loading}
          disabled={loading}
        >
          Create Account
        </Button>
        <p className="text-center text-gray-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </form>
      {/* Email Verification Modal */}
       {showVerifyModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#1E2836]/90 z-50 backdrop-blur-md transition-opacity duration-500">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-10 shadow-2xl max-w-md w-full text-center transform transition-all duration-500 scale-100 hover:scale-105">
            <h2 className="text-3xl font-extrabold mb-5 text-gray-900 tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Verify Your Email
            </h2>
            <p className="mb-8 text-gray-600 text-base leading-relaxed font-medium">
              Confirm your email address to unlock a world of features!
            </p>
            {verifySuccess ? (
              <p className="text-green-600 text-lg font-semibold mb-8">Verification successful! Redirecting to login...</p>
            ) : (
              <div className="flex items-center justify-center mb-8">
                <label className="flex items-center space-x-4 cursor-pointer group">
                  <span className="relative">
                    <input
                      type="checkbox"
                      onChange={handleVerifyEmail}
                      disabled={verifyLoading}
                      className="h-6 w-6 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-lg transition-colors duration-300 group-hover:ring-2 group-hover:ring-blue-200 appearance-none border-2 border-blue-400 checked:bg-blue-600 checked:border-blue-600"
                    />
                    {verifyLoading && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <LoadingSpinner className="w-5 h-5 text-blue-600" />
                      </span>
                    )}
                  </span>
                  <span className="text-gray-800 font-semibold text-lg transition-colors duration-300 group-hover:text-blue-600">
                    I have verified my email
                  </span>
                </label>
              </div>
            )}
            {verifyError && (
              <p className="text-red-500 text-sm mt-2 bg-red-50/80 p-3 rounded-lg border border-red-200/50">
                {verifyError}
              </p>
            )}
            <button
              onClick={() => setShowVerifyModal(false)}
              className="mt-8 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full hover:from-blue-600 hover:to-indigo-700 text-sm font-semibold transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg"
              disabled={verifyLoading || verifySuccess}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
};

export default Register;