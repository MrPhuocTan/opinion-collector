const pool = require('../models/db');
const { hashPassword } = require('../utils/auth.utils');
const Mapper = require('../utils/mapper');

class UserController {
    static async getAll(req, res) {
        try {
            const query = `
                SELECT u.*, d.depart_name,
                       (SELECT COUNT(*) FROM user_answer ua WHERE ua.user_id = u.user_id) as total_answers
                FROM users u
                LEFT JOIN department d ON u.depart_id = d.depart_id
                ORDER BY u.user_id DESC
            `;
            const result = await pool.query(query);
            res.json({
                success: true,
                users: result.rows.map(Mapper.mapUser),
                count: result.rows.length
            });
        } catch (error) {
            console.error('Get users error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    
    static async getById(req, res) {
        try {
            const query = `
                SELECT u.*, d.depart_name
                FROM users u
                LEFT JOIN department d ON u.depart_id = d.depart_id
                WHERE u.user_id = $1
            `;
            const result = await pool.query(query, [req.params.id]);
            if (!result.rows[0]) return res.status(404).json({ error: 'User not found' });
            
            res.json({ success: true, user: Mapper.mapUser(result.rows[0]) });
        } catch (error) {
            console.error('Get user error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    
    static async create(req, res) {
        try {
            const { username, password, fullName, phone, citizenId, departmentId, role } = req.body;
            
            const checkQuery = 'SELECT user_id FROM users WHERE user_name = $1';
            const existing = await pool.query(checkQuery, [username]);
            if (existing.rows[0]) return res.status(400).json({ error: 'Username already exists' });
            
            const hashedPassword = await hashPassword(password);
            const query = `
                INSERT INTO users (user_name, user_pass, user_info, user_phone, user_cccd, depart_id, user_role)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `;
            const values = [username, hashedPassword, fullName, phone, citizenId, departmentId, role || 'USER'];
            const result = await pool.query(query, values);
            
            res.status(201).json({ success: true, message: 'User created successfully', user: Mapper.mapUser(result.rows[0]) });
        } catch (error) {
            console.error('Create user error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    
    static async update(req, res) {
        try {
            const { fullName, phone, citizenId, departmentId, role } = req.body;
            const query = `
                UPDATE users 
                SET user_info = $1, user_phone = $2, user_cccd = $3, 
                    depart_id = $4, user_role = $5, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = $6
                RETURNING *
            `;
            const values = [fullName, phone, citizenId, departmentId, role, req.params.id];
            const result = await pool.query(query, values);
            
            if (!result.rows[0]) return res.status(404).json({ error: 'User not found' });
            res.json({ success: true, message: 'User updated successfully', user: Mapper.mapUser(result.rows[0]) });
        } catch (error) {
            console.error('Update user error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    
    static async delete(req, res) {
        try {
            const query = `
                UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = $1 RETURNING user_id
            `;
            const result = await pool.query(query, [req.params.id]);
            
            if (!result.rows[0]) return res.status(404).json({ error: 'User not found' });
            res.json({ success: true, message: 'User deactivated successfully' });
        } catch (error) {
            console.error('Delete user error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = UserController;
