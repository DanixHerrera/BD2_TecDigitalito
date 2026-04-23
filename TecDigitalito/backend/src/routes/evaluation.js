const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  createEvaluation,
  getEvaluationsByCourse,
  submitEvaluation,
  getMyResultsByCourse,
  getEvaluationResults,
} = require('../controllers/evaluationController');

const router = express.Router();

router.post('/courses/:id/evaluations', authMiddleware, createEvaluation);
router.get('/courses/:id/evaluations', authMiddleware, getEvaluationsByCourse);
router.get('/courses/:id/my-results', authMiddleware, getMyResultsByCourse);
router.get('/evaluations/:id/results', authMiddleware, getEvaluationResults);

router.post('/evaluations/:id/submit', authMiddleware, submitEvaluation);

module.exports = router;