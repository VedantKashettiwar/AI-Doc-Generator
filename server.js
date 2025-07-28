require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI Documentation Generator API running on port ${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/api/docs/health`);
  console.log(`📤 Upload endpoint: http://localhost:${PORT}/api/docs/upload`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Check if OpenAI API key is configured
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
    console.warn('⚠️  Warning: OPENAI_API_KEY is not configured properly.');
    console.warn('   Upload API will not work without a valid OpenAI API key.');
    console.warn('   Get your API key from: https://platform.openai.com/api-keys');
  } else {
    console.log('✅ OpenAI API key is configured.');
  }

  // Check if S3 is configured
  try {
    const s3Service = require('./services/s3Service');
    if (!s3Service.isConfigured()) {
      console.warn('⚠️  Warning: AWS S3 is not configured. The application will start but uploads will fail.');
      console.warn('   To enable S3 upload, configure AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_BUCKET_NAME in your .env file.');
      console.warn('   See S3_SETUP.md for detailed setup instructions.');
    } else {
      console.log('✅ S3 configuration detected. Documents will be uploaded to S3 bucket.');
    }
  } catch (error) {
    console.warn('⚠️  Warning: S3 service could not be loaded. The application will start but uploads will fail.');
    console.warn('   Error:', error.message);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
}); 