const pool = require('./db');

class UserModel {
  /**
   * Base SELECT clause used by all user queries.
   * Returns camelCase fields directly — no Mapper needed.
   */
  static get SELECT() {
    return `
      SELECT u.user_id    AS "userId",
             u.user_name  AS "username",
             u.user_pass  AS "userPass",
             u.user_info  AS "userInfo",
             u.user_cccd  AS "citizenId",
             u.depart_id  AS "departmentId",
             d.depart_name AS "departmentName",
             u.user_role  AS "role",
             u.user_phone AS "phone",
             u.user_lastotp AS "lastOtp",
             u.otp_expires_at AS "otpExpiresAt",
             u.is_active  AS "isActive",
             u.created_at AS "createdAt",
             u.updated_at AS "updatedAt"
      FROM users u
      LEFT JOIN department d ON u.depart_id = d.depart_id
    `;
  }

  static async findByUsername(username) {
    const query = `${this.SELECT} WHERE u.user_name = $1`;
    const result = await pool.query(query, [username]);
    return result.rows[0];
  }

  static async findById(userId) {
    const query = `${this.SELECT} WHERE u.user_id = $1`;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  static async getAll() {
    const query = `
      ${this.SELECT},
      (SELECT COUNT(*) FROM user_answer ua WHERE ua.user_id = u.user_id)::int AS "totalAnswers"
      ORDER BY u.user_id DESC
    `;
    // Fix: the comma after SELECT clause needs to be inside the sub-select
    // Re-structure:
    const q = `
      SELECT u.user_id    AS "userId",
             u.user_name  AS "username",
             u.user_info  AS "userInfo",
             u.user_cccd  AS "citizenId",
             u.depart_id  AS "departmentId",
             d.depart_name AS "departmentName",
             u.user_role  AS "role",
             u.user_phone AS "phone",
             u.is_active  AS "isActive",
             u.created_at AS "createdAt",
             u.updated_at AS "updatedAt",
             (SELECT COUNT(*) FROM user_answer ua WHERE ua.user_id = u.user_id)::int AS "totalAnswers"
      FROM users u
      LEFT JOIN department d ON u.depart_id = d.depart_id
      ORDER BY u.user_id DESC
    `;
    const result = await pool.query(q);
    return result.rows;
  }

  static async create(data) {
    const { username, password, userInfo, phone, citizenId, departmentId, role } = data;
    const query = `
      INSERT INTO users (user_name, user_pass, user_info, user_phone, user_cccd, depart_id, user_role)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING user_id AS "userId", user_name AS "username", user_info AS "userInfo",
                user_role AS "role", user_phone AS "phone", depart_id AS "departmentId",
                is_active AS "isActive", created_at AS "createdAt"
    `;
    const values = [username, password, userInfo, phone, citizenId || null, departmentId || null, role || 'USER'];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async update(userId, data) {
    const { userInfo, phone, citizenId, departmentId, role } = data;
    const query = `
      UPDATE users
      SET user_info = $1, user_phone = $2, user_cccd = $3,
          depart_id = $4, user_role = $5, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $6
      RETURNING user_id AS "userId", user_name AS "username", user_info AS "userInfo",
                user_role AS "role", user_phone AS "phone", depart_id AS "departmentId",
                user_cccd AS "citizenId", is_active AS "isActive",
                created_at AS "createdAt", updated_at AS "updatedAt"
    `;
    const values = [userInfo, phone, citizenId, departmentId, role, userId];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async deactivate(userId) {
    const query = `
      UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
      RETURNING user_id AS "userId"
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }
}

module.exports = UserModel;
