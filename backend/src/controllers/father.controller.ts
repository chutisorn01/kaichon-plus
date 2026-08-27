import { Request, Response } from 'express';
import { Father } from '../models/father.model.js';
import { Chicken } from '../models/chicken.model.js';

export const getFathers = async (req: any, res: Response) => {
  try {
    const fathers = await Father.find({ user: req.user.id }).populate('user', 'name farmName farmCode isVerified profileImage coverImage phone lineId facebook address description');
    res.json(fathers);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getFatherById = async (req: any, res: Response) => {
  try {
    const father = await Father.findOne({ _id: req.params.id, user: req.user.id });
    if (!father) return res.status(404).json({ message: 'ไม่พบข้อมูลพ่อไก่' });
    res.json(father);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createFather = async (req: any, res: Response) => {
  try {
    const { code, name, breed, color, bandNumber, bandColor, records, hatchDate, status, image } = req.body;
    const father = new Father({
      user: req.user.id,
      code,
      name,
      breed: breed || 'ไม่ระบุ',
      color: color || 'ไม่ระบุ',
      bandNumber,
      bandColor,
      records: records || req.body.notes,
      hatchDate,
      status: status || 'ปกติ',
      image
    });
    const savedFather = await father.save();

    // Sync to Chicken collection for global pedigree linkage
    try {
      await Chicken.findOneAndUpdate(
        { code: code.toUpperCase(), user: req.user.id },
        {
          code: code.toUpperCase(),
          name,
          gender: 'male',
          bloodline: breed,
          bandNumber,
          bandColor,
          fatherNameText: req.body.fatherNameText,
          motherNameText: req.body.motherNameText,
          notes: records,
          status: status,
          saleInfo: savedFather.saleInfo,
          image,
          user: req.user.id
        },
        { upsert: true, new: true }
      );
    } catch (syncErr) {
      console.error('Auto sync to Chicken error:', syncErr);
    }

    res.status(201).json(savedFather);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const updateFather = async (req: any, res: Response) => {
  try {
    // Map unified frontend fields to schema fields
    if (req.body.notes !== undefined) {
      req.body.records = req.body.notes;
    }
    if (req.body.bloodline !== undefined && !req.body.breed) {
      req.body.breed = req.body.bloodline;
    }

    const oldFather = await Father.findOne({ _id: req.params.id, user: req.user.id });

    const updatedFather = await Father.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!updatedFather) return res.status(404).json({ message: 'ไม่พบข้อมูลพ่อไก่' });

    // If code was changed, delete the old orphaned record from Chicken collection
    if (oldFather && oldFather.code !== updatedFather.code) {
      try {
        await Chicken.deleteMany({ code: oldFather.code.toUpperCase(), user: req.user.id });
      } catch (err) {
        console.error('Error deleting orphaned Chicken:', err);
      }
    }

    // Sync update to Chicken collection
    if (updatedFather.code) {
      try {
        await Chicken.findOneAndUpdate(
          { code: updatedFather.code.toUpperCase(), user: req.user.id },
          {
            code: updatedFather.code.toUpperCase(),
            name: updatedFather.name,
            gender: 'male',
            bloodline: updatedFather.breed,
            bandNumber: updatedFather.bandNumber,
            bandColor: updatedFather.bandColor,
            bandText: updatedFather.bandText,
            fatherNameText: updatedFather.fatherNameText,
            motherNameText: updatedFather.motherNameText,
            notes: updatedFather.records,
            status: updatedFather.status,
            saleInfo: updatedFather.saleInfo,
            image: updatedFather.image,
            user: req.user.id
          },
          { upsert: true, new: true }
        );
      } catch (syncErr) {
        console.error('Auto sync updated father to Chicken error:', syncErr);
      }
    }

    res.json(updatedFather);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteFather = async (req: any, res: Response) => {
  try {
    const deletedFather = await Father.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deletedFather) return res.status(404).json({ message: 'ไม่พบข้อมูลพ่อไก่' });

    if (deletedFather.code) {
      await Chicken.deleteMany({ code: deletedFather.code.toUpperCase(), user: req.user.id });
    }

    res.json({ message: 'ลบข้อมูลพ่อไก่เรียบร้อยแล้ว' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getPromotedFathers = async (req: any, res: Response) => {
  try {
    const promoted = await Father.find({
      isPromoted: true,
      promotedUntil: { $gte: new Date() }
    }).populate('user', 'name farmName farmCode isVerified profileImage coverImage phone lineId facebook address description');
    
    // Separate into VIP and Standard
    const vips = promoted.filter(f => f.promotionTier === 'vip');
    const standards = promoted.filter(f => f.promotionTier !== 'vip');

    // Fair Rotation (Shuffle arrays randomly)
    const shuffledVips = vips.sort(() => 0.5 - Math.random());
    const shuffledStandards = standards.sort(() => 0.5 - Math.random());
    
    // Combine them (VIPs always on top)
    const sorted = [...shuffledVips, ...shuffledStandards];
    
    res.json(sorted);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};