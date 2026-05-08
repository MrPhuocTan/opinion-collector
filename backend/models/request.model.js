const pool = require('./db');

class RequestModel {
    static async getAll(userId = null, userRole = null) {
        // Use the view for better performance
        let query = `
            SELECT 
                r.*,
                u.user_name as creator_name,
                rcs.total_questions,
                rcs.total_answers,
                rcs.users_responded,
                rcs.completion_percentage
            FROM request r
            LEFT JOIN users u ON r.req_cre = u.user_id
            LEFT JOIN request_completion_status rcs ON r.req_id = rcs.req_id
            WHERE r.is_active = true
            ORDER BY r.req_date DESC
        `;
        const result = await pool.query(query);
        return result.rows;
    }
    
    static async getById(reqId) {
        const query = `
            SELECT r.*, u.user_name as creator_name
            FROM request r
            LEFT JOIN users u ON r.req_cre = u.user_id
            WHERE r.req_id = $1
        `;
        const result = await pool.query(query, [reqId]);
        return result.rows[0];
    }
    
    static async create(data) {
        const { req_name, req_des, req_cre } = data;
        const query = `
            INSERT INTO request (req_name, req_des, req_cre)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const result = await pool.query(query, [req_name, req_des, req_cre]);
        return result.rows[0];
    }
    
    static async update(reqId, data) {
        const { req_name, req_des } = data;
        const query = `
            UPDATE request
            SET req_name = $1, req_des = $2, updated_at = CURRENT_TIMESTAMP
            WHERE req_id = $3
            RETURNING *
        `;
        const result = await pool.query(query, [req_name, req_des, reqId]);
        return result.rows[0];
    }
    
    static async delete(reqId) {
        const query = `
            UPDATE request
            SET is_active = false, updated_at = CURRENT_TIMESTAMP
            WHERE req_id = $1
            RETURNING req_id
        `;
        const result = await pool.query(query, [reqId]);
        return result.rows[0];
    }
}

module.exports = RequestModel;
