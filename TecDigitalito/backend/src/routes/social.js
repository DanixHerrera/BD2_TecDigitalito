const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  sendFriendRequest,
  acceptFriendRequest,
  listMyFriends,
  getFriendCourses,
} = require('../controllers/socialController');

const router = express.Router();

router.post('/request/:userId', authMiddleware, sendFriendRequest);
router.post('/accept/:userId', authMiddleware, acceptFriendRequest);
router.get('/friends', authMiddleware, listMyFriends);
router.get('/friends/:id/courses', authMiddleware, getFriendCourses);

module.exports = router;