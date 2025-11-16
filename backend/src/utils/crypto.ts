import { createHash, randomBytes } from 'crypto';

/**
 * Generate a cryptographically secure random edit token
 */
export function generateEditToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Hash an edit token with salt for storage
 */
export function hashEditToken(token: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256')
    .update(salt + token)
    .digest('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify an edit token against its hash
 */
export function verifyEditToken(token: string, hashedToken: string): boolean {
  const [salt, hash] = hashedToken.split(':');
  if (!salt || !hash) return false;

  const tokenHash = createHash('sha256')
    .update(salt + token)
    .digest('hex');

  return tokenHash === hash;
}

/**
 * Generate a short unique slug
 */
export function generateSlug(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 9; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Hash IP address for privacy
 */
export function hashIP(ip: string): string {
  return createHash('sha256')
    .update(ip + process.env.IP_HASH_SALT || 'default-salt')
    .digest('hex');
}