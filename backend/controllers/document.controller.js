const DocumentModel = require('../models/document.model');
const Mapper = require('../utils/mapper');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;

// Configure multer for PDF upload
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadPath = path.join(__dirname, '..', 'uploads');
        try {
            await fs.mkdir(uploadPath, { recursive: true });
            cb(null, uploadPath);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
}).single('pdf');

class DocumentController {
    static uploadPDF(req, res) {
        upload(req, res, async (err) => {
            try {
                if (err) return res.status(400).json({ success: false, error: err.message });
                if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });
                
                const { requestId, description, documentNumber } = req.body;
                // fallback to old names if FE hasn't been updated yet
                const req_id = requestId || req.body.req_id;
                const doc_des = description || req.body.doc_des;
                const doc_num = documentNumber || req.body.doc_num;
                
                if (!req_id) {
                    await fs.unlink(req.file.path);
                    return res.status(400).json({ success: false, error: 'Request ID is required' });
                }
                
                const document = await DocumentModel.create({
                    req_id: parseInt(req_id),
                    doc_des,
                    doc_num,
                    pdf_url: `/uploads/${req.file.filename}`
                });
                
                res.status(201).json({ success: true, message: 'Document uploaded successfully', document: Mapper.mapDocument(document) });
            } catch (error) {
                console.error('Upload error:', error);
                if (req.file) await fs.unlink(req.file.path).catch(console.error);
                res.status(500).json({ success: false, error: 'Internal server error' });
            }
        });
    }
    
    static async getByRequestId(req, res) {
        try {
            const documents = await DocumentModel.getByRequestId(req.params.requestId);
            res.json({ success: true, documents: documents.map(Mapper.mapDocument), count: documents.length });
        } catch (error) {
            console.error('Get documents error:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
    
    static async getById(req, res) {
        try {
            const document = await DocumentModel.getById(req.params.id);
            if (!document) return res.status(404).json({ success: false, error: 'Document not found' });
            res.json({ success: true, document: Mapper.mapDocument(document) });
        } catch (error) {
            console.error('Get document error:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
    
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { description, documentNumber } = req.body;
            // fallback
            const doc_des = description || req.body.doc_des;
            const doc_num = documentNumber || req.body.doc_num;
            
            const document = await DocumentModel.update(id, { doc_des, doc_num });
            if (!document) return res.status(404).json({ success: false, error: 'Document not found' });
            
            res.json({ success: true, message: 'Document updated successfully', document: Mapper.mapDocument(document) });
        } catch (error) {
            console.error('Update document error:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
    
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const document = await DocumentModel.getById(id);
            if (!document) return res.status(404).json({ success: false, error: 'Document not found' });
            
            if (document.pdf_url) {
                const filePath = path.join(__dirname, '..', document.pdf_url);
                await fs.unlink(filePath).catch(console.error);
            }
            
            await DocumentModel.delete(id);
            res.json({ success: true, message: 'Document deleted successfully' });
        } catch (error) {
            console.error('Delete document error:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
}

module.exports = DocumentController;
