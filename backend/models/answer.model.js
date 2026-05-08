const pool = require('./db');

class AnswerModel {
  /**
   * Save a single answer using UPSERT (INSERT ... ON CONFLICT DO UPDATE).
   * Replaces the old check+insert/update pattern.
   */
  static async saveAnswer(data) {
    const { userId, queId, ansUser, ansReason } = data;
    const query = `
      INSERT INTO user_answer (user_id, que_id, ans_user, ans_reason)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, que_id) DO UPDATE
        SET ans_user = EXCLUDED.ans_user,
            ans_reason = EXCLUDED.ans_reason,
            ans_date = CURRENT_TIMESTAMP
      RETURNING ans_id AS "ansId", user_id AS "userId", que_id AS "queId",
                ans_user AS "ansUser", ans_reason AS "ansReason", ans_date AS "ansDate"
    `;
    const result = await pool.query(query, [userId, queId, ansUser, ansReason]);
    return result.rows[0];
  }

  /**
   * Save multiple answers in a transaction using UPSERT.
   */
  static async saveMultipleAnswers(userId, answers) {
    const client = await pool.connect();
    const results = [];

    try {
      await client.query('BEGIN');

      for (const answer of answers) {
        const { queId, ansUser, ansReason } = answer;
        const query = `
          INSERT INTO user_answer (user_id, que_id, ans_user, ans_reason)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (user_id, que_id) DO UPDATE
            SET ans_user = EXCLUDED.ans_user,
                ans_reason = EXCLUDED.ans_reason,
                ans_date = CURRENT_TIMESTAMP
          RETURNING ans_id AS "ansId", user_id AS "userId", que_id AS "queId",
                    ans_user AS "ansUser", ans_reason AS "ansReason", ans_date AS "ansDate"
        `;
        const result = await client.query(query, [userId, queId, ansUser, ansReason]);
        results.push(result.rows[0]);
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
      SELECT ua.ans_id AS "ansId", ua.user_id AS "userId", ua.que_id AS "queId",
             ua.ans_user AS "ansUser", ua.ans_reason AS "ansReason", ua.ans_date AS "ansDate",
             q.que_des AS "queDes", q.que_type AS "queType",
             d.doc_id AS "docId", d.doc_des AS "docDes", d.doc_num AS "docNum"
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
        COUNT(DISTINCT q.que_id)::int AS total,
        COUNT(DISTINCT ua.que_id)::int AS answered
      FROM question q
      JOIN document d ON q.doc_id = d.doc_id
      LEFT JOIN user_answer ua ON q.que_id = ua.que_id AND ua.user_id = $1
      WHERE d.req_id = $2
    `;
    const result = await pool.query(query, [userId, requestId]);
    const row = result.rows[0];
    return {
      total: row.total,
      answered: row.answered,
      percentage: row.total > 0 ? Math.round((row.answered / row.total) * 100) : 0,
    };
  }

  static async getRequestStatistics(requestId) {
    const query = `
      SELECT q.que_id AS "queId", q.que_des AS "queDes", q.que_type AS "queType",
             d.doc_des AS "docDes",
             COUNT(CASE WHEN ua.ans_user = 'YES' THEN 1 END)::int AS "yesCount",
             COUNT(CASE WHEN ua.ans_user = 'NO' THEN 1 END)::int AS "noCount",
             COUNT(ua.ans_id)::int AS "totalAnswers"
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
