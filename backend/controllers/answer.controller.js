const AnswerModel = require('../models/answer.model');
const AppError = require('../utils/AppError');

class AnswerController {
  static async submitAnswer(req, res, next) {
    try {
      const userId = req.user.userId;
      const { queId, ansUser, ansReason } = req.body;
      if (!queId) throw AppError.badRequest('queId is required');

      const answer = await AnswerModel.saveAnswer({ userId, queId, ansUser, ansReason });
      res.json({ success: true, message: 'Answer submitted successfully', answer });
    } catch (error) {
      next(error);
    }
  }

  static async submitMultipleAnswers(req, res, next) {
    try {
      const userId = req.user.userId;
      const { answers } = req.body;
      if (!answers || !Array.isArray(answers)) throw AppError.badRequest('answers array is required');

      const results = await AnswerModel.saveMultipleAnswers(userId, answers);
      res.json({ success: true, message: 'Answers submitted successfully', count: results.length, answers: results });
    } catch (error) {
      next(error);
    }
  }

  static async getUserAnswers(req, res, next) {
    try {
      const userId = req.user.userId;
      const { requestId } = req.params;

      const answers = await AnswerModel.getUserAnswers(userId, requestId);
      const progress = await AnswerModel.getUserProgress(userId, requestId);

      res.json({ success: true, answers, progress, count: answers.length });
    } catch (error) {
      next(error);
    }
  }

  static async getUserProgress(req, res, next) {
    try {
      const userId = req.user.userId;
      const { requestId } = req.params;

      const progress = await AnswerModel.getUserProgress(userId, requestId);
      res.json({ success: true, progress });
    } catch (error) {
      next(error);
    }
  }

  static async getRequestStatistics(req, res, next) {
    try {
      const { requestId } = req.params;
      const statistics = await AnswerModel.getRequestStatistics(requestId);
      res.json({ success: true, overall: statistics });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AnswerController;
