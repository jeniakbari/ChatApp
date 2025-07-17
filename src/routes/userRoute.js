import { authenticate } from "../middleware/auth-middleware.js";
import { Router } from "express";
import { uploadAvatar } from '../middleware/upload-middleware.js';
const router = Router();

import {
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
  createGroupChat,
  getUsersAllRooms,
} from "../controllers/userController.js";


router.route("/send-request").post(authenticate, sendFriendRequest);

router.route("/accept-request").post(authenticate, acceptFriendRequest);

router.route("/reject-request").post(authenticate, rejectFriendRequest);

router.route("/remove-friend").post(authenticate, removeFriend);

router.route("/block-user").post(authenticate, blockUser);

router.route("/unblock-user").post(authenticate, unblockUser);

router.route("/blocked-users").get(authenticate, getBlockedUsers);

router.route("/friends").get(authenticate, getFriends);

router.route("/pending-requests").get(authenticate, getPendingRequests);

router.route("/profile").get(authenticate, getProfile);

router.route("/profile").patch(authenticate, uploadAvatar.single('avatar'), updateProfile);

router.route("/search").get(authenticate, searchUsers);

router.route("/group-chat").post(authenticate, createGroupChat);

router.route("/all-rooms").get(authenticate, getUsersAllRooms);


export { router as userRouter };
