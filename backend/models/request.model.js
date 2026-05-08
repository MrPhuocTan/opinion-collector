const pool = require('./db');

class RequestModel {
  static async getAll() {
    const query = `
      SELECT r.req_id      AS "reqId",
             r.req_name    AS "reqName",
             r.req_des     AS "reqDes",
             r.req_cre     AS "createdBy",
             u.user_name   AS "creatorName",
             r.req_date    AS "reqDate",
             r.req_volume  AS "reqVolume",
             r.is_active   AS "isActive",
             r.created_at  AS "createdAt",
             r.updated_at  AS "updatedAt",
             rcs.total_questions   AS "totalQuestions",
             rcs.total_answers     AS "totalAnswers",
             rcs.users_responded   AS "usersResponded",
             rcs.completion_percentage AS "completionPercentage"
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
      SELECT r.req_id     AS "reqId",
             r.req_name   AS "reqName",
             r.req_des    AS "reqDes",
             r.req_cre    AS "createdBy",
             u.user_name  AS "creatorName",
             r.req_date   AS "reqDate",
             r.req_volume AS "reqVolume",
             r.is_active  AS "isActive",
             r.created_at AS "createdAt",
             r.updated_at AS "updatedAt"
      FROM request r
      LEFT JOIN users u ON r.req_cre = u.user_id
      WHERE r.req_id = $1
    `;
    const result = await pool.query(query, [reqId]);
    return result.rows[0];
  }

  static async create(data) {
    const { reqName, reqDes, createdBy } = data;
    const query = `
      INSERT INTO request (req_name, req_des, req_cre)
      VALUES ($1, $2, $3)
      RETURNING req_id AS "reqId", req_name AS "reqName", req_des AS "reqDes",
                req_cre AS "createdBy", req_date AS "reqDate", is_active AS "isActive",
                created_at AS "createdAt"
    `;
    const result = await pool.query(query, [reqName, reqDes, createdBy]);
    return result.rows[0];
  }

  static async update(reqId, data) {
    const { reqName, reqDes } = data;
    const query = `
      UPDATE request
      SET req_name = $1, req_des = $2, updated_at = CURRENT_TIMESTAMP
      WHERE req_id = $3
      RETURNING req_id AS "reqId", req_name AS "reqName", req_des AS "reqDes",
                req_cre AS "createdBy", req_date AS "reqDate", is_active AS "isActive",
                created_at AS "createdAt", updated_at AS "updatedAt"
    `;
    const result = await pool.query(query, [reqName, reqDes, reqId]);
    return result.rows[0];
  }

  static async delete(reqId) {
    const query = `
      UPDATE request SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE req_id = $1
      RETURNING req_id AS "reqId"
    `;
    const result = await pool.query(query, [reqId]);
    return result.rows[0];
  }
}

module.exports = RequestModel;
