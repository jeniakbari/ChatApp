import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Shield, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/Auth/AuthLayout';
import Input from '../components/Shared/Input';
import Button from '../components/Shared/Button';

const Login = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: email, 2: otp
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [sendOtpLoading, setSendOtpLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);

  const { sendOtp, loginWithOtp } = useAuth();
  const navigate = useNavigate();

  // Countdown timer for resend OTP
  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
        if (countdown === 1) {
          setCanResend(true);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const validateEmail = () => {
    if (!email) {
      setErrors({ email: 'Email is required' });
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: 'Email is invalid' });
      return false;
    }
    setErrors({});
    return true;
  };

  const validateOtp = () => {
    if (!otp || otp.length !== 6) {
      setErrors({ otp: 'Please enter a valid 6-digit OTP' });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSendOtp = async () => {
    if (!validateEmail()) return;

    setSendOtpLoading(true);
    try {
      await sendOtp(email);
      setStep(2);
      setCountdown(60);
      setCanResend(false);
      setErrors({});
    } catch (error) {
      console.error('Send OTP error:', error);
    } finally {
      setSendOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setSendOtpLoading(true);
    try {
      await sendOtp(email);
      setCountdown(60);
      setCanResend(false);
      setErrors({});
    } catch (error) {
      console.error('Resend OTP error:', error);
    } finally {
      setSendOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateOtp()) return;

    setLoading(true);
    try {
      await loginWithOtp(email, otp);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.slice(0, 6);
    setOtp(value);
    if (errors.otp) {
      setErrors(prev => ({ ...prev, otp: '' }));
    }
  };

  const handleBackToEmail = () => {
    setStep(1);
    setOtp('');
    setErrors({});
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle={step === 1 ? "Sign in to your account to continue" : `Enter the 6-digit code sent to ${email}`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 ? (
          // Step 1: Email input
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={handleEmailChange}
              error={errors.email}
              icon={Mail}
            />

            <Button
              type="button"
              className="w-full mt-[15px]"
              loading={sendOtpLoading}
              disabled={sendOtpLoading}
              onClick={handleSendOtp}
            >
              Send OTP
            </Button>
          </motion.div>
        ) : (
          // Step 2: OTP input
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center">
              <Input
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={handleOtpChange}
                error={errors.otp}
                icon={Shield}
                className="text-center text-lg tracking-widest"
                maxLength={6}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={loading}
              disabled={loading || otp.length !== 6}
            >
              Sign In
            </Button>

            <div className="text-center">
              {canResend ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResendOtp}
                  loading={sendOtpLoading}
                  disabled={sendOtpLoading}
                  icon={RotateCcw}
                >
                  Resend Code
                </Button>
              ) : (
                <p className="text-gray-400">
                  Resend code in {countdown}s
                </p>
              )}
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleBackToEmail}
                className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
              >
                ← Back to email
              </button>
            </div>
          </motion.div>
        )}

        <div className="text-center space-y-2">
          <p className="text-gray-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Sign up
            </Link>
          </p>
          <Link
            to="/forgot-password"
            className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
          >
            Forgot your password?
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;