import { Request, Response } from 'express';
import { VipBreeding } from '../models/vipBreeding.model.js';
import { Mother } from '../models/mother.model.js';
import { BreedingBatch } from '../models/breedingBatch.model.js';
import { Chick } from '../models/chick.model.js';

export const createVipBreeding = async (req: Request, res: Response) => {
  try {
    // Only VIP users can create VIP breeding records
    if (!(req.user as any)?.isVIP) {
      return res.status(403).json({ success: false, message: 'VIP access required' });
    }

    const vipBreeding = new VipBreeding({
      ...req.body,
      user: (req as any).user?._id,
    });
    
    await vipBreeding.save();
    res.status(201).json({ success: true, data: vipBreeding });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getVipBreedings = async (req: Request, res: Response) => {
  try {
    if (!(req.user as any)?.isVIP) {
      return res.status(403).json({ success: false, message: 'VIP access required' });
    }

    const breedings = await VipBreeding.find({ user: (req as any).user?._id })
      .populate('father', 'name code')
      .sort({ createdAt: -1 });
      
    res.status(200).json({ success: true, count: breedings.length, data: breedings });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateVipBreeding = async (req: Request, res: Response) => {
  try {
    let vipBreeding = await VipBreeding.findById(req.params.id);

    if (!vipBreeding) {
      return res.status(404).json({ success: false, message: 'VIP breeding record not found' });
    }

    // Ensure user owns the record
    if (vipBreeding.user.toString() !== (req as any).user?._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this record' });
    }

    vipBreeding = await VipBreeding.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: vipBreeding });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteVipBreeding = async (req: Request, res: Response) => {
  try {
    const vipBreeding = await VipBreeding.findById(req.params.id);

    if (!vipBreeding) {
      return res.status(404).json({ success: false, message: 'VIP breeding record not found' });
    }

    if (vipBreeding.user.toString() !== (req as any).user?._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this record' });
    }

    await vipBreeding.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const generateChicks = async (req: Request, res: Response) => {
  try {
    const vipBreeding = await VipBreeding.findById(req.params.id);

    if (!vipBreeding) {
      return res.status(404).json({ success: false, message: 'VIP breeding record not found' });
    }

    if (vipBreeding.user.toString() !== (req as any).user?._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to generate chicks for this record' });
    }

    if (vipBreeding.isChicksGenerated) {
      return res.status(400).json({ success: false, message: 'Chicks already generated for this record' });
    }

    if (!vipBreeding.chickQuantity || vipBreeding.chickQuantity <= 0) {
      return res.status(400).json({ success: false, message: 'No chicks to generate' });
    }

    // 1. Find or create dummy mother
    const dummyMotherName = `${vipBreeding.motherName} (VIP)`;
    let mother = await Mother.findOne({ name: dummyMotherName, user: vipBreeding.user });
    if (!mother) {
      mother = new Mother({
        user: vipBreeding.user,
        code: `VIP-M-${Date.now().toString().slice(-6)}`,
        name: dummyMotherName,
        source: 'ไก่ฟาร์มอื่น (ลูกค้า VIP)',
        status: 'ปกติ',
        originFarm: vipBreeding.user // Assuming the user is the farm
      });
      await mother.save();
    }

    // 2. Create dummy batch
    const batchCode = `VIP-B-${vipBreeding.queueNo}-${Date.now().toString().slice(-4)}`;
    const batch = new BreedingBatch({
      user: vipBreeding.user,
      batchCode,
      father: vipBreeding.father,
      mother: mother._id,
      matingDate: vipBreeding.breedingStartDate,
      status: 'ฟักสำเร็จ',
      eggCount: vipBreeding.eggCount,
      fertileEggs: vipBreeding.fertileEggs,
      hatchDate: vipBreeding.hatchDate,
      chickQuantity: vipBreeding.chickQuantity,
      chicksGenerated: true
    });
    await batch.save();

    // 3. Generate chicks
    const chicksToCreate = [];
    for (let i = 1; i <= vipBreeding.chickQuantity; i++) {
      const chickCode = `C-${batchCode}-${i.toString().padStart(2, '0')}`;
      chicksToCreate.push({
        user: vipBreeding.user,
        batch: batch._id,
        father: vipBreeding.father,
        mother: mother._id,
        code: chickCode,
        name: `ลูกไก่ VIP คิว ${vipBreeding.queueNo} ตัวที่ ${i}`,
        gender: 'ยังไม่ระบุ',
        hatchDate: vipBreeding.hatchDate,
        status: 'ปกติ'
      });
    }

    await Chick.insertMany(chicksToCreate);

    // 4. Mark VIP record as generated
    vipBreeding.isChicksGenerated = true;
    await vipBreeding.save();

    res.status(200).json({ success: true, message: 'Chicks generated successfully', count: chicksToCreate.length });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
