import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model.js';
import { Father } from '../models/father.model.js';
import { Promotion } from '../models/promotion.model.js';
import { VipSubscription } from '../models/vipSubscription.model.js';
import { AppError } from '../middleware/error.middleware.js';

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

    res.status(200).json({
      status: 'success',
      data: promotion
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

