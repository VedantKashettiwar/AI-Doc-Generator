const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const aiService = require('../services/aiService');

function renderStructuredTextToPDF(doc, text) {
  const lines = text.split(/\r?\n/);
  let inList = false;
  let inCodeBlock = false;
  let codeBlockBuffer = [];
  lines.forEach((line, idx) => {
    // Detect start/end of code block (``` or ```lang)
    if (/^```/.test(line.trim())) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockBuffer = [];
        doc.moveDown(0.5); // Extra space before code block
      } else {
        // End of code block, render it
        inCodeBlock = false;
        if (codeBlockBuffer.length > 0) {
          doc.font('Courier').fontSize(11).fillColor('#222').text(codeBlockBuffer.join('\n'), {
            indent: 30,
            width: 440,
            align: 'left',
            lineGap: 1.5
          });
          doc.moveDown(0.5); // Extra space after code block
        }
        codeBlockBuffer = [];
      }
      return;
    }
    if (inCodeBlock) {
      codeBlockBuffer.push(line);
      return;
    }
    if (/^# (.*)/.test(line)) {
      if (inList) { doc.moveDown(0.5); inList = false; }
      doc.moveDown(1).font('Times-Bold').fontSize(22).fillColor('black').text(line.replace(/^# /, ''), {align: 'left'});
      doc.moveDown(0.5);
    } else if (/^## (.*)/.test(line)) {
      if (inList) { doc.moveDown(0.5); inList = false; }
      doc.moveDown(0.5).font('Times-Bold').fontSize(16).fillColor('black').text(line.replace(/^## /, ''), {align: 'left'});
      doc.moveDown(0.2);
    } else if (/^### (.*)/.test(line)) {
      if (inList) { doc.moveDown(0.5); inList = false; }
      doc.moveDown(0.2).font('Times-Bold').fontSize(13).fillColor('black').text(line.replace(/^### /, ''), {align: 'left'});
    } else if (/^- (.*)/.test(line)) {
      if (!inList) { doc.moveDown(0.1); inList = true; }
      doc.font('Times-Roman').fontSize(12).fillColor('black').text('• ' + line.replace(/^- /, ''), {indent: 20});
    } else if (/^\s*$/.test(line)) {
      if (inList) { doc.moveDown(0.5); inList = false; }
      doc.moveDown(0.3);
    } else {
      if (inList) { doc.moveDown(0.5); inList = false; }
      doc.font('Times-Roman').fontSize(12).fillColor('black').text(line, {width: 480, align: 'left'});
    }
  });
  // If file ends while still in code block
  if (inCodeBlock && codeBlockBuffer.length > 0) {
    doc.font('Courier').fontSize(11).fillColor('#222').text(codeBlockBuffer.join('\n'), {
      indent: 30,
      width: 440,
      align: 'left',
      lineGap: 1.5
    });
    doc.moveDown(0.5);
  }
}

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

      // Save documentation as PDF locally
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const outputDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
      }
      const outputFilename = `${timestamp}_${req.file.originalname.replace(/\.md|\.markdown/, '_documentation.pdf')}`;
      const outputPath = path.join(outputDir, outputFilename);

      // Create PDF
      const doc = new PDFDocument({margin: 40});
      const writeStream = fs.createWriteStream(outputPath);
      doc.pipe(writeStream);
      renderStructuredTextToPDF(doc, documentation);
      doc.end();

      // Wait for PDF to finish writing
      writeStream.on('finish', () => {
        res.json({
          success: true,
          message: 'Document generated and saved as PDF locally',
          data: {
            localPath: `uploads/${outputFilename}`,
            filename: outputFilename,
            originalFile: req.file.originalname,
            timestamp: timestamp
          }
        });
      });
      writeStream.on('error', (err) => {
        throw err;
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