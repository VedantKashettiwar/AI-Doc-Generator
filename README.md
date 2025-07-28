# AI Documentation Generator

An MVP web application that processes markdown files using OpenAI GPT-4 to generate structured technical documentation.

## 🚀 Features

- **File Upload API**: Accept `.md` files via POST request
- **AI Integration**: Uses OpenAI GPT-4 for intelligent documentation generation
- **Structured Output**: Returns clean JSON with module summary, features, inputs/outputs, dependencies, and notes
- **MVC Architecture**: Clean, maintainable code structure
- **Security**: Rate limiting, CORS, and input validation

## 📁 Project Structure

```
mvc-ai-docgen/
├── controllers/
│   └── docController.js      # Handles file upload and processing
├── models/
│   └── docModel.js           # Database model (empty for now)
├── routes/
│   └── docRoutes.js          # API route definitions
├── services/
│   └── aiService.js          # OpenAI integration
├── uploads/                  # Temporary file storage
├── .env                      # Environment variables
├── app.js                    # Express app configuration
├── server.js                 # Server entry point
└── package.json
```

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your OpenAI API key:

```bash
cp env.example .env
```

Edit `.env` and add your OpenAI API key:

```env
OPENAI_API_KEY=your-openai-api-key-here
PORT=3000
NODE_ENV=development
```

### 3. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3000`

## 📡 API Endpoints

### Health Check
```http
GET /api/docs/health
```

**Response:**
```json
{
  "success": true,
  "message": "AI Documentation Generator API is running",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Upload and Process Markdown
```http
POST /api/docs/upload
Content-Type: multipart/form-data
```

**Form Data:**
- `markdown`: File (`.md` or `.markdown`)

**Response:**
```json
{
  "success": true,
  "message": "Document generated and uploaded successfully",
  "data": {
    "downloadUrl": "https://your-bucket.s3.amazonaws.com/documents/2024-01-01T12-00-00-000Z_uuid_filename_documentation.txt?signature=...",
    "filename": "2024-01-01T12-00-00-000Z_uuid_filename_documentation.txt",
    "fileKey": "documents/2024-01-01T12-00-00-000Z_uuid_filename_documentation.txt",
    "expiresAt": "2024-01-02T12:00:00.000Z",
    "originalFile": "sample.md",
    "timestamp": "2024-01-01T12-00-00-000Z"
  }
}
```

**Note:** 
- All documents are uploaded to S3 with unique timestamps
- Download links are valid for 24 hours
- Filenames include timestamp for uniqueness

## 🧪 Testing with Postman

### 1. Health Check
- **Method**: GET
- **URL**: `http://localhost:3000/api/docs/health`

### 2. Upload Markdown File
- **Method**: POST
- **URL**: `http://localhost:3000/api/docs/upload`
- **Body**: form-data
- **Key**: `markdown`
- **Type**: File
- **Value**: Select your `.md` file

### 3. Using curl
```bash
# Upload and get S3 download link
curl -X POST http://localhost:3000/api/docs/upload \
  -F "markdown=@sample.md"

# Save response to file
curl -X POST http://localhost:3000/api/docs/upload \
  -F "markdown=@sample.md" \
  -o response.json
```

## 📝 Sample Markdown File

Create a file named `sample.md` with this content for testing:

```markdown
# User Authentication Module

This module handles user authentication and authorization in the application.

## Features

- User registration with email verification
- Secure password hashing using bcrypt
- JWT token generation and validation
- Password reset functionality
- Role-based access control

## API Endpoints

### POST /auth/register
Registers a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "userId": "12345"
}
```

### POST /auth/login
Authenticates a user and returns a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "12345",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

## Dependencies

- express
- bcryptjs
- jsonwebtoken
- nodemailer
- mongoose

## Environment Variables

- JWT_SECRET
- MONGODB_URI
- SMTP_HOST
- SMTP_PORT
- SMTP_USER
- SMTP_PASS

## Security Considerations

- Passwords are hashed using bcrypt with salt rounds of 12
- JWT tokens expire after 24 hours
- Email verification is required for account activation
- Rate limiting is implemented on all auth endpoints
```

## 🔧 Configuration Options

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | - | Your OpenAI API key (required) |
| `PORT` | 3000 | Server port |
| `NODE_ENV` | development | Environment mode |
| `RATE_LIMIT_WINDOW_MS` | 900000 | Rate limit window (15 minutes) |
| `RATE_LIMIT_MAX_REQUESTS` | 100 | Max requests per window |
| `AWS_ACCESS_KEY_ID` | - | AWS Access Key ID (required) |
| `AWS_SECRET_ACCESS_KEY` | - | AWS Secret Access Key (required) |
| `AWS_REGION` | us-east-1 | AWS Region |
| `AWS_S3_BUCKET_NAME` | - | S3 Bucket name (required) |

### File Upload Limits

- **File Size**: 5MB maximum
- **Allowed Types**: `.md`, `.markdown`
- **Storage**: Temporary (files are deleted after processing)

## 🚨 Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details (in development)"
}
```

Common error scenarios:
- Missing file upload
- Invalid file type
- File size too large
- OpenAI API errors
- Server errors

## 🔮 Future Enhancements

- Database integration for storing processed documents
- User authentication and document history
- Support for multiple file formats
- Custom documentation templates
- Web interface for file upload
- Document versioning and comparison

## 📄 License

MIT License 