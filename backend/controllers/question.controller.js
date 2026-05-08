const QuestionModel = require('../models/question.model');
const Mapper = require('../utils/mapper');

class QuestionController {
    static async getByDocumentId(req, res) {
        try {
            const questions = await QuestionModel.getByDocumentId(req.params.documentId);
            res.json({ success: true, questions: questions.map(Mapper.mapQuestion), count: questions.length });
        } catch (error) {
            console.error('Get questions error:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
    
    static async getByRequestId(req, res) {
        try {
            const questions = await QuestionModel.getByRequestId(req.params.requestId);
            
            // Group by document
            const groupedQuestions = questions.reduce((acc, q) => {
                if (!acc[q.doc_id]) {
                    acc[q.doc_id] = {
                        id: q.doc_id,
                        description: q.doc_des,
                        documentNumber: q.doc_num,
                        pdfUrl: q.pdf_url,
                        questions: []
                    };
                }
                acc[q.doc_id].questions.push(Mapper.mapQuestion(q));
                return acc;
            }, {});
            
            res.json({ success: true, documents: Object.values(groupedQuestions), total_questions: questions.length });
        } catch (error) {
            console.error('Get questions by request error:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
    
    static async create(req, res) {
        try {
            const { documentId, content, type, expectedAnswer, orderIndex } = req.body;
            // fallback for old FE
            const doc_id = documentId || req.body.doc_id;
            const que_des = content || req.body.que_des;
            const que_type = type || req.body.que_type;
            const ques_ans = expectedAnswer || req.body.ques_ans;
            const que_order = orderIndex || req.body.que_order;

            const question = await QuestionModel.create({ doc_id, que_des, que_type, ques_ans, que_order });
            res.status(201).json({ success: true, message: 'Question created successfully', question: Mapper.mapQuestion(question) });
        } catch (error) {
            console.error('Create question error:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
    
    static async createMultiple(req, res) {
        try {
            const { documentId, questions } = req.body;
            const doc_id = documentId || req.body.doc_id;
            
            if (!doc_id || !questions || !Array.isArray(questions)) {
                return res.status(400).json({ success: false, error: 'Document ID and questions array are required' });
            }
            
            const createdQuestions = [];
            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                const content = q.content || q.que_des;
                const type = q.type || q.que_type || 'BOOLEAN';
                const answer = q.expectedAnswer || q.ques_ans;
                
                const question = await QuestionModel.create({
                    doc_id,
                    que_des: content,
                    que_type: type,
                    ques_ans: answer,
                    que_order: i + 1
                });
                createdQuestions.push(question);
            }
            
            res.status(201).json({ success: true, message: `${createdQuestions.length} questions created successfully`, questions: createdQuestions.map(Mapper.mapQuestion) });
        } catch (error) {
            console.error('Create multiple questions error:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
    
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { content, type, expectedAnswer, orderIndex } = req.body;
            const que_des = content || req.body.que_des;
            const que_type = type || req.body.que_type;
            const ques_ans = expectedAnswer || req.body.ques_ans;
            const que_order = orderIndex || req.body.que_order;

            const question = await QuestionModel.update(id, { que_des, que_type, ques_ans, que_order });
            if (!question) return res.status(404).json({ success: false, error: 'Question not found' });
            
            res.json({ success: true, message: 'Question updated successfully', question: Mapper.mapQuestion(question) });
        } catch (error) {
            console.error('Update question error:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
    
    static async delete(req, res) {
        try {
            await QuestionModel.delete(req.params.id);
            res.json({ success: true, message: 'Question deleted successfully' });
        } catch (error) {
            console.error('Delete question error:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
}

module.exports = QuestionController;
