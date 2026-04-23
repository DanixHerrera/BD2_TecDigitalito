const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  addContentToSection,
  getContentBySection,
} = require('../controllers/sectionContentController');

const router = express.Router();

router.post('/sections/:id/content', authMiddleware, addContentToSection);
router.get('/sections/:id/content', getContentBySection);

module.exports = router;