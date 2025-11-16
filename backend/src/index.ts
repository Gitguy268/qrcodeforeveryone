import fastify from 'fastify';
import { EnvSchema, Env } from '@qrforeverybody/shared';
import { setupMiddleware } from './middleware';
import qrRoutes from './routes/qrcodes';
import redirectRoutes from './routes/redirect';
import uploadRoutes from './routes/upload';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validate environment variables
const env: Env = EnvSchema.parse(process.env);

// Create Fastify instance
const server = fastify({
  logger: {
    level: env.NODE_ENV === 'production' ? 'info' : 'debug'
  },
  // Increase payload size for file uploads
  bodyLimit: 10 * 1024 * 1024, // 10MB
});

// Store config in server instance
server.config = env;

// Setup middleware
await setupMiddleware(server, env);

// Register routes
await server.register(qrRoutes);
await server.register(redirectRoutes);
await server.register(uploadRoutes);

// Serve static files (frontend)
if (env.NODE_ENV === 'production') {
  await server.register(import('@fastify/static'), {
    root: path.join(__dirname, '../frontend/dist'),
    prefix: '/',
  });
}

// Management page route
server.get('/manage/:slug', async (request, reply) => {
  const { slug } = request.params as { slug: string };

  if (env.NODE_ENV === 'development') {
    // In development, redirect to frontend dev server
    reply.redirect(302, `http://localhost:5173/manage/${slug}${request.url.split('?')[1] ? '?' + request.url.split('?')[1] : ''}`);
  } else {
    // In production, serve the management page from the build
    return reply.sendFile('index.html');
  }
});

// Start server
const start = async () => {
  try {
    const port = parseInt(env.PORT.toString());
    const host = env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

    await server.listen({ port, host });
    server.log.info(`Server listening on http://${host}:${port}`);

    if (env.NODE_ENV === 'development') {
      server.log.info('Frontend dev server should be running on http://localhost:5173');
    }

  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  server.log.info('Received SIGINT. Shutting down gracefully...');
  await server.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  server.log.info('Received SIGTERM. Shutting down gracefully...');
  await server.close();
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  server.log.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the server
start();

// Type augmentation for Fastify instance
declare module 'fastify' {
  interface FastifyInstance {
    config: Env;
  }
}