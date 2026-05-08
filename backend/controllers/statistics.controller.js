const pool = require('../models/db');

class StatisticsController {
    static async getDepartmentStatistics(req, res) {
        try {
            const { requestId } = req.params;
            const query = `
                SELECT 
                    d.depart_id,
                    d.depart_name,
                    q.que_id,
                    q.que_des,
                    COUNT(CASE WHEN ua.ans_user = 'YES' THEN 1 END) as yes_count,
                    COUNT(CASE WHEN ua.ans_user = 'NO' THEN 1 END) as no_count,
                    COUNT(ua.ans_id) as total_answers,
                    ROUND(100.0 * COUNT(CASE WHEN ua.ans_user = 'YES' THEN 1 END) / NULLIF(COUNT(ua.ans_id), 0), 2) as yes_percentage
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
            result.rows.forEach(row => {
                if (!departments[row.depart_id]) {
                    departments[row.depart_id] = {
                        departmentId: row.depart_id,
                        departmentName: row.depart_name,
                        questions: []
                    };
                }
                departments[row.depart_id].questions.push({
                    questionId: row.que_id,
                    content: row.que_des,
                    yesCount: parseInt(row.yes_count),
                    noCount: parseInt(row.no_count),
                    totalAnswers: parseInt(row.total_answers),
                    yesPercentage: parseFloat(row.yes_percentage) || 0
                });
            });
            
            res.json({ success: true, statistics: Object.values(departments) });
        } catch (error) {
            console.error('Get department statistics error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    
    static async getOverallStatistics(req, res) {
        try {
            const statsQuery = `
                SELECT 
                    (SELECT COUNT(*) FROM users WHERE user_role = 'USER') as total_users,
                    (SELECT COUNT(*) FROM request WHERE is_active = true) as total_requests,
                    (SELECT COUNT(*) FROM document) as total_documents,
                    (SELECT COUNT(*) FROM question) as total_questions,
                    (SELECT COUNT(*) FROM user_answer) as total_answers,
                    (SELECT COUNT(DISTINCT user_id) FROM user_answer) as users_answered
            `;
            const recentActivityQuery = `
                SELECT 
                    DATE(ua.ans_date) as date,
                    COUNT(*) as answer_count,
                    COUNT(DISTINCT ua.user_id) as user_count
                FROM user_answer ua
                WHERE ua.ans_date > CURRENT_DATE - INTERVAL '7 days'
                GROUP BY DATE(ua.ans_date)
                ORDER BY date DESC
            `;
            
            const [statsResult, activityResult] = await Promise.all([
                pool.query(statsQuery),
                pool.query(recentActivityQuery)
            ]);
            
            res.json({
                success: true,
                overview: statsResult.rows[0] ? {
                    totalUsers: parseInt(statsResult.rows[0].total_users) || 0,
                    totalRequests: parseInt(statsResult.rows[0].total_requests) || 0,
                    totalDocuments: parseInt(statsResult.rows[0].total_documents) || 0,
                    totalQuestions: parseInt(statsResult.rows[0].total_questions) || 0,
                    totalAnswers: parseInt(statsResult.rows[0].total_answers) || 0,
                    usersAnswered: parseInt(statsResult.rows[0].users_answered) || 0
                } : {},
                recentActivity: activityResult.rows.map(row => ({
                    date: row.date,
                    answerCount: parseInt(row.answer_count) || 0,
                    userCount: parseInt(row.user_count) || 0
                }))
            });
        } catch (error) {
            console.error('Get overall statistics error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = StatisticsController;
