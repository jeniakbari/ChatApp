import { User } from "../models/usersModel.js";
import {FriendRequest} from "../models/friendRequestModel.js";
import {ChatRoom} from "../models/chatRoomModel.js";
import {ChatParticipant} from "../models/chatParticipantsModel.js";
import { BlockedUser } from "../models/blockedUserModel.js";
import { Op } from 'sequelize';


const sendFriendRequest = async (req,res,next) => {
    try {

        const { receiver_id } = req.body;
        const sender_id = req.user; 


        if (!receiver_id) {
            return res.status(400).json({ message: "Receiver ID is required" });
        }

        const receiver = await User.findOne({ where: { user_id: receiver_id } });
        if (!receiver) {
            return res.status(404).json({ message: "Receiver User not found" });
        }

        // if any user tries to find block user
        const blockedUser = await BlockedUser.findOne({
            where: {
                [Op.or]: [
                    { user_id: sender_id, blocked_user_id: receiver_id },
                    { user_id: receiver_id, blocked_user_id: sender_id }
                ],
                is_deleted: 0
            }
        }); 
        if (blockedUser) {
            return res.status(403).json({ message: "User Not Found" });
        }

        const existingRequest = await FriendRequest.findOne({
            where: {
                [Op.or]: [
                    {
                        request_sender_id: sender_id,
                        request_receiver_id: receiver_id
                    },
                    {
                        request_sender_id: receiver_id,
                        request_receiver_id: sender_id
                    }
                ],
                is_deleted: 0
            }
        });

        if(existingRequest){

        if (existingRequest.status === 1) {
            return res.status(400).json({ message: "Friend request already sent or received" });
        }
        if (existingRequest.status === 2) {
            return res.status(400).json({ message: "You are already friends" });
        }
    }

        // Create a new friend request
        const newRequest = await FriendRequest.create({
            request_sender_id: sender_id,
            request_receiver_id: receiver_id,
        });


        return res.status(201).json({
            message: "Friend request sent successfully",
            friend_request: newRequest
        });
       
    } catch (error) {
        next(error);
        console.error("Error in Sending Friend Request:", error);
    }
}

const acceptFriendRequest = async (req, res, next) => {
    try {
        const { friend_request_id } = req.body;
        const user_id = req.user;

        if (!friend_request_id) {
            return res.status(400).json({ message: "Request ID is required" });
        }
        const request = await FriendRequest.findOne({
            where: {
                friend_id: friend_request_id,
                request_receiver_id: user_id,
                status: 1, // Only pending requests
                is_deleted: 0
            }
        }); 
        if (!request) {
            return res.status(404).json({ message: "Friend request not found or already processed" });
        }

        request.status = 2; // Accepted
        await request.save();

        const chatRoom = await ChatRoom.create({
            created_by: user_id
        });
        if (!chatRoom) {
            return res.status(500).json({ message: "Failed to create chat room" });
        }
        if(chatRoom.room_type !== 1) {
            chatRoom.room_name = 'Group'; 
            await chatRoom.save();
        }
        
        request.room_id = chatRoom.room_id;
        await request.save();

        await ChatParticipant.bulkCreate([
            { user_id: request.request_sender_id, room_id: chatRoom.room_id },
            { user_id: request.request_receiver_id, room_id: chatRoom.room_id }
        ]);
    

        return res.status(200).json({
            message: "Friend request accepted successfully",
            friend_request: request,
            chat_room: chatRoom
        });


    } catch (error) {
        next(error);
        console.error("Error in Accepting Friend Request:", error);
    }
}

const rejectFriendRequest = async (req, res, next) => {
    try {
        const { friend_request_id } = req.body;
        const user_id = req.user;

        if (!friend_request_id) {
            return res.status(400).json({ message: "Request ID is required" });
        }

        const request = await FriendRequest.findOne({
            where: {
                friend_id: friend_request_id,
                request_receiver_id: user_id,
                status: 1, 
                is_deleted: 0
            }
        });

        if (!request) {
            return res.status(404).json({ message: "Friend request not found or already processed" });
        }

        request.status = 3; // Rejected
        await request.save();

        return res.status(200).json({
            message: "Friend request rejected successfully",
            friend_request: request
        });

    } catch (error) {
        next(error);
        console.error("Error in Rejecting Friend Request:", error);
    }
}

const removeFriend = async (req, res, next) => {
    try {
        const { friend_id } = req.body;
        const user_id = req.user;

        if (!friend_id) {
            return res.status(400).json({ message: "Friend ID is required" });
        }

        const request = await FriendRequest.findOne({
            where: {
                [Op.or]: [
                    { request_sender_id: user_id, request_receiver_id: friend_id },
                    { request_sender_id: friend_id, request_receiver_id: user_id }
                ],
                status: 2, 
                is_deleted: 0
            }
        });

        if (!request) {
            return res.status(404).json({ message: "Friend not found or already removed" });
        }

        request.is_deleted = 1; 
        await request.save();

        return res.status(200).json({
            message: "Friend removed successfully",
            friend_request: request
        });

    } catch (error) {
        next(error);
        console.error("Error in Removing Friend:", error);
    }
}

const blockUser = async (req, res, next) => {
    try {

        const { blocked_user_id } = req.body;
        const user_id = req.user;

        if (!blocked_user_id) {
            return res.status(400).json({ message: "Blocked User ID is required" });
        }

        const blockedUser = await User.findOne({ where: { user_id: blocked_user_id } });
        if (!blockedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const existingBlock = await BlockedUser.findOne({
            where: {
                user_id: user_id,
                blocked_user_id: blocked_user_id,
                is_deleted: 0
            }
        });

        if (existingBlock) {
            return res.status(400).json({ message: "User already blocked" });
        }

        const newBlock = await BlockedUser.create({
            user_id: user_id,
            blocked_user_id: blocked_user_id
        });

        return res.status(201).json({
            message: "User blocked successfully",
            block_info: newBlock
        });
        
    } catch (error) {
        next(error);
        console.error("Error in Blocking User:", error);
        
    }
}

const unblockUser = async (req, res, next) => {
    try {
        const { blocked_user_id } = req.body;
        const user_id = req.user;

        if (!blocked_user_id) {
            return res.status(400).json({ message: "Blocked User ID is required" });
        }

        const block = await BlockedUser.findOne({
            where: {
                user_id: user_id,
                blocked_user_id: blocked_user_id,
                is_deleted: 0
            }
        });

        if (!block) {
            return res.status(404).json({ message: "Blocked user not found" });
        }

        block.is_deleted = 1; 
        await block.save();

        return res.status(200).json({
            message: "User unblocked successfully",
            block_info: block
        });

    } catch (error) {
        next(error);
        console.error("Error in Unblocking User:", error);
    }
}



export {sendFriendRequest,acceptFriendRequest,rejectFriendRequest,removeFriend,blockUser,unblockUser};