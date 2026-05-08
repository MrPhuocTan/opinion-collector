const express = require('express');
const router = express.Router();
const GroupController = require('../controllers/group.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

router.use(authenticateToken);

router.get('/', GroupController.getAll);
router.get('/:id', GroupController.getById);
router.post('/', requireAdmin, GroupController.create);
router.put('/:id', requireAdmin, GroupController.update);
router.delete('/:id', requireAdmin, GroupController.delete);

module.exports = router;
