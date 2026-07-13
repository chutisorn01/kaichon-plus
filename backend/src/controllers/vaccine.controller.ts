import { Request, Response } from 'express';
import { Chick } from '../models/chick.model.js';
import { Chicken } from '../models/chicken.model.js';

const VACCINE_SCHEDULE = [
  { name: 'นิวคาสเซิล + หลอดลมอักเสบ (รอบ 1)', days: 7, type: 'หยอดตา/จมูก' },
  { name: 'ฝีดาษไก่', days: 14, type: 'แทงปีก' },
  { name: 'นิวคาสเซิล + หลอดลมอักเสบ (รอบ 2)', days: 28, type: 'หยอดตา/จมูก' },
  { name: 'อหิวาต์เป็ดไก่', days: 60, type: 'ฉีดกล้ามเนื้อ' }
];

export const getVaccineSchedule = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    // Fetch all chicks and chickens with hatchDate
    const chicks = await Chick.find({ user: userId, hatchDate: { $exists: true, $ne: null } })
      .populate('batch', 'batchCode')
      .lean();
    const chickens = await Chicken.find({ user: userId, hatchDate: { $exists: true, $ne: null } }).lean();

    const allBirds = [
      ...chicks.map(c => ({ ...c, type: 'Chick', batchCode: (c.batch as any)?.batchCode, batchId: (c.batch as any)?._id })),
      ...chickens.map(c => ({ ...c, type: 'Chicken' }))
    ];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    const schedule: any[] = [];

    allBirds.forEach((bird: any) => {
      const hatchDate = new Date(bird.hatchDate);
      hatchDate.setHours(0, 0, 0, 0);

      const completed = bird.completedVaccines || [];
      const completedNames = completed.map((v: any) => v.vaccineName);

      VACCINE_SCHEDULE.forEach(vaccine => {
        // Skip if already completed
        if (completedNames.includes(vaccine.name)) return;

        const targetDate = new Date(hatchDate);
        targetDate.setDate(hatchDate.getDate() + vaccine.days);

        // Determine status
        let status = '';
        const diffTime = targetDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          status = 'overdue';
        } else if (diffDays === 0) {
          status = 'today';
        } else if (diffDays > 0 && diffDays <= 7) {
          status = 'upcoming';
        }

        if (status) {
          schedule.push({
            id: `${bird._id}-${vaccine.name}`, // unique key
            chickenId: bird._id,
            chickenType: bird.type,
            chickenName: bird.name,
            chickenCode: bird.code || bird.bandNumber || 'ไม่มีรหัส',
            gender: bird.gender,
            batchId: bird.batchId || null,
            batchCode: bird.batchCode || null,
            vaccineName: vaccine.name,
            method: vaccine.type,
            targetDate: targetDate,
            daysOverdue: diffDays < 0 ? Math.abs(diffDays) : 0,
            status: status
          });
        }
      });
    });

    // Sort by targetDate ascending
    schedule.sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime());

    res.json({
      status: 'success',
      data: schedule
    });

  } catch (error: any) {
    console.error('Get Vaccine Schedule Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const markVaccineCompleted = async (req: any, res: Response) => {
  try {
    const { chickenIds, vaccineName, date } = req.body;
    const userId = req.user.id;

    if (!chickenIds || !Array.isArray(chickenIds) || chickenIds.length === 0 || !vaccineName) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields or chickenIds must be an array' });
    }

    const completedEntry = {
      vaccineName,
      date: date ? new Date(date) : new Date()
    };

    // Update chicks
    await Chick.updateMany(
      { _id: { $in: chickenIds }, user: userId },
      { $push: { completedVaccines: completedEntry } }
    );

    // Update chickens
    await Chicken.updateMany(
      { _id: { $in: chickenIds }, user: userId },
      { $push: { completedVaccines: completedEntry } }
    );

    res.json({ status: 'success', message: 'บันทึกการทำวัคซีนสำเร็จ' });
  } catch (error: any) {
    console.error('Mark Vaccine Completed Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
