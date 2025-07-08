// Mock data for demo purposes
export const mockUser = {
  id: '1',
  username: 'john_doe',
  email: 'john@example.com',
  avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
  bio: 'Software developer passionate about creating amazing user experiences.',
  friendsCount: 12,
  chatsCount: 8,
  messagesCount: 247,
  isOnline: true,
};

export const mockFriends = [
  {
    id: '2',
    username: 'alice_smith',
    email: 'alice@example.com',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
    isOnline: true,
  },
  {
    id: '3',
    username: 'bob_wilson',
    email: 'bob@example.com',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150',
    isOnline: false,
  },
  {
    id: '4',
    username: 'emma_davis',
    email: 'emma@example.com',
    avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150',
    isOnline: true,
  },
  {
    id: '5',
    username: 'mike_johnson',
    email: 'mike@example.com',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
    isOnline: false,
  },
];

export const mockChats = [
  {
    id: 'chat1',
    type: 'private',
    name: null,
    participants: [mockUser, mockFriends[0]],
    lastMessage: {
      id: 'msg1',
      content: 'Hey! How are you doing?',
      sender: mockFriends[0],
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    },
    unreadCount: 2,
  },
  {
    id: 'chat2',
    type: 'private',
    name: null,
    participants: [mockUser, mockFriends[1]],
    lastMessage: {
      id: 'msg2',
      content: 'Thanks for the help yesterday!',
      sender: mockUser,
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    },
    unreadCount: 0,
  },
  {
    id: 'chat3',
    type: 'group',
    name: 'Team Project',
    participants: [mockUser, mockFriends[0], mockFriends[2], mockFriends[3]],
    lastMessage: {
      id: 'msg3',
      content: 'Meeting at 3 PM today',
      sender: mockFriends[2],
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    },
    unreadCount: 1,
  },
  {
    id: 'chat4',
    type: 'private',
    name: null,
    participants: [mockUser, mockFriends[3]],
    lastMessage: {
      id: 'msg4',
      content: 'See you tomorrow!',
      sender: mockFriends[3],
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    },
    unreadCount: 0,
  },
];

export const mockMessages = {
  chat1: [
    {
      id: 'msg1-1',
      content: 'Hi there! How was your weekend?',
      sender: mockFriends[0],
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      status: 'read',
    },
    {
      id: 'msg1-2',
      content: 'It was great! Went hiking with some friends. How about you?',
      sender: mockUser,
      timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
      status: 'read',
    },
    {
      id: 'msg1-3',
      content: 'That sounds amazing! I stayed home and worked on some personal projects.',
      sender: mockFriends[0],
      timestamp: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
      status: 'read',
    },
    {
      id: 'msg1-4',
      content: 'Hey! How are you doing?',
      sender: mockFriends[0],
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      status: 'delivered',
    },
  ],
};

export const mockFriendRequests = [
  {
    id: 'req1',
    sender: {
      id: '6',
      username: 'sarah_connor',
      email: 'sarah@example.com',
      avatar: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
  },
  {
    id: 'req2',
    sender: {
      id: '7',
      username: 'david_brown',
      email: 'david@example.com',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
  },
];

export const mockSearchResults = [
  {
    id: '8',
    username: 'lisa_garcia',
    email: 'lisa@example.com',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    requestSent: false,
  },
  {
    id: '9',
    username: 'tom_anderson',
    email: 'tom@example.com',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150',
    requestSent: false,
  },
];

export const mockOnlineUsers = ['2', '4']; // Alice and Emma are online