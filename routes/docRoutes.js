const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const docController = require('../controllers/docController');

// Try to load S3 service, but don't fail if it's not available
let s3Service;
try {
  s3Service = require('../services/s3Service');
} catch (error) {
  console.warn('S3 service not available:', error.message);
  s3Service = { isConfigured: () => false };
}

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    const allowedTypes = ['.md', '.markdown'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Only .md and .markdown files are allowed'), false);
    }
  }
});

// Routes

/**
 * @route POST /api/docs/upload
 * @desc Upload and process markdown file
 * @access Public
 */
router.post('/upload', upload.single('markdown'), docController.uploadAndProcess);

/**
 * @route GET /api/docs/health
 * @desc Health check endpoint
 * @access Public
 */
router.get('/health', docController.healthCheck);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size too large. Maximum size is 5MB.'
      });
    }
  }
  
  if (error.message === 'Only .md and .markdown files are allowed') {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
  
  next(error);
});

module.exports = router; 