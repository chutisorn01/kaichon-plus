import { Request, Response } from 'express';
import { Father } from '../models/father.model';
import { Chicken } from '../models/chicken.model';

export const getFathers = async (req: any, res: Response) => {
  try {
    const fathers = await Father.find({ user: req.user.id });
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
      breed,
      color,
      bandNumber,
      bandColor,
      records,
      hatchDate,
      status,
      image
    });
    const savedFather = await father.save();

    // Sync to Chicken collection for global pedigree linkage
    try {
      await Chicken.findOneAndUpdate(
        { code: code.toUpperCase() },
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

    const updatedFather = await Father.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!updatedFather) return res.status(404).json({ message: 'ไม่พบข้อมูลพ่อไก่' });

    // Sync update to Chicken collection
    if (updatedFather.code) {
      try {
        await Chicken.findOneAndUpdate(
          { code: updatedFather.code.toUpperCase() },
          {
            code: updatedFather.code.toUpperCase(),
            name: updatedFather.name,
            gender: 'male',
            bloodline: updatedFather.breed,
            bandNumber: updatedFather.bandNumber,
            bandColor: updatedFather.bandColor,
            fatherNameText: updatedFather.fatherNameText,
            motherNameText: updatedFather.motherNameText,
            notes: updatedFather.records,
            status: updatedFather.status,
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
      await Chicken.deleteMany({ code: deletedFather.code.toUpperCase() });
    }

    res.json({ message: 'ลบข้อมูลพ่อไก่เรียบร้อยแล้ว' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};