const express = require('express');
const router = express.Router();
const QuestionController = require('../controllers/question.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

router.use(authenticateToken);

router.get('/request/:requestId', QuestionController.getByRequestId);
router.get('/document/:documentId', QuestionController.getByDocumentId);
router.post('/', requireAdmin, QuestionController.create);
router.post('/multiple', requireAdmin, QuestionController.createMultiple);
router.put('/:id', requireAdmin, QuestionController.update);
router.delete('/:id', requireAdmin, QuestionController.delete);

module.exports = router;
