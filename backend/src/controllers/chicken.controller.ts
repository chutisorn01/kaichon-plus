import { Request, Response, NextFunction } from 'express';
import { Chicken } from '../models/chicken.model.js';
import { Father } from '../models/father.model.js';
import { Mother } from '../models/mother.model.js';
import { AppError } from '../middleware/error.middleware.js';

// Recursive helper to build pedigree tree
const buildPedigreeTree = async (chickenId: any, depth = 1, maxDepth = 3): Promise<any> => {
  if (!chickenId || depth > maxDepth) return null;

  const chicken = await Chicken.findById(chickenId)
    .select('code name gender bloodline father mother')
    .lean();

  if (!chicken) return null;

  const fatherTree = chicken.father
    ? await buildPedigreeTree(chicken.father, depth + 1, maxDepth)
    : null;
  const motherTree = chicken.mother
    ? await buildPedigreeTree(chicken.mother, depth + 1, maxDepth)
    : null;

  return {
    id: chicken._id,
    code: chicken.code,
    name: chicken.name,
    gender: chicken.gender,
    bloodline: chicken.bloodline,
    father: fatherTree,
    mother: motherTree,
  };
};

// Helper to detect circular references in pedigree tree
const detectCircularReference = async (
  chickenId: string,
  parentCandidateId: string
): Promise<boolean> => {
  // If the candidate parent is the chicken itself, it's circular
  if (chickenId === parentCandidateId) return true;

  // Traverse candidate's ancestry to see if chickenId exists in it
  const parentCandidate = await Chicken.findById(parentCandidateId);
  if (!parentCandidate) return false;

  const visited = new Set<string>();
  const queue: string[] = [];

  if (parentCandidate.father) queue.push(parentCandidate.father.toString());
  if (parentCandidate.mother) queue.push(parentCandidate.mother.toString());

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (currentId === chickenId) return true; // Circular path found!
    if (!visited.has(currentId)) {
      visited.add(currentId);
      const curr = await Chicken.findById(currentId);
      if (curr) {
        if (curr.father) queue.push(curr.father.toString());
        if (curr.mother) queue.push(curr.mother.toString());
      }
    }
  }

  return false;
};

// Get all chickens with search and filters
export const getAllChickens = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, gender } = req.query;
    const filter: any = {};

    if (gender === 'male' || gender === 'female') {
      filter.gender = gender;
    }

    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      filter.$or = [
        { code: searchRegex },
        { name: searchRegex },
        { bloodline: searchRegex },
        { bandNumber: searchRegex },
        { bandText: searchRegex },
      ];
    }

    const chickens = await Chicken.find(filter)
      .populate('father', 'code name')
      .populate('mother', 'code name')
      .populate('user', 'name farmName farmCode isVerified')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: chickens.length,
      data: chickens,
    });
  } catch (error) {
    next(error);
  }
};

// Get single chicken
export const getChickenById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const chicken = await Chicken.findById(req.params.id)
      .populate('father', 'code name gender bloodline')
      .populate('mother', 'code name gender bloodline');

    if (!chicken) {
      return next(new AppError('Chicken not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: chicken,
    });
  } catch (error) {
    next(error);
  }
};

// Get Pedigree Tree for a chicken
export const getChickenPedigree = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const chicken = await Chicken.findById(req.params.id);
    if (!chicken) {
      return next(new AppError('Chicken not found', 404));
    }

    const pedigree = await buildPedigreeTree(chicken._id);

    res.status(200).json({
      status: 'success',
      data: pedigree,
    });
  } catch (error) {
    next(error);
  }
};

// Get eligible parents options for registration dropdowns
export const getParentsOptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fathers = await Chicken.find({ gender: 'male' }).select('code name');
    const mothers = await Chicken.find({ gender: 'female' }).select('code name');

    res.status(200).json({
      status: 'success',
      data: {
        fathers,
        mothers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Register a new chicken
export const registerChicken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, name, gender, bloodline, breed, color, hatchDate, bandColor, bandNumber, bandText, father, mother, notes, image } = req.body;

    // Check if chicken code already exists
    const existing = await Chicken.findOne({ code: code.toUpperCase() });
    if (existing) {
      return next(new AppError(`รหัสไก่ชน ${code} มีอยู่ในระบบแล้ว กรุณาใช้รหัสอื่น`, 400));
    }

    const newChicken = await Chicken.create({
      user: (req as any).user?.id,
      code: code.toUpperCase(),
      name,
      gender,
      bloodline: bloodline || breed || 'ไก่ชนสายเลือดดี',
      breed,
      color,
      hatchDate,
      bandColor,
      bandNumber,
      bandText,
      notes,
      image,
      father: father && father.match(/^[0-9a-fA-F]{24}$/) ? father : null,
      mother: mother && mother.match(/^[0-9a-fA-F]{24}$/) ? mother : null,
    });

    // 2-Way Automated Sync to Father/Mother Collections
    try {
      if (gender === 'male') {
        await Father.findOneAndUpdate(
          { code: code.toUpperCase() },
          {
            user: (req as any).user?.id,
            code: code.toUpperCase(),
            name,
            breed: breed || bloodline || 'พ่อพันธุ์',
            color: color || 'เพลิง/แดง',
            bandNumber,
            bandColor,
            records: notes
          },
          { upsert: true, new: true }
        );
      } else if (gender === 'female') {
        await Mother.findOneAndUpdate(
          { code: code.toUpperCase() },
          {
            user: (req as any).user?.id,
            code: code.toUpperCase(),
            name,
            breed: breed || bloodline || 'แม่พันธุ์',
            color: color || 'สา/เหลือง',
            bandNumber,
            bandColor
          },
          { upsert: true, new: true }
        );
      }
    } catch (syncErr) {
      console.error('2-Way Sync to Father/Mother error:', syncErr);
    }

    res.status(201).json({
      status: 'success',
      data: newChicken,
    });
  } catch (error) {
    next(error);
  }
};

// Update existing chicken details
export const updateChicken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, name, gender, bloodline, breed, color, bandNumber, bandColor, notes, status, father, mother, image } = req.body;
    const chickenId = req.params.id;

    const chicken = await Chicken.findById(chickenId);
    if (!chicken) {
      return next(new AppError('Chicken not found', 404));
    }

    // Prevent changing gender if chicken is already a parent of others
    if (gender && gender !== chicken.gender) {
      const isParent = await Chicken.findOne({
        $or: [{ father: chickenId }, { mother: chickenId }],
      });
      if (isParent) {
        return next(new AppError('Cannot change gender because this chicken is already registered as a parent of another chicken', 400));
      }
    }

    // Validate Father
    if (father) {
      if (father === chickenId) {
        return next(new AppError('A chicken cannot be its own father', 400));
      }
      const fatherChicken = await Chicken.findById(father);
      if (!fatherChicken) {
        return next(new AppError('Specified father chicken does not exist', 400));
      }
      if (fatherChicken.gender !== 'male') {
        return next(new AppError(`Father chicken must be male (selected chicken is ${fatherChicken.gender})`, 400));
      }
      // Circular check
      const isCircular = await detectCircularReference(chickenId, father);
      if (isCircular) {
        return next(new AppError('Circular pedigree reference detected: This chicken is an ancestor of the proposed father', 400));
      }
    }

    // Validate Mother
    if (mother) {
      if (mother === chickenId) {
        return next(new AppError('A chicken cannot be its own mother', 400));
      }
      const motherChicken = await Chicken.findById(mother);
      if (!motherChicken) {
        return next(new AppError('Specified mother chicken does not exist', 400));
      }
      if (motherChicken.gender !== 'female') {
        return next(new AppError(`Mother chicken must be female (selected chicken is ${motherChicken.gender})`, 400));
      }
      // Circular check
      const isCircular = await detectCircularReference(chickenId, mother);
      if (isCircular) {
        return next(new AppError('Circular pedigree reference detected: This chicken is an ancestor of the proposed mother', 400));
      }
    }


    chicken.code = code ? code.toUpperCase() : chicken.code;
    chicken.name = name || chicken.name;
    chicken.gender = gender || chicken.gender;
    chicken.bloodline = bloodline || breed || chicken.bloodline;
    if (breed) chicken.breed = breed;
    if (color) chicken.color = color;
    if (bandNumber !== undefined) chicken.bandNumber = bandNumber;
    if (bandColor !== undefined) chicken.bandColor = bandColor;
    if (notes !== undefined) chicken.notes = notes;
    if (status !== undefined) chicken.status = status;
    if (image !== undefined) (chicken as any).image = image;
    chicken.father = father !== undefined ? (father || null) : chicken.father;
    chicken.mother = mother !== undefined ? (mother || null) : chicken.mother;

    const updatedChicken = await chicken.save();

    // 2-Way Sync update to Father/Mother collections
    try {
      if (updatedChicken.gender === 'male') {
        await Father.findOneAndUpdate(
          { code: updatedChicken.code },
          {
            name: updatedChicken.name,
            breed: updatedChicken.breed || updatedChicken.bloodline,
            color: updatedChicken.color,
            bandNumber: updatedChicken.bandNumber,
            bandColor: updatedChicken.bandColor,
            hatchDate: updatedChicken.hatchDate,
            records: updatedChicken.notes,
            image: (updatedChicken as any).image,
          },
          { upsert: true, new: true }
        );
      } else if (updatedChicken.gender === 'female') {
        await Mother.findOneAndUpdate(
          { code: updatedChicken.code },
          {
            name: updatedChicken.name,
            breed: updatedChicken.breed || updatedChicken.bloodline,
            color: updatedChicken.color,
            bandNumber: updatedChicken.bandNumber,
            bandColor: updatedChicken.bandColor,
            hatchDate: updatedChicken.hatchDate,
            image: (updatedChicken as any).image,
          },
          { upsert: true, new: true }
        );
      }
    } catch (syncErr) {
      console.error('Update sync error:', syncErr);
    }

    res.status(200).json({
      status: 'success',
      data: updatedChicken,
    });
  } catch (error) {
    next(error);
  }
};

// Delete chicken
export const deleteChicken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const chickenId = req.params.id;

    const chicken = await Chicken.findById(chickenId);
    if (!chicken) {
      // Also try finding by Father or Mother ID just in case
      await Father.findByIdAndDelete(chickenId);
      await Mother.findByIdAndDelete(chickenId);
      return res.status(200).json({
        status: 'success',
        message: 'ลบข้อมูลเรียบร้อยแล้ว',
      });
    }

    // Cross-delete in Father or Mother collections if matching code
    if (chicken.code) {
      await Father.deleteMany({ code: chicken.code });
      await Mother.deleteMany({ code: chicken.code });
    }

    await Chicken.findByIdAndDelete(chickenId);

    res.status(200).json({
      status: 'success',
      message: 'ลบข้อมูลไก่ชนเรียบร้อยแล้ว',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
