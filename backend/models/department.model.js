const pool = require('./db');

class DepartmentModel {
  static async getAll() {
    const query = `
      SELECT depart_id AS "departmentId",
             depart_name AS "name",
             created_at AS "createdAt",
             updated_at AS "updatedAt"
      FROM department
      ORDER BY depart_name
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async getById(id) {
    const query = `
      SELECT depart_id AS "departmentId",
             depart_name AS "name",
             created_at AS "createdAt",
             updated_at AS "updatedAt"
      FROM department WHERE depart_id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async create(name) {
    const query = `
      INSERT INTO department (depart_name)
      VALUES ($1)
      RETURNING depart_id AS "departmentId", depart_name AS "name",
                created_at AS "createdAt", updated_at AS "updatedAt"
    `;
    const result = await pool.query(query, [name]);
    return result.rows[0];
  }

  static async update(id, name) {
    const query = `
      UPDATE department SET depart_name = $1, updated_at = CURRENT_TIMESTAMP
      WHERE depart_id = $2
      RETURNING depart_id AS "departmentId", depart_name AS "name",
                created_at AS "createdAt", updated_at AS "updatedAt"
    `;
    const result = await pool.query(query, [name, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const checkQuery = 'SELECT COUNT(*) FROM users WHERE depart_id = $1';
    const checkResult = await pool.query(checkQuery, [id]);
    if (parseInt(checkResult.rows[0].count) > 0) {
      throw new Error('Cannot delete department with active users');
    }
    const query = 'DELETE FROM department WHERE depart_id = $1 RETURNING depart_id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = DepartmentModel;
