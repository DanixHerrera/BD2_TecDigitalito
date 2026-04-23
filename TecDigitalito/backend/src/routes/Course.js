const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  createCourse,
  getMyCreatedCourses,
  getCatalog,
  publishCourse,
} = require('../controllers/courseController');

const router = express.Router();

router.get('/catalog', getCatalog);
router.get('/my-created', authMiddleware, getMyCreatedCourses);
router.post('/', authMiddleware, createCourse);
router.patch('/:id/publish', authMiddleware, publishCourse);

module.exports = router;