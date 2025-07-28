const fs = require('fs');
const path = require('path');
const aiService = require('../services/aiService');
const s3Service = require('../services/s3Service');

class DocController {
  /**
   * Upload and process markdown file
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async uploadAndProcess(req, res) {
    try {
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No markdown file uploaded'
        });
      }

      // Validate file type
      const allowedTypes = ['.md', '.markdown'];
      const fileExtension = path.extname(req.file.originalname).toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          error: 'Only .md and .markdown files are allowed'
        });
      }

      // Read the uploaded file
      const markdownContent = fs.readFileSync(req.file.path, 'utf8');
      
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      // Process with AI
      const documentation = await aiService.generateDocumentation(markdownContent);

      // Check if S3 is available
      if (!s3Service.isConfigured()) {
        return res.status(500).json({
          success: false,
          error: 'S3 service is not configured. Please configure AWS credentials in your .env file.',
          details: 'See S3_SETUP.md for setup instructions'
        });
      }

      // Upload to S3 and get download link
      const uploadResult = await s3Service.uploadDocument(documentation, req.file.originalname);

      // Return JSON with download link
      res.json({
        success: true,
        message: 'Document generated and uploaded successfully',
        data: {
          downloadUrl: uploadResult.downloadUrl,
          filename: uploadResult.filename,
          fileKey: uploadResult.fileKey,
          expiresAt: uploadResult.expiresAt,
          originalFile: req.file.originalname,
          timestamp: uploadResult.timestamp
        }
      });

    } catch (error) {
      console.error('Error processing markdown file:', error);
      
      // Clean up file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      // Log the error to console for debugging
      console.error('❌ Error processing markdown file:', error.message);
      
      // Check if it's an OpenAI configuration error
      if (error.message.includes('OPENAI_API_KEY is not configured')) {
        res.status(500).json({
          success: false,
          error: 'Server configuration error: OpenAI API key not configured',
          details: 'Please configure OPENAI_API_KEY in your .env file',
          message: 'Contact administrator to fix server configuration'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to process markdown file',
          details: error.message
        });
      }
    }
  }

  /**
   * Health check endpoint
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  healthCheck(req, res) {
    res.json({
      success: true,
      message: 'AI Documentation Generator API is running',
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = new DocController(); 