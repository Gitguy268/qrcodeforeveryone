import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../database';
import { QRMode } from '@qrforeverybody/shared';
import { hashIP } from '../utils/crypto';

export default async function redirectRoutes(fastify: FastifyInstance) {
  // GET /r/:slug - Handle QR code scans
  fastify.get('/r/:slug', {
    schema: {
      params: {
        type: 'object',
        properties: {
          slug: { type: 'string', minLength: 1, maxLength: 9 }
        },
        required: ['slug']
      },
      response: {
        302: { type: 'null' },
        410: { type: 'string' },
        404: { type: 'string' }
      }
    }
  }, async (request: FastifyRequest<{ Params: { slug: string } }>, reply: FastifyReply) => {
    try {
      const { slug } = request.params;
      const clientIP = request.ip || request.headers['x-forwarded-for'] as string;
      const userAgent = request.headers['user-agent'];
      const referer = request.headers.referer;

      // Find QR code
      const qrCode = await prisma.qRCode.findUnique({
        where: { slug }
      });

      if (!qrCode) {
        return reply.status(404).type('text/html').send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>QR Code Not Found</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                text-align: center;
                margin-top: 100px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                min-height: 100vh;
                margin: 0;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
              }
              .container {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                padding: 40px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                max-width: 400px;
              }
              h1 { font-size: 2.5em; margin-bottom: 20px; }
              p { font-size: 1.2em; opacity: 0.9; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>QR Code Not Found</h1>
              <p>This QR code doesn't exist or has been deleted.</p>
            </div>
          </body>
          </html>
        `);
      }

      // Record scan analytics
      await prisma.scan.create({
        data: {
          qrcodeId: qrCode.id,
          ipHash: clientIP ? hashIP(clientIP) : null,
          userAgent: userAgent || null,
          referer: referer || null
        }
      });

      // Update scan count
      await prisma.qRCode.update({
        where: { id: qrCode.id },
        data: {
          scanCount: { increment: 1 },
          lastScannedAt: new Date()
        }
      });

      // Check if QR code is active
      if (!qrCode.active) {
        return reply.status(410).type('text/html').send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>QR Code Paused</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                text-align: center;
                margin-top: 100px;
                background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
                color: white;
                min-height: 100vh;
                margin: 0;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
              }
              .container {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                padding: 40px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                max-width: 400px;
              }
              h1 { font-size: 2.5em; margin-bottom: 20px; }
              p { font-size: 1.2em; opacity: 0.9; }
              .icon { font-size: 4em; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">⏸️</div>
              <h1>QR Code Paused</h1>
              <p>This QR code is currently paused by its owner.</p>
              <p>Scanning is temporarily disabled.</p>
            </div>
          </body>
          </html>
        `);
      }

      // Handle based on mode
      if (qrCode.mode === QRMode.REDIRECT) {
        // Redirect to target URL
        return reply.redirect(302, qrCode.content);
      } else {
        // Show embedded content
        return reply.type('text/html').send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>QR Code Content</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                text-align: center;
                margin-top: 50px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                min-height: 100vh;
                margin: 0;
                padding: 20px;
              }
              .container {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                padding: 40px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                max-width: 600px;
                margin: 0 auto;
              }
              h1 { font-size: 2em; margin-bottom: 20px; }
              .content {
                background: rgba(0, 0, 0, 0.2);
                border-radius: 10px;
                padding: 20px;
                margin: 20px 0;
                word-break: break-all;
                font-family: 'Courier New', monospace;
                font-size: 1.1em;
                text-align: left;
                max-height: 200px;
                overflow-y: auto;
              }
              .copy-btn {
                background: rgba(255, 255, 255, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 1em;
                transition: all 0.3s ease;
              }
              .copy-btn:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: translateY(-2px);
              }
              .copied {
                color: #4ade80;
                margin-left: 10px;
                font-weight: bold;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🔍 QR Code Content</h1>
              <p>This QR code contains the following information:</p>
              <div class="content" id="content">${escapeHtml(qrCode.content)}</div>
              <button class="copy-btn" onclick="copyContent()">
                📋 Copy to Clipboard
              </button>
              <span id="copied" class="copied" style="display: none;">Copied!</span>
            </div>

            <script>
              function copyContent() {
                const content = document.getElementById('content').innerText;
                navigator.clipboard.writeText(content).then(() => {
                  const copied = document.getElementById('copied');
                  copied.style.display = 'inline';
                  setTimeout(() => {
                    copied.style.display = 'none';
                  }, 2000);
                });
              }

              function escapeHtml(text) {
                const map = {
                  '&': '&amp;',
                  '<': '&lt;',
                  '>': '&gt;',
                  '"': '&quot;',
                  "'": '&#039;'
                };
                return text.replace(/[&<>"']/g, m => map[m]);
              }
            </script>
          </body>
          </html>
        `);
      }

    } catch (error) {
      fastify.log.error('Redirect error:', error);
      return reply.status(500).type('text/html').send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Error</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: sans-serif; text-align: center; margin-top: 100px; }
            .error { color: #dc2626; }
          </style>
        </head>
        <body>
          <h1 class="error">⚠️ Service Temporarily Unavailable</h1>
          <p>Please try again in a few moments.</p>
        </body>
        </html>
      `);
    }
  });
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}