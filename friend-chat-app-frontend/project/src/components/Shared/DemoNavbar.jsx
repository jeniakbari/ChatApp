import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, LogOut, User, Users, Settings } from 'lucide-react';
import { useDemoAuth } from '../../context/DemoAuthContext';
import Avatar from './Avatar';
import Button from './Button';

const DemoNavbar = () => {
  const { user, logout } = useDemoAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/demo-login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-gray-800 border-b border-gray-700 px-4 py-3"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/demo" className="flex items-center space-x-2">
          <MessageCircle className="h-8 w-8 text-blue-500" />
          <span className="text-xl font-bold text-white">ChatApp Demo</span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <Link
            to="/demo"
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              isActive('/demo') || isActive('/demo-dashboard')
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <MessageCircle className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/demo-friends"
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              isActive('/demo-friends')
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Friends</span>
          </Link>
          <Link
            to="/demo-profile"
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              isActive('/demo-profile')
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Profile</span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
            🎭 DEMO
          </div>
          <div className="flex items-center space-x-3">
            <Avatar
              src={user?.avatar}
              alt={user?.username}
              size="md"
              onClick={() => navigate('/demo-profile')}
            />
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-white">{user?.username}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={LogOut}
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-400"
          >
            <span className="hidden sm:inline">Exit Demo</span>
          </Button>
        </div>
      </div>
    </motion.nav>
  );
};

export default DemoNavbar;