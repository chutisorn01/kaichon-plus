import { Request, Response } from 'express';
import { VipSubscription } from '../models/vipSubscription.model.js';

export const createSubscription = async (req: Request, res: Response) => {
  try {
    const { amount, slipImage } = req.body;

    if (!amount || !slipImage) {
      return res.status(400).json({ success: false, message: 'Please provide amount and slip image' });
    }

    const subscription = new VipSubscription({
      user: (req as any).user?._id,
      amount,
      slipImage,
      status: 'pending'
    });
    
    await subscription.save();
    res.status(201).json({ success: true, data: subscription });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMySubscriptions = async (req: Request, res: Response) => {
  try {
    const subscriptions = await VipSubscription.find({ user: (req as any).user?._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: subscriptions.length, data: subscriptions });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
