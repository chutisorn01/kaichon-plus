import { Request, Response, NextFunction } from 'express';
import { Chick } from '../models/chick.model';

export const getChicks = async (req: any, res: Response, next: NextFunction) => {
  try {
    const chicks = await Chick.find({ user: req.user.id })
      .populate('father', 'name code bloodline breed')
      .populate('mother', 'name code bloodline breed')
      .populate('batch', 'batchCode')
      .populate('user', 'name farmName farmCode isVerified profileImage coverImage phone lineId facebook address description')
      .lean();

    const mappedChicks = chicks.map(c => {
      let parentBloodline = (c as any).bloodline || '';
      if (!(c as any).bloodline) {
        const f = c.father as any;
        const m = c.mother as any;
        const fBlood = f?.bloodline || f?.breed || '';
        const mBlood = m?.bloodline || m?.breed || '';
        
        if (fBlood && mBlood) {
          if (fBlood === mBlood) {
            parentBloodline = fBlood;
          } else {
            parentBloodline = `${fBlood}-${mBlood}`;
          }
        } else if (fBlood || mBlood) {
          parentBloodline = fBlood || mBlood;
        } else {
          parentBloodline = 'กำลังพัฒนา';
        }
      }
      return {
        ...c,
        bloodline: parentBloodline
      };
    });

    res.json(mappedChicks);
  } catch (err: any) {
    next(err);
  }
};

export const getChickById = async (req: any, res: Response, next: NextFunction) => {
  try {
    const chick = await Chick.findById(req.params.id)
      .populate('father')
      .populate('mother')
      .populate('batch');
    if (!chick) return res.status(404).json({ message: 'ไม่พบข้อมูลลูกไก่' });
    res.json(chick);
  } catch (err: any) {
    next(err);
  }
};

export const createChick = async (req: any, res: Response, next: NextFunction) => {
  try {
    const chick = new Chick({
      ...req.body,
      user: req.user.id
    });
    const savedChick = await chick.save();
    res.status(201).json(savedChick);
  } catch (err: any) {
    next(err);
  }
};

export const updateChick = async (req: any, res: Response, next: NextFunction) => {
  try {
    const updatedChick = await Chick.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!updatedChick) return res.status(404).json({ message: 'ไม่พบข้อมูลลูกไก่' });
    res.json(updatedChick);
  } catch (err: any) {
    next(err);
  }
};

export const deleteChick = async (req: any, res: Response, next: NextFunction) => {
  try {
    const deletedChick = await Chick.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deletedChick) return res.status(404).json({ message: 'ไม่พบข้อมูลลูกไก่' });
    res.json({ message: 'ลบข้อมูลลูกไก่เรียบร้อยแล้ว' });
  } catch (err: any) {
    next(err);
  }
};

export const getSiblings = async (req: any, res: Response) => {
  try {
    const chick = await Chick.findById(req.params.id);
    if (!chick) return res.status(404).json({ message: 'ไม่พบข้อมูลลูกไก่' });
    
    // Siblings are chicks from the same batch (excluding self)
    const siblings = await Chick.find({
      batch: chick.batch,
      _id: { $ne: chick._id }
    });
    res.json(siblings);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};