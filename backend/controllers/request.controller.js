const RequestModel = require('../models/request.model');
const DocumentModel = require('../models/document.model');
const QuestionModel = require('../models/question.model');
const AppError = require('../utils/AppError');
const pool = require('../models/db');

class RequestController {
  static async getAll(req, res, next) {
    try {
      const requests = await RequestModel.getAll();
      res.json({ success: true, requests, count: requests.length });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const request = await RequestModel.getById(id);
      if (!request) throw AppError.notFound('Request not found');

      // Load documents with their questions
      const documents = await DocumentModel.getByRequestId(id);
      for (const doc of documents) {
        doc.questions = await QuestionModel.getByDocumentId(doc.docId);
      }

      res.json({ success: true, request, documents });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const { reqName, reqDes } = req.body;
      if (!reqName) throw AppError.badRequest('Request name is required');

      const request = await RequestModel.create({
        reqName,
        reqDes,
        createdBy: req.user.userId,
      });

      res.status(201).json({ success: true, message: 'Request created successfully', request });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { reqName, reqDes } = req.body;

      const existing = await RequestModel.getById(id);
      if (!existing) throw AppError.notFound('Request not found');

      const request = await RequestModel.update(id, { reqName, reqDes });
      res.json({ success: true, message: 'Request updated successfully', request });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await RequestModel.getById(id);
      if (!existing) throw AppError.notFound('Request not found');

      await RequestModel.delete(id);
      res.json({ success: true, message: 'Request deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async assignUsers(req, res, next) {
    try {
      const { id } = req.params;
      const { userIds } = req.body;

      const query = `
        INSERT INTO request_assignment (req_id, user_id)
        VALUES ($1, unnest($2::int[]))
        ON CONFLICT DO NOTHING
        RETURNING assignment_id AS "assignmentId", req_id AS "reqId", user_id AS "userId"
      `;
      const result = await pool.query(query, [id, userIds]);
      res.json({ success: true, message: 'Users assigned successfully', assignments: result.rows });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = RequestController;
