import AWS from 'aws-sdk';
import { Env } from '@qrforeverybody/shared';

/**
 * Service for S3 file operations
 */
export class S3Service {
  private s3: AWS.S3;

  constructor(env: Env) {
    const config: AWS.S3.ClientConfiguration = {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      region: env.S3_REGION,
    };

    // Use custom endpoint for MinIO in development
    if (env.S3_ENDPOINT) {
      config.endpoint = env.S3_ENDPOINT;
      config.s3ForcePathStyle = true;
    }

    this.s3 = new AWS.S3(config);
  }

  /**
   * Upload file to S3
   */
  async uploadFile(
    buffer: Buffer,
    key: string,
    contentType: string,
    bucket: string = process.env.S3_BUCKET!
  ): Promise<string> {
    const params: AWS.S3.PutObjectRequest = {
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'public-read'
    };

    try {
      const result = await this.s3.upload(params).promise();
      return result.Location;
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error('Failed to upload file to S3');
    }
  }

  /**
   * Delete file from S3
   */
  async deleteFile(key: string, bucket: string = process.env.S3_BUCKET!): Promise<void> {
    const params: AWS.S3.DeleteObjectRequest = {
      Bucket: bucket,
      Key: key
    };

    try {
      await this.s3.deleteObject(params).promise();
    } catch (error) {
      console.error('S3 delete error:', error);
      throw new Error('Failed to delete file from S3');
    }
  }

  /**
   * Get file from S3
   */
  async getFile(key: string, bucket: string = process.env.S3_BUCKET!): Promise<Buffer> {
    const params: AWS.S3.GetObjectRequest = {
      Bucket: bucket,
      Key: key
    };

    try {
      const result = await this.s3.getObject(params).promise();
      return result.Body as Buffer;
    } catch (error) {
      console.error('S3 get error:', error);
      throw new Error('Failed to get file from S3');
    }
  }

  /**
   * Generate presigned URL for temporary uploads
   */
  async getPresignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn: number = 3600,
    bucket: string = process.env.S3_BUCKET!
  ): Promise<string> {
    const params: AWS.S3.PresignedPost.Params = {
      Bucket: bucket,
      Key: key,
      Expires: expiresIn,
      ContentType: contentType
    };

    try {
      return await this.s3.getSignedUrlPromise('putObject', {
        Bucket: bucket,
        Key: key,
        Expires: expiresIn,
        ContentType: contentType
      });
    } catch (error) {
      console.error('S3 presigned URL error:', error);
      throw new Error('Failed to generate presigned URL');
    }
  }

  /**
   * Generate unique file key
   */
  generateKey(prefix: string, filename: string, extension: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `${prefix}/${timestamp}-${random}-${filename}${extension}`;
  }

  /**
   * Validate file type and size
   */
  validateFile(buffer: Buffer, contentType: string): { valid: boolean; error?: string } {
    // Size limit: 5MB
    const maxSize = 5 * 1024 * 1024;
    if (buffer.length > maxSize) {
      return { valid: false, error: 'File size exceeds 5MB limit' };
    }

    // Allowed content types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(contentType)) {
      return { valid: false, error: 'File type not supported. Use JPEG, PNG, or WebP.' };
    }

    return { valid: true };
  }
}