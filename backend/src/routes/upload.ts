import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { S3Service } from '../services/s3-service';
import { EnvSchema } from '@qrforeverybody/shared';

export default async function uploadRoutes(fastify: FastifyInstance) {
  const s3Service = new S3Service(fastify.config as Env);

  // POST /api/upload-temp - Temporary file upload
  fastify.post('/api/upload-temp', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                tempUrl: { type: 'string' },
                expiresAt: { type: 'string' }
              }
            }
          }
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = await request.file();

      if (!data) {
        return reply.status(400).send({
          success: false,
          error: 'No file provided'
        });
      }

      // Validate file
      const buffer = await data.toBuffer();
      const contentType = data.mimetype;

      const validation = s3Service.validateFile(buffer, contentType);
      if (!validation.valid) {
        return reply.status(400).send({
          success: false,
          error: validation.error
        });
      }

      // Generate temporary upload key
      const filename = data.filename || 'upload';
      const extension = contentType.split('/')[1] || 'bin';
      const key = s3Service.generateKey('temp', filename.replace(/\.[^/.]+$/, ''), `.${extension}`);

      // Upload to temporary storage
      const tempUrl = await s3Service.uploadFile(buffer, key, contentType);

      // Calculate expiration (24 hours from now)
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      return reply.send({
        success: true,
        data: {
          tempUrl,
          expiresAt
        }
      });

    } catch (error) {
      fastify.log.error('Upload error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to upload file'
      });
    }
  });
}