import crypto from 'crypto';

// Base64Url helper functions
const base64UrlEncode = (str: string): string => {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

const base64UrlDecode = (str: string): string => {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
};

// Password Hashing
export const hashPassword = (password: string): { salt: string; hash: string } => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
    .toString('hex');
  return { salt, hash };
};

export const verifyPassword = (password: string, salt: string, storedHash: string): boolean => {
  const hash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
    .toString('hex');

  const hashBuffer = Buffer.from(storedHash, 'hex');
  const attemptBuffer = Buffer.from(hash, 'hex');

  if (hashBuffer.length !== attemptBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(hashBuffer, attemptBuffer);
};

// JWT token creator
export const createToken = (payload: any, secret: string, expiresInHours = 24): string => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInHours * 60 * 60;
  const tokenPayload = { ...payload, exp };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(tokenPayload));

  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signatureInput)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

// JWT token verifier
export const verifyToken = (token: string, secret: string): any | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerStr, payloadStr, signature] = parts;

    // Validate Signature
    const signatureInput = `${headerStr}.${payloadStr}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signatureInput)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    // Parse and return payload if not expired
    const payload = JSON.parse(base64UrlDecode(payloadStr));
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return null; // Token expired
    }

    return payload;
  } catch (error) {
    return null;
  }
};
