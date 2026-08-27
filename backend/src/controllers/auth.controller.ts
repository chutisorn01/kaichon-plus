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
    const { email, name, googleId, profileImage } = req.body;

    if (!email) {
      return next(new AppError('Email is required for Google login', 400));
    }

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
        profileImage: profileImage || ''
      });
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
        isVerified: user.isVerified,
        isPartnerVip: user.isPartnerVip
      },
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
    const { name, farmName, description, phone, lineId, facebook, address, profileImage, coverImage, signatureImage, stampText, isVerified } = req.body;

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
        stampText,
        ...(typeof isVerified === 'boolean' && { isVerified })
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
