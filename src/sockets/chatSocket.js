import { ChatMessage } from '../models/chatMessageModel.js';
import { ChatMessageSeen } from '../models/chatMessageSeenModel.js';
import { ChatRoom } from '../models/chatRoomModel.js';
import { ChatParticipant } from '../models/chatParticipantsModel.js';
import { ChatMessageEdit } from '../models/chatMessageEditModel.js';
import { UserLoginLogs } from '../models/userLoginLogsModel.js';
import { User } from '../models/usersModel.js';
import CryptoJS from 'crypto-js';
import { Op } from 'sequelize';

export const socketConnection = (io) => {
  io.on('connection', async (socket) => {
    console.log(` New client connected: ${socket.id}`);

    const token = socket.handshake.headers?.token;

    if (!token) {
      console.log("No token provided. Disconnecting...");
      return socket.disconnect(true);
    }

    try {

      const decryptedData = CryptoJS.AES.decrypt(token, process.env.ACCESS_SECRET).toString(CryptoJS.enc.Utf8);
      if (!decryptedData) {
        console.log("Invalid token decryption");
        return socket.disconnect(true);
      }

      const [userId, issuedAt] = decryptedData.split("##");
      if (!userId) {
        return socket.disconnect(true);
      }

      socket.user_id = userId;


      const tokenLog = await UserLoginLogs.findOne({
        where: {
          user_id: userId,
          access_token: token,
          access_token_expiration_datetime: {
            [Op.gt]: new Date(),
          },
          is_logout: 0
        },
      })
     
        if (!tokenLog) {
        console.log("No valid token log found. Disconnecting...");
        return socket.disconnect(true);
        }

        await User.update({ is_online: 1 }, { where: { user_id: userId } })

        
      socket.on('disconnect', async() => {
        console.log(`Client disconnected: ${socket.id}`);
     
        await User.update({ is_online: 0 }, { where: { user_id: userId } })

      });

    } catch (err) {
      console.log("Error while decrypting token", err);
      socket.disconnect(true);
    }

  });
};
