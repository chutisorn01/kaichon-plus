import { Swords, Search, ShieldCheck, Activity, BadgeCheck, Tag, X, Sparkles, Trophy } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useState, useEffect } from 'react';
import { getBandColorClass } from './pedigree/FatherRegistry';
import { useLanguage } from './LanguageContext';

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

export default function HomeView({ onNavigate }: { onNavigate: (page: any, id?: string) => void }) {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState(() => sessionStorage.getItem('home_searchQuery') || '');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [promotedFathers, setPromotedFathers] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);

  useEffect(() => {
    fetchPromotedFathers();
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/banners/active`);
      if (res.ok) {
        const data = await res.json();
        setBanners(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching banners:', err);
    }
  };

  const fetchPromotedFathers = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/fathers/promoted`);
      if (res.ok) {
        const data = await res.json();
        setPromotedFathers(Array.isArray(data) ? data : (data.data || []));
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
      if (res.ok) {
        const json = await res.json();
        // Handle both direct array and object with data array { status: 'success', data: [...] }
        const list = Array.isArray(json) 
          ? json 
          : (Array.isArray(json.data) ? json.data : (Array.isArray(json.chickens) ? json.chickens : []));
        setSearchResults(list);
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const resultsList = Array.isArray(searchResults) ? searchResults : [];

  return (
    <div className="fixed inset-0 bg-linear-to-tr from-slate-50 via-red-50 to-white dark:from-slate-900 dark:via-red-950 dark:to-black font-sans flex flex-col overflow-hidden text-slate-900 dark:text-slate-300 transition-colors duration-500">
      {/* Decorative background elements */}
      <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-red-400 dark:bg-red-600 rounded-full mix-blend-multiply dark:mix-blend-multiply filter blur-[128px] opacity-20 dark:opacity-10 animate-pulse pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-96 h-96 bg-orange-400 dark:bg-orange-600 rounded-full mix-blend-multiply dark:mix-blend-multiply filter blur-[128px] opacity-15 dark:opacity-10 animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>
      <div className="fixed top-[40%] left-[50%] w-96 h-96 bg-red-300 dark:bg-red-900 rounded-full mix-blend-multiply dark:mix-blend-multiply filter blur-[150px] opacity-15 dark:opacity-10 animate-pulse pointer-events-none" style={{ animationDelay: '4s' }}></div>

      {/* Header Bar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 z-999 shrink-0 sticky top-0 transition-all duration-300 w-full">
        <div className="w-full px-4">
          <div className="flex justify-between items-center h-16 relative">
            <div className="flex items-center min-w-0">
              <div className="flex items-center group cursor-pointer shrink-0" onClick={() => { document.getElementById('home-main-scroll')?.scrollTo({ top: 0, behavior: 'smooth' }); onNavigate('home'); }}>
                <Swords className="w-6 h-6 mr-2 text-red-600 dark:text-red-500 shrink-0" />
                <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight whitespace-nowrap overflow-hidden">KaiChon Plus</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0 ml-2">
              <ThemeToggle />
              <button
                onClick={() => onNavigate('login')}
                className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-semibold shadow-lg hover:shadow-red-500/25 transition-all text-xs sm:text-sm whitespace-nowrap"
              >
                {t('login')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="home-main-scroll" className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden">
        {/* Hero Section */}
        <div className="pt-8 pb-8 sm:pt-16 sm:pb-12 lg:pt-16 lg:pb-12 w-full px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-4 leading-tight">
              {t('appName')}
            </h1>
            <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed font-medium">
              {t('appSub')}
            </p>

            {/* Global Search UI */}
            <div className="max-w-xl mx-auto mb-8 relative">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="block w-full pl-11 pr-10 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-medium placeholder-slate-400 focus:outline-none focus:border-red-500 dark:focus:border-red-500 shadow-lg text-slate-900 dark:text-white transition-all"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
                  {isSearching && (
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {searchQuery && (
                    <button
                      onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Search Results Overlay */}
              {searchQuery.trim().length > 0 && (
                <div className="mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 text-left max-h-80 overflow-y-auto z-50 relative">
                  <div className="text-xs font-bold text-slate-400 mb-3 uppercase flex justify-between items-center">
                    <span>{t('publicVerification')} ({resultsList.length})</span>
                    <span className="text-[10px] text-red-500">Public Verification</span>
                  </div>

                  {resultsList.length === 0 && !isSearching ? (
                    <div className="text-center py-6 text-slate-400 text-sm">ไม่พบไก่ชนหรือกิ๊ฟปีกตรงกับคำค้นหานี้</div>
                  ) : (
                    <div className="space-y-2">
                      {resultsList.map((chicken) => (
                        <div
                          key={chicken._id}
                          onClick={() => onNavigate('chicken-detail', chicken._id)}
                          className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700 flex items-center justify-between group"
                        >
                          <div className="flex-1 min-w-0 pr-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-red-600 transition-colors truncate">
                                {chicken.name}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-1.5 mt-1">
                              <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                                {chicken.user?.farmName || chicken.user?.name || 'ฟาร์มสมาชิก'}
                                {chicken.user?.isVerified === true && (
                                  <BadgeCheck className="w-4 h-4 text-white fill-blue-500 inline drop-shadow-sm" />
                                )}
                              </span>
                              {chicken._id && (
                                <span className="text-[9px] px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-mono font-bold rounded-full whitespace-nowrap">
                                  KP-{chicken._id.substring(12, 18).toUpperCase()}-{chicken._id.substring(18, 24).toUpperCase()}
                                </span>
                              )}
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
            </div>

            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-1 py-1">{t('popularSearches')}</span>
              {['พม่า', 'ก๋อย', '001', 'A99', 'KP-', 'ธนูทอง', 'เสือดำ', 'กุมารจีน', 'ก็อตซิล่า', 'ทันใจ'].map((tag) => (
                <button 
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800/80 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-medium transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => onNavigate('register')}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-2xl font-bold text-base shadow-xl hover:shadow-red-600/30 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                {t('btnStart')}
              </button>
              <button
                onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 px-8 py-3.5 rounded-2xl font-bold text-base shadow-lg transition-all cursor-pointer"
              >
                {t('btnFeatures')}
              </button>
            </div>
          </div>
        </div>

        {/* 🚀 FIRST SECTION: Promoted Studs (พ่อพันธุ์แนะนำพิเศษ) */}
        {Array.isArray(promotedFathers) && promotedFathers.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-4 w-full overflow-x-hidden border-b border-slate-100 dark:border-slate-800/50">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" />
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {t('featuredStuds')}
                  </h2>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {t('featuredStudsSub')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {promotedFathers.map((father) => {
                const isVip = father.promotionTier === 'vip';
                return (
                <div
                  key={father._id}
                  onClick={() => onNavigate('chicken-detail', father._id)}
                  className={`relative h-[480px] rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all border group cursor-pointer transform hover:-translate-y-1 ${isVip ? 'border-amber-400 dark:border-amber-500/50 ring-2 ring-amber-400 shadow-amber-900/40' : 'border-slate-300 dark:border-slate-700/50 dark:hover:shadow-red-950/40'}`}
                >
                  {/* Full-bleed Background Image Area */}
                  <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                    {father.image ? (
                      <img 
                        src={father.image} 
                        alt={father.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <Swords className="w-20 h-20 text-slate-700 opacity-50" />
                    )}
                    
                    {/* Dark gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent z-10"></div>
                  </div>
                  
                  {/* Badge: การ์ดแนะนำ หรือ VIP (Top Right) */}
                  {isVip ? (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-900 text-[11px] font-black px-3 py-1.5 rounded-lg z-20 shadow-lg border border-amber-300 flex items-center gap-1.5 backdrop-blur-sm">
                      <Sparkles className="w-3.5 h-3.5" />
                      แชมป์เงินล้าน
                    </div>
                  ) : (
                    <div className="absolute top-4 right-4 bg-red-600/90 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1.5 rounded-lg z-20 shadow-lg border border-red-500">
                      {t('recommendedCard')}
                    </div>
                  )}

                  {/* Info Area (Bottom) */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 z-20 flex flex-col justify-end">
                    <div className="mb-3">
                      <h3 className="text-2xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] line-clamp-1 leading-tight">{father.name}</h3>
                      <p className="text-[11px] text-amber-400 font-mono mt-1 font-bold tracking-wider drop-shadow-md">ID: {father.code}</p>
                    </div>

                    <div className="space-y-1.5 text-xs mb-4">
                      <div className="flex justify-between items-center text-slate-300 drop-shadow-sm">
                        <span className="font-medium opacity-80">{t('ownerFarm')}</span>
                        <span className="font-bold text-white flex items-center gap-1">
                          {father.user?.farmName || father.user?.name || 'ฟาร์มสมาชิก'}
                          {father.user?.isVerified && (
                            <BadgeCheck className="w-4 h-4 text-blue-400 inline fill-blue-500/20" />
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-slate-300 drop-shadow-sm">
                        <span className="font-medium opacity-80">{t('bloodline')}</span>
                        <span className="font-bold text-white">
                          {father.breed || father.bloodline || 'ไม่ระบุ'}
                        </span>
                      </div>

                      {father.studFee !== undefined && father.studFee > 0 && (
                        <div className="flex justify-between items-center text-slate-300 drop-shadow-sm pt-0.5">
                          <span className="font-medium opacity-80">{t('studFee')}</span>
                          <span className="font-black text-amber-400 text-sm">
                            {father.studFee.toLocaleString()} ฿
                          </span>
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('chicken-detail', father._id);
                      }}
                      className={`w-full py-2.5 px-4 font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 backdrop-blur-md ${isVip ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-900 border border-yellow-400/50' : 'bg-red-600/90 hover:bg-red-500 text-white border border-red-500/50'}`}
                    >
                      {t('viewPedigree')}
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        )}

        {/* B2B Advertisement Banners */}
        {banners.map((banner) => (
          <div key={banner._id} className="max-w-7xl mx-auto px-4 mt-4 mb-8">
            <a href={banner.targetUrl} target="_blank" rel="noopener noreferrer" className="block relative w-full overflow-hidden rounded-2xl shadow-lg border border-slate-200 dark:border-white/10 group cursor-pointer bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 transition-transform hover:-translate-y-1">
              {/* Banner Background */}
              <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-600 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-600 rounded-full blur-3xl opacity-50"></div>
              </div>
              
              <div className="relative flex flex-col md:flex-row items-center justify-between p-6 sm:p-8">
                <div className="flex-1 text-center md:text-left z-10">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    {banner.subtitle}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
                    {banner.title}
                  </h3>
                  <p className="text-slate-300 text-sm sm:text-base font-medium max-w-lg mx-auto md:mx-0">
                    {banner.description}
                  </p>
                </div>
                
                <div className="mt-6 md:mt-0 flex-shrink-0 z-10">
                  <div className="bg-red-600 group-hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold shadow-xl group-hover:shadow-red-500/50 transition-all flex items-center gap-2">
                    {banner.buttonText} <span className="group-hover:translate-x-1 transition-transform">➔</span>
                  </div>
                </div>
              </div>
              
              {/* Ad Badge Overlay */}
              <div className="absolute top-0 right-0 bg-white/10 backdrop-blur-md text-white/70 text-[9px] px-2 py-0.5 rounded-bl-lg font-mono">
                ADVERTISEMENT
              </div>
            </a>
          </div>
        ))}

        {/* Quick Links UI */}
        <div id="features-section" className="max-w-7xl mx-auto px-4 mb-16 scroll-mt-24 pt-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {[
              { icon: Search, label: 'เช็คสายเลือด', desc: 'ตรวจสอบสายพันธุ์', color: 'text-red-500', bg: 'bg-red-50' },
              { icon: Trophy, label: 'ผลการชน', desc: 'สถิติการแข่ง', color: 'text-blue-500', bg: 'bg-blue-50' },
              { icon: ShieldCheck, label: 'ใบเซอร์ไก่', desc: 'รับรองถิ่นกำเนิด', color: 'text-green-500', bg: 'bg-green-50' },
              { icon: Activity, label: 'ตารางยา', desc: 'บันทึกวัคซีน', color: 'text-purple-500', bg: 'bg-purple-50' },
            ].map((item, index) => (
              <div key={index} className="bg-white dark:bg-slate-900/60 p-4 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-lg hover:shadow-xl transition-all">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${item.bg} dark:bg-slate-800 rounded-xl flex items-center justify-center mb-3 sm:mb-4`}>
                  <item.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${item.color}`} />
                </div>
                <h3 className="font-bold text-sm sm:text-base mb-1 dark:text-white">{item.label}</h3>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 leading-tight">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
