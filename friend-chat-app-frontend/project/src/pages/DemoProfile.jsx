import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Save, Edit2, Award, MessageSquare, Users } from 'lucide-react';
import DemoNavbar from '../components/Shared/DemoNavbar';
import Input from '../components/Shared/Input';
import Button from '../components/Shared/Button';
import Avatar from '../components/Shared/Avatar';
import { useDemoAuth } from '../context/DemoAuthContext';
import { demoUserAPI } from '../services/demoApi';
import toast from 'react-hot-toast';

const DemoProfile = () => {
  const { user, updateUser } = useDemoAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    avatar: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await demoUserAPI.updateProfile(formData);
      updateUser(response.data);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user.username || '',
      email: user.email || '',
      bio: user.bio || '',
      avatar: user.avatar || '',
    });
    setIsEditing(false);
  };

  const achievements = [
    { icon: MessageSquare, label: 'First Message', description: 'Sent your first message' },
    { icon: Users, label: 'Social Butterfly', description: 'Added 10+ friends' },
    { icon: Award, label: 'Active User', description: 'Used the app for 7 days' },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      <DemoNavbar />
      
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
              <p className="text-gray-400">Manage your account information</p>
            </div>
            <div className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
              🎭 Demo Mode
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Picture */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="card p-6 text-center">
              <div className="relative inline-block mb-4">
                <Avatar
                  src={formData.avatar}
                  alt={formData.username}
                  size="2xl"
                />
                {isEditing && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg"
                  >
                    <Camera className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
              
              <h2 className="text-xl font-semibold text-white mb-1">
                {formData.username}
              </h2>
              <p className="text-gray-400 mb-4">{formData.email}</p>
              
              {!isEditing && (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  icon={Edit2}
                >
                  Edit Profile
                </Button>
              )}
            </div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 card p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className="text-green-400 flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Member since</span>
                  <span className="text-white">Jan 2024</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Last seen</span>
                  <span className="text-white">Now</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Profile Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="card p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Username
                    </label>
                    <Input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Enter your username"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={true} // Email cannot be changed
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Avatar URL
                  </label>
                  <Input
                    type="url"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter avatar image URL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself..."
                    className="input-field resize-none h-24"
                    rows={3}
                  />
                </div>

                {isEditing && (
                  <div className="flex items-center space-x-4">
                    <Button
                      type="submit"
                      loading={loading}
                      disabled={loading}
                      icon={Save}
                    >
                      Save Changes
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </form>
            </div>
          </motion.div>
        </div>

        {/* Account Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Account Statistics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {user?.friendsCount || 12}
                </div>
                <div className="text-sm text-gray-400">Friends</div>
              </div>
              
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {user?.chatsCount || 8}
                </div>
                <div className="text-sm text-gray-400">Chats</div>
              </div>
              
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {user?.messagesCount || 247}
                </div>
                <div className="text-sm text-gray-400">Messages</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
                >
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Achievements</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="p-4 bg-gray-700 rounded-lg text-center"
                >
                  <achievement.icon className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <h4 className="font-medium text-white mb-1">{achievement.label}</h4>
                  <p className="text-xs text-gray-400">{achievement.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DemoProfile;