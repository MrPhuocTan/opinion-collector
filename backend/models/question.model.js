const pool = require('./db');

class QuestionModel {
    static async getByDocumentId(docId) {
        const query = 'SELECT * FROM question WHERE doc_id = $1 ORDER BY que_order, que_id';
        const result = await pool.query(query, [docId]);
        return result.rows;
    }
    
    static async getByRequestId(reqId) {
        const query = `
            SELECT q.*, d.doc_des, d.doc_num, d.pdf_url, d.doc_id
            FROM question q
            JOIN document d ON q.doc_id = d.doc_id
            WHERE d.req_id = $1
            ORDER BY d.doc_id, q.que_order, q.que_id
        `;
        const result = await pool.query(query, [reqId]);
        return result.rows;
    }
    
    static async getById(queId) {
        const query = 'SELECT * FROM question WHERE que_id = $1';
        const result = await pool.query(query, [queId]);
        return result.rows[0];
    }
    
    static async create(data) {
        const { doc_id, que_des, que_type, ques_ans, que_order } = data;
        const query = `
            INSERT INTO question (doc_id, que_des, que_type, ques_ans, que_order)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const result = await pool.query(query, [
            doc_id, 
            que_des, 
            que_type || 'BOOLEAN', 
            ques_ans, 
            que_order || 0
        ]);
        return result.rows[0];
    }
    
    static async update(queId, data) {
        const { que_des, que_type, ques_ans, que_order } = data;
        const query = `
            UPDATE question
            SET que_des = $1, que_type = $2, ques_ans = $3, que_order = $4,
                updated_at = CURRENT_TIMESTAMP
            WHERE que_id = $5
            RETURNING *
        `;
        const result = await pool.query(query, [
            que_des, 
            que_type, 
            ques_ans, 
            que_order, 
            queId
        ]);
        return result.rows[0];
    }
    
    static async delete(queId) {
        const query = 'DELETE FROM question WHERE que_id = $1 RETURNING doc_id';
        const result = await pool.query(query, [queId]);
        return result.rows[0];
    }
}

module.exports = QuestionModel;
