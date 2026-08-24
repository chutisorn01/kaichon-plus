import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Password Hashing
export const hashPassword = (password: string): { salt: string; hash: string } => {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  return { salt, hash }; // returning salt for backwards compatibility in auth.controller, though not strictly needed for bcrypt
};

export const verifyPassword = (password: string, _salt: string, storedHash: string): boolean => {
  return bcrypt.compareSync(password, storedHash);
};

// JWT token creator
export const createToken = (payload: any, secret: string, expiresInHours = 24): string => {
  return jwt.sign(payload, secret, { expiresIn: `${expiresInHours}h` });
};

// JWT token verifier
export const verifyToken = (token: string, secret: string): any | null => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};
