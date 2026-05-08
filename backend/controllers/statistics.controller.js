const pool = require('../models/db');

class StatisticsController {
  static async getDepartmentStatistics(req, res, next) {
    try {
      const { requestId } = req.params;
      const query = `
        SELECT d.depart_id, d.depart_name, q.que_id, q.que_des,
               COUNT(CASE WHEN ua.ans_user = 'YES' THEN 1 END)::int AS yes_count,
               COUNT(CASE WHEN ua.ans_user = 'NO' THEN 1 END)::int AS no_count,
               COUNT(ua.ans_id)::int AS total_answers,
               ROUND(100.0 * COUNT(CASE WHEN ua.ans_user = 'YES' THEN 1 END) / NULLIF(COUNT(ua.ans_id), 0), 2) AS yes_percentage
        FROM department d
        CROSS JOIN question q
        JOIN document doc ON q.doc_id = doc.doc_id
        LEFT JOIN users u ON d.depart_id = u.depart_id
        LEFT JOIN user_answer ua ON u.user_id = ua.user_id AND q.que_id = ua.que_id
        WHERE doc.req_id = $1 AND q.que_type = 'BOOLEAN'
        GROUP BY d.depart_id, d.depart_name, q.que_id, q.que_des
        ORDER BY d.depart_name, q.que_id
      `;
      const result = await pool.query(query, [requestId]);

      const departments = {};
      result.rows.forEach((row) => {
        if (!departments[row.depart_id]) {
          departments[row.depart_id] = {
            departmentId: row.depart_id,
            departmentName: row.depart_name,
            questions: [],
          };
        }
        departments[row.depart_id].questions.push({
          questionId: row.que_id,
          content: row.que_des,
          yesCount: row.yes_count,
          noCount: row.no_count,
          totalAnswers: row.total_answers,
          yesPercentage: parseFloat(row.yes_percentage) || 0,
        });
      });

      res.json({ success: true, statistics: Object.values(departments) });
    } catch (error) {
      next(error);
    }
  }

  static async getOverallStatistics(req, res, next) {
    try {
      const [statsResult, activityResult] = await Promise.all([
        pool.query(`
          SELECT
            (SELECT COUNT(*) FROM users WHERE user_role = 'USER')::int AS total_users,
            (SELECT COUNT(*) FROM request WHERE is_active = true)::int AS total_requests,
            (SELECT COUNT(*) FROM document)::int AS total_documents,
            (SELECT COUNT(*) FROM question)::int AS total_questions,
            (SELECT COUNT(*) FROM user_answer)::int AS total_answers,
            (SELECT COUNT(DISTINCT user_id) FROM user_answer)::int AS users_answered
        `),
        pool.query(`
          SELECT DATE(ua.ans_date) AS date,
                 COUNT(*)::int AS answer_count,
                 COUNT(DISTINCT ua.user_id)::int AS user_count
          FROM user_answer ua
          WHERE ua.ans_date > CURRENT_DATE - INTERVAL '7 days'
          GROUP BY DATE(ua.ans_date)
          ORDER BY date DESC
        `),
      ]);

      res.json({
        success: true,
        overview: statsResult.rows[0] || {},
        recentActivity: activityResult.rows.map((row) => ({
          date: row.date,
          answerCount: row.answer_count,
          userCount: row.user_count,
        })),
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = StatisticsController;
