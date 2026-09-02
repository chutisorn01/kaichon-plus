import re

def update_file(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Find the start of getAllChickens and the end of it
    start_str = "export const getAllChickens = async (req: Request, res: Response, next: NextFunction) => {"
    
    # We will replace the entire function. It ends right before "export const getChickenById"
    end_str = "export const getChickenById = async (req: Request, res: Response, next: NextFunction) => {"
    
    start_idx = content.find(start_str)
    end_idx = content.find(end_str)
    
    if start_idx == -1 or end_idx == -1:
        print("Could not find function boundaries")
        return

    new_function = """export const getAllChickens = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, gender, includeChicks } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const filter: any = {};
    const chickFilter: any = {};

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
      chickFilter.user = userId;
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
          // Auto-split numbers and text
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

      const searchConditions = searchWords.map(word => {
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

        if (/^[0-9a-fA-F]{24}$/.test(word)) {
          conditions.push({ _id: word });
        }
        
        return { $or: conditions, regex, word };
      });
      
      filter.$and = searchConditions.map((sc) => {
        const conds = [...sc.$or];
        if (certNoChickenIds.length > 0) conds.push({ _id: { $in: certNoChickenIds } });
        const matchedUserIds = matchingUsers.filter((u: any) => sc.regex.test(u.farmName || '') || sc.regex.test(u.name || '')).map((u: any) => u._id);
        if (matchedUserIds.length > 0) conds.push({ user: { $in: matchedUserIds } });
        return { $or: conds };
      });
      
      chickFilter.$and = searchConditions.map((sc) => {
        const conds = [...sc.$or];
        if (certNoChickIds.length > 0) conds.push({ _id: { $in: certNoChickIds } });
        const matchedUserIds = matchingUsers.filter((u: any) => sc.regex.test(u.farmName || '') || sc.regex.test(u.name || '')).map((u: any) => u._id);
        if (matchedUserIds.length > 0) conds.push({ user: { $in: matchedUserIds } });
        return { $or: conds };
      });
    }

    // --- STEP 1: Fetch IDs only for pagination ---
    
    // Only query Chicken if gender filter is male/female/undefined
    const shouldFetchChickens = !gender || gender === 'male' || gender === 'female';
    const chickenIdsList = shouldFetchChickens ? await Chicken.find(filter).select('_id createdAt').lean() : [];
    
    // Only query Chick if includeChicks is true, or gender is chick
    const shouldFetchChicks = includeChicks === 'true' || gender === 'chick';
    const chickIdsList = shouldFetchChicks ? await Chick.find(chickFilter).select('_id createdAt').lean() : [];

    const combinedIds = [
      ...chickenIdsList.map(item => ({ id: item._id, type: 'chicken', createdAt: (item as any).createdAt })),
      ...chickIdsList.map(item => ({ id: item._id, type: 'chick', createdAt: (item as any).createdAt }))
    ];

    // Sort by createdAt desc
    combinedIds.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    const totalCount = combinedIds.length;
    const totalPages = Math.ceil(totalCount / limit);
    const startIndex = (page - 1) * limit;
    const paginatedIds = combinedIds.slice(startIndex, startIndex + limit);

    // --- STEP 2: Fetch full documents for the paginated slice ---
    
    const paginatedChickenIds = paginatedIds.filter(item => item.type === 'chicken').map(item => item.id);
    const paginatedChickIds = paginatedIds.filter(item => item.type === 'chick').map(item => item.id);

    let chickens: any[] = [];
    if (paginatedChickenIds.length > 0) {
      chickens = await Chicken.find({ _id: { $in: paginatedChickenIds } })
        .populate('father', 'code name gender bloodline')
        .populate('mother', 'code name gender bloodline')
        .populate('user', 'name farmName farmCode isVerified phone lineId facebook address description stampText')
        .lean();
    }

    let mappedChicks: any[] = [];
    if (paginatedChickIds.length > 0) {
      const chicks = await Chick.find({ _id: { $in: paginatedChickIds } })
        .populate('father', 'code name bloodline breed')
        .populate('mother', 'code name bloodline breed')
        .populate('user', 'name farmName farmCode isVerified phone lineId facebook address description stampText')
        .lean();

      mappedChicks = chicks.map(c => {
        let parentBloodline = (c as any).bloodline || '';
        if (!(c as any).bloodline) {
          const f = c.father as any;
          const m = c.mother as any;
          if (f && m) parentBloodline = `${f.bloodline || f.breed || '?'} / ${m.bloodline || m.breed || '?'}`;
          else if (f) parentBloodline = f.bloodline || f.breed || '';
          else if (m) parentBloodline = m.bloodline || m.breed || '';
        }

        return {
          ...c,
          name: (c as any).name || `ลูกไก่ #${(c as any).bandNumber || (c as any).code}`,
          chickGender: (c as any).gender,
          gender: 'chick', // Map to chicken schema equivalent
          bloodline: parentBloodline || 'กำลังพัฒนา',
          isChickRegistry: true,
          chickOriginalData: c
        };
      });
    }

    // --- STEP 3: Merge and restore sort order ---
    
    const mergedResults = [...chickens, ...mappedChicks];
    
    // Sort merged results exactly as the paginatedIds array to maintain consistency
    const sortedMergedResults = paginatedIds.map(paginatedItem => 
      mergedResults.find(r => r._id.toString() === paginatedItem.id.toString())
    ).filter(Boolean);

    res.json({
      success: true,
      data: sortedMergedResults,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore: page < totalPages
      }
    });

  } catch (err: any) {
    console.error('Error fetching chickens:', err);
    res.status(500).json({ message: err.message });
  }
};

"""

    content = content[:start_idx] + new_function + content[end_idx:]

    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Updated {file_path}")

update_file('src/controllers/chicken.controller.ts')
