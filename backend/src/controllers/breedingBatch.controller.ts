import { Response, NextFunction } from 'express';
import { BreedingBatch } from '../models/breedingBatch.model';
import { Chick } from '../models/chick.model';

export const createBreedingBatch = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { batchCode, father, mother, breedingDate, chicks } = req.body;
    
    const batch = await BreedingBatch.create({
      user: req.user.id,
      batchCode,
      father,
      mother,
      breedingDate,
      notes: req.body.notes
    });

    if (chicks && chicks.length > 0) {
      const chickData = chicks.map((chick: any, index: number) => ({
        user: req.user.id,
        batch: batch._id,
        father: father,
        mother: mother,
        code: chick.code || `${batchCode}-${String(index + 1).padStart(2, '0')}`,
        name: chick.name || 'ลูกไก่',
        gender: chick.gender || 'ยังไม่ระบุ',
        bandColor: chick.bandColor,
        bandNumber: chick.bandNumber,
        bandText: chick.bandText,
        status: 'ปกติ'
      }));
      await Chick.insertMany(chickData);
    }

    res.status(201).json(batch);
  } catch (error) {
    next(error);
  }
};

export const getBreedingBatches = async (req: any, res: Response, next: NextFunction) => {
  try {
    const batches = await BreedingBatch.find({ user: req.user.id })
      .populate('father', 'name code')
      .populate('mother', 'name code source')
      .sort({ createdAt: -1 });
    res.json(batches);
  } catch (error) {
    next(error);
  }
};

export const getBreedingBatchById = async (req: any, res: Response, next: NextFunction) => {
  try {
    const batch = await BreedingBatch.findOne({ _id: req.params.id, user: req.user.id })
      .populate('father')
      .populate('mother');
    if (!batch) return res.status(404).json({ message: 'ไม่พบข้อมูลชุดการผสม' });
    
    const chicks = await Chick.find({ batch: batch._id, user: req.user.id });
    
    res.json({ batch, chicks });
  } catch (error) {
    next(error);
  }
};

export const deleteBreedingBatch = async (req: any, res: Response, next: NextFunction) => {
  try {
    const deletedBatch = await BreedingBatch.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deletedBatch) return res.status(404).json({ message: 'ไม่พบข้อมูลชุดการผสม' });
    
    await Chick.deleteMany({ batch: deletedBatch._id, user: req.user.id });
    
    res.json({ message: 'ลบข้อมูลชุดการผสมและลูกไก่ที่เกี่ยวข้องเรียบร้อยแล้ว' });
  } catch (error) {
    next(error);
  }
};

export const updateBreedingBatch = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { batchCode, father, mother, breedingDate, notes, isArchived } = req.body;
    const updatedBatch = await BreedingBatch.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { batchCode, father, mother, breedingDate, notes, isArchived },
      { new: true }
    );
    if (!updatedBatch) return res.status(404).json({ message: 'ไม่พบข้อมูลชุดการผสม' });
    res.json(updatedBatch);
  } catch (error) {
    next(error);
  }
};
