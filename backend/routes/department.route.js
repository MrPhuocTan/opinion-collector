const express = require('express');
const router = express.Router();
const DepartmentController = require('../controllers/department.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

router.use(authenticateToken);
// We might want regular users to read departments, but let's assume they all need auth.
// Admin required for create, update, delete
router.get('/', DepartmentController.getAll);
router.get('/:id', DepartmentController.getById);

router.post('/', requireAdmin, DepartmentController.create);
router.put('/:id', requireAdmin, DepartmentController.update);
router.delete('/:id', requireAdmin, DepartmentController.delete);

module.exports = router;
