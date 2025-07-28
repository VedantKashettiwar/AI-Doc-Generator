# AWS S3 Setup Guide

This guide will help you configure AWS S3 integration for the AI Documentation Generator.

## 🚀 Quick Setup

### 1. Create AWS Account
If you don't have an AWS account, create one at [aws.amazon.com](https://aws.amazon.com)

### 2. Create S3 Bucket
1. Go to AWS S3 Console
2. Click "Create bucket"
3. Choose a unique bucket name (e.g., `my-doc-generator-bucket`)
4. Select your preferred region
5. Keep default settings for now
6. Click "Create bucket"

### 3. Create IAM User
1. Go to AWS IAM Console
2. Click "Users" → "Create user"
3. Enter username (e.g., `doc-generator-user`)
4. Select "Programmatic access"
5. Click "Next: Permissions"

### 4. Attach S3 Policy
1. Click "Attach existing policies directly"
2. Search for "S3" and select "AmazonS3FullAccess" (for simplicity)
   - **Note:** For production, create a custom policy with minimal permissions
3. Click "Next: Tags" → "Next: Review" → "Create user"

### 5. Get Access Keys
1. Click on your created user
2. Go to "Security credentials" tab
3. Click "Create access key"
4. Select "Application running outside AWS"
5. Copy the **Access Key ID** and **Secret Access Key**

### 6. Configure Environment
1. Copy `env.example` to `.env`:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` and add your AWS credentials:
   ```env
   # AWS S3 Configuration
   AWS_ACCESS_KEY_ID=your-access-key-id
   AWS_SECRET_ACCESS_KEY=your-secret-access-key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET_NAME=your-bucket-name
   ```

## 🔒 Security Best Practices

### Custom IAM Policy (Recommended)
Instead of using `AmazonS3FullAccess`, create a custom policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name"
    }
  ]
}
```

### Bucket Configuration
1. **Enable CORS** (if needed for web access):
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": []
     }
   ]
   ```

2. **Set up lifecycle rules** (optional):
   - Delete old documents after 30 days
   - Move to cheaper storage after 7 days

## 🧪 Testing S3 Integration

### 1. Test with curl
```bash
# Upload and get S3 link
curl -X POST http://localhost:3000/api/docs/upload \
  -F "markdown=@sample.md"
```

### Expected Response:
```json
{
  "success": true,
  "message": "Document generated and uploaded successfully",
  "data": {
    "downloadUrl": "https://your-bucket.s3.amazonaws.com/documents/uuid_filename_documentation.txt?signature=...",
    "filename": "uuid_filename_documentation.txt",
    "fileKey": "documents/uuid_filename_documentation.txt",
    "expiresAt": "2024-01-02T12:00:00.000Z",
    "originalFile": "sample.md"
  }
}
```

### 2. Download the document
```bash
# Download using the provided URL
curl -o downloaded_doc.txt "YOUR_DOWNLOAD_URL_HERE"
```

## 📁 File Structure in S3

Documents are stored with the following structure:
```
your-bucket/
└── documents/
    ├── uuid1_sample_documentation.txt
    ├── uuid2_module_documentation.txt
    └── uuid3_api_documentation.txt
```

## ⚙️ Configuration Options

### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `AWS_ACCESS_KEY_ID` | Yes | Your AWS Access Key ID |
| `AWS_SECRET_ACCESS_KEY` | Yes | Your AWS Secret Access Key |
| `AWS_REGION` | No | AWS Region (default: us-east-1) |
| `AWS_S3_BUCKET_NAME` | Yes | Your S3 bucket name |

### URL Expiration
- Download URLs are valid for **24 hours** by default
- You can modify this in `services/s3Service.js`:
  ```javascript
  { expiresIn: 86400 } // 24 hours in seconds
  ```

## 🔄 Fallback Behavior

If S3 is not configured, the API will:
1. Generate the document as before
2. Return it directly as a downloadable file
3. Not upload to S3

This ensures the API works even without S3 configuration.

## 🚨 Troubleshooting

### Common Issues

1. **Access Denied**
   - Check your AWS credentials
   - Verify bucket name is correct
   - Ensure IAM user has proper permissions

2. **Bucket Not Found**
   - Verify bucket name in `.env`
   - Check if bucket exists in the specified region

3. **Invalid Credentials**
   - Regenerate access keys in AWS IAM
   - Update `.env` file with new credentials

4. **Region Mismatch**
   - Ensure `AWS_REGION` matches your bucket's region

### Debug Mode
Add this to your `.env` for detailed AWS logs:
```env
AWS_SDK_JS_DEBUG=true
```

## 💰 Cost Considerations

- **Storage**: ~$0.023 per GB per month
- **Requests**: ~$0.0004 per 1,000 GET requests
- **Data Transfer**: ~$0.09 per GB (outbound)

For typical usage (1000 documents/month):
- Storage: ~$0.01/month
- Requests: ~$0.01/month
- **Total**: ~$0.02/month

## 🔐 Security Notes

1. **Never commit `.env` to version control**
2. **Use IAM roles in production** (not access keys)
3. **Enable bucket versioning** for document recovery
4. **Set up CloudTrail** for audit logs
5. **Consider encryption** for sensitive documents

## 📞 Support

If you encounter issues:
1. Check AWS CloudWatch logs
2. Verify IAM permissions
3. Test with AWS CLI first
4. Review the troubleshooting section above 