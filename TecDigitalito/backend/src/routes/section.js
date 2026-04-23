const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  createSection,
  getSectionsByCourse,
} = require('../controllers/sectionController');

const router = express.Router();

router.post('/courses/:id/sections', authMiddleware, createSection);
router.get('/courses/:id/sections', getSectionsByCourse);

module.exports = router;