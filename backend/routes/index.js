const express = require('express');
const router = express.Router();

const answerRoutes = require('./answer.route');
const authRoutes = require('./auth.route');
const dashboardRoutes = require('./dashboard.route');
const departmentRoutes = require('./department.route');
const documentRoutes = require('./document.route');
const questionRoutes = require('./question.route');
const requestRoutes = require('./request.route');
const statisticsRoutes = require('./statistics.route');
const userRoutes = require('./user.route');

router.use('/answers', answerRoutes);
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/departments', departmentRoutes);
router.use('/documents', documentRoutes);
router.use('/questions', questionRoutes);
router.use('/requests', requestRoutes);
router.use('/statistics', statisticsRoutes);
router.use('/users', userRoutes);

module.exports = router;
