const pool = require('../models/db');

class DashboardController {
  static async getOverallStats(req, res, next) {
    try {
      const stats = await pool.query('SELECT * FROM dashboard_stats');
      const activity = await pool.query(`
        SELECT * FROM recent_activity
        WHERE activity_date >= CURRENT_DATE - INTERVAL '7 days'
        ORDER BY activity_date DESC
      `);
      const deptStats = await pool.query('SELECT * FROM department_statistics ORDER BY depart_name');

      res.json({
        success: true,
        stats: stats.rows[0] ? {
          totalUsers: parseInt(stats.rows[0].total_users) || 0,
          totalRequests: parseInt(stats.rows[0].total_requests) || 0,
          totalDocuments: parseInt(stats.rows[0].total_documents) || 0,
          totalQuestions: parseInt(stats.rows[0].total_questions) || 0,
          totalAnswers: parseInt(stats.rows[0].total_answers) || 0,
          usersParticipated: parseInt(stats.rows[0].users_participated) || 0,
        } : {},
        recentActivity: activity.rows.map((row) => ({
          activityDate: row.activity_date,
          activeUsers: parseInt(row.active_users) || 0,
          answersSubmitted: parseInt(row.answers_submitted) || 0,
          documentsAnswered: parseInt(row.documents_answered) || 0,
          requestsParticipated: parseInt(row.requests_participated) || 0,
        })),
        departmentStats: deptStats.rows.map((row) => ({
          departmentId: row.depart_id,
          departmentName: row.depart_name,
          userCount: parseInt(row.user_count) || 0,
          totalAnswers: parseInt(row.total_answers) || 0,
          yesAnswers: parseInt(row.yes_answers) || 0,
          noAnswers: parseInt(row.no_answers) || 0,
        })),
      });
    } catch (error) {
      next(error);
    }
  }

  static async refreshMaterializedView(req, res, next) {
    try {
      await pool.query('SELECT refresh_department_stats()');
      res.json({ success: true, message: 'Statistics refreshed successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DashboardController;
