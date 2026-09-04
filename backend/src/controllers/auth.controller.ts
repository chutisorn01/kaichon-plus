import { OAuth2Client } from 'google-auth-library';
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model.js';
import { hashPassword, verifyPassword, createToken } from '../config/crypto.js';
import { AppError } from '../middleware/error.middleware.js';
import { SystemSetting } from '../models/systemSetting.model.js';

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return process.env.JWT_SECRET;
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await (SystemSetting as any).getSettings();
    if (!settings.isRegistrationOpen) {
      return next(new AppError('ระบบปิดรับสมัครสมาชิกชั่วคราว (Registration is currently closed)', 403));
    }

    const { username, password, name, email } = req.body;

    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return next(new AppError('Username is already taken', 400));
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return next(new AppError('Email is already in use', 400));
    }

    const { salt, hash } = hashPassword(password);

    const user = await User.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      name,
      passwordHash: hash,
      passwordSalt: salt,
      role: 'user',
      isVerified: false,
    });

    const token = createToken({ id: user._id, role: user.role }, getJwtSecret());

    res.status(201).json({
      status: 'success',
      token,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return next(new AppError('Invalid username or password', 401));
    }

    const isValidPassword = verifyPassword(password, user.passwordSalt, user.passwordHash);
    if (!isValidPassword) {
      return next(new AppError('Invalid username or password', 401));
    }

    const token = createToken({ id: user._id, role: user.role }, getJwtSecret());

    res.status(200).json({
      status: 'success',
      token,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        isPartnerVip: user.isPartnerVip,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const googleAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return next(new AppError('Google credential is required', 400));
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || "1058888702511-73ndeh0hvtkpge1ulhed049mdom0h8mc.apps.googleusercontent.com");
    
    let ticket;
    try {
      ticket = await client.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID || "1058888702511-73ndeh0hvtkpge1ulhed049mdom0h8mc.apps.googleusercontent.com", 
      });
    } catch (err) {
      return next(new AppError('Invalid Google token', 401));
    }

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return next(new AppError('Google authentication failed', 401));
    }

    const { email, name, picture } = payload;
    const cleanEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      const baseUsername = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
      let username = baseUsername || `google_${Date.now()}`;
      
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        username = `${username}_${Math.floor(100 + Math.random() * 900)}`;
      }

      const { salt, hash } = hashPassword(`google_${Date.now()}_${Math.random()}`);

      user = await User.create({
        username,
        email: cleanEmail,
        name: name || 'Google User',
        passwordHash: hash,
        passwordSalt: salt,
        role: 'user',
        isVerified: false,
        farmName: `ซุ้ม ${name || 'สมาร์ทฟาร์ม'}`,
        profileImage: picture || ''
      });
    }

    const token = createToken({ id: user._id, role: user.role }, getJwtSecret());

    res.status(200).json({
      status: 'success',
      token,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await (SystemSetting as any).getSettings();
    res.status(200).json({
      status: 'success',
      data: {
        isRegistrationOpen: settings.isRegistrationOpen,
        adminLineUrl: settings.adminLineUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user._id;
    const { name, farmName, description, phone, lineId, facebook, address, profileImage, coverImage, signatureImage, stampText } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        farmName,
        description,
        phone,
        lineId,
        facebook,
        address,
        profileImage,
        coverImage,
        signatureImage,
        stampText
      },
      { new: true, runValidators: true }
    ).select('-passwordHash -passwordSalt');

    if (!updatedUser) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(new AppError('กรุณากรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่', 400));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('ไม่พบผู้ใช้งาน', 404));
    }

    const isValidPassword = verifyPassword(currentPassword, user.passwordSalt, user.passwordHash);
    if (!isValidPassword) {
      return next(new AppError('รหัสผ่านปัจจุบันไม่ถูกต้อง', 401));
    }

    const { salt, hash } = hashPassword(newPassword);
    
    await User.findByIdAndUpdate(userId, {
      passwordHash: hash,
      passwordSalt: salt
    });

    res.status(200).json({
      status: 'success',
      message: 'อัปเดตรหัสผ่านสำเร็จ'
    });
  } catch (error) {
    next(error);
  }
};

// --- Image Streaming Endpoints ---

const streamUserImage = async (id: string, res: Response, field: string) => {
  try {
    const doc = await User.findById(id).select(field).lean() as any;
    if (!doc || !doc[field]) {
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.status(200).send(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f1f5f9"/><text x="50%" y="50%" font-size="60" font-family="sans-serif" text-anchor="middle" dominant-baseline="middle" fill="#cbd5e1">👤</text></svg>`);
    }

    const match = doc[field].match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!match) {
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.status(200).send(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f1f5f9"/><text x="50%" y="50%" font-size="60" font-family="sans-serif" text-anchor="middle" dominant-baseline="middle" fill="#cbd5e1">👤</text></svg>`);
    }

    const buffer = Buffer.from(match[2], 'base64');
    res.setHeader('Content-Type', match[1]);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.end(buffer);
  } catch (error) {
    console.error('Error streaming user image:', error);
    return res.status(500).send('Server Error');
  }
};

export const getUserProfileImage = async (req: Request, res: Response) => {
  return streamUserImage(req.params.id as string, res, 'profileImage');
};

export const getUserCoverImage = async (req: Request, res: Response) => {
  return streamUserImage(req.params.id as string, res, 'coverImage');
};

export const getUserSignatureImage = async (req: Request, res: Response) => {
  return streamUserImage(req.params.id as string, res, 'signatureImage');
};
