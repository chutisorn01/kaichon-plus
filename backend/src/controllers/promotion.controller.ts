import { Request, Response, NextFunction } from 'express';
import { Promotion } from '../models/promotion.model.js';
import { Father } from '../models/father.model.js';
import { AppError } from '../middleware/error.middleware.js';

export const createPromotion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fatherId, durationDays, amount, slipImage } = req.body;
    const reqUser = (req as any).user;
    const userId = reqUser.id;
    const isPartnerVip = reqUser.isPartnerVip === true;

    if (!isPartnerVip && (!fatherId || !durationDays || !amount || !slipImage)) {
      return next(new AppError('Please provide all required fields', 400));
    }

    if (!fatherId || !durationDays) {
      return next(new AppError('fatherId and durationDays are required', 400));
    }

    const promotion = await Promotion.create({
      user: userId,
      father: fatherId,
      durationDays,
      amount: isPartnerVip ? 0 : amount,
      slipImage: isPartnerVip ? 'partner-vip-auto-approved' : slipImage,
      status: isPartnerVip ? 'approved' : 'pending'
    });

    if (isPartnerVip) {
      const promotedUntil = new Date();
      promotedUntil.setDate(promotedUntil.getDate() + durationDays);
      await Father.findByIdAndUpdate(fatherId, {
        isPromoted: true,
        promotedUntil,
        promotionTier: 'vip' // Partner VIP automatically gets highest tier
      });
    }

    res.status(201).json({
      status: 'success',
      data: promotion
    });
  } catch (error) {
    next(error);
  }
};

export const getMyPromotions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;

    const promotions = await Promotion.find({ user: userId })
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
