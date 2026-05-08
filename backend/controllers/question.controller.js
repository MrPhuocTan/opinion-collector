const QuestionModel = require('../models/question.model');
const AppError = require('../utils/AppError');

class QuestionController {
  static async getByDocumentId(req, res, next) {
    try {
      const questions = await QuestionModel.getByDocumentId(req.params.documentId);
      res.json({ success: true, questions, count: questions.length });
    } catch (error) {
      next(error);
    }
  }

  static async getByRequestId(req, res, next) {
    try {
      const questions = await QuestionModel.getByRequestId(req.params.requestId);

      // Group by document
      const grouped = {};
      questions.forEach((q) => {
        if (!grouped[q.docId]) {
          grouped[q.docId] = {
            docId: q.docId,
            docDes: q.docDes,
            docNum: q.docNum,
            pdfUrl: q.pdfUrl,
            questions: [],
          };
        }
        grouped[q.docId].questions.push({
          queId: q.queId,
          docId: q.docId,
          queDes: q.queDes,
          queType: q.queType,
          quesAns: q.quesAns,
          queOrder: q.queOrder,
        });
      });

      res.json({ success: true, documents: Object.values(grouped), total_questions: questions.length });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const { docId, queDes, queType, quesAns, queOrder } = req.body;
      if (!docId || !queDes) throw AppError.badRequest('docId and queDes are required');

      const question = await QuestionModel.create({ docId, queDes, queType, quesAns, queOrder });
      res.status(201).json({ success: true, message: 'Question created successfully', question });
    } catch (error) {
      next(error);
    }
  }

  static async createMultiple(req, res, next) {
    try {
      const { docId, questions } = req.body;
      if (!docId || !questions || !Array.isArray(questions)) {
        throw AppError.badRequest('docId and questions array are required');
      }

      const created = [];
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const question = await QuestionModel.create({
          docId,
          queDes: q.queDes,
          queType: q.queType || 'BOOLEAN',
          quesAns: q.quesAns,
          queOrder: i + 1,
        });
        created.push(question);
      }

      res.status(201).json({ success: true, message: `${created.length} questions created`, questions: created });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { docId, queDes, queType, quesAns, queOrder } = req.body;

      const question = await QuestionModel.update(id, { docId, queDes, queType, quesAns, queOrder });
      if (!question) throw AppError.notFound('Question not found');

      res.json({ success: true, message: 'Question updated successfully', question });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const result = await QuestionModel.delete(req.params.id);
      if (!result) throw AppError.notFound('Question not found');
      res.json({ success: true, message: 'Question deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = QuestionController;
