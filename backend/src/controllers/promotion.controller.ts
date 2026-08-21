import { Request, Response, NextFunction } from 'express';
import { Promotion } from '../models/promotion.model.js';
import { AppError } from '../middleware/error.middleware.js';

export const createPromotion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fatherId, durationDays, amount, slipImage } = req.body;
    const userId = (req as any).user.id;

    if (!fatherId || !durationDays || !amount || !slipImage) {
      return next(new AppError('Please provide all required fields', 400));
    }

    const promotion = await Promotion.create({
      user: userId,
      father: fatherId,
      durationDays,
      amount,
      slipImage,
      status: 'pending'
    });

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
