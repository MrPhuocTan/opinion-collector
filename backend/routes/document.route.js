const express = require('express');
const router = express.Router();
const DocumentController = require('../controllers/document.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

router.use(authenticateToken);

router.get('/request/:requestId', DocumentController.getByRequestId);
router.get('/:id', DocumentController.getById);
router.post('/upload', requireAdmin, DocumentController.uploadPDF);
router.put('/:id', requireAdmin, DocumentController.update);
router.delete('/:id', requireAdmin, DocumentController.delete);

module.exports = router;
