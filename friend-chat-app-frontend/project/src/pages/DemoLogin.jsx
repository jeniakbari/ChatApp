import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Play, Users, Zap } from 'lucide-react';
import Button from '../components/Shared/Button';
import { useNavigate } from 'react-router-dom';

const DemoLogin = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: MessageCircle,
      title: 'Real-time Chat',
      description: 'Instant messaging with typing indicators and read receipts'
    },
    {
      icon: Users,
      title: 'Friend System',
      description: 'Send requests, manage friends, and build your network'
    },
    {
      icon: Zap,
      title: 'Live Updates',
      description: 'Socket.IO powered real-time communication'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-6"
          >
            <MessageCircle className="h-10 w-10 text-white" />
          </motion.div>
          
          <h1 className="text-5xl font-bold text-white mb-4">
            Chat App Demo
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Experience a fully functional chat application with real-time messaging, friend system, and beautiful UI
          </p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              onClick={() => navigate('/demo')}
              icon={Play}
              className="text-lg px-8 py-4"
            >
              Start Demo
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/login')}
              className="text-lg px-8 py-4"
            >
              Real Login
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className="card p-6 text-center"
            >
              <feature.icon className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center"
        >
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Demo Features</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-gray-300">✅ User Authentication</div>
              <div className="text-gray-300">✅ Real-time Messaging</div>
              <div className="text-gray-300">✅ Friend Requests</div>
              <div className="text-gray-300">✅ Profile Management</div>
              <div className="text-gray-300">✅ Online Status</div>
              <div className="text-gray-300">✅ Typing Indicators</div>
              <div className="text-gray-300">✅ Responsive Design</div>
              <div className="text-gray-300">✅ Dark Theme</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DemoLogin;