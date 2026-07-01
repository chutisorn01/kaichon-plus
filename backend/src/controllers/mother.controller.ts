import { Request, Response } from 'express';
import { Mother } from '../models/mother.model';
import { Chicken } from '../models/chicken.model';

export const getMothers = async (req: any, res: Response) => {
  try {
    const mothers = await Mother.find({ user: req.user.id });
    res.json(mothers);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getMotherById = async (req: any, res: Response) => {
  try {
    const mother = await Mother.findOne({ _id: req.params.id, user: req.user.id });
    if (!mother) return res.status(404).json({ message: 'ไม่พบข้อมูลแม่ไก่' });
    res.json(mother);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createMother = async (req: any, res: Response) => {
  try {
    const { code, name, breed, color, bandNumber, bandColor, hatchDate, status, image } = req.body;
    const mother = new Mother({
      user: req.user.id,
      code,
      name,
      breed,
      color,
      bandNumber,
      bandColor,
      hatchDate,
      status,
      image
    });
    const savedMother = await mother.save();

    // Sync to Chicken collection for global pedigree linkage
    try {
      await Chicken.findOneAndUpdate(
        { code: code.toUpperCase() },
        {
          code: code.toUpperCase(),
          name,
          gender: 'female',
          bloodline: breed,
          bandNumber,
          bandColor,
          image,
          user: req.user.id
        },
        { upsert: true, new: true }
      );
    } catch (syncErr) {
      console.error('Auto sync mother to Chicken error:', syncErr);
    }

    res.status(201).json(savedMother);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const updateMother = async (req: any, res: Response) => {
  try {
    const updatedMother = await Mother.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!updatedMother) return res.status(404).json({ message: 'ไม่พบข้อมูลแม่ไก่' });

    // Sync update to Chicken collection
    if (updatedMother.code) {
      try {
        await Chicken.findOneAndUpdate(
          { code: updatedMother.code.toUpperCase() },
          {
            code: updatedMother.code.toUpperCase(),
            name: updatedMother.name,
            gender: 'female',
            bloodline: updatedMother.breed,
            bandNumber: updatedMother.bandNumber,
            bandColor: updatedMother.bandColor,
            image: updatedMother.image,
            user: req.user.id
          },
          { upsert: true, new: true }
        );
      } catch (syncErr) {
        console.error('Auto sync updated mother to Chicken error:', syncErr);
      }
    }

    res.json(updatedMother);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteMother = async (req: any, res: Response) => {
  try {
    const deletedMother = await Mother.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deletedMother) return res.status(404).json({ message: 'ไม่พบข้อมูลแม่ไก่' });

    if (deletedMother.code) {
      await Chicken.deleteMany({ code: deletedMother.code.toUpperCase() });
    }

    res.json({ message: 'ลบข้อมูลแม่ไก่เรียบร้อยแล้ว' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};