import { Request, Response } from 'express';
import { Chick } from '../models/chick.model';

export const getChicks = async (req: any, res: Response) => {
  try {
    const chicks = await Chick.find({ user: req.user.id })
      .populate('father', 'name code')
      .populate('mother', 'name code')
      .populate('batch', 'batchCode');
    res.json(chicks);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getChickById = async (req: any, res: Response) => {
  try {
    const chick = await Chick.findOne({ _id: req.params.id, user: req.user.id })
      .populate('father')
      .populate('mother')
      .populate('batch');
    if (!chick) return res.status(404).json({ message: 'ไม่พบข้อมูลลูกไก่' });
    res.json(chick);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createChick = async (req: any, res: Response) => {
  try {
    const chick = new Chick({
      ...req.body,
      user: req.user.id
    });
    const savedChick = await chick.save();
    res.status(201).json(savedChick);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const updateChick = async (req: any, res: Response) => {
  try {
    const updatedChick = await Chick.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!updatedChick) return res.status(404).json({ message: 'ไม่พบข้อมูลลูกไก่' });
    res.json(updatedChick);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteChick = async (req: any, res: Response) => {
  try {
    const deletedChick = await Chick.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deletedChick) return res.status(404).json({ message: 'ไม่พบข้อมูลลูกไก่' });
    res.json({ message: 'ลบข้อมูลลูกไก่เรียบร้อยแล้ว' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getSiblings = async (req: any, res: Response) => {
  try {
    const chick = await Chick.findOne({ _id: req.params.id, user: req.user.id });
    if (!chick) return res.status(404).json({ message: 'ไม่พบข้อมูลลูกไก่' });
    
    // Siblings are chicks from the same batch (excluding self)
    const siblings = await Chick.find({
      batch: chick.batch,
      _id: { $ne: chick._id },
      user: req.user.id
    });
    res.json(siblings);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};