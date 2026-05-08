const DocumentModel = require('../models/document.model');
const AppError = require('../utils/AppError');
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
    cb(null, `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
}).single('pdf');

class DocumentController {
  static uploadPDF(req, res, next) {
    upload(req, res, async (err) => {
      try {
        if (err) throw AppError.badRequest(err.message);
        if (!req.file) throw AppError.badRequest('No file uploaded');

        const { reqId, docDes, docNum } = req.body;
        if (!reqId) {
          await fs.unlink(req.file.path);
          throw AppError.badRequest('Request ID is required');
        }

        const document = await DocumentModel.create({
          reqId: parseInt(reqId),
          docDes,
          docNum,
          pdfUrl: `/uploads/${req.file.filename}`,
        });

        res.status(201).json({ success: true, message: 'Document uploaded successfully', document });
      } catch (error) {
        if (req.file) await fs.unlink(req.file.path).catch(() => {});
        next(error);
      }
    });
  }

  static async getByRequestId(req, res, next) {
    try {
      const documents = await DocumentModel.getByRequestId(req.params.requestId);
      res.json({ success: true, documents, count: documents.length });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const document = await DocumentModel.getById(req.params.id);
      if (!document) throw AppError.notFound('Document not found');
      res.json({ success: true, document });
    } catch (error) {
      next(error);
    }
  }

  static updatePDF(req, res, next) {
    upload(req, res, async (err) => {
      try {
        if (err) throw AppError.badRequest(err.message);

        const { id } = req.params;
        const { docDes, docNum } = req.body;
        const updateData = { docDes, docNum };

        if (req.file) {
          updateData.pdfUrl = `/uploads/${req.file.filename}`;
        }

        const document = await DocumentModel.update(id, updateData);
        if (!document) throw AppError.notFound('Document not found');

        res.json({ success: true, message: 'Document updated successfully', document });
      } catch (error) {
        next(error);
      }
    });
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await DocumentModel.delete(id);
      if (!deleted) throw AppError.notFound('Document not found');

      // Cleanup file
      if (deleted.pdfUrl) {
        const filePath = path.join(__dirname, '..', deleted.pdfUrl);
        await fs.unlink(filePath).catch(() => {});
      }

      res.json({ success: true, message: 'Document deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DocumentController;
