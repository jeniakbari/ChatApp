import { authenticate } from '../middleware/auth-middleware.js';
import {Router} from 'express';
const router = Router();

import {sendFriendRequest,acceptFriendRequest,rejectFriendRequest,removeFriend,blockUser,unblockUser,getBlockedUsers,getFriends,getPendingRequests} from '../controllers/userController.js';

router.route('/send-request').post(authenticate,sendFriendRequest);

router.route('/accept-request').post(authenticate,acceptFriendRequest);

router.route('/reject-request').post(authenticate,rejectFriendRequest);

router.route('/remove-friend').post(authenticate,removeFriend);

router.route('/block-user').post(authenticate,blockUser)

router.route('/unblock-user').post(authenticate,unblockUser);

router.route('/blocked-users').get(authenticate,getBlockedUsers);

router.route('/friends').get(authenticate,getFriends);

router.route('/pending-requests').get(authenticate,getPendingRequests);

export {router as userRouter};