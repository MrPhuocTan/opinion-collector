const pool = require('./db');

class DepartmentModel {
    static async getAll() {
        const query = 'SELECT * FROM department ORDER BY depart_name';
        const result = await pool.query(query);
        return result.rows;
    }

    static async getById(id) {
        const query = 'SELECT * FROM department WHERE depart_id = $1';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async create(name) {
        const query = 'INSERT INTO department (depart_name) VALUES ($1) RETURNING *';
        const result = await pool.query(query, [name]);
        return result.rows[0];
    }

    static async update(id, name) {
        const query = 'UPDATE department SET depart_name = $1, updated_at = CURRENT_TIMESTAMP WHERE depart_id = $2 RETURNING *';
        const result = await pool.query(query, [name, id]);
        return result.rows[0];
    }

    static async delete(id) {
        // First check if any users are in this department
        const checkQuery = 'SELECT COUNT(*) FROM users WHERE depart_id = $1';
        const checkResult = await pool.query(checkQuery, [id]);
        if (parseInt(checkResult.rows[0].count) > 0) {
            throw new Error('Cannot delete department with active users');
        }
        
        const query = 'DELETE FROM department WHERE depart_id = $1 RETURNING *';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }
}

module.exports = DepartmentModel;
