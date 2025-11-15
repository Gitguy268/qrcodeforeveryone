import QRCode from '@nuintun/qrcode';
import sharp from 'sharp';
import { QROptions, QRMode } from '@qrforeverybody/shared';

/**
 * Service for QR code generation and processing
 */
export class QRService {
  /**
   * Generate QR code as SVG buffer
   */
  async generateSVG(data: string, options: QROptions): Promise<Buffer> {
    const qr = new QRCode(data, {
      type: 'svg',
      width: options.size,
      margin: 4, // 4 modules quiet zone
      color: {
        dark: options.color,
        light: options.background
      },
      errorCorrectionLevel: options.errorCorrection
    });

    // Apply gradient if specified
    let svg = qr.toString();

    if (options.gradient) {
      svg = this.applyGradient(svg, options.gradient);
    }

    if (options.rounded) {
      svg = this.applyRoundedCorners(svg);
    }

    return Buffer.from(svg);
  }

  /**
   * Generate QR code as PNG buffer
   */
  async generatePNG(data: string, options: QROptions, logoUrl?: string): Promise<Buffer> {
    // First generate SVG
    const svgBuffer = await this.generateSVG(data, options);

    // Convert to PNG
    let pngBuffer = await sharp(svgBuffer)
      .png({ quality: 90 })
      .toBuffer();

    // Composite logo if provided
    if (logoUrl) {
      pngBuffer = await this.compositeLogo(pngBuffer, options, logoUrl);
    }

    return pngBuffer;
  }

  /**
   * Generate QR code as JPEG buffer
   */
  async generateJPEG(data: string, options: QROptions, logoUrl?: string): Promise<Buffer> {
    const pngBuffer = await this.generatePNG(data, options, logoUrl);

    return await sharp(pngBuffer)
      .jpeg({ quality: 90 })
      .toBuffer();
  }

  /**
   * Composite logo onto QR code
   */
  private async compositeLogo(qrBuffer: Buffer, options: QROptions, logoUrl: string): Promise<Buffer> {
    try {
      // Calculate logo size (25% max of QR size)
      const logoSize = Math.floor(options.size * (options.logoScale || 0.2));

      // Fetch and resize logo
      const logoBuffer = await this.fetchLogo(logoUrl, logoSize);

      // Composite logo centered
      return await sharp(qrBuffer)
        .composite([{
          input: logoBuffer,
          top: Math.floor((options.size - logoSize) / 2),
          left: Math.floor((options.size - logoSize) / 2)
        }])
        .png()
        .toBuffer();
    } catch (error) {
      console.error('Error compositing logo:', error);
      throw new Error('Failed to composite logo onto QR code');
    }
  }

  /**
   * Fetch and resize logo from URL
   */
  private async fetchLogo(url: string, size: number): Promise<Buffer> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch logo: ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    return await sharp(buffer)
      .resize(size, size, {
        fit: 'inside',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer();
  }

  /**
   * Apply gradient to SVG
   */
  private applyGradient(svg: string, gradient: { from: string; to: string }): string {
    // Add gradient definition
    const gradientDef = `
      <defs>
        <linearGradient id="qrGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${gradient.from};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${gradient.to};stop-opacity:1" />
        </linearGradient>
      </defs>
    `;

    // Replace fill color with gradient
    return svg
      .replace('<svg', `<svg ${gradientDef.replace('<defs', '').replace('</defs>', '').trim()}`)
      .replace(/fill="#000000"/g, 'fill="url(#qrGradient)"')
      .replace(/fill='#000000'/g, "fill='url(#qrGradient)'");
  }

  /**
   * Apply rounded corners to SVG modules
   */
  private applyRoundedCorners(svg: string): string {
    // This is a simplified version - in production, you'd want more sophisticated rounding
    return svg.replace(/rect width="([0-9]+)" height="([0-9]+)"/g,
      'rect width="$1" height="$2" rx="2" ry="2"');
  }

  /**
   * Validate color contrast for scanability
   */
  validateContrast(color: string, background: string): { valid: boolean; ratio?: number } {
    // Simple contrast calculation (WCAG)
    const rgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    const c1 = rgb(color);
    const c2 = rgb(background);

    if (!c1 || !c2) return { valid: false };

    // Calculate relative luminance
    const luminance = (c: typeof c1) => {
      const [r, g, b] = [c.r, c.g, c.b].map(val => {
        val = val / 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const l1 = luminance(c1);
    const l2 = luminance(c2);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

    return {
      valid: ratio >= 4.5, // WCAG AA standard
      ratio
    };
  }
}