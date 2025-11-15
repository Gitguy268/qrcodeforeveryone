import rateLimit from '@fastify/rate-limit';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import { FastifyInstance } from 'fastify';
import { EnvSchema, Env } from '@qrforeverybody/shared';

/**
 * Setup security and utility middleware
 */
export async function setupMiddleware(fastify: FastifyInstance, env: Env) {
  // Security headers
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "http:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        manifestSrc: ["'self'"]
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  });

  // CORS configuration
  await fastify.register(cors, {
    origin: env.NODE_ENV === 'production'
      ? [env.BASE_URL]
      : true, // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-edit-token']
  });

  // Rate limiting
  await fastify.register(rateLimit, {
    max: parseInt(env.RATE_LIMIT_MAX.toString()),
    timeWindow: env.RATE_LIMIT_WINDOW,
    skipOnError: false,
    keyGenerator: (request) => {
      // Use IP address for rate limiting
      return request.ip ||
             request.headers['x-forwarded-for'] as string ||
             request.headers['x-real-ip'] as string ||
             'unknown';
    },
    errorResponseBuilder: (request, context) => ({
      success: false,
      error: 'Rate limit exceeded',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: context.ttl
    })
  });

  // Special rate limiting for QR creation
  await fastify.register(rateLimit, {
    max: 50, // 50 QR creations per day
    timeWindow: 24 * 60 * 60 * 1000, // 24 hours
    skipOnError: false,
    keyGenerator: (request) => {
      // Use IP address for rate limiting
      return request.ip ||
             request.headers['x-forwarded-for'] as string ||
             request.headers['x-real-ip'] as string ||
             'unknown';
    },
    hooks: {
      preHandler: (request, reply, done) => {
        // Only apply to QR creation endpoint
        if (request.url === '/api/qrcodes' && request.method === 'POST') {
          done();
        } else {
          reply.raw.next();
        }
      }
    },
    errorResponseBuilder: (request, context) => ({
      success: false,
      error: 'QR creation limit exceeded. Maximum 50 QR codes per day per IP.',
      code: 'QR_RATE_LIMIT_EXCEEDED',
      retryAfter: context.ttl
    })
  });

  // Request logging
  fastify.addHook('preHandler', async (request, reply) => {
    const start = Date.now();

    request.log.info({
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
      ip: request.ip
    }, 'Incoming request');

    // Add response logging
    reply.addHook('onSend', async (request, reply) => {
      const duration = Date.now() - start;
      request.log.info({
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        duration
      }, 'Request completed');
    });
  });

  // Error handling
  fastify.setErrorHandler((error, request, reply) => {
    request.log.error({
      error: error.message,
      stack: error.stack,
      method: request.method,
      url: request.url
    }, 'Request error');

    // Don't expose internal errors in production
    const message = env.NODE_ENV === 'production'
      ? 'Internal server error'
      : error.message;

    reply.status(error.statusCode || 500).send({
      success: false,
      error: message,
      ...(env.NODE_ENV !== 'production' && { stack: error.stack })
    });
  });

  // 404 handler
  fastify.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      success: false,
      error: 'Route not found',
      code: 'NOT_FOUND'
    });
  });

  // Health check endpoint
  fastify.get('/health', async () => {
    return {
      success: true,
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0'
      }
    };
  });
}