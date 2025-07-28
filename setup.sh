#!/bin/bash

echo "🚀 Setting up AI Documentation Generator..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit .env file and add your OpenAI API key:"
    echo "   OPENAI_API_KEY=your-openai-api-key-here"
    echo ""
    echo "💡 You can get your API key from: https://platform.openai.com/api-keys"
else
    echo "✅ .env file already exists"
fi

# Create uploads directory if it doesn't exist
if [ ! -d uploads ]; then
    echo "📁 Creating uploads directory..."
    mkdir -p uploads
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file and add your OpenAI API key"
echo "2. Start the server: npm run dev"
echo "3. Test the API: curl http://localhost:3000/api/docs/health"
echo ""
echo "📚 For more information, see README.md" 