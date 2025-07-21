import { User } from "../models/usersModel.js";
import { FriendRequest } from "../models/friendRequestModel.js";
import { ChatRoom } from "../models/chatRoomModel.js";
import { ChatParticipant } from "../models/chatParticipantsModel.js";
import { BlockedUser } from "../models/blockedUserModel.js";
import { Op } from "sequelize";
import { getSignedUrl } from '../utility/getSignedUrl.js';
// import { s3 } from '../config/aws.js'; 


const sendFriendRequest = async (req, res, next) => {
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
          { user_id: receiver_id, blocked_user_id: sender_id },
        ],
        is_deleted: 0,
      },
    });
    if (blockedUser) {
      return res.status(403).json({ message: "User Not Found" });
    }

    const existingRequest = await FriendRequest.findOne({
      where: {
        [Op.or]: [
          {
            request_sender_id: sender_id,
            request_receiver_id: receiver_id,
          },
          {
            request_sender_id: receiver_id,
            request_receiver_id: sender_id,
          },
        ],
        is_deleted: 0,
      },
    });

    if (existingRequest) {
      if (existingRequest.status === 1) {
        return res
          .status(400)
          .json({ message: "Friend request already sent or received" });
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
      friend_request: newRequest,
    });
  } catch (error) {
    next(error);
  }
};

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
        is_deleted: 0,
      },
    });
    if (!request) {
      return res
        .status(404)
        .json({ message: "Friend request not found or already processed" });
    }

    request.status = 2; // Accepted
    await request.save();

    const chatRoom = await ChatRoom.create({
      created_by: user_id,
    });
    if (!chatRoom) {
      return res.status(500).json({ message: "Failed to create chat room" });
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
      chat_room: chatRoom,
    });
  } catch (error) {
    next(error);
  }
};

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
        is_deleted: 0,
      },
    });

    if (!request) {
      return res
        .status(404)
        .json({ message: "Friend request not found or already processed" });
    }

    request.status = 3; // Rejected
    await request.save();

    return res.status(200).json({
      message: "Friend request rejected successfully",
      friend_request: request,
    });
  } catch (error) {
    next(error);
  }
};

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
          { request_sender_id: friend_id, request_receiver_id: user_id },
        ],
        status: 2,
        is_deleted: 0,
      },
    });

    if (!request) {
      return res
        .status(404)
        .json({ message: "Friend not found or already removed" });
    }

    request.is_deleted = 1;
    await request.save();

    return res.status(200).json({
      message: "Friend removed successfully",
      friend_request: request,
    });
  } catch (error) {
    next(error);
  }
};

const blockUser = async (req, res, next) => {
  try {
    const { blocked_user_id } = req.body;
    const user_id = req.user;

    if (!blocked_user_id) {
      return res.status(400).json({ message: "Blocked User ID is required" });
    }

    const blockedUser = await User.findOne({
      where: { user_id: blocked_user_id },
    });
    if (!blockedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingBlock = await BlockedUser.findOne({
      where: {
        user_id: user_id,
        blocked_user_id: blocked_user_id,
        is_deleted: 0,
      },
    });

    if (existingBlock) {
      return res.status(400).json({ message: "User already blocked" });
    }

    const newBlock = await BlockedUser.create({
      user_id: user_id,
      blocked_user_id: blocked_user_id,
    });

    return res.status(201).json({
      message: "User blocked successfully",
      block_info: newBlock,
    });
  } catch (error) {
    next(error);
  }
};

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
        is_deleted: 0,
      },
    });

    if (!block) {
      return res.status(404).json({ message: "Blocked user not found" });
    }

    block.is_deleted = 1;
    await block.save();

    return res.status(200).json({
      message: "User unblocked successfully",
      block_info: block,
    });
  } catch (error) {
    next(error);
  }
};

const getBlockedUsers = async (req, res, next) => {
  try {
    const user_id = req.user;

    const blockedUsers = await BlockedUser.findAll({
      where: {
        user_id: user_id,
        is_deleted: 0,
      },
      include: [
        {
          model: User,
          as: "BlockedPerson",
          attributes: ["user_id", "first_name", "last_name", "email"],
        },
      ],
    });

    return res.status(200).json({
      message: "Blocked users retrieved successfully",
      blocked_users: blockedUsers,
    });
  } catch (error) {
    next(error);
    console.error("Error in Retrieving Blocked Users:", error);
  }
};

const getFriends = async (req, res, next) => {
  try {
    const user_id = req.user;
    console.log("User ID:", user_id);

    const friends = await FriendRequest.findAll({
      where: {
        [Op.or]: [
          { request_sender_id: user_id, status: 2 },
          { request_receiver_id: user_id, status: 2 },
        ],
        is_deleted: 0,
      },
      include: [
        {
          model: User,
          as: "Sender",
          attributes: ["user_id", "first_name", "last_name", "email"],
          include: [
            {
              model: BlockedUser,
              as: "BlockedUsers",
              attributes: ["block_id", "blocked_user_id"],
              where: {
                is_deleted: 0,
              },
              required: false,
            },
          ],
          required: false,
        },
        {
          model: User,
          as: "Receiver",
          attributes: ["user_id", "first_name", "last_name", "email"],
          include: [
            {
              model: BlockedUser,
              as: "BlockedUsers",
              attributes: ["block_id", "blocked_user_id"],
              where: {
                is_deleted: 0,
              },
              required: false,
            },
          ],
          required: false,
        },
      ],
    });

    if (!friends || friends.length === 0) {
      return res.status(404).json({ message: "No friends found" });
    }

    const finalFriends = [];

    for (const friend of friends) {
      let friendUser;
      if (friend.request_sender_id === user_id) {
        friendUser = friend.Receiver;
      } else {
        friendUser = friend.Sender;
      }

      if (!friendUser) continue;

      // check blocked logic
      const hasBlocked = friendUser.BlockedUsers?.some(
        (blocked) =>
          (blocked.user_id === user_id &&
            blocked.blocked_user_id === friendUser.user_id) ||
          (blocked.user_id === friendUser.user_id &&
            blocked.blocked_user_id === user_id)
      );

      if (!hasBlocked) {
        finalFriends.push({
          user_id: friendUser.user_id,
          first_name: friendUser.first_name,
          last_name: friendUser.last_name,
          email: friendUser.email,
        });
      }
    }

    return res.status(200).json({
      message: "Friends retrieved successfully",
      friends: finalFriends,
    });
  } catch (error) {
    next(error);
  }
};

const getPendingRequests = async (req, res, next) => {
  try {
    const user_id = req.user;

    const pendingRequests = await FriendRequest.findAll({
      where: {
        request_receiver_id: user_id,
        status: 1,
        is_deleted: 0,
      },
      include: [
        {
          model: User,
          as: "Sender",
          attributes: ["user_id", "first_name", "last_name", "email"],
        },
      ],
    });

    if (!pendingRequests || pendingRequests.length === 0) {
      return res
        .status(404)
        .json({ message: "No pending friend requests found" });
    }

    return res.status(200).json({
      message: "Pending friend requests retrieved successfully",
      pending_requests: pendingRequests,
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user_id = req.user;
    let userProfile = await User.findOne({
      where: { user_id: user_id },
      attributes: ["user_id", "first_name", "last_name", "email", "username","avatar_key"],
      raw: true,
    });
    

    if (!userProfile) {
      return res.status(404).json({ message: "User not found" });
    }

    const avatarUrl = userProfile.avatar_key ? await getSignedUrl(userProfile.avatar_key) : null;
    userProfile.avatar_url = avatarUrl;

    return res.status(200).json({
      message: "User profile retrieved successfully",
      user_profile: userProfile,
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user_id = req.user;

    let { first_name, last_name, username } = req.body;
    const avatarKey = req.file ? req.file.key : null;

    const userProfile = await User.findOne({ where: { user_id: user_id } });
    if (!userProfile) {
      return res.status(404).json({ message: "User not found" });
    }

    const updateData = {
      first_name,
      last_name,
      username,
    };

    if (avatarKey) updateData.avatar_key = avatarKey;

    const [affectedRows] = await User.update(updateData, {
      where: { user_id },
    });

    if (affectedRows === 0) {
      return res.status(500).json({ message: "Failed to update user profile" });
    }


    return res.status(200).json({
      message: "User profile updated successfully",
    });
  } catch (error) {
    next(error);
  }
};


const searchUsers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const user_id = req.user;

    if (!search || search.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }

    const users = await User.findAll({
      where: {
        [Op.or]: [
          { first_name: { [Op.like]: `%${search}%` } },
          { last_name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
        ],
        user_id: { [Op.ne]: user_id },
        is_deleted: 0,
      },
      attributes: ["user_id", "first_name", "last_name", "email", "username"],
    });

    return res.status(200).json({
      message: "Users retrieved successfully",
      users: users,
    });
  } catch (error) {
    next(error);
  }
};

const searchFriends = async (req, res,next) =>{
  try {
    const { search } = req.query;
    const user_id = req.user;

    if (!search || search.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }

    const friends = await FriendRequest.findAll({
      where: {
        [Op.or]: [
          { request_sender_id: user_id, status: 2 },
          { request_receiver_id: user_id, status: 2 },
        ],
        is_deleted: 0,
        [Op.or]: [
          { '$Sender.first_name$': { [Op.like]: `%${search}%` } },
          { '$Sender.last_name$': { [Op.like]: `%${search}%` } },
          { '$Sender.username$': { [Op.like]: `%${search}%` } },
          { '$Receiver.first_name$': { [Op.like]: `%${search}%` } },
          { '$Receiver.last_name$': { [Op.like]: `%${search}%` } },
          { '$Receiver.username$': { [Op.like]: `%${search}%` } },
        ],
        [Op.and]: [
          {
            '$Sender.user_id$': { [Op.ne]: user_id },
          },
          {
            '$Receiver.user_id$': { [Op.ne]: user_id },
          },
        ]
      },
      include: [
        {
          model: User,
          as: "Sender",
          attributes: ["user_id", "first_name", "last_name", "email", "username"],
          required: false,
        },
        {
          model: User,
          as: "Receiver",
          attributes: ["user_id", "first_name", "last_name", "email", "username"],
          required: false,
        },
      ],
    });

    const matchedFriends = [];

    for (const fr of friends) {
      const otherUser =
        fr.request_sender_id === user_id ? fr.Receiver : fr.Sender;

      if (!otherUser) continue;

      matchedFriends.push(otherUser);
    }

    if (matchedFriends.length === 0) {
      return res.status(404).json({ message: "No friends found" });
    }

    return res.status(200).json({
      message: "Friends retrieved successfully",
      friends: matchedFriends,
    });
    
  } catch (error) {
    next(error);
    console.log("Error in Searching Friends:", error);
    
  }
}

const createGroupChat = async (req, res, next) => {
  try {
    const { room_name, user_ids } = req.body;
    const user_id = req.user;

    if (!room_name || !user_ids || user_ids.length === 0) {
      return res
        .status(400)
        .json({ message: "Room name and user IDs are required" });
    }

    if (user_ids.length < 2) {
      return res.status(400).json({
        message: "At least two users are required to create a group chat",
      });
    }

    const chatRoom = await ChatRoom.create({
      room_name,
      created_by: user_id,
      room_type: 2,
    });

    const participants = [
      { user_id: user_id, room_id: chatRoom.room_id }, // creator
      ...user_ids.map((id) => ({ user_id: id, room_id: chatRoom.room_id })),
    ];

    await ChatParticipant.bulkCreate(participants, { ignoreDuplicates: true });

    return res.status(201).json({
      message: "Group chat created successfully",
      chat_room: chatRoom,
    });
  } catch (error) {
    next(error);
  }
};

// const getUsersAllRooms = async (req, res, next) => {
//   try {
//     const user_id = req.user;

//     const chatRooms = await ChatRoom.findAll({
//       include: [
//         {
//           model: ChatParticipant,
//           as: "ChatParticipants",
//           where: { user_id },
//           attributes: [], 
//         },
//         {
//           model: User,
//           as: "Participants", 
//           attributes: ["user_id", "first_name", "last_name","username", "avatar_key","email"],
//           through: { attributes: [] }, 
//         },

//       ],
//     });

//     if (!chatRooms || chatRooms.length === 0) {
//       return res.status(404).json({ message: "No chat rooms found" });
//     }

//     const formattedRooms = chatRooms.map(room => {
//       const isGroup = room.room_type === 2;
//       let displayName;

//       if (isGroup) {
//         displayName = room.room_name;
//       } else {
        
//         const friend = room.Participants.find(p => p.user_id !== user_id);
//         if (friend) {
//           displayName = friend.username;
//         } else {
//           displayName = "Unknown";
//         }
//       }

//       return {
//         room_id: room.room_id,
//         room_type: room.room_type,
//         room_name: displayName,
//         created_at: room.created_at,
//         updated_at: room.updated_at,
//       };
//     });

//     return res.status(200).json({
//       message: "Chat rooms retrieved successfully",
//       chat_rooms: formattedRooms,
//     });

//   } catch (error) {
//     next(error);
//   }
// };

const getUsersAllRooms = async (req, res, next) => {
  try {
    const user_id = req.user;
    let {page = 1, limit = 10 } = req.body;
    const offset = (page - 1) * limit;

    const chatRooms = await ChatRoom.findAll({
      include: [
        {
          model: ChatParticipant,
          as: "ChatParticipants",
          where: { user_id },
          attributes: [], 
        },
        {
          model: User,
          as: "Participants", 
          attributes: ["user_id", "first_name", "last_name","username", "avatar_key","email"],
          through: { attributes: [] }, 
        },

      ],
      order: [['updated_at', 'DESC']],
      limit,
      offset,
    });

    if (!chatRooms || chatRooms.length === 0) {
      return res.status(404).json({ message: "No chat rooms found" });
    }
    const formattedRooms = [];

    for (const room of chatRooms) {
      const isGroup = room.room_type === 2;
      let displayName = room.room_name;
      let avatarUrl = null;

      if (!isGroup) {
        const friend = room.Participants.find(p => p.user_id !== user_id);
        if (friend) {
          displayName = friend.username || `${friend.first_name} ${friend.last_name}`.trim();
          avatarUrl = friend.avatar_key ? await getSignedUrl(friend.avatar_key) : null;
        }
      }

      formattedRooms.push({
        room_id: room.room_id,
        room_type: room.room_type,
        room_name: displayName,
        avatar_url: avatarUrl,
        created_at: room.created_at,
        updated_at: room.updated_at,
      });
    }

    return res.status(200).json({
      message: "Chat rooms retrieved successfully",
      chat_rooms: formattedRooms,
      page,
      hasMore: chatRooms.length === limit,
    });

  } catch (error) {
    next(error);
  }
};

const getUserById = async (req,res,next) => {
  try {

    const id = req.body.user_id;
    if (!id) {
      throw new Error("User ID is required");
    }

    const user = await User.findOne({
      where: { user_id: id },
      attributes: ["user_id", "first_name", "last_name", "email", "username", "avatar_key"],
    }); 
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const avatarUrl = user.avatar_key ? await getSignedUrl(user.avatar_key) : null;

    return res.status(200).json({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      username: user.username,
      avatar_url: avatarUrl,    
    });
    
  } catch (error) {
    next(error);
  }
}



export {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  blockUser,
  unblockUser,
  getBlockedUsers,
  getFriends,
  getPendingRequests,
  getProfile,
  updateProfile,
  searchUsers,
  searchFriends,
  createGroupChat,
  getUsersAllRooms,
  getUserById
};
