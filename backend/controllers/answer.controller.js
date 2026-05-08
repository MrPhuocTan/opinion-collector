const AnswerModel = require('../models/answer.model');
const Mapper = require('../utils/mapper');

class AnswerController {
    static async submitAnswer(req, res) {
        try {
            const userId = req.user.userId;
            const { questionId, userAnswer, reason } = req.body;
            const que_id = questionId || req.body.que_id;
            const ans_user = userAnswer || req.body.ans_user;
            const ans_reason = reason || req.body.ans_reason;
            
            const result = await AnswerModel.saveAnswer({
                user_id: userId,
                que_id,
                ans_user,
                ans_reason
            });
            
            res.json({
                message: result.isNew ? 'Answer submitted successfully' : 'Answer updated successfully',
                answer: Mapper.mapAnswer(result.answer)
            });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    
    static async submitMultipleAnswers(req, res) {
        try {
            const userId = req.user.userId;
            const { answers } = req.body;
            
            const mappedAnswers = answers.map(a => ({
                que_id: a.questionId || a.que_id,
                ans_user: a.userAnswer || a.ans_user,
                ans_reason: a.reason || a.ans_reason
            }));

            const results = await AnswerModel.saveMultipleAnswers(userId, mappedAnswers);
            
            res.json({
                message: 'Answers submitted successfully',
                count: results.length,
                answers: results.map(Mapper.mapAnswer)
            });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    
    static async getUserAnswers(req, res) {
        try {
            const userId = req.user.userId;
            const { requestId } = req.params;
            
            const answers = await AnswerModel.getUserAnswers(userId, requestId);
            const progress = await AnswerModel.getUserProgress(userId, requestId);
            
            res.json({ answers: answers.map(Mapper.mapAnswer), progress, count: answers.length });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    
    static async getUserProgress(req, res) {
        try {
            const userId = req.user.userId;
            const { requestId } = req.params;
            
            const progress = await AnswerModel.getUserProgress(userId, requestId);
            res.json({ progress });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    
    static async getRequestStatistics(req, res) {
        try {
            const { requestId } = req.params;
            const statistics = await AnswerModel.getRequestStatistics(requestId);
            res.json({ overall: statistics });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = AnswerController;
