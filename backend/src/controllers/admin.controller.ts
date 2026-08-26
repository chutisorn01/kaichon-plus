import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model.js';
import { Father } from '../models/father.model.js';
import { Promotion } from '../models/promotion.model.js';
import { VipSubscription } from '../models/vipSubscription.model.js';
import { SystemSetting } from '../models/systemSetting.model.js';
import { BreedingBatch } from '../models/breedingBatch.model.js';
import { AppError } from '../middleware/error.middleware.js';
import { hashPassword } from '../config/crypto.js';
import { Chicken } from '../models/chicken.model.js';

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find().select('-passwordHash -passwordSalt').sort({ createdAt: -1 });
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password, name, email, role } = req.body;

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
      name,
      email: email.toLowerCase(),
      passwordHash: hash,
      passwordSalt: salt,
      role: role || 'user',
      isVerified: true
    });

    const userResponse = {
      _id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    };

    res.status(201).json({
      status: 'success',
      data: userResponse
    });
  } catch (error) {
    next(error);
  }
};

export const blockUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (user.role === 'admin' && isBlocked) {
      return next(new AppError('Cannot block an admin user', 400));
    }

    (user as any).isBlocked = isBlocked;
    await user.save();

    res.status(200).json({
      status: 'success',
      data: {
        _id: user._id,
        isBlocked: (user as any).isBlocked
      }
    });
  } catch (error) {
    next(error);
  }
};

export const changeUserPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return next(new AppError('Password must be at least 8 characters long', 400));
    }

    const user = await User.findById(id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const { salt, hash } = hashPassword(newPassword);
    
    (user as any).passwordHash = hash;
    (user as any).passwordSalt = salt;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const changeUserRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const reqUser = (req as any).user;
    if (reqUser.username !== 'adminkaichon') {
      return next(new AppError('Only the Super Admin can change user roles', 403));
    }

    if (role !== 'admin' && role !== 'user') {
      return next(new AppError('Invalid role', 400));
    }

    const user = await User.findById(id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (user.username === 'adminkaichon') {
      return next(new AppError('Cannot change the role of the Super Admin', 400));
    }

    (user as any).role = role;
    await user.save();

    res.status(200).json({
      status: 'success',
      data: {
        _id: user._id,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    const targetUser = await User.findById(id);
    if (targetUser && targetUser.username === 'adminkaichon') {
      return next(new AppError('Cannot modify verification status of the main administrator', 400));
    }

    const user = await User.findByIdAndUpdate(id, { isVerified }, { new: true }).select('-passwordHash -passwordSalt');
    if (!user) {
      return next(new AppError('No user found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const getPromotions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const promotions = await Promotion.find()
      .populate('user', 'name farmName email username')
      .populate('father', 'name code breed color bandNumber image')
      .sort({ createdAt: -1 });
    res.status(200).json({
      status: 'success',
      results: promotions.length,
      data: promotions
    });
  } catch (error) {
    next(error);
  }
};

export const approvePromotion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const promotion = await Promotion.findById(id);
    if (!promotion) {
      return next(new AppError('No promotion request found with that ID', 404));
    }

    promotion.status = 'approved';
    await promotion.save();

    const durationDays = promotion.durationDays;
    const promotedUntil = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

    await Father.findByIdAndUpdate(promotion.father, {
      isPromoted: true,
      promotedUntil
    });

    res.status(200).json({
      status: 'success',
      data: promotion
    });
  } catch (error) {
    next(error);
  }
};

export const rejectPromotion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const promotion = await Promotion.findByIdAndUpdate(id, { status: 'rejected' }, { new: true });
    if (!promotion) {
      return next(new AppError('No promotion request found with that ID', 404));
    }

    // Reset the father's promotion status
    await Father.findByIdAndUpdate(promotion.father, {
      isPromoted: false,
      promotedUntil: null,
      promotionTier: 'standard'
    });

    res.status(200).json({
      status: 'success',
      data: promotion
    });
  } catch (error) {
    next(error);
  }
};

export const deletePromotion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const promotion = await Promotion.findByIdAndDelete(id);
    if (!promotion) {
      return next(new AppError('No promotion request found with that ID', 404));
    }

    // Reset the father's promotion status
    await Father.findByIdAndUpdate(promotion.father, {
      isPromoted: false,
      promotedUntil: null,
      promotionTier: 'standard'
    });

    res.status(200).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

export const searchFathers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search } = req.query;
    let filter: any = {};

    if (search) {
      const searchStr = String(search).trim();
      const escapedWord = searchStr.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(escapedWord, 'i');
      
      const conditions: any[] = [
        { name: regex },
        { code: regex },
        { bandNumber: regex }
      ];

      // Match full 24-character ObjectId
      if (/^[0-9a-fA-F]{24}$/.test(searchStr)) {
        conditions.push({ _id: searchStr });
      }

      // Check if it's a KP- style code
      const kpMatch = searchStr.match(/^(?:KP-)?([0-9a-fA-F]{6})-?([0-9a-fA-F]{6})$/i) 
                   || searchStr.match(/^(?:KP-)?([0-9a-fA-F]{12})$/i);
                   
      if (kpMatch) {
        const hexSuffix = (kpMatch[1] + (kpMatch[2] || '')).toLowerCase();
        if (hexSuffix.length === 12) {
          // Add exact suffix match for Father _id
          conditions.push({
            $expr: {
              $regexMatch: {
                input: { $toString: "$_id" },
                regex: `${hexSuffix}$`,
                options: "i"
              }
            }
          });

          // Also lookup the corresponding Chicken and find its father code
          const matchedChickens = await Chicken.find({
            $expr: {
              $regexMatch: {
                input: { $toString: "$_id" },
                regex: `${hexSuffix}$`,
                options: "i"
              }
            }
          }).select('code').lean();

          if (matchedChickens.length > 0) {
            const chickenCodes = matchedChickens.map(c => c.code?.toUpperCase()).filter(Boolean);
            if (chickenCodes.length > 0) {
              conditions.push({ code: { $in: chickenCodes } });
            }
          }
        }
      }

      filter = { $or: conditions };
    }

    const fathers = await Father.find(filter)
      .populate('user', 'name farmName isVerified')
      .limit(50)
      .lean();

    res.status(200).json({
      status: 'success',
      data: fathers
    });
  } catch (error) {
    next(error);
  }
};

export const promoteFather = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { isPromoted, promotionTier, durationDays } = req.body;

    const father = await Father.findById(id);
    if (!father) {
      return next(new AppError('No father found with that ID', 404));
    }

    const promotedUntil = durationDays 
      ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000) 
      : (father.promotedUntil || null);

    father.isPromoted = isPromoted !== undefined ? isPromoted : father.isPromoted;
    father.promotionTier = promotionTier || father.promotionTier;
    if (promotedUntil) {
      father.promotedUntil = promotedUntil;
    }

    await father.save();

    res.status(200).json({
      status: 'success',
      data: father
    });
  } catch (error) {
    next(error);
  }
};

export const getVipSubscriptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subscriptions = await VipSubscription.find()
      .populate('user', 'name farmName email username isVIP')
      .sort({ createdAt: -1 });
    res.status(200).json({
      status: 'success',
      results: subscriptions.length,
      data: subscriptions
    });
  } catch (error) {
    next(error);
  }
};

export const approveVipSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const subscription = await VipSubscription.findById(id);
    if (!subscription) {
      return next(new AppError('No VIP subscription request found', 404));
    }

    subscription.status = 'approved';
    await subscription.save();

    await User.findByIdAndUpdate(subscription.user, { isVIP: true });

    res.status(200).json({
      status: 'success',
      data: subscription
    });
  } catch (error) {
    next(error);
  }
};

export const rejectVipSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const subscription = await VipSubscription.findByIdAndUpdate(id, { status: 'rejected' }, { new: true });
    if (!subscription) {
      return next(new AppError('No VIP subscription request found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: subscription
    });
  } catch (error) {
    next(error);
  }
};

export const getSystemSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await (SystemSetting as any).getSettings();
    res.status(200).json({
      status: 'success',
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

export const updateSystemSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { isRegistrationOpen } = req.body;
    let settings = await (SystemSetting as any).getSettings();
    
    if (isRegistrationOpen !== undefined) {
      settings.isRegistrationOpen = isRegistrationOpen;
    }
    await settings.save();

    res.status(200).json({
      status: 'success',
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

export const backupData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find();
    const fathers = await Father.find();
    const promotions = await Promotion.find();
    const vipSubscriptions = await VipSubscription.find();
    const breedingBatches = await BreedingBatch.find();
    const settings = await (SystemSetting as any).getSettings();

    const backup = {
      timestamp: new Date().toISOString(),
      metadata: {
        usersCount: users.length,
        fathersCount: fathers.length,
        promotionsCount: promotions.length,
        vipSubscriptionsCount: vipSubscriptions.length,
        breedingBatchesCount: breedingBatches.length
      },
      data: {
        settings,
        users,
        fathers,
        promotions,
        vipSubscriptions,
        breedingBatches
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="kaichon-plus-backup-${new Date().toISOString().split('T')[0]}.json"`);
    res.status(200).send(JSON.stringify(backup, null, 2));
  } catch (error) {
    next(error);
  }
};

