const pool = require('./db');

class UserModel {
    static async findByUsername(username) {
        const query = `
            SELECT u.*, d.depart_name 
            FROM users u 
            LEFT JOIN department d ON u.depart_id = d.depart_id 
            WHERE u.user_name = $1
        `;
        const result = await pool.query(query, [username]);
        return result.rows[0];
    }
    
    static async findById(userId) {
        const query = `
            SELECT u.*, d.depart_name 
            FROM users u 
            LEFT JOIN department d ON u.depart_id = d.depart_id 
            WHERE u.user_id = $1
        `;
        const result = await pool.query(query, [userId]);
        return result.rows[0];
    }
    
    static async create(userData) {
        const { user_name, user_pass, user_info, user_phone, depart_id, user_role } = userData;
        const query = `
            INSERT INTO users (user_name, user_pass, user_info, user_phone, depart_id, user_role)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING user_id, user_name, user_info, user_role, user_phone
        `;
        const values = [user_name, user_pass, user_info, user_phone, depart_id || null, user_role || 'USER'];
        const result = await pool.query(query, values);
        return result.rows[0];
    }
}

module.exports = UserModel;
