import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../database';
import { QRService } from '../services/qr-service';
import { S3Service } from '../services/s3-service';
import {
  generateEditToken,
  hashEditToken,
  generateSlug,
  hashIP
} from '../utils/crypto';
import {
  CreateQRRequestSchema,
  CreateQRResponseSchema,
  UpdateQRRequestSchema,
  ExportRequestSchema,
  QRMode,
  SuccessResponseSchema,
  ErrorResponseSchema,
  type CreateQRRequest,
  type UpdateQRRequest,
  type ExportRequest
} from '@qrforeverybody/shared';

export default async function qrRoutes(fastify: FastifyInstance) {
  const qrService = new QRService();
  const s3Service = new S3Service(fastify.config as any);

  // POST /api/qrcodes - Create new QR code
  fastify.post('/api/qrcodes', {
    schema: {
      body: CreateQRRequestSchema,
      response: {
        201: SuccessResponseSchema,
        400: ErrorResponseSchema,
        429: ErrorResponseSchema
      }
    }
  }, async (request: FastifyRequest<{ Body: CreateQRRequest }>, reply: FastifyReply) => {
    try {
      const { mode, content, options, logo } = request.body;

      // Validate contrast
      if (options?.color && options?.background) {
        const contrast = qrService.validateContrast(options.color, options.background);
        if (!contrast.valid) {
          return reply.status(400).send({
            success: false,
            error: `Color contrast too low (${contrast.ratio?.toFixed(2)}:1). Minimum 4.5:1 required for scanability.`
          });
        }
      }

      // Handle logo upload if provided
      let logoUrl: string | undefined;
      if (logo) {
        const logoBuffer = Buffer.from(logo.split(',')[1], 'base64');
        const contentType = logo.split(';')[0].split(':')[1];

        const validation = s3Service.validateFile(logoBuffer, contentType);
        if (!validation.valid) {
          return reply.status(400).send({
            success: false,
            error: validation.error
          });
        }

        const key = s3Service.generateKey('logos', 'logo', '.png');
        logoUrl = await s3Service.uploadFile(logoBuffer, key, contentType);
      }

      // Generate unique identifiers
      const slug = generateSlug();
      const editToken = generateEditToken();
      const editTokenHash = hashEditToken(editToken);

      // Create target URL for redirect mode
      const targetUrl = mode === QRMode.REDIRECT
        ? `${process.env.BASE_URL}/r/${slug}`
        : undefined;

      // Save to database
      const qrCode = await prisma.qRCode.create({
        data: {
          slug,
          mode,
          content,
          targetUrl,
          options: options || {},
          logoUrl,
          ownerEditTokenHash: editTokenHash
        }
      });

      // Generate URLs
      const publicUrl = mode === QRMode.REDIRECT
        ? `${process.env.BASE_URL}/r/${slug}`
        : `${process.env.BASE_URL}/api/qrcodes/${qrCode.id}/export?format=svg`;

      const managementUrl = `${process.env.BASE_URL}/manage/${slug}?token=${editToken}`;

      const response: CreateQRResponse = {
        id: qrCode.id,
        slug,
        editToken,
        publicUrl,
        managementUrl,
        expires: null
      };

      return reply.status(201).send({
        success: true,
        data: response
      });

    } catch (error) {
      fastify.log.error('Create QR error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // GET /api/qrcodes/:id - Get QR metadata (requires edit token)
  fastify.get('/api/qrcodes/:id', {
    schema: {
      response: {
        200: SuccessResponseSchema,
        401: ErrorResponseSchema,
        404: ErrorResponseSchema
      }
    }
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const editToken = request.headers['x-edit-token'] as string ||
                       (request.query as any)?.editToken;

      if (!editToken) {
        return reply.status(401).send({
          success: false,
          error: 'Edit token required'
        });
      }

      const qrCode = await prisma.qRCode.findUnique({
        where: { id },
        include: {
          scans: {
            orderBy: { timestamp: 'desc' },
            take: 100
          }
        }
      });

      if (!qrCode) {
        return reply.status(404).send({
          success: false,
          error: 'QR code not found'
        });
      }

      // Verify edit token
      if (!verifyEditToken(editToken, qrCode.ownerEditTokenHash)) {
        return reply.status(401).send({
          success: false,
          error: 'Invalid edit token'
        });
      }

      return reply.send({
        success: true,
        data: qrCode
      });

    } catch (error) {
      fastify.log.error('Get QR error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // PATCH /api/qrcodes/:id - Update QR code (requires edit token)
  fastify.patch('/api/qrcodes/:id', {
    schema: {
      body: UpdateQRRequestSchema,
      response: {
        200: SuccessResponseSchema,
        401: ErrorResponseSchema,
        404: ErrorResponseSchema
      }
    }
  }, async (request: FastifyRequest<{ Params: { id: string }; Body: UpdateQRRequest }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const updates = request.body;
      const editToken = request.headers['x-edit-token'] as string;

      if (!editToken) {
        return reply.status(401).send({
          success: false,
          error: 'Edit token required'
        });
      }

      // Get existing QR code
      const existingQR = await prisma.qRCode.findUnique({
        where: { id }
      });

      if (!existingQR) {
        return reply.status(404).send({
          success: false,
          error: 'QR code not found'
        });
      }

      // Verify edit token
      if (!verifyEditToken(editToken, existingQR.ownerEditTokenHash)) {
        return reply.status(401).send({
          success: false,
          error: 'Invalid edit token'
        });
      }

      // Validate contrast if colors changed
      if (updates.options?.color && updates.options?.background) {
        const contrast = qrService.validateContrast(
          updates.options.color,
          updates.options.background
        );
        if (!contrast.valid) {
          return reply.status(400).send({
            success: false,
            error: `Color contrast too low (${contrast.ratio?.toFixed(2)}:1). Minimum 4.5:1 required for scanability.`
          });
        }
      }

      // Update QR code
      const updatedQR = await prisma.qRCode.update({
        where: { id },
        data: updates
      });

      return reply.send({
        success: true,
        data: updatedQR
      });

    } catch (error) {
      fastify.log.error('Update QR error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // POST /api/qrcodes/:id/pause - Toggle pause state (requires edit token)
  fastify.post('/api/qrcodes/:id/pause', {
    schema: {
      response: {
        200: SuccessResponseSchema,
        401: ErrorResponseSchema,
        404: ErrorResponseSchema
      }
    }
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const editToken = request.headers['x-edit-token'] as string;

      if (!editToken) {
        return reply.status(401).send({
          success: false,
          error: 'Edit token required'
        });
      }

      const existingQR = await prisma.qRCode.findUnique({
        where: { id }
      });

      if (!existingQR) {
        return reply.status(404).send({
          success: false,
          error: 'QR code not found'
        });
      }

      if (!verifyEditToken(editToken, existingQR.ownerEditTokenHash)) {
        return reply.status(401).send({
          success: false,
          error: 'Invalid edit token'
        });
      }

      const updatedQR = await prisma.qRCode.update({
        where: { id },
        data: {
          active: !existingQR.active
        }
      });

      return reply.send({
        success: true,
        data: updatedQR
      });

    } catch (error) {
      fastify.log.error('Pause QR error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // DELETE /api/qrcodes/:id - Delete QR code (requires edit token)
  fastify.delete('/api/qrcodes/:id', {
    schema: {
      response: {
        204: { type: 'null' },
        401: ErrorResponseSchema,
        404: ErrorResponseSchema
      }
    }
  }, async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const editToken = request.headers['x-edit-token'] as string;

      if (!editToken) {
        return reply.status(401).send({
          success: false,
          error: 'Edit token required'
        });
      }

      const existingQR = await prisma.qRCode.findUnique({
        where: { id }
      });

      if (!existingQR) {
        return reply.status(404).send({
          success: false,
          error: 'QR code not found'
        });
      }

      if (!verifyEditToken(editToken, existingQR.ownerEditTokenHash)) {
        return reply.status(401).send({
          success: false,
          error: 'Invalid edit token'
        });
      }

      // Delete logo from S3 if exists
      if (existingQR.logoUrl) {
        const key = new URL(existingQR.logoUrl).pathname.substring(1);
        await s3Service.deleteFile(key);
      }

      // Delete from database (cascades to scans)
      await prisma.qRCode.delete({
        where: { id }
      });

      return reply.status(204).send();

    } catch (error) {
      fastify.log.error('Delete QR error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });

  // GET /api/qrcodes/:id/export - Export QR code as image
  fastify.get('/api/qrcodes/:id/export', {
    schema: {
      querystring: ExportRequestSchema,
      response: {
        200: { type: 'string', format: 'binary' },
        400: ErrorResponseSchema,
        404: ErrorResponseSchema
      }
    }
  }, async (request: FastifyRequest<{ Params: { id: string }; Querystring: ExportRequest }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const { format, size } = request.query;

      const qrCode = await prisma.qRCode.findUnique({
        where: { id }
      });

      if (!qrCode) {
        return reply.status(404).send({
          success: false,
          error: 'QR code not found'
        });
      }

      // Generate QR code
      const data = qrCode.mode === QRMode.REDIRECT ? qrCode.targetUrl! : qrCode.content;
      const options = { ...qrCode.options as any, size };

      let buffer: Buffer;
      let contentType: string;

      switch (format) {
        case 'svg':
          buffer = await qrService.generateSVG(data, options);
          contentType = 'image/svg+xml';
          break;
        case 'png':
          buffer = await qrService.generatePNG(data, options, qrCode.logoUrl || undefined);
          contentType = 'image/png';
          break;
        case 'jpeg':
          buffer = await qrService.generateJPEG(data, options, qrCode.logoUrl || undefined);
          contentType = 'image/jpeg';
          break;
        default:
          return reply.status(400).send({
            success: false,
            error: 'Invalid format. Use png, jpeg, or svg.'
          });
      }

      reply.header('Content-Type', contentType);
      reply.header('Cache-Control', 'public, max-age=3600');
      return reply.send(buffer);

    } catch (error) {
      fastify.log.error('Export QR error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });
}