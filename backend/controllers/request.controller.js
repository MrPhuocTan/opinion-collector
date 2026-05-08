const RequestModel = require('../models/request.model');
const DocumentModel = require('../models/document.model');
const QuestionModel = require('../models/question.model');
const pool = require('../models/db');
const Mapper = require('../utils/mapper');

class RequestController {
    static async getAll(req, res) {
        try {
            const userId = req.user?.userId;
            const userRole = req.user?.userRole;
            const requests = await RequestModel.getAll(userId, userRole);
            res.json({ 
                success: true,
                requests: requests.map(Mapper.mapRequest), 
                count: requests.length 
            });
        } catch (error) {
            console.error('Get requests error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const request = await RequestModel.getById(id);
            if (!request) return res.status(404).json({ error: 'Request not found' });
            
            const documents = await DocumentModel.getByRequestId(id);
            const mappedDocuments = [];
            for (let doc of documents) {
                const questions = await QuestionModel.getByDocumentId(doc.doc_id);
                const mappedDoc = Mapper.mapDocument(doc);
                mappedDoc.questions = questions.map(Mapper.mapQuestion);
                mappedDocuments.push(mappedDoc);
            }
            
            res.json({ success: true, request: Mapper.mapRequest(request), documents: mappedDocuments });
        } catch (error) {
            console.error('Get request error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    
    static async create(req, res) {
        try {
            const { title, description } = req.body;
            if (!title) return res.status(400).json({ error: 'Request title is required' });
            
            const newRequest = await RequestModel.create({
                req_name: title,
                req_des: description,
                req_cre: req.user.userId
            });
            
            res.status(201).json({ success: true, message: 'Request created successfully', request: Mapper.mapRequest(newRequest) });
        } catch (error) {
            console.error('Create request error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { title, description } = req.body;
            
            const request = await RequestModel.getById(id);
            if (!request) return res.status(404).json({ error: 'Request not found' });
            
            const updated = await RequestModel.update(id, { req_name: title, req_des: description });
            res.json({ success: true, message: 'Request updated successfully', request: Mapper.mapRequest(updated) });
        } catch (error) {
            console.error('Update request error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const request = await RequestModel.getById(id);
            if (!request) return res.status(404).json({ error: 'Request not found' });
            
            await RequestModel.delete(id);
            res.json({ success: true, message: 'Request deleted successfully' });
        } catch (error) {
            console.error('Delete request error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    
    static async assignUsers(req, res) {
        try {
            const { id } = req.params;
            const { userIds } = req.body;
            
            const query = `
                INSERT INTO request_assignment (req_id, user_id)
                VALUES ($1, unnest($2::int[]))
                ON CONFLICT DO NOTHING
                RETURNING *
            `;
            const result = await pool.query(query, [id, userIds]);
            res.json({ success: true, message: 'Users assigned successfully', assignments: result.rows });
        } catch (error) {
            console.error('Assign users error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = RequestController;
