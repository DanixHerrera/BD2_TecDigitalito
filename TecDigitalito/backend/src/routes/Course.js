const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  createCourse,
  getMyCreatedCourses,
  getCatalog,
  publishCourse,
  updateCourse,
  enrollInCourse,
  getMyEnrolledCourses,
  getStudentsByCourse,
  getCourseContentTree,
  syncContentTree,
} = require('../controllers/courseController');

const router = express.Router();

router.get('/catalog', getCatalog);
router.get('/my-created', authMiddleware, getMyCreatedCourses);
router.get('/my-enrolled', authMiddleware, getMyEnrolledCourses);
router.get('/:id/students', authMiddleware, getStudentsByCourse);
router.get('/:id/content-tree', authMiddleware, getCourseContentTree);
router.put('/:id/content-tree', authMiddleware, syncContentTree);

router.post('/', authMiddleware, createCourse);
router.post('/:id/enroll', authMiddleware, enrollInCourse);

router.patch('/:id', authMiddleware, updateCourse);
router.patch('/:id/publish', authMiddleware, publishCourse);

module.exports = router;
