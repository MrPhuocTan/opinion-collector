const express = require('express');
const router = express.Router();
const StatisticsController = require('../controllers/statistics.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

router.use(authenticateToken);

router.get('/overview', StatisticsController.getOverallStatistics);
router.get('/department/:requestId', requireAdmin, StatisticsController.getDepartmentStatistics);

module.exports = router;
