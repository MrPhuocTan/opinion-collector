const pool = require('./db');

class AnswerModel {
    static async saveAnswer(data) {
        const { user_id, que_id, ans_user, ans_reason } = data;
        
        // Check if answer exists
        const checkQuery = 'SELECT ans_id FROM user_answer WHERE user_id = $1 AND que_id = $2';
        const existing = await pool.query(checkQuery, [user_id, que_id]);
        
        if (existing.rows[0]) {
            // Update
            const query = `
                UPDATE user_answer
                SET ans_user = $1, ans_reason = $2, ans_date = CURRENT_TIMESTAMP
                WHERE user_id = $3 AND que_id = $4
                RETURNING *
            `;
            const result = await pool.query(query, [ans_user, ans_reason, user_id, que_id]);
            return { answer: result.rows[0], isNew: false };
        } else {
            // Insert
            const query = `
                INSERT INTO user_answer (user_id, que_id, ans_user, ans_reason)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `;
            const result = await pool.query(query, [user_id, que_id, ans_user, ans_reason]);
            return { answer: result.rows[0], isNew: true };
        }
    }
    
    static async saveMultipleAnswers(userId, answers) {
        const client = await pool.connect();
        const results = [];
        
        try {
            await client.query('BEGIN');
            
            for (const answer of answers) {
                const { que_id, ans_user, ans_reason } = answer;
                
                const checkQuery = 'SELECT ans_id FROM user_answer WHERE user_id = $1 AND que_id = $2';
                const existing = await client.query(checkQuery, [userId, que_id]);
                
                if (existing.rows[0]) {
                    const updateQuery = `
                        UPDATE user_answer
                        SET ans_user = $1, ans_reason = $2, ans_date = CURRENT_TIMESTAMP
                        WHERE user_id = $3 AND que_id = $4
                        RETURNING *
                    `;
                    const result = await client.query(updateQuery, [ans_user, ans_reason, userId, que_id]);
                    results.push(result.rows[0]);
                } else {
                    const insertQuery = `
                        INSERT INTO user_answer (user_id, que_id, ans_user, ans_reason)
                        VALUES ($1, $2, $3, $4)
                        RETURNING *
                    `;
                    const result = await client.query(insertQuery, [userId, que_id, ans_user, ans_reason]);
                    results.push(result.rows[0]);
                }
            }
            
            await client.query('COMMIT');
            return results;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
    
    static async getUserAnswers(userId, requestId) {
        const query = `
            SELECT ua.*, q.que_des, q.que_type, d.doc_id, d.doc_des, d.doc_num
            FROM user_answer ua
            JOIN question q ON ua.que_id = q.que_id
            JOIN document d ON q.doc_id = d.doc_id
            WHERE ua.user_id = $1 AND d.req_id = $2
            ORDER BY d.doc_id, q.que_order
        `;
        const result = await pool.query(query, [userId, requestId]);
        return result.rows;
    }
    
    static async getUserProgress(userId, requestId) {
        const query = `
            SELECT 
                COUNT(DISTINCT q.que_id) as total_questions,
                COUNT(DISTINCT ua.que_id) as answered_questions
            FROM question q
            JOIN document d ON q.doc_id = d.doc_id
            LEFT JOIN user_answer ua ON q.que_id = ua.que_id AND ua.user_id = $1
            WHERE d.req_id = $2
        `;
        const result = await pool.query(query, [userId, requestId]);
        const progress = result.rows[0];
        return {
            total: parseInt(progress.total_questions),
            answered: parseInt(progress.answered_questions),
            percentage: progress.total_questions > 0 
                ? Math.round((progress.answered_questions / progress.total_questions) * 100)
                : 0
        };
    }
    
    static async getRequestStatistics(requestId) {
        const query = `
            SELECT 
                q.que_id, q.que_des, q.que_type, d.doc_des,
                COUNT(CASE WHEN ua.ans_user = 'YES' THEN 1 END) as yes_count,
                COUNT(CASE WHEN ua.ans_user = 'NO' THEN 1 END) as no_count,
                COUNT(ua.ans_id) as total_answers
            FROM question q
            JOIN document d ON q.doc_id = d.doc_id
            LEFT JOIN user_answer ua ON q.que_id = ua.que_id
            WHERE d.req_id = $1 AND q.que_type = 'BOOLEAN'
            GROUP BY q.que_id, q.que_des, q.que_type, d.doc_des
            ORDER BY q.que_id
        `;
        const result = await pool.query(query, [requestId]);
        return result.rows;
    }
}

module.exports = AnswerModel;
