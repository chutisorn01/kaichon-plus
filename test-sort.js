const results = [
  { name: 'แสนงาม', code: 'KP-CCC822-C16139', bandNumber: '04304', bandText: '', user: { farmName: 'ฟาร์มส่วนกลาง (แอดมิน)' }, createdAt: '2025-01-01' },
  { name: 'ธนูทอง', code: 'KP-EDB55D-90C5C1', bandNumber: 'A001', bandText: 'ส.มีสุวรรณ', user: { farmName: 'ฟาร์มส่วนกลาง (แอดมิน)' }, createdAt: '2024-01-01' }
];
const query = 'A001';
const q = query.toLowerCase();
const searchWords = q.split(/\s+/);

const sorted = [...results].sort((a, b) => {
  const calculateScore = (item) => {
    let score = 0;
    const name = (item.name || '').toLowerCase();
    const code = (item.code || '').toLowerCase();
    const bandNumber = (item.bandNumber || '').toLowerCase();
    const bandText = (item.bandText || '').toLowerCase();
    const farmName = (item.user?.farmName || '').toLowerCase();

    for (const word of searchWords) {
      if (bandNumber === word) score += 100;
      else if (bandNumber.includes(word)) score += 70;

      if (name === word || farmName === word || bandText === word) score += 80;
      else if (name.includes(word) || farmName.includes(word) || bandText.includes(word)) score += 60;

      if (code === word) score += 50;
      else if (code.includes(word)) score += 30;
    }
    return score;
  };

  const scoreA = calculateScore(a);
  const scoreB = calculateScore(b);
  console.log(`Score ${a.name}: ${scoreA}, Score ${b.name}: ${scoreB}`);

  if (scoreA !== scoreB) {
    return scoreB - scoreA;
  }

  const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
  const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
  return dateB - dateA;
});

console.log(sorted.map(s => s.name));
