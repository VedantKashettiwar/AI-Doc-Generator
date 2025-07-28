const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');

class S3Service {
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    this.bucketName = process.env.AWS_S3_BUCKET_NAME;
  }

  /**
   * Upload document to S3 bucket
   * @param {string} content - Document content
   * @param {string} originalFilename - Original markdown filename
   * @returns {Object} Upload result with file key and URL
   */
  async uploadDocument(content, originalFilename) {
    try {
      // Generate unique file key with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileKey = `documents/${timestamp}_${uuidv4()}_${originalFilename.replace('.md', '_documentation.txt')}`;
      
      // Upload to S3
      const uploadParams = {
        Bucket: this.bucketName,
        Key: fileKey,
        Body: content,
        ContentType: 'text/plain',
        Metadata: {
          'original-filename': originalFilename,
          'uploaded-at': new Date().toISOString(),
          'timestamp': timestamp,
        },
      };

      await this.s3Client.send(new PutObjectCommand(uploadParams));

      // Generate presigned URL for download (valid for 24 hours)
      const downloadParams = {
        Bucket: this.bucketName,
        Key: fileKey,
      };

      const downloadUrl = await getSignedUrl(
        this.s3Client,
        new GetObjectCommand(downloadParams),
        { expiresIn: 86400 } // 24 hours
      );

      return {
        success: true,
        fileKey: fileKey,
        downloadUrl: downloadUrl,
        filename: fileKey.split('/').pop(),
        expiresAt: new Date(Date.now() + 86400 * 1000).toISOString(),
        timestamp: timestamp,
      };

    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error(`Failed to upload document to S3: ${error.message}`);
    }
  }

  /**
   * Generate a new download URL for an existing file
   * @param {string} fileKey - S3 file key
   * @returns {string} New presigned URL
   */
  async generateDownloadUrl(fileKey) {
    try {
      const downloadParams = {
        Bucket: this.bucketName,
        Key: fileKey,
      };

      const downloadUrl = await getSignedUrl(
        this.s3Client,
        new GetObjectCommand(downloadParams),
        { expiresIn: 86400 } // 24 hours
      );

      return downloadUrl;
    } catch (error) {
      console.error('S3 URL generation error:', error);
      throw new Error(`Failed to generate download URL: ${error.message}`);
    }
  }

  /**
   * Check if S3 is properly configured
   * @returns {boolean} Configuration status
   */
  isConfigured() {
    return !!(
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_S3_BUCKET_NAME
    );
  }
}

module.exports = new S3Service(); 