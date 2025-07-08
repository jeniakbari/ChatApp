import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';
import Navbar from '../components/Shared/Navbar';
import Avatar from '../components/Shared/Avatar';
import MessageItem from '../components/Chat/MessageItem';
import ChatInput from '../components/Chat/ChatInput';
import TypingIndicator from '../components/Chat/TypingIndicator';
import LoadingSpinner from '../components/Shared/LoadingSpinner';
import Button from '../components/Shared/Button';
import { chatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import socketService from '../socket/socket';

const ChatRoom = () => {
  const { chatId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isUserOnline, getTypingUsers } = useSocket();
  
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);
  
  // For new chat creation
  const newChatUser = location.state?.user;

  useEffect(() => {
    if (chatId === 'new' && newChatUser) {
      // Create a temporary chat object for UI
      setChat({
        id: 'new',
        type: 'private',
        participants: [user, newChatUser],
        name: null,
      });
      setMessages([]);
      setLoading(false);
    } else if (chatId !== 'new') {
      fetchChat();
      fetchMessages();
    }
  }, [chatId, newChatUser]);

  useEffect(() => {
    if (chatId !== 'new') {
      // Join the chat room
      socketService.joinRoom(chatId);

      // Listen for new messages
      socketService.onMessage(handleNewMessage);

      return () => {
        socketService.leaveRoom(chatId);
        socketService.offMessage();
      };
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChat = async () => {
    try {
      const response = await chatAPI.getChatById(chatId);
      setChat(response.data);
    } catch (error) {
      console.error('Error fetching chat:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await chatAPI.getMessages(chatId);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content) => {
    if (!content.trim()) return;

    setSendingMessage(true);
    
    try {
      let currentChatId = chatId;
      
      // If this is a new chat, we need to create it first
      if (chatId === 'new' && newChatUser) {
        // For now, we'll send the message and let the backend handle chat creation
        // In a real implementation, you might want to create the chat first
        const tempMessage = {
          id: Date.now(),
          content,
          sender: user,
          timestamp: new Date().toISOString(),
          status: 'sending',
        };
        setMessages(prev => [...prev, tempMessage]);
        
        // Here you would typically call an API to create a new chat
        // For now, we'll simulate this
        navigate('/dashboard');
        return;
      }

      const response = await chatAPI.sendMessage(currentChatId, content);
      
      // The message will be received via socket, so we don't need to add it here
      // But we can add it optimistically
      const newMessage = {
        ...response.data,
        sender: user,
        status: 'sent',
      };
      
      // Send via socket for real-time delivery
      socketService.sendMessage(currentChatId, newMessage);
      
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleTyping = (isTyping) => {
    if (chatId !== 'new') {
      if (isTyping) {
        socketService.startTyping(chatId, user.id);
      } else {
        socketService.stopTyping(chatId, user.id);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white mb-2">Chat not found</h2>
            <Button onClick={() => navigate('/dashboard')}>
              Go back to chats
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const otherParticipant = chat.participants.find(p => p.id !== user.id);
  const typingUsers = getTypingUsers(chatId);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Navbar />
      
      {/* Chat Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            icon={ArrowLeft}
            className="lg:hidden"
          />
          
          <Avatar
            src={chat.type === 'group' ? null : otherParticipant?.avatar}
            alt={chat.name || otherParticipant?.username}
            size="md"
            online={chat.type === 'private' && isUserOnline(otherParticipant?.id)}
          />
          
          <div>
            <h2 className="font-semibold text-white">
              {chat.name || otherParticipant?.username}
            </h2>
            {chat.type === 'private' && (
              <p className="text-sm text-gray-400">
                {isUserOnline(otherParticipant?.id) ? 'Online' : 'Offline'}
              </p>
            )}
            {chat.type === 'group' && (
              <p className="text-sm text-gray-400">
                {chat.participants.length} members
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" icon={Phone} />
          <Button variant="ghost" size="sm" icon={Video} />
          <Button variant="ghost" size="sm" icon={MoreVertical} />
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-400 mb-2">
                  No messages yet
                </h3>
                <p className="text-gray-500">
                  Start the conversation with {otherParticipant?.username}
                </p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => {
              const isOwn = message.sender.id === user.id;
              const showAvatar = !isOwn && (
                index === 0 || 
                messages[index - 1].sender.id !== message.sender.id
              );
              
              return (
                <MessageItem
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                  user={message.sender}
                />
              );
            })
          )}
          
          {typingUsers.length > 0 && (
            <TypingIndicator users={typingUsers} />
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          disabled={sendingMessage}
        />
      </div>
    </div>
  );
};

export default ChatRoom;