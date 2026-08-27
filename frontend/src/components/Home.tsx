import { Swords, Trophy, Search, ShieldCheck, Activity, BadgeCheck, Tag, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useState, useEffect } from 'react';
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
};import { LanguageToggle } from './LanguageToggle';
import { useLanguage } from './LanguageContext';

export default function Home({ onNavigate }: { onNavigate: (page: any, id?: string) => void }) {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState(() => sessionStorage.getItem('home_searchQuery') || '');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [promotedFathers, setPromotedFathers] = useState<any[]>([]);

  const topRoosters = [
    { id: 1, name: "แดงเพลิง", bloodline: "พม่า-ง่อน", wins: 5 },
    { id: 2, name: "สายฟ้า", bloodline: "ไซ่ง่อน", wins: 4 },
    { id: 3, name: "เจ้าขุน", bloodline: "พม่า", wins: 3 },
  ];

  useEffect(() => {
    fetchPromotedFathers();
  }, []);

  const fetchPromotedFathers = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/fathers/promoted`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setPromotedFathers(data);
      }
    } catch (err) {
      console.error('Error fetching promoted fathers:', err);
    }
  };

  useEffect(() => {
    sessionStorage.setItem('home_searchQuery', searchQuery);
    
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chickens?search=${encodeURIComponent(query)}&includeChicks=true`);
      const data = await res.json();
      if (data.status === 'success') {
        setSearchResults(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-linear-to-tr from-slate-50 via-red-50 to-white dark:from-slate-900 dark:via-red-950 dark:to-black font-sans flex flex-col overflow-hidden text-slate-900 dark:text-slate-300 transition-colors duration-500">
      {/* Decorative background elements */}
      <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-red-400 dark:bg-red-600 rounded-full mix-blend-multiply dark:mix-blend-multiply filter blur-[128px] opacity-20 dark:opacity-10 animate-pulse pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-96 h-96 bg-orange-400 dark:bg-orange-600 rounded-full mix-blend-multiply dark:mix-blend-multiply filter blur-[128px] opacity-15 dark:opacity-10 animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>
      <div className="fixed top-[40%] left-[50%] w-96 h-96 bg-red-300 dark:bg-red-900 rounded-full mix-blend-multiply dark:mix-blend-multiply filter blur-[150px] opacity-15 dark:opacity-10 animate-pulse pointer-events-none" style={{ animationDelay: '4s' }}></div>

      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 z-999 shrink-0 sticky top-0 transition-all duration-300 w-full">
        <div className="w-full px-4">
          <div className="flex justify-between items-center h-16 relative">
            <div className="flex items-center min-w-0">
              <div className="flex items-center group cursor-pointer shrink-0" onClick={() => onNavigate('home')}>
                <Swords className="w-6 h-6 mr-2 text-red-600 dark:text-red-500 shrink-0" />
                <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight whitespace-nowrap overflow-hidden">KaiChon Plus</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0 ml-2">
              <LanguageToggle />
              <ThemeToggle />
              <button 
                onClick={() => onNavigate('login')}
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all active:scale-[0.98] whitespace-nowrap cursor-pointer shadow-md shadow-red-600/20"
              >
                {t('login')}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden">
        {/* Hero Section */}
        <div className="pt-8 pb-8 sm:pt-16 sm:pb-12 lg:pt-20 lg:pb-16 w-full px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mb-4 sm:mb-6 text-slate-900 dark:text-white leading-tight">
              {t('appName')}
            </h1>
            <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed font-medium">
              {t('appSub')}
            </p>

            {/* Global Search UI */}
            <div className="max-w-xl mx-auto mb-10 relative">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  className="block w-full pl-11 pr-12 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-500/50 transition-all text-sm sm:text-base outline-none"
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
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Public Search Results Overlay */}
              {searchQuery.trim().length > 0 && (
                <div className="mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 text-left max-h-80 overflow-y-auto z-50 relative">
                  <div className="text-xs font-bold text-slate-400 mb-3 uppercase flex justify-between items-center">
                    <span>ผลการค้นหาสาธารณะ ({searchResults.length} รายการ)</span>
                    <span className="text-[10px] text-red-500">Public Verification</span>
                  </div>
                  {searchResults.length === 0 && !isSearching ? (
                    <div className="text-center py-6 text-slate-400 text-sm">ไม่พบไก่ชนหรือกิ๊ฟปีกตรงกับคำค้นหานี้</div>
                  ) : (
                    <div className="space-y-2">
                      {searchResults.map((chicken) => (
                        <div 
                          key={chicken._id}
                          onClick={() => onNavigate('chicken-detail', chicken._id)}
                          className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 border border-transparent hover:border-red-200 transition-all cursor-pointer flex items-center justify-between"
                        >
                          <div className="flex-1 min-w-0 pr-3">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`font-bold text-sm truncate ${
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
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-1.5 mt-1">
                              <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                                {chicken.user?.farmName || chicken.user?.name || 'ฟาร์มสมาชิก'}
                                {chicken.user?.isVerified === true && (
                                  <span title="Verified Farm">
                                    <BadgeCheck className="w-4 h-4 text-white fill-blue-500 inline drop-shadow-sm" />
                                  </span>
                                )}
                              </span>
                              <span className="text-[9px] px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-mono font-bold rounded-full whitespace-nowrap">
                                KP-{chicken._id.substring(12, 18).toUpperCase()}-{chicken._id.substring(18, 24).toUpperCase()}
                              </span>
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
                          <span className="text-xs font-bold text-red-600 shrink-0">ดูประวัติ ➔</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-1 py-1">คำค้นยอดนิยม:</span>
                {['พม่า', 'ก๋อย', '001', 'KCP', 'กุมารจีน'].map((tag) => (
                  <button 
                    key={tag} 
                    onClick={() => setSearchQuery(tag)}
                    className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 transition-colors border border-transparent hover:border-red-200 cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <button 
                onClick={() => onNavigate('register')}
                className="w-full sm:w-auto px-8 py-3.5 text-sm sm:text-base font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-600/20 transform transition-all active:scale-95 flex items-center justify-center"
              >
                เริ่มต้นใช้งานฟรี
              </button>
              <button 
                onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-8 py-3.5 text-sm sm:text-base font-medium text-slate-700 dark:text-white bg-white/50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-700 rounded-xl backdrop-blur-sm transition-all active:scale-95"
              >
                ดูฟีเจอร์ทั้งหมด
              </button>
            </div>
          </div>
        </div>

        {/* Quick Links UI */}
        <div id="features-section" className="max-w-7xl mx-auto px-4 mb-16 scroll-mt-24">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {[
              { icon: Search, label: 'เช็คสายเลือด', desc: 'ตรวจสอบสายพันธุ์', color: 'text-red-500', bg: 'bg-red-50' },
              { icon: Trophy, label: 'ผลการชน', desc: 'สถิติการแข่ง', color: 'text-blue-500', bg: 'bg-blue-50' },
              { icon: ShieldCheck, label: 'ใบเซอร์ไก่', desc: 'รับรองถิ่นกำเนิด', color: 'text-green-500', bg: 'bg-green-50' },
              { icon: Activity, label: 'ตารางยา', desc: 'บันทึกวัคซีน', color: 'text-purple-500', bg: 'bg-purple-50' },
            ].map((item, idx) => (
              <div key={idx} className="p-4 bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                <div className={`w-10 h-10 ${item.bg} dark:bg-slate-800 rounded-xl flex items-center justify-center mb-3 ${item.color} group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm sm:text-base mb-1 dark:text-white">{item.label}</h3>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 leading-tight">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {promotedFathers.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-4 w-full overflow-x-hidden border-b border-slate-100 dark:border-slate-800/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
              {promotedFathers.map((father, index) => (
                <div 
                  key={father._id}
                  onClick={() => onNavigate('chicken-detail', father._id)}
                  className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl dark:hover:shadow-red-950/20 transition-all border border-slate-200 dark:border-white/10 group relative transform hover:-translate-y-1 flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    {/* Image Area */}
                    <div className="h-48 sm:h-56 bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative overflow-hidden">
                      {father.image ? (
                        <img 
                          src={father.image} 
                          alt={father.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Swords className="w-20 h-20 text-orange-500/30 dark:text-orange-500/50 transform transition-transform group-hover:scale-110" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent z-10"></div>
                      
                      <div className="absolute top-3 left-3 bg-red-650 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg z-20 shadow-md">
                        {language === 'th' ? 'การ์ดแนะนำ' : 'RECOMMENDED'}
                      </div>

                      <div className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg z-20 shadow-md flex items-center gap-1 border border-amber-400/30">
                        <span>🏆</span>
                        <span>{language === 'th' ? `อันดับ ${index + 1}` : `Rank ${index + 1}`}</span>
                      </div>
 
                      <div className="absolute bottom-4 left-4 z-20">
                        <h3 className="text-xl font-bold text-white drop-shadow-md">{father.name}</h3>
                        <p className="text-[10px] text-slate-200 font-mono mt-0.5">{father.code}</p>
                      </div>
                    </div>
 
                    {/* Info Area */}
                    <div className="p-5 space-y-3.5">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-400 font-semibold">{language === 'th' ? 'ฟาร์มเจ้าของ' : 'Owner Farm'}</span>
                        <span className="text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          {father.user?.farmName || father.user?.name || 'ฟาร์มสมาชิก'}
                          {father.user?.isVerified && (
                            <BadgeCheck className="w-4 h-4 text-blue-500 shrink-0" />
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-400 font-semibold">{language === 'th' ? 'สายเลือด' : 'Bloodline'}</span>
                        <span className="text-slate-700 dark:text-slate-300 bg-slate-105 px-2.5 py-0.5 rounded-lg border border-slate-200/50 dark:border-slate-800 font-semibold truncate max-w-[150px]">
                          {father.breed || 'ไม่ระบุ'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-400 font-semibold">{language === 'th' ? 'ความนิยม' : 'Popularity'}</span>
                        <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 font-black">
                          👑 {language === 'th' ? 'พ่อไก่ติดอันดับยอดนิยม' : 'Top Popular Stud'}
                        </span>
                      </div>

                      {father.studFee !== undefined && father.studFee > 0 ? (
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-slate-400 font-semibold">{language === 'th' ? 'ค่าทับ/เปิดผสม' : 'Breeding Fee'}</span>
                          <span className="text-red-600 dark:text-red-400 font-black text-sm">
                            {father.studFee.toLocaleString()} ฿
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  
                  <div className="px-5 pb-5 pt-1">
                    <button className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer">
                      {language === 'th' ? 'ดูใบประวัติสายเลือด' : 'View Pedigree Certificate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-4 sm:pt-8 w-full overflow-x-hidden">
          <div className="mb-10 flex items-center justify-between">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center">
              <Trophy className="w-8 h-8 text-amber-500 dark:text-amber-400 mr-3 shrink-0" /> พ่อไก่ติดอันดับยอดนิยม
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 w-full">
            {topRoosters.map((rooster, index) => (
              <div key={rooster.id} className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl dark:hover:shadow-red-900/20 transition-all border border-slate-200 dark:border-white/10 group relative transform hover:-translate-y-1">
                <div className="absolute top-0 left-0 bg-linear-to-r from-amber-500 to-orange-400 text-white px-4 py-1.5 rounded-br-xl font-bold z-20 shadow-lg">
                  อันดับ {index + 1}
                </div>
                <div className="h-48 sm:h-56 bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative overflow-hidden group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                  <Swords className="w-20 h-20 text-orange-500/50 dark:text-orange-500/80 transform transition-transform group-hover:scale-110" />
                  <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 dark:from-slate-900 via-transparent dark:via-slate-900/40 to-transparent z-10"></div>
                  <h3 className="absolute bottom-5 left-5 text-2xl font-bold text-white z-20 drop-shadow-md">{rooster.name}</h3>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap mr-2">สายพันธุ์</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 truncate">{rooster.bloodline}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap mr-2">สถิติชนะ</span>
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20">
                      {rooster.wins} ไฟต์
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
