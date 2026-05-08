const pool = require('./db');

class DocumentModel {
    static async getByRequestId(reqId) {
        const query = `
            SELECT d.*, COUNT(q.que_id) as question_count
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
        const query = 'SELECT * FROM document WHERE doc_id = $1';
        const result = await pool.query(query, [docId]);
        return result.rows[0];
    }
    
    static async create(data) {
        const { req_id, doc_des, doc_num, pdf_url } = data;
        const query = `
            INSERT INTO document (req_id, doc_des, doc_num, pdf_url)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const result = await pool.query(query, [req_id, doc_des, doc_num, pdf_url]);
        return result.rows[0];
    }
    
    static async update(docId, data) {
        const { doc_des, doc_num } = data;
        const query = `
            UPDATE document
            SET doc_des = $1, doc_num = $2, updated_at = CURRENT_TIMESTAMP
            WHERE doc_id = $3
            RETURNING *
        `;
        const result = await pool.query(query, [doc_des, doc_num, docId]);
        return result.rows[0];
    }
    
    static async delete(docId) {
        const query = 'DELETE FROM document WHERE doc_id = $1 RETURNING req_id';
        const result = await pool.query(query, [docId]);
        return result.rows[0];
    }
}

module.exports = DocumentModel;
