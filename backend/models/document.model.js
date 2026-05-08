const pool = require('./db');

class DocumentModel {
  static async getByRequestId(reqId) {
    const query = `
      SELECT d.doc_id    AS "docId",
             d.req_id    AS "reqId",
             d.doc_des   AS "docDes",
             d.doc_date  AS "docDate",
             d.doc_num   AS "docNum",
             d.doc_volume AS "docVolume",
             d.pdf_url   AS "pdfUrl",
             d.created_at AS "createdAt",
             d.updated_at AS "updatedAt",
             COUNT(q.que_id)::int AS "question_count"
      FROM document d
      LEFT JOIN question q ON d.doc_id = q.doc_id
      WHERE d.req_id = $1
      GROUP BY d.doc_id
      ORDER BY d.doc_date DESC
    `;
    const result = await pool.query(query, [reqId]);
    return result.rows;
  }

  static async getById(docId) {
    const query = `
      SELECT doc_id AS "docId", req_id AS "reqId", doc_des AS "docDes",
             doc_date AS "docDate", doc_num AS "docNum", doc_volume AS "docVolume",
             pdf_url AS "pdfUrl", created_at AS "createdAt", updated_at AS "updatedAt"
      FROM document WHERE doc_id = $1
    `;
    const result = await pool.query(query, [docId]);
    return result.rows[0];
  }

  static async create(data) {
    const { reqId, docDes, docNum, pdfUrl } = data;
    const query = `
      INSERT INTO document (req_id, doc_des, doc_num, pdf_url)
      VALUES ($1, $2, $3, $4)
      RETURNING doc_id AS "docId", req_id AS "reqId", doc_des AS "docDes",
                doc_date AS "docDate", doc_num AS "docNum", pdf_url AS "pdfUrl",
                created_at AS "createdAt"
    `;
    const result = await pool.query(query, [reqId, docDes, docNum, pdfUrl]);
    return result.rows[0];
  }

  static async update(docId, data) {
    const { docDes, docNum, pdfUrl } = data;
    // If pdfUrl is provided, update it too
    let query, values;
    if (pdfUrl) {
      query = `
        UPDATE document SET doc_des = $1, doc_num = $2, pdf_url = $3, updated_at = CURRENT_TIMESTAMP
        WHERE doc_id = $4
        RETURNING doc_id AS "docId", req_id AS "reqId", doc_des AS "docDes",
                  doc_num AS "docNum", pdf_url AS "pdfUrl",
                  created_at AS "createdAt", updated_at AS "updatedAt"
      `;
      values = [docDes, docNum, pdfUrl, docId];
    } else {
      query = `
        UPDATE document SET doc_des = $1, doc_num = $2, updated_at = CURRENT_TIMESTAMP
        WHERE doc_id = $3
        RETURNING doc_id AS "docId", req_id AS "reqId", doc_des AS "docDes",
                  doc_num AS "docNum", pdf_url AS "pdfUrl",
                  created_at AS "createdAt", updated_at AS "updatedAt"
      `;
      values = [docDes, docNum, docId];
    }
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(docId) {
    // Get pdf_url before deleting for file cleanup
    const query = 'DELETE FROM document WHERE doc_id = $1 RETURNING pdf_url AS "pdfUrl", req_id AS "reqId"';
    const result = await pool.query(query, [docId]);
    return result.rows[0];
  }
}

module.exports = DocumentModel;
