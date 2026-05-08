const express = require('express');
const router = express.Router();
const AnswerController = require('../controllers/answer.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

router.use(authenticateToken);
router.post('/submit', AnswerController.submitAnswer);
router.post('/submit-multiple', AnswerController.submitMultipleAnswers);
router.get('/request/:requestId', AnswerController.getUserAnswers);
router.get('/progress/:requestId', AnswerController.getUserProgress);
router.get('/statistics/:requestId', requireAdmin, AnswerController.getRequestStatistics);

module.exports = router;
