import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/Auth/AuthLayout';
import Input from '../components/Shared/Input';
import Button from '../components/Shared/Button';

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const { verifyEmail, sendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/register');
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      await verifyEmail(otp);
      navigate('/login');
    } catch (error) {
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    try {
      await sendOtp(email);
      setCountdown(60);
      setCanResend(false);
      setError('');
    } catch (error) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Verify Your Email"
      subtitle={`We've sent a 6-digit code to ${email}`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center">
          <Input
            type="text"
            placeholder="Enter 6-digit code"
            value={otp}
            onChange={handleChange}
            error={error}
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
          Verify Email
        </Button>

        <div className="text-center">
          {canResend ? (
            <Button
              type="button"
              variant="ghost"
              onClick={handleResendOtp}
              loading={resendLoading}
              disabled={resendLoading}
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

        <p className="text-center text-gray-400 text-sm">
          Didn't receive the code? Check your spam folder or{' '}
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            try a different email
          </button>
        </p>
      </form>
    </AuthLayout>
  );
};

export default VerifyOtp;