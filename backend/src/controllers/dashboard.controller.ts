import { Request, Response } from 'express';
import { Chicken } from '../models/chicken.model.js';
import { Father } from '../models/father.model.js';
import { Mother } from '../models/mother.model.js';
import { Chick } from '../models/chick.model.js';
import { BreedingBatch } from '../models/breedingBatch.model.js';

export const getDashboardCounts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Run all counts in parallel for maximum speed
    const [totalChickens, totalFathers, totalMothers, totalChicks, totalBatches] = await Promise.all([
      Chicken.countDocuments({ user: userId }),
      Father.countDocuments({ user: userId }),
      Mother.countDocuments({ user: userId }),
      Chick.countDocuments({ user: userId }),
      BreedingBatch.countDocuments({ user: userId })
    ]);

    res.status(200).json({
      success: true,
      data: {
        chickens: totalChickens,
        fathers: totalFathers,
        mothers: totalMothers,
        chicks: totalChicks,
        batches: totalBatches
      }
    });

  } catch (error: any) {
    console.error('Error fetching dashboard counts:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
