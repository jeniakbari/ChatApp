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

      // Join user in room
      socket.on('join_room', async (data) => {
        const { room_id } = data;
        socket.join(room_id);
      });
      

      socket.on('send_message', async (data) => {
        const { room_id, message } = data;

        const encryptedMessage = CryptoJS.AES.encrypt(message, process.env.MESSAGE_SECRET).toString();

        const newMessage = await ChatMessage.create({
          sender_id: userId,
          room_id: room_id,
          message: encryptedMessage,
        });

         // Find other participants in the room (excluding sender)
        const participants = await ChatParticipant.findAll({
          where: {
            room_id,
            user_id: { [Op.ne]: userId }
          }
        });

        // Get all connected sockets in this room
        const socketsInRoom = await io.in(room_id).fetchSockets();
        const userIdsInRoom = socketsInRoom.map(s => s.user_id);

        for (const participant of participants) {
          const receiver_id = participant.user_id;
          const isUserInRoom = userIdsInRoom.includes(receiver_id);

          await ChatMessageSeen.create({
            message_id: newMessage.message_id,
            user_id: receiver_id,
            seen_at: isUserInRoom ? new Date() : null,
          });

          console.log(`Seen status for ${receiver_id}: ${isUserInRoom ? 'SEEN' : 'UNSEEN'}`);
        } 
        io.to(room_id).emit('receive_message', {
          message_id: newMessage.message_id,
          room_id: room_id,
          sender_id: userId,
          message: encryptedMessage,
        });
       
      });

      socket.on('seen_at', async (data) => {
        const { message_id, room_id } = data;

        const message = await ChatMessage.findByPk(message_id);
        if (!message) {
          console.log(`Message with ID ${message_id} not found.`);
          return;
        }

        await ChatMessageSeen.update({seen_at: new Date()},{
          where:
          {message_id: message_id,
          user_id: userId}
        });

        
        io.to(room_id).emit('message_seen', {
          message_id: message_id,
          user_id: userId,
          seen_at: new Date(),
        });
      });

      socket.on('edit_message', async (data) => {
        const { message_id, new_message, room_id } = data;

        const encryptedNewMessage = CryptoJS.AES.encrypt(new_message, process.env.MESSAGE_SECRET).toString();
        const message = await ChatMessage.findByPk(message_id);

        if (!message) {
          console.log(`Message with ID ${message_id} not found.`);
          return ;
        }

        if(message.message === encryptedNewMessage) {
          console.log(`Message ${message_id} is already the same. No changes made.`);
          return ;
        }

        if(message.sender_id !== userId) {
          console.log(`User ${userId} is not the sender of message ${message_id}. Cannot edit.`);
          return ;
        }

        await ChatMessageEdit.create({
          message_id: message_id,
          user_id: userId,
          old_message: message.message,
        });

        await ChatMessage.update({ message: encryptedNewMessage , is_edited:1 }, { where: { message_id } });
        
        // Emit to the room that the message was edited
        io.to(room_id).emit('message_edited', {
          message_id: message_id,
          new_message: encryptedNewMessage,
          user_id: userId, 
        });

      }); 

      socket.on('load_messages', async ({ room_id, page = 1, limit = 20 }) => {

        const offset = (page - 1) * limit;

        const messages = await ChatMessage.findAndCountAll({
          where: {
            room_id,
            is_deleted: 0,
          },
          order: [['created_at', 'DESC']], 
          limit,
          offset,
        });

        const totalMessages = messages.count;

        const formatted = messages.map(msg => ({
          message_id: msg.message_id,
          user_id: msg.sender_id,
          message: CryptoJS.AES.decrypt(msg.message, process.env.MESSAGE_SECRET).toString(CryptoJS.enc.Utf8),
          created_at: msg.created_at,
          is_edited: msg.is_edited,
        }));

        socket.emit('load_messages_response', {
          messages: formatted.reverse(), 
          page,
          hasMore: offset + limit < totalMessages,
        });
     });

        
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
