import sequelize from './models/dbConfig.js';
import express from "express";
import http from 'http';
import dotenv from 'dotenv'
import cors from 'cors';
import { Server } from 'socket.io';
import { socketConnection } from './sockets/chatSocket.js';

import { User } from './models/usersModel.js';
import { ChatMessage } from './models/chatMessageModel.js';
import { ChatRoom } from './models/chatRoomModel.js';
import { ChatParticipant } from './models/chatParticipantsModel.js';
import { ChatMessageEdit } from './models/chatMessageEditModel.js';
import { ChatMessageSeen } from './models/chatMessageSeenModel.js';
import { FriendRequest } from './models/friendRequestModel.js';
import { BlockedUser } from './models/blockedUserModel.js';
import { UserOtpLogs } from './models/userOtpLogsModel.js';
import { UserLoginLogs } from './models/userLoginLogsModel.js';
import {MessageReaction} from './models/messageReactionModel.js';


import { errorMiddleware } from './middleware/error-middleware.js';


import {router} from './routes/indexRoutes.js';

dotenv.config();

const app = express();

// app.use(cors({
//   origin: '*', 
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
// }));

app.use((req, res, next) => {
  const origin = req.headers.origin;
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Credentials', 'true');  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

const httpServer = http.createServer(app);

const io = new Server(httpServer, { 
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

socketConnection(io);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', router);
app.use(errorMiddleware);

// Associate all models
const models = {
  User,
  ChatMessage,
  ChatRoom,
  ChatParticipant,
  ChatMessageEdit,
  ChatMessageSeen,
  FriendRequest,
  BlockedUser,
  UserOtpLogs,
  UserLoginLogs,
  MessageReaction
};

// Initialize associations
Object.values(models).forEach(model => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

async function startServer(){
  try {
      await sequelize.authenticate();
        console.log("Database connected successfully");
      await sequelize.sync({alter:true});
      await User.update({ is_online: 0 }, { where: {} });
      httpServer.listen(process.env.PORT,()=>{
        console.log(`Server Running on PORT ${process.env.PORT}`);
      })
  }
  catch (error) {
      console.log("Error connecting to database",error)
  }
}

startServer();
