import { Request, Response, NextFunction } from 'express';
import { Chicken } from '../models/chicken.model.js';
import { Father } from '../models/father.model.js';
import { Mother } from '../models/mother.model.js';
import { Chick } from '../models/chick.model.js';
import { AppError } from '../middleware/error.middleware.js';
import { User } from '../models/user.model.js';
import { verifyToken } from '../config/crypto.js';

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
    const { search, gender, includeChicks } = req.query;
    const filter: any = {};

    if (gender === 'male' || gender === 'female') {
      filter.gender = gender;
    }

    let certNoChickenIds: any[] = [];
    let certNoChickIds: any[] = [];
    let searchWords: string[] = [];
    let matchingUsers: any[] = [];

    // Optional Auth: If Authorization header exists, decode it to filter by user.
    let userId: string | null = null;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      const token = req.headers.authorization.split(' ')[1];
      if (token && token !== 'null') {
        const secret = process.env.JWT_SECRET || 'kaichon-plus-super-secret-key-12345';
        try {
          const decoded = verifyToken(token, secret);
          if (decoded && decoded.id) {
            userId = decoded.id;
          }
        } catch (jwtErr) {
          console.error('Optional JWT parsing error:', jwtErr);
        }
      }
    }

    if (userId) {
      filter.user = userId;
    }

    if (search) {
      let searchStr = search as string;
      const rawWords = searchStr.trim().split(/\s+/);
      
      searchWords = [];
      for (const word of rawWords) {
        const isWordCertNo = /^(?:KP-)?([0-9a-fA-F]{6})-?([0-9a-fA-F]{6})$/i.test(word) 
                          || /^(?:KP-)?([0-9a-fA-F]{12})$/i.test(word);
        if (isWordCertNo) {
          searchWords.push(word);
        } else {
          // Auto-split numbers and text (e.g., "001โกเซ้ม" -> "001 โกเซ้ม")
          const splitWord = word
            .replace(/([0-9])([a-zA-Zก-ฮเแโใไาีืึุูะัิี])/g, '$1 $2')
            .replace(/([a-zA-Zก-ฮเแโใไาีืึุูะัิี])([0-9])/g, '$1 $2');
          
          searchWords.push(...splitWord.split(/\s+/));
        }
      }
      
      // Escape special regex characters in searchStr for matching users
      const regexPattern = searchWords.map(w => w.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&')).join('|');
      const anyWordRegex = new RegExp(regexPattern, 'i');

      matchingUsers = await User.find({
        $or: [{ farmName: anyWordRegex }, { name: anyWordRegex }]
      }).select('_id farmName name').lean();
      
      // Pre-fetch any document IDs matching certificate number suffixes
      for (const word of searchWords) {
        const kpMatch = word.match(/^(?:KP-)?([0-9a-fA-F]{6})-?([0-9a-fA-F]{6})$/i) 
                     || word.match(/^(?:KP-)?([0-9a-fA-F]{12})$/i);
        if (kpMatch) {
          const hexSuffix = (kpMatch[1] + (kpMatch[2] || '')).toLowerCase();
          if (hexSuffix.length === 12) {
            // 1. Find directly in Chicken collection
            const matchedChickens = await Chicken.find({
              $expr: {
                $regexMatch: {
                  input: { $toString: "$_id" },
                  regex: `${hexSuffix}$`,
                  options: "i"
                }
              }
            }).select('_id').lean();
            certNoChickenIds = [...certNoChickenIds, ...matchedChickens.map(c => c._id)];

            // 2. Find directly in Chick collection
            const matchedChicks = await Chick.find({
              $expr: {
                $regexMatch: {
                  input: { $toString: "$_id" },
                  regex: `${hexSuffix}$`,
                  options: "i"
                }
              }
            }).select('_id').lean();
            certNoChickIds = [...certNoChickIds, ...matchedChicks.map(c => c._id)];

            // 3. Find in Father collection, then find synced Chickens
            const matchedFathers = await Father.find({
              $expr: {
                $regexMatch: {
                  input: { $toString: "$_id" },
                  regex: `${hexSuffix}$`,
                  options: "i"
                }
              }
            }).select('code').lean();
            if (matchedFathers.length > 0) {
              const fatherCodes = matchedFathers.map(f => f.code.toUpperCase());
              const syncedChickens = await Chicken.find({ code: { $in: fatherCodes } }).select('_id').lean();
              certNoChickenIds = [...certNoChickenIds, ...syncedChickens.map(c => c._id)];
            }

            // 4. Find in Mother collection, then find synced Chickens
            const matchedMothers = await Mother.find({
              $expr: {
                $regexMatch: {
                  input: { $toString: "$_id" },
                  regex: `${hexSuffix}$`,
                  options: "i"
                }
              }
            }).select('code').lean();
            if (matchedMothers.length > 0) {
              const motherCodes = matchedMothers.map(m => m.code.toUpperCase());
              const syncedChickens = await Chicken.find({ code: { $in: motherCodes } }).select('_id').lean();
              certNoChickenIds = [...certNoChickenIds, ...syncedChickens.map(c => c._id)];
            }
          }
        }
      }

      filter.$and = searchWords.map(word => {
        // Escape special regex characters
        const escapedWord = word.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(escapedWord, 'i');
        const conditions: any[] = [
          { code: regex },
          { name: regex },
          { bloodline: regex },
          { bandNumber: regex },
          { bandText: regex },
          { fatherNameText: regex },
          { motherNameText: regex },
          { 'saleInfo.customerName': regex },
          { 'saleInfo.customerFarm': regex }
        ];

        // Match full 24-character ObjectId
        if (/^[0-9a-fA-F]{24}$/.test(word)) {
          conditions.push({ _id: word });
        }

        // Match pre-fetched certificate IDs
        if (certNoChickenIds.length > 0) {
          conditions.push({ _id: { $in: certNoChickenIds } });
        }
        
        const matchedUserIds = matchingUsers
          .filter((u: any) => regex.test(u.farmName || '') || regex.test(u.name || ''))
          .map((u: any) => u._id);
          
        if (matchedUserIds.length > 0) conditions.push({ user: { $in: matchedUserIds } });
        
        return { $or: conditions };
      });
    }

    let chickens = await Chicken.find(filter)
      .populate('father', 'code name image')
      .populate('mother', 'code name image')
      .populate('user', 'name farmName farmCode isVerified profileImage coverImage phone lineId facebook address description signatureImage stampText')
      .sort({ createdAt: -1 })
      .lean();

    if (includeChicks === 'true' && search) {
      const chickFilter: any = {};
      if (userId) {
        chickFilter.user = userId;
      }
      
      chickFilter.$and = searchWords.map(word => {
        // Escape special regex characters
        const escapedWord = word.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(escapedWord, 'i');
        const conditions: any[] = [
          { code: regex },
          { name: regex },
          { bandNumber: regex },
          { bandText: regex },
          { fatherNameText: regex },
          { motherNameText: regex },
          { 'saleInfo.customerName': regex },
          { 'saleInfo.customerFarm': regex }
        ];

        // Match full 24-character ObjectId
        if (/^[0-9a-fA-F]{24}$/.test(word)) {
          conditions.push({ _id: word });
        }

        // Match pre-fetched certificate IDs for chicks
        if (certNoChickIds.length > 0) {
          conditions.push({ _id: { $in: certNoChickIds } });
        }
        
        const matchedUserIds = matchingUsers
          .filter((u: any) => regex.test(u.farmName || '') || regex.test(u.name || ''))
          .map((u: any) => u._id);
          
        if (matchedUserIds.length > 0) conditions.push({ user: { $in: matchedUserIds } });
        
        return { $or: conditions };
      });

      const chicks = await Chick.find(chickFilter)
        .populate('father', 'code name image bloodline breed')
        .populate('mother', 'code name image bloodline breed')
        .populate('user', 'name farmName farmCode isVerified profileImage coverImage phone lineId facebook address description signatureImage stampText')
        .lean();

      const mappedChicks = chicks.map(c => {
        let parentBloodline = (c as any).bloodline || '';
        if (!(c as any).bloodline) {
          const f = c.father as any;
          const m = c.mother as any;
          const fBlood = f?.bloodline || f?.breed || '';
          const mBlood = m?.bloodline || m?.breed || '';
          
          if (fBlood && mBlood) {
            if (fBlood === mBlood) {
              parentBloodline = fBlood;
            } else {
              parentBloodline = `${fBlood}-${mBlood}`;
            }
          } else if (fBlood || mBlood) {
            parentBloodline = fBlood || mBlood;
          } else {
            parentBloodline = 'กำลังพัฒนา';
          }
        }

        return {
          ...c,
          bloodline: parentBloodline
        };
      });

      chickens = [...chickens, ...(mappedChicks as any[])] as any[];
    }

    // Sort the final results
    if (search) {
      const searchLower = (search as string).toLowerCase().trim();
      chickens.sort((a: any, b: any) => {
        const aCode = (a.code || '').toLowerCase();
        const bCode = (b.code || '').toLowerCase();
        const aBand = (a.bandNumber || '').toLowerCase();
        const bBand = (b.bandNumber || '').toLowerCase();
        const aName = (a.name || '').toLowerCase();
        const bName = (b.name || '').toLowerCase();
        const aBandText = (a.bandText || '').toLowerCase();
        const bBandText = (b.bandText || '').toLowerCase();
        const aFarm = (a.user?.farmName || '').toLowerCase();
        const bFarm = (b.user?.farmName || '').toLowerCase();
        const aCustomer = (a.saleInfo?.customerName || '').toLowerCase();
        const bCustomer = (b.saleInfo?.customerName || '').toLowerCase();
        const aCustomerFarm = (a.saleInfo?.customerFarm || '').toLowerCase();
        const bCustomerFarm = (b.saleInfo?.customerFarm || '').toLowerCase();

        const searchWords = searchLower.split(/\s+/);

        const calculateScore = (band: string, bandText: string, name: string, farm: string, code: string, customer: string, customerFarm: string) => {
          let score = 0;
          for (const word of searchWords) {
            // 1. กิ๊ฟสำคัญที่สุด (Band Number & Band Text)
            if (band === word || bandText === word) score += 100;
            else if (band.includes(word) || bandText.includes(word)) score += 70;

            // 2. ชื่อไก่ และ ชื่อฟาร์ม สำคัญรองลงมา (Chicken Name & Farm Name & Customer)
            if (name === word || farm === word || customer === word || customerFarm === word) score += 80;
            else if (name.includes(word) || farm.includes(word) || customer.includes(word) || customerFarm.includes(word)) score += 60;

            // 3. รหัสระบบ สำคัญน้อยสุด (System Code)
            if (code === word) score += 50;
            else if (code.includes(word)) score += 30;
          }
          return score;
        };

        const scoreA = calculateScore(aBand, aBandText, aName, aFarm, aCode, aCustomer, aCustomerFarm);
        const scoreB = calculateScore(bBand, bBandText, bName, bFarm, bCode, bCustomer, bCustomerFarm);

        // If scores are different, sort by score descending
        if (scoreA !== scoreB) {
          return scoreB - scoreA;
        }

        // Fallback to createdAt
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    } else {
      chickens.sort((a: any, b: any) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    }

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
    const { includeAny } = req.query;

    if (includeAny === 'true') {
      let data: any = await Chicken.findById(req.params.id)
        .populate('father', 'code name gender bloodline image')
        .populate('mother', 'code name gender bloodline image')
        .populate('user', 'name farmName farmCode isVerified profileImage coverImage phone lineId facebook address description signatureImage stampText')
        .lean();
        
      if (data) {
        let siblingCount = 0;
        if (data.batch) {
          siblingCount = await Chick.countDocuments({ batch: data.batch._id || data.batch });
        } else if (data.father && data.mother) {
          const fatherId = data.father._id || data.father;
          const motherId = data.mother._id || data.mother;
          siblingCount = (await Chick.countDocuments({ father: fatherId, mother: motherId })) + 
                         (await Chicken.countDocuments({ father: fatherId, mother: motherId }));
        }
        return res.status(200).json({ status: 'success', data: { ...data, siblingCount, _sourceCollection: 'chickens' } });
      }

      data = await Father.findById(req.params.id).populate('user', 'name farmName farmCode isVerified profileImage coverImage phone lineId facebook address description signatureImage stampText').lean();
      if (data) {
        return res.status(200).json({ status: 'success', data: { ...data, gender: 'male', _sourceCollection: 'fathers' } });
      }

      data = await Mother.findById(req.params.id).populate('user', 'name farmName farmCode isVerified profileImage coverImage phone lineId facebook address description signatureImage stampText').lean();
      if (data) {
        return res.status(200).json({ status: 'success', data: { ...data, gender: 'female', _sourceCollection: 'mothers' } });
      }

      data = await Chick.findById(req.params.id)
        .populate('father', 'code name image bloodline breed')
        .populate('mother', 'code name image bloodline breed')
        .populate('batch')
        .populate('user', 'name farmName farmCode isVerified profileImage coverImage phone lineId facebook address description signatureImage stampText')
        .lean();
      if (data) {
        let siblingCount = 0;
        if (data.batch) {
          siblingCount = await Chick.countDocuments({ batch: data.batch._id || data.batch });
        } else if (data.father && data.mother) {
          const fatherId = data.father._id || data.father;
          const motherId = data.mother._id || data.mother;
          siblingCount = (await Chick.countDocuments({ father: fatherId, mother: motherId })) + 
                         (await Chicken.countDocuments({ father: fatherId, mother: motherId }));
        }

        let parentBloodline = data.bloodline || '';
        if (!data.bloodline) {
          const f = data.father as any;
          const m = data.mother as any;
          const fBlood = f?.bloodline || f?.breed || '';
          const mBlood = m?.bloodline || m?.breed || '';
          if (fBlood && mBlood) {
            if (fBlood === mBlood) {
              parentBloodline = fBlood;
            } else {
              parentBloodline = `${fBlood}-${mBlood}`;
            }
          } else if (fBlood || mBlood) {
            parentBloodline = fBlood || mBlood;
          } else {
            parentBloodline = 'กำลังพัฒนา';
          }
        }

        return res.status(200).json({ status: 'success', data: { ...data, bloodline: parentBloodline, siblingCount, _sourceCollection: 'chicks' } });
      }

      return next(new AppError('Chicken not found', 404));
    }

    const chicken = await Chicken.findById(req.params.id)
      .populate('father', 'code name gender bloodline image')
      .populate('mother', 'code name gender bloodline image')
      .populate('user', 'name farmName farmCode isVerified profileImage coverImage phone lineId facebook address description signatureImage stampText')
      .lean();

    if (!chicken) {
      return next(new AppError('Chicken not found', 404));
    }

    let siblingCount = 0;
    if ((chicken as any).batch) {
      siblingCount = await Chick.countDocuments({ batch: ((chicken as any).batch as any)._id || (chicken as any).batch });
    } else if (chicken.father && chicken.mother) {
      const fatherId = (chicken.father as any)._id || chicken.father;
      const motherId = (chicken.mother as any)._id || chicken.mother;
      const chickSiblings = await Chick.countDocuments({ father: fatherId, mother: motherId });
      const chickenSiblings = await Chicken.countDocuments({ father: fatherId, mother: motherId });
      siblingCount = chickSiblings + chickenSiblings;
    }
    (chicken as any).siblingCount = siblingCount;

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
    const { code, name, gender, bloodline, breed, color, hatchDate, bandColor, bandNumber, bandText, father, mother, fatherNameText, motherNameText, notes, image } = req.body;

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
      fatherNameText,
      motherNameText,
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
            bandText,
            fatherNameText,
            motherNameText,
            records: notes,
            hatchDate,
            image
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
            bandColor,
            bandText,
            fatherNameText,
            motherNameText,
            records: notes,
            hatchDate,
            image
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
    const { code, name, gender, bloodline, breed, color, bandNumber, bandColor, bandText, notes, status, hatchDate, father, mother, fatherNameText, motherNameText, image, saleInfo } = req.body;
    const chickenId = req.params.id;
    const user = (req as any).user;

    const chicken = await Chicken.findById(chickenId);
    if (!chicken) {
      return next(new AppError('Chicken not found', 404));
    }

    // Owner check: Allow only the owner or an admin
    if (chicken.user && chicken.user.toString() !== user.id && user.role !== 'admin') {
      return next(new AppError('You are not authorized to edit this chicken', 403));
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
      const isCircular = await detectCircularReference(chickenId as string, father as string);
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
      const isCircular = await detectCircularReference(chickenId as string, mother as string);
      if (isCircular) {
        return next(new AppError('Circular pedigree reference detected: This chicken is an ancestor of the proposed mother', 400));
      }
    }


    const oldCode = chicken.code;
    chicken.code = code ? code.toUpperCase() : chicken.code;
    chicken.name = name || chicken.name;
    chicken.gender = gender || chicken.gender;
    chicken.bloodline = bloodline || breed || chicken.bloodline;
    if (breed) (chicken as any).breed = breed;
    if (color) (chicken as any).color = color;
    if (bandNumber !== undefined) chicken.bandNumber = bandNumber;
    if (bandColor !== undefined) chicken.bandColor = bandColor;
    if (bandText !== undefined) chicken.bandText = bandText;
    if (notes !== undefined) chicken.notes = notes;
    if (status !== undefined) chicken.status = status;
    if (saleInfo !== undefined) chicken.saleInfo = saleInfo;
    if (image !== undefined) (chicken as any).image = image;
    if (hatchDate !== undefined) chicken.hatchDate = hatchDate;
    chicken.father = father !== undefined ? (father || null) : chicken.father;
    chicken.mother = mother !== undefined ? (mother || null) : chicken.mother;
    if (fatherNameText !== undefined) chicken.fatherNameText = fatherNameText;
    if (motherNameText !== undefined) chicken.motherNameText = motherNameText;

    const updatedChicken = await chicken.save();

    // 2-Way Sync update to Father/Mother collections
    try {
      if (updatedChicken.gender === 'male') {
        await Father.findOneAndUpdate(
          { code: oldCode, user: updatedChicken.user },
          {
            code: updatedChicken.code,
            name: updatedChicken.name,
            breed: (updatedChicken as any).breed || (updatedChicken as any).bloodline,
            color: (updatedChicken as any).color,
            bandNumber: updatedChicken.bandNumber,
            bandColor: updatedChicken.bandColor,
            bandText: updatedChicken.bandText,
            hatchDate: updatedChicken.hatchDate,
            records: updatedChicken.notes,
            status: updatedChicken.status,
            fatherNameText: updatedChicken.fatherNameText,
            motherNameText: updatedChicken.motherNameText,
            image: (updatedChicken as any).image,
          },
          { upsert: true, new: true }
        );
      } else if (updatedChicken.gender === 'female') {
        await Mother.findOneAndUpdate(
          { code: oldCode, user: updatedChicken.user },
          {
            code: updatedChicken.code,
            name: updatedChicken.name,
            breed: (updatedChicken as any).breed || (updatedChicken as any).bloodline,
            color: (updatedChicken as any).color,
            bandNumber: updatedChicken.bandNumber,
            bandColor: updatedChicken.bandColor,
            bandText: updatedChicken.bandText,
            hatchDate: updatedChicken.hatchDate,
            records: updatedChicken.notes,
            status: updatedChicken.status,
            fatherNameText: updatedChicken.fatherNameText,
            motherNameText: updatedChicken.motherNameText,
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
    const user = (req as any).user;

    const chicken = await Chicken.findById(chickenId);
    if (!chicken) {
      // Also try finding by Father or Mother ID just in case, checking permissions
      const father = await Father.findById(chickenId);
      if (father && father.user && father.user.toString() !== user.id && user.role !== 'admin') {
        return next(new AppError('You are not authorized to delete this chicken', 403));
      }
      const mother = await Mother.findById(chickenId);
      if (mother && mother.user && mother.user.toString() !== user.id && user.role !== 'admin') {
        return next(new AppError('You are not authorized to delete this chicken', 403));
      }

      await Father.findByIdAndDelete(chickenId);
      await Mother.findByIdAndDelete(chickenId);
      return res.status(200).json({
        status: 'success',
        message: 'ลบข้อมูลเรียบร้อยแล้ว',
      });
    }

    // Owner check: Allow only the owner or an admin
    if (chicken.user && chicken.user.toString() !== user.id && user.role !== 'admin') {
      return next(new AppError('You are not authorized to delete this chicken', 403));
    }

    // Cross-delete in Father or Mother collections if matching code (restricted to the same owner)
    if (chicken.code && chicken.user) {
      await Father.deleteMany({ code: chicken.code, user: chicken.user });
      await Mother.deleteMany({ code: chicken.code, user: chicken.user });
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
