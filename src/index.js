import sequelize from './models/dbConfig.js';
import express from "express";
import http from 'http';
import dotenv from 'dotenv'
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


import { errorMiddleware } from './middleware/error-middleware.js';


import {router} from './routes/indexRoutes.js';

dotenv.config();

const app = express();


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
      httpServer.listen(process.env.PORT,()=>{
        console.log(`Server Running on PORT ${process.env.PORT}`);
      })
  }
  catch (error) {
      console.log("Error connecting to database",error)
  }
}

startServer();


