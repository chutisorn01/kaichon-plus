import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/crypto.js';
import { User } from '../models/user.model.js';
import { AppError } from './error.middleware.js';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token = '';

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Access denied: Please authenticate to access this endpoint', 401));
    }

    if (!process.env.JWT_SECRET) {
      return next(new AppError('Server configuration error: JWT_SECRET is missing', 500));
    }
    const secret = process.env.JWT_SECRET;
    const decoded = verifyToken(token, secret);

    if (!decoded) {
      return next(new AppError('Invalid or expired authentication token', 401));
    }

    // Check if user still exists
    const user = await User.findById(decoded.id).select('-passwordHash -passwordSalt');
    if (!user) {
      return next(new AppError('User belonging to this token no longer exists', 401));
    }

    if ((user as any).isBlocked) {
      return next(new AppError('บัญชีของคุณถูกระงับการใช้งานชั่วคราว กรุณาติดต่อผู้ดูแลระบบ (Your account has been temporarily blocked)', 403));
    }

    // Grant access and assign user payload to request
    (req as any).user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};
