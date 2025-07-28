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