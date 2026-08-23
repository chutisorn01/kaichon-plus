import { Request, Response, NextFunction } from 'express';
import { Banner } from '../models/banner.model.js';
import { AppError } from '../middleware/error.middleware.js';

// Get active banners for public homepage
export const getActiveBanners = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.status(200).json({
      status: 'success',
      results: banners.length,
      data: banners
    });
  } catch (error) {
    next(error);
  }
};

// Get all banners for admin
export const getAllBanners = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json({
      status: 'success',
      results: banners.length,
      data: banners
    });
  } catch (error) {
    next(error);
  }
};

// Create new banner (Admin)
export const createBanner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json({
      status: 'success',
      data: banner
    });
  } catch (error) {
    next(error);
  }
};

// Update banner (Admin)
export const updateBanner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    
    if (!banner) {
      return next(new AppError('No banner found with that ID', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: banner
    });
  } catch (error) {
    next(error);
  }
};

// Delete banner (Admin)
export const deleteBanner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByIdAndDelete(id);
    
    if (!banner) {
      return next(new AppError('No banner found with that ID', 404));
    }
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};
