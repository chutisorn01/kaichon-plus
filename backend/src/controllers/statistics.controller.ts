import { Request, Response } from 'express';
import { Father } from '../models/father.model.js';
import { Mother } from '../models/mother.model.js';
import { Chick } from '../models/chick.model.js';
import { BreedingBatch } from '../models/breedingBatch.model.js';

export const getFarmStatistics = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // 1. Population Stats
    const totalFathers = await Father.countDocuments({ user: userId });
    const totalMothers = await Mother.countDocuments({ user: userId });
    
    const chicksMale = await Chick.countDocuments({ user: userId, gender: 'ผู้' });
    const chicksFemale = await Chick.countDocuments({ user: userId, gender: 'เมีย' });
    const chicksUnknown = await Chick.countDocuments({ user: userId, gender: 'ยังไม่ระบุ' });

    // 2. Top Fathers (Aggregation)
    const topFathers = await Chick.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$father', chickCount: { $sum: 1 } } },
      { $sort: { chickCount: -1 } },
      { $limit: 3 },
      { $lookup: { from: 'fathers', localField: '_id', foreignField: '_id', as: 'fatherData' } },
      { $unwind: '$fatherData' },
      { $project: { _id: 1, name: '$fatherData.name', code: '$fatherData.code', chickCount: 1 } }
    ]);

    // 3. Top Mothers (Aggregation)
    const topMothers = await Chick.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$mother', chickCount: { $sum: 1 } } },
      { $sort: { chickCount: -1 } },
      { $limit: 3 },
      { $lookup: { from: 'mothers', localField: '_id', foreignField: '_id', as: 'motherData' } },
      { $unwind: '$motherData' },
      { $project: { _id: 1, name: '$motherData.name', code: '$motherData.code', chickCount: 1 } }
    ]);

    // 4. Monthly Batches this year
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    const monthlyBatches = await BreedingBatch.aggregate([
      { 
        $match: { 
          user: userId,
          breedingDate: { $gte: startOfYear, $lte: endOfYear }
        }
      },
      {
        $group: {
          _id: { $month: '$breedingDate' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format monthly data for chart (Jan-Dec)
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const monthBatch = monthlyBatches.find(b => b._id === i + 1);
      const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
      return {
        name: months[i],
        batches: monthBatch ? monthBatch.count : 0
      };
    });

    res.status(200).json({
      success: true,
      data: {
        population: {
          fathers: totalFathers,
          mothers: totalMothers,
          chicks: {
            male: chicksMale,
            female: chicksFemale,
            unknown: chicksUnknown,
            total: chicksMale + chicksFemale + chicksUnknown
          }
        },
        topFathers,
        topMothers,
        monthlyBatches: monthlyData
      }
    });

  } catch (error: any) {
    console.error('Error fetching farm statistics:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
