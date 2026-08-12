import { useState, useEffect } from 'react';
import { 
  Plus, 
  ChevronRight, 
  Settings, 
  LogOut, 
  LayoutDashboard, 
  Swords, 
  Layers,
  Heart,
  Users,
  Building2,
  Search,
  BadgeCheck,
  ShieldCheck,
  Tag,
  User,
  X,
  ShoppingBag,
  BarChart,
  Award,
  TrendingUp,
  Syringe
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import { ChickenIcon } from './ui/ChickenIcon';
import { getBandColorClass } from './pedigree/FatherRegistry';

const getBandColorCircleClass = (color: string) => {
  switch (color) {
    case 'ทอง': return 'bg-amber-400';
    case 'เงิน': return 'bg-slate-300';
    case 'แดง': return 'bg-red-500';
    case 'เหลือง': return 'bg-yellow-400';
    case 'เขียว': return 'bg-green-500';
    case 'น้ำเงิน': return 'bg-blue-500';
    default: return 'bg-slate-400';
  }
};

export default function Dashboard({ onLogout, onNavigate }: { onLogout: () => void, onNavigate: (page: any, id?: string) => void }) {
  const [searchQuery, setSearchQuery] = useState(() => sessionStorage.getItem('dashboard_searchQuery') || '');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState<any>(() => {
    const cached = sessionStorage.getItem('dashboard_user');
    return cached ? JSON.parse(cached) : null;
  });
  
  const [totalChickens, setTotalChickens] = useState(() => Number(sessionStorage.getItem('dashboard_totalChickens') || 0));
  const [fatherCount, setFatherCount] = useState(() => Number(sessionStorage.getItem('dashboard_fatherCount') || 0));
  const [motherCount, setMotherCount] = useState(() => Number(sessionStorage.getItem('dashboard_motherCount') || 0));
  const [batchCount, setBatchCount] = useState(() => Number(sessionStorage.getItem('dashboard_batchCount') || 0));
  const [chickCount, setChickCount] = useState(() => Number(sessionStorage.getItem('dashboard_chickCount') || 0));

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [chickensRes, fathersRes, mothersRes, batchesRes, chicksRes, userRes] = await Promise.all([
        fetch('http://localhost:5001/api/chickens', { headers }).catch(() => null),
        fetch('http://localhost:5001/api/fathers', { headers }).catch(() => null),
        fetch('http://localhost:5001/api/mothers', { headers }).catch(() => null),
        fetch('http://localhost:5001/api/breeding-batches', { headers }).catch(() => null),
        fetch('http://localhost:5001/api/chicks', { headers }).catch(() => null),
        fetch('http://localhost:5001/api/auth/me', { headers }).catch(() => null)
      ]);

      if (userRes && userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.data);
        try {
          sessionStorage.setItem('dashboard_user', JSON.stringify(userData.data));
        } catch (e) {
          console.warn('Could not save user to sessionStorage (likely quota exceeded by base64 images).');
        }
      }

      let cCount = 0;
      if (chickensRes && chickensRes.ok) {
        const data = await chickensRes.json();
        cCount = (data.data || data.chickens || []).length;
      }

      let fCount = 0;
      if (fathersRes && fathersRes.ok) {
        const data = await fathersRes.json();
        fCount = Array.isArray(data) ? data.length : 0;
      }

      let mCount = 0;
      if (mothersRes && mothersRes.ok) {
        const data = await mothersRes.json();
        mCount = Array.isArray(data) ? data.length : 0;
      }

      let bCount = 0;
      if (batchesRes && batchesRes.ok) {
        const data = await batchesRes.json();
        bCount = Array.isArray(data) ? data.length : 0;
      }

      let chCount = 0;
      if (chicksRes && chicksRes.ok) {
        const data = await chicksRes.json();
        chCount = Array.isArray(data) ? data.length : 0;
      }

      setFatherCount(fCount);
      sessionStorage.setItem('dashboard_fatherCount', fCount.toString());
      setMotherCount(mCount);
      sessionStorage.setItem('dashboard_motherCount', mCount.toString());
      setBatchCount(bCount);
      sessionStorage.setItem('dashboard_batchCount', bCount.toString());
      setChickCount(chCount);
      sessionStorage.setItem('dashboard_chickCount', chCount.toString());
      
      // Total chickens in farm is combined unique items or sum
      const totalCombined = Math.max(cCount, fCount + mCount + chCount);
      setTotalChickens(totalCombined);
      sessionStorage.setItem('dashboard_totalChickens', totalCombined.toString());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    sessionStorage.setItem('dashboard_searchQuery', searchQuery);
    
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    let active = true;

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const query = searchQuery.trim();
        const res = await fetch(`http://localhost:5001/api/chickens?search=${encodeURIComponent(query)}&includeChicks=true`);
        const data = await res.json();
        
        if (active && data.status === 'success') {
          const results = data.data || [];
          const q = query.toLowerCase();
          const searchWords = q.split(/\s+/);

          // Client-side scoring and sorting to prioritize exact matches
          const sorted = [...results].sort((a: any, b: any) => {
            const calculateScore = (item: any) => {
              let score = 0;
              const name = (item.name || '').toLowerCase();
              const code = (item.code || '').toLowerCase();
              const bandNumber = (item.bandNumber || '').toLowerCase();
              const bandText = (item.bandText || '').toLowerCase();
              const farmName = (item.user?.farmName || '').toLowerCase();

              for (const word of searchWords) {
                // 1. Band Number (กิ๊ฟ) - Most important
                if (bandNumber === word) score += 100;
                else if (bandNumber.includes(word)) score += 70;

                // 2. Name, Farm Name, Band Text - Second most important
                if (name === word || farmName === word || bandText === word) score += 80;
                else if (name.includes(word) || farmName.includes(word) || bandText.includes(word)) score += 60;

                // 3. System Code - Third most important
                if (code === word) score += 50;
                else if (code.includes(word)) score += 30;
              }
              return score;
            };

            const scoreA = calculateScore(a);
            const scoreB = calculateScore(b);

            if (scoreA !== scoreB) {
              return scoreB - scoreA; // Descending (highest score first)
            }

            // Fallback to createdAt descending
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });

          setSearchResults(sorted);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setIsSearching(false);
      }
    }, 500);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col text-slate-900 dark:text-white transition-colors relative w-full">
      {/* Mobile Top Header */}
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 flex items-center justify-center px-4 sticky top-0 z-50">
        <div className="max-w-6xl w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center cursor-pointer" onClick={() => onNavigate('home')}>
              <Swords className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">KaiChon Plus</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            
            {/* Profile Avatar Button */}
            <button 
              onClick={() => onNavigate('profile')}
              className="w-9 h-9 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center border border-red-200 dark:border-red-800/50 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm ml-1 overflow-hidden"
              title="โปรไฟล์ฟาร์ม"
            >
              {user?.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </button>

            {/* Quick Logout Icon Button */}
            <button 
              onClick={() => setShowLogoutConfirm(true)}
              className="w-9 h-9 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="ออกจากระบบ"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area (Scrollable) */}
      <main className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-6xl mx-auto w-full">
          {/* Premium Welcome Banner (Red Tone) */}
          <div className="p-4 space-y-4">
            <div className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-500 to-orange-500 rounded-3xl p-6 sm:p-8 text-white shadow-2xl shadow-red-600/30 border border-red-500/50">
              {/* Decorative Background Elements */}
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="relative z-10">
                <h1 className="text-lg sm:text-xl font-bold mb-3 text-white/90">
                  สวัสดีครับ! <span className="text-white font-black">{user?.name ? `คุณ${user.name}` : 'คุณนกยูง'}</span>
                </h1>
                
                <div className="flex flex-col gap-1.5 mb-6">
                  <div className="flex items-center flex-wrap gap-2">
                    <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl text-sm font-black text-white shadow-lg border border-white/20 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-white/90" />
                      {user?.farmName || 'ฟาร์มไก่ชน (ยังไม่ตั้งชื่อ)'}
                      {user?.isVerified === true && <BadgeCheck className="w-4 h-4 text-white fill-blue-500 drop-shadow-xs" />}
                    </div>
                  </div>
                  <span className="text-white/80 text-[11px] sm:text-xs font-medium ml-1">ระบบจัดการสายเลือดและตลาดซื้อ-ขายไก่ชน</span>
                </div>

                {/* Prominent White Card for Total Chickens */}
                <div 
                  onClick={() => onNavigate('chicken-list')}
                  className="group bg-white rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-xl shadow-black/10 hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98] transition-all cursor-pointer border border-white"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl flex items-center justify-center text-red-600 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform shrink-0 border border-red-100">
                      <ChickenIcon size={26} />
                    </div>
                    <div className="text-left">
                      <div className="text-[10px] sm:text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-1">ไก่ชนทั้งหมดในฟาร์ม</div>
                      <div className="text-3xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-red-600 to-orange-500 flex items-baseline gap-2 leading-none">
                        {totalChickens} <span className="text-sm font-bold text-slate-400">ตัว</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] sm:text-xs font-bold text-slate-400 group-hover:text-red-500 transition-colors hidden sm:block">ดูทะเบียนไก่ชน</span>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors shrink-0">
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Search Section */}
          <div className="px-4 mb-6 relative">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-red-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="ค้นหาไก่ในฟาร์ม (เลขกิ๊ฟ, รหัสประจำตัว, หรือชื่อ)..."
                className="block w-full pl-11 pr-12 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-red-500 text-sm outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
                {isSearching && (
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                )}
                {searchQuery && (
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Search Results Overlay */}
            {searchQuery.trim().length > 0 && (
              <div className="mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 text-left max-h-80 overflow-y-auto z-50 relative animate-in fade-in zoom-in-95 duration-200 origin-top">
                <div className="text-xs font-bold text-slate-400 mb-2 uppercase flex justify-between items-center">
                  <span>ผลการค้นหา ({searchResults.length} รายการ)</span>
                </div>
                {searchResults.length === 0 && !isSearching ? (
                  <div className="text-center py-4 text-slate-400 text-sm">ไม่พบข้อมูลตรงกับคำค้นหา</div>
                ) : (
                  <div className="space-y-2">
                    {searchResults.slice(0, 15).map((chicken) => (
                      <div 
                        key={chicken._id}
                        onClick={() => onNavigate('chicken-detail', chicken._id)}
                        className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 border border-transparent hover:border-red-200 transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <div className="flex-1 min-w-0 pr-3">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-bold text-sm truncate group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors ${
                              chicken.gender === 'ผู้' || chicken.gender === 'male' ? 'text-blue-700 dark:text-blue-400' :
                              chicken.gender === 'เมีย' || chicken.gender === 'female' ? 'text-pink-600 dark:text-pink-400' :
                              'text-slate-900 dark:text-white'
                            }`}>
                              {(() => {
                                let displayName = chicken.name || '';
                                if (displayName.includes('เจ้าชาย')) displayName = 'ไก่เพศผู้ "ยังไม่มีชื่อ"';
                                if (displayName.includes('เจ้าหญิง')) displayName = 'ไก่เพศเมีย "ยังไม่มีชื่อ"';
                                
                                if (chicken.gender === 'ผู้' || chicken.gender === 'male') {
                                  return displayName.includes('♂') ? displayName : `♂ ${displayName}`;
                                } else if (chicken.gender === 'เมีย' || chicken.gender === 'female') {
                                  return displayName.includes('♀') ? displayName : `♀ ${displayName}`;
                                }
                                return displayName;
                              })()}
                            </h4>
                            <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono font-bold rounded-full max-w-[120px] truncate shrink-0" title={chicken.code}>
                              {chicken.code}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 mt-1 mb-1">
                            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{chicken.user?.farmName || chicken.user?.name || 'ฟาร์มสมาชิก'}</span>
                            {chicken.user?.isVerified === true && (
                              <BadgeCheck className="w-3.5 h-3.5 text-white fill-blue-500 shrink-0 drop-shadow-xs" />
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs mb-1.5 mt-1">
                            {chicken.bandNumber && (
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 font-bold rounded-lg border min-w-0 max-w-full ${getBandColorClass(chicken.bandColor || 'แดง')}`}>
                                <Tag className="w-2.5 h-2.5 shrink-0" /> 
                                <span className="flex items-center gap-1 shrink-0">
                                  {chicken.bandColor && <div className={`w-2 h-2 rounded-full ${getBandColorCircleClass(chicken.bandColor)} shadow-sm border border-black/10 shrink-0`} />}
                                </span>
                                <span className="shrink-0">#{chicken.bandNumber}</span>
                                {chicken.bandText && <span className="truncate">[{chicken.bandText}]</span>}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center flex-wrap gap-2 mt-2">
                            <div className="flex items-center shadow-sm">
                              <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-black rounded-l-md border-y border-l border-blue-200 dark:border-blue-800 flex items-center gap-1">
                                ♂ พ่อ
                              </span>
                              <span className="text-[10px] px-2 py-0.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-r-md border border-blue-200 dark:border-blue-800">
                                {chicken.father?.name || chicken.fatherNameText || '-'}
                              </span>
                            </div>
                            <div className="flex items-center shadow-sm">
                              <span className="text-[10px] px-1.5 py-0.5 bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 font-black rounded-l-md border-y border-l border-pink-200 dark:border-pink-800 flex items-center gap-1">
                                ♀ แม่
                              </span>
                              <span className="text-[10px] px-2 py-0.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-r-md border border-pink-200 dark:border-pink-800">
                                {chicken.mother?.name || chicken.motherNameText || '-'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-red-600 shrink-0 bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded-lg">เปิดดู ➔</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Focus on Pedigree & Trading Modules */}
          <div className="px-4 mb-6 space-y-6">
          {/* Pedigree Core Grid */}
          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="font-bold text-slate-800 dark:text-slate-200">ระบบสายเลือด (Pedigree Management)</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => onNavigate('father-registry')}
                className="flex flex-col items-center gap-3 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2rem] active:scale-95 transition-all shadow-sm group cursor-pointer relative"
              >
                <div className="w-14 h-14 bg-red-100 dark:bg-red-900/40 rounded-2xl flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                  <Swords className="w-7 h-7" />
                </div>
                <div className="text-center">
                  <span className="text-sm font-bold block">พ่อพันธุ์ ({fatherCount})</span>
                  <span className="text-[10px] text-slate-400 font-medium font-sans">Fathers</span>
                </div>
              </button>

              <button 
                onClick={() => onNavigate('mother-registry')}
                className="flex flex-col items-center gap-3 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2rem] active:scale-95 transition-all shadow-sm group cursor-pointer relative"
              >
                <div className="w-14 h-14 bg-pink-100 dark:bg-pink-900/40 rounded-2xl flex items-center justify-center text-pink-600 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                  <Heart className="w-7 h-7" />
                </div>
                <div className="text-center">
                  <span className="text-sm font-bold block">แม่พันธุ์ ({motherCount})</span>
                  <span className="text-[10px] text-slate-400 font-medium font-sans">Mothers</span>
                </div>
              </button>

              <button 
                onClick={() => onNavigate('breeding-batch')}
                className="flex flex-col items-center gap-3 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2rem] active:scale-95 transition-all shadow-sm group cursor-pointer relative"
              >
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Layers className="w-7 h-7" />
                </div>
                <div className="text-center">
                  <span className="text-sm font-bold block">บันทึกผสม ({batchCount})</span>
                  <span className="text-[10px] text-slate-400 font-medium font-sans">Breeding</span>
                </div>
              </button>

              <button 
                onClick={() => onNavigate('chick-registry')}
                className="flex flex-col items-center gap-3 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2rem] active:scale-95 transition-all shadow-sm group cursor-pointer relative"
              >
                <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/40 rounded-2xl flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Users className="w-7 h-7" />
                </div>
                <div className="text-center">
                  <span className="text-sm font-bold block">ลูกไก่ ({chickCount})</span>
                  <span className="text-[10px] text-slate-400 font-medium font-sans">Chicks</span>
                </div>
              </button>
            </div>
          </div>

          {/* Chick Management & Farm Health Modules */}
          <div className="space-y-3">
            <h2 className="font-bold text-slate-800 dark:text-slate-200 px-1">ระบบบริหารจัดการลูกไก่ & สุขภาพฟาร์ม</h2>
            
            {/* 1-Month Chick Banding Banner */}
            <div 
              onClick={() => onNavigate('chick-banding')}
              className="p-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-[2rem] active:scale-95 transition-all shadow-md shadow-amber-500/20 cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white text-xl">
                  🏷️
                </div>
                <div className="text-left">
                  <span className="text-base font-bold block">บันทึกคัดเพศ & ติดกิ๊ฟปีกไก่ 1 เดือน 🐥</span>
                  <span className="text-xs text-white/80 font-medium font-sans">1-Month Chick Sexing & Wing Banding Registry</span>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-white/80" />
            </div>

            {/* Farm Statistics Banner */}
            <div 
              onClick={() => onNavigate('statistics')}
              className="p-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-[2rem] active:scale-95 transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white">
                  <BarChart className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <span className="text-base font-bold block">สถิติฟาร์มอัจฉริยะ 📊</span>
                  <span className="text-xs text-white/80 font-medium font-sans">Farm Analytics & Population Stats</span>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-white/80" />
            </div>

            {/* Vaccine Notification Banner */}
            <div 
              onClick={() => onNavigate('vaccine')}
              className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[2rem] active:scale-95 transition-all shadow-md shadow-blue-600/20 cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white">
                  <Syringe className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <span className="text-base font-bold block">โปรแกรมทำวัคซีนไก่ชน 💉</span>
                  <span className="text-xs text-white/80 font-medium font-sans">Vaccination Schedule & Notifications</span>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-white/80" />
            </div>
          </div>
        </div>
        </div>
      </main>

      {/* Modern Bottom Navigation Bar */}
      <nav className="h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 fixed bottom-0 left-0 right-0 max-w-6xl mx-auto w-full flex items-center justify-around px-2 z-40 shadow-lg">
        <button 
          onClick={() => { setActiveTab('home'); onNavigate('dashboard'); }}
          className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all cursor-pointer ${activeTab === 'home' ? 'text-red-600 font-bold' : 'text-slate-400'}`}
        >
          <LayoutDashboard className={`w-5 h-5 ${activeTab === 'home' ? 'scale-110' : ''}`} />
          <span className="text-[10px]">หน้าแรก</span>
        </button>

        <button 
          onClick={() => onNavigate('chicken-list')}
          className="flex flex-col items-center gap-1 flex-1 py-1 transition-all text-slate-400 hover:text-red-600 cursor-pointer"
        >
          <ChickenIcon size={20} />
          <span className="text-[10px]">ไก่ในฟาร์ม</span>
        </button>

        <button 
          onClick={() => onNavigate('statistics')}
          className="flex flex-col items-center gap-1 flex-1 py-1 transition-all text-slate-400 hover:text-emerald-600 cursor-pointer"
        >
          <BarChart className="w-5 h-5" />
          <span className="text-[10px]">สถิติฟาร์ม</span>
        </button>

        <button 
          onClick={() => onNavigate('profile')}
          className="flex flex-col items-center gap-1 flex-1 py-1 transition-all text-slate-400 hover:text-blue-600 cursor-pointer"
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px]">โปรไฟล์</span>
        </button>
      </nav>



      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center space-y-4 border border-slate-100 dark:border-white/10 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-red-100 dark:bg-red-950/50 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <LogOut className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">ยืนยันการออกจากระบบ?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">คุณต้องการออกจากระบบบริหารจัดการสายเลือดไก่ชนใช่หรือไม่</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button 
                onClick={onLogout}
                className="py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md shadow-red-600/20 active:scale-95 transition-all cursor-pointer"
              >
                ยืนยัน ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
