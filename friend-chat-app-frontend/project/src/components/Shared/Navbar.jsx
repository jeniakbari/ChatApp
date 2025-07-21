import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, LogOut, User, Users, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from './Avatar';
import Button from './Button';
import { userAPI } from '../../services/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = React.useState(null);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userAPI.getProfile();
        setProfile(response.data.user_profile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-gray-800 border-b border-gray-700 px-4 py-3"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <MessageCircle className="h-8 w-8 text-blue-500" />
          <span className="text-xl font-bold text-white">ChatApp</span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <Link
            to="/dashboard"
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              isActive('/dashboard')
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <MessageCircle className="h-4 w-4" />
            <span>Chats</span>
          </Link>
          <Link
            to="/friends"
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              isActive('/friends')
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Friends</span>
          </Link>
          <Link
            to="/profile"
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              isActive('/profile')
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Profile</span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <Avatar
              src={user?.avatar}
              alt={profile?.username || user?.username}
              size="md"
              onClick={() => navigate('/profile')}
            />
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-white">{profile ? `${profile.first_name} ${profile.last_name}` : user?.username}</p>
              <p className="text-xs text-gray-400">{profile?.email || user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={LogOut}
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-400"
          >
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;