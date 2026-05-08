const express = require('express');
const router = express.Router();
const RequestController = require('../controllers/request.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

router.use(authenticateToken);

router.get('/', RequestController.getAll);
router.get('/:id', RequestController.getById);
router.post('/', requireAdmin, RequestController.create);
router.put('/:id', requireAdmin, RequestController.update);
router.delete('/:id', requireAdmin, RequestController.delete);

module.exports = router;
