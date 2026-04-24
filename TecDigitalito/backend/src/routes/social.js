const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  sendFriendRequest,
  acceptFriendRequest,
  listMyFriends,
  getFriendCourses,
  getPendingRequests,
  rejectFriendRequest,
  removeFriend,
  searchUsers,
  getStudentsByCourse,
} = require('../controllers/socialController');

const router = express.Router();

router.post('/request/:userId', authMiddleware, sendFriendRequest);
router.post('/accept/:userId', authMiddleware, acceptFriendRequest);
router.post('/reject/:userId', authMiddleware, rejectFriendRequest);
router.get('/friends', authMiddleware, listMyFriends);
router.delete('/friends/:id', authMiddleware, removeFriend);
router.get('/friends/:id/courses', authMiddleware, getFriendCourses);
router.get('/requests', authMiddleware, getPendingRequests);
router.get('/search', authMiddleware, searchUsers);
router.get('/students/:courseId', authMiddleware, getStudentsByCourse);

module.exports = router;