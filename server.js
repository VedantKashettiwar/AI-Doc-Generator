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