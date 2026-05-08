const pool = require('./db');

class QuestionModel {
  static async getByDocumentId(docId) {
    const query = `
      SELECT que_id AS "queId", doc_id AS "docId", que_des AS "queDes",
             que_type AS "queType", ques_ans AS "quesAns", que_order AS "queOrder",
             created_at AS "createdAt", updated_at AS "updatedAt"
      FROM question WHERE doc_id = $1
      ORDER BY que_order, que_id
    `;
    const result = await pool.query(query, [docId]);
    return result.rows;
  }

  static async getByRequestId(reqId) {
    const query = `
      SELECT q.que_id AS "queId", q.doc_id AS "docId", q.que_des AS "queDes",
             q.que_type AS "queType", q.ques_ans AS "quesAns", q.que_order AS "queOrder",
             d.doc_des AS "docDes", d.doc_num AS "docNum", d.pdf_url AS "pdfUrl"
      FROM question q
      JOIN document d ON q.doc_id = d.doc_id
      WHERE d.req_id = $1
      ORDER BY d.doc_id, q.que_order, q.que_id
    `;
    const result = await pool.query(query, [reqId]);
    return result.rows;
  }

  static async getById(queId) {
    const query = `
      SELECT que_id AS "queId", doc_id AS "docId", que_des AS "queDes",
             que_type AS "queType", ques_ans AS "quesAns", que_order AS "queOrder"
      FROM question WHERE que_id = $1
    `;
    const result = await pool.query(query, [queId]);
    return result.rows[0];
  }

  static async create(data) {
    const { docId, queDes, queType, quesAns, queOrder } = data;
    const query = `
      INSERT INTO question (doc_id, que_des, que_type, ques_ans, que_order)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING que_id AS "queId", doc_id AS "docId", que_des AS "queDes",
                que_type AS "queType", ques_ans AS "quesAns", que_order AS "queOrder",
                created_at AS "createdAt"
    `;
    const result = await pool.query(query, [
      docId, queDes, queType || 'BOOLEAN', quesAns || null, queOrder || 0,
    ]);
    return result.rows[0];
  }

  static async update(queId, data) {
    const { docId, queDes, queType, quesAns, queOrder } = data;
    const query = `
      UPDATE question
      SET doc_id = COALESCE($1, doc_id), que_des = $2, que_type = $3,
          ques_ans = $4, que_order = $5, updated_at = CURRENT_TIMESTAMP
      WHERE que_id = $6
      RETURNING que_id AS "queId", doc_id AS "docId", que_des AS "queDes",
                que_type AS "queType", ques_ans AS "quesAns", que_order AS "queOrder",
                created_at AS "createdAt", updated_at AS "updatedAt"
    `;
    const result = await pool.query(query, [docId, queDes, queType, quesAns, queOrder || 0, queId]);
    return result.rows[0];
  }

  static async delete(queId) {
    const query = 'DELETE FROM question WHERE que_id = $1 RETURNING que_id AS "queId"';
    const result = await pool.query(query, [queId]);
    return result.rows[0];
  }
}

module.exports = QuestionModel;
