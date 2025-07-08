import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(token) {
    if (this.socket) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket'],
      auth: {
        token: token,
      },
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Chat events
  joinRoom(roomId) {
    if (this.socket) {
      this.socket.emit('joinRoom', roomId);
    }
  }

  leaveRoom(roomId) {
    if (this.socket) {
      this.socket.emit('leaveRoom', roomId);
    }
  }

  sendMessage(roomId, message) {
    if (this.socket) {
      this.socket.emit('sendMessage', { roomId, message });
    }
  }

  onMessage(callback) {
    if (this.socket) {
      this.socket.on('receiveMessage', callback);
    }
  }

  offMessage() {
    if (this.socket) {
      this.socket.off('receiveMessage');
    }
  }

  // Typing events
  startTyping(roomId, userId) {
    if (this.socket) {
      this.socket.emit('startTyping', { roomId, userId });
    }
  }

  stopTyping(roomId, userId) {
    if (this.socket) {
      this.socket.emit('stopTyping', { roomId, userId });
    }
  }

  onTyping(callback) {
    if (this.socket) {
      this.socket.on('userTyping', callback);
    }
  }

  onStopTyping(callback) {
    if (this.socket) {
      this.socket.on('userStoppedTyping', callback);
    }
  }

  // User events
  onUserOnline(callback) {
    if (this.socket) {
      this.socket.on('userOnline', callback);
    }
  }

  onUserOffline(callback) {
    if (this.socket) {
      this.socket.on('userOffline', callback);
    }
  }

  // Friend events
  onFriendRequest(callback) {
    if (this.socket) {
      this.socket.on('friendRequest', callback);
    }
  }

  onFriendRequestAccepted(callback) {
    if (this.socket) {
      this.socket.on('friendRequestAccepted', callback);
    }
  }

  // Generic event listeners
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}

const socketService = new SocketService();
export default socketService;