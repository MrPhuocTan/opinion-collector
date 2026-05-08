const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboard.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

router.use(authenticateToken);
router.use(requireAdmin);
router.get('/stats', DashboardController.getOverallStats);

module.exports = router;
