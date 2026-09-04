import { Request, Response } from 'express';
import { Father } from '../models/father.model.js';
import { Mother } from '../models/mother.model.js';
import { Chick } from '../models/chick.model.js';
import { Chicken } from '../models/chicken.model.js';
import { Expense } from '../models/expense.model.js';
import { BreedingBatch } from '../models/breedingBatch.model.js';

export const getFarmStatistics = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;

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
      { $limit: 5 },
      { $lookup: { from: 'fathers', localField: '_id', foreignField: '_id', as: 'fatherData' } },
      { $unwind: '$fatherData' },
      { $project: { _id: 1, name: '$fatherData.name', code: '$fatherData.code', chickCount: 1 } }
    ]);

    // 3. Top Mothers (Aggregation)
    const topMothers = await Chick.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$mother', chickCount: { $sum: 1 } } },
      { $sort: { chickCount: -1 } },
      { $limit: 5 },
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

    // 5. Band Color Distribution
    const bandColorStats = await Chick.aggregate([
      { $match: { user: userId, bandColor: { $exists: true, $nin: [null, ''] } } },
      { $group: { _id: '$bandColor', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 6. Average Chicks Per Batch
    const totalBatches = await BreedingBatch.countDocuments({ user: userId });
    const totalChicks = chicksMale + chicksFemale + chicksUnknown;
    const avgChicksPerBatch = totalBatches > 0 ? (totalChicks / totalBatches).toFixed(1) : '0';

    
    // 7. Finance / Sales
    const soldChicks = await Chick.find({ user: userId, status: 'ขายแล้ว', 'saleInfo.price': { $exists: true } })
      .select('name code bandNumber saleInfo updatedAt')
      .lean();
      
    const soldChickens = await Chicken.find({ user: userId, status: 'ขายแล้ว', 'saleInfo.price': { $exists: true } })
      .select('name code bandNumber saleInfo updatedAt')
      .lean();

    const allSales = [...soldChicks, ...soldChickens].map((item: any) => ({
      _id: item._id,
      name: item.name,
      code: item.code || item.bandNumber || '-',
      customerName: item.saleInfo?.customerName || '-',
      date: item.saleInfo?.saleDate || item.updatedAt,
      amount: item.saleInfo?.price || 0,
      type: 'sale'
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const totalIncome = allSales.reduce((sum, item) => sum + item.amount, 0);

    const expenses = await Expense.find({ user: userId }).sort({ date: -1 }).lean();
    const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

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
            total: totalChicks
          }
        },
        topFathers,
        topMothers,
        monthlyBatches: monthlyData,
        bandColorStats: bandColorStats.map(b => ({ color: b._id, count: b.count })),
        totalBatches,
        avgChicksPerBatch,
        finance: {
          totalIncome,
          totalExpense,
          netProfit: totalIncome - totalExpense,
          salesHistory: allSales,
          expensesHistory: expenses
        }
      }
    });
  } catch (error: any) {

    console.error('Error fetching farm statistics:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
