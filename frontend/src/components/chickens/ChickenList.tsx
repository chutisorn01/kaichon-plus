import { useState, useEffect } from 'react';
import { Plus, Search, ChevronLeft, ChevronRight, Swords, Tag, Heart, ShieldCheck, Filter, Sparkles, Trophy, Trash2, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { ChickenIcon } from '../ui/ChickenIcon';
import { getBandColorClass, getBandColorCircleClass } from '../pedigree/FatherRegistry';

export default function ChickenList({ onNavigate }: { onNavigate: (page: string, id?: string) => void }) {
  const [chickens, setChickens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [search, setSearch] = useState(() => sessionStorage.getItem('chickenList_searchQuery') || '');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female' | 'chick'>(() => 
    (sessionStorage.getItem('chickenList_genderFilter') as 'all' | 'male' | 'female' | 'chick') || 'all'
  );
  const [alertConfig, setAlertConfig] = useState<{ 
    show: boolean; 
    title: string; 
    message: string; 
    type: 'info' | 'success' | 'error';
    onConfirm?: () => void;
  } | null>(null);
  const [chickenToDelete, setChickenToDelete] = useState<any>(null);

  useEffect(() => {
    sessionStorage.setItem('chickenList_searchQuery', search);
    sessionStorage.setItem('chickenList_genderFilter', genderFilter);
    setPage(1);
    fetchChickens(1);
  }, [search, genderFilter]);

  const fetchChickens = async (pageNum = 1) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setIsLoadingMore(true);

      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      let url = `${import.meta.env.VITE_API_URL}/api/chickens?search=${encodeURIComponent(search)}&includeChicks=true&page=${pageNum}&limit=20`;
      if (genderFilter !== 'all') {
        url += `&gender=${genderFilter}`;
      }

      const res = await fetch(url, { headers });
      const data = await res.json();

      let newChickens = [];
      let _hasMore = false;

      if (data.success && data.pagination) {
        newChickens = data.data || [];
        _hasMore = data.pagination.hasMore;
      } else {
        newChickens = data.data || data.chickens || (Array.isArray(data) ? data : []);
      }

      setHasMore(_hasMore);
      
      if (pageNum === 1) {
        setChickens(newChickens);
      } else {
        setChickens(prev => [...prev, ...newChickens]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleDelete = (e: React.MouseEvent, chicken: any) => {
    e.stopPropagation();
    setChickenToDelete(chicken);
  };

  const confirmDelete = async () => {
    if (!chickenToDelete) return;
    const chicken = chickenToDelete;

    if (chicken._id?.startsWith('mock')) {
      setChickens(prev => prev.filter(c => c._id !== chicken._id));
      setChickenToDelete(null);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      let endpoint = `${import.meta.env.VITE_API_URL}/api/chickens/${chicken._id}`;
      if (chicken.isFatherRegistry) {
        endpoint = `${import.meta.env.VITE_API_URL}/api/fathers/${chicken._id}`;
      } else if (chicken.isMotherRegistry) {
        endpoint = `${import.meta.env.VITE_API_URL}/api/mothers/${chicken._id}`;
      }

      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers
      });

      if (res.ok) {
        setChickens(prev => prev.filter(c => c._id !== chicken._id));
        setAlertConfig({ show: true, type: 'success', message: 'ลบข้อมูลไก่ชนเรียบร้อยแล้ว' });
      } else {
        const errData = await res.json();
        setAlertConfig({
          show: true,
          title: '⚠️ ไม่สามารถลบข้อมูลได้',
          message: errData.message || 'ไม่สามารถลบข้อมูลไก่ชนได้',
          type: 'error'
        });
      }
    } catch (err) {
      console.error(err);
      setAlertConfig({
        show: true,
        title: '❌ เกิดข้อผิดพลาด',
        message: 'เกิดข้อผิดพลาดในการลบข้อมูล',
        type: 'error'
      });
    } finally {
      setChickenToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col pb-24 text-slate-900 dark:text-slate-100 transition-colors relative">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 px-4 py-3 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button 
              onClick={() => onNavigate('dashboard')} 
              className="p-1.5 sm:p-2 -ml-1 sm:-ml-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-1.5 sm:gap-2 truncate">
                🐓 ทะเบียนไก่ชน
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate">จัดการข้อมูลประวัติและกิ๊ฟปีกทั้งหมด</p>
            </div>
          </div>

          <button 
            onClick={() => onNavigate('chicken-add')}
            className="px-3 sm:px-4 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-bold text-[10px] sm:text-xs rounded-2xl shadow-md shadow-red-600/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 
            <span className="hidden sm:inline">เพิ่มไก่ชนใหม่</span>
            <span className="sm:hidden">เพิ่มใหม่</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto w-full p-4 space-y-4 flex-1 relative z-10">
        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-sm space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อไก่, รหัสประจำตัว (เช่น SCJ-001), หรือเลขกิ๊ฟ..."
              className="w-full pl-10 pr-10 py-3 bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-red-500 dark:focus:border-red-500/50 rounded-2xl text-sm outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Gender Filter Badges */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> ตัวกรอง:
            </span>
            {[
              { id: 'all', label: () => 'ทั้งหมด' },
              { id: 'male', label: (isActive: boolean) => <span className="flex items-center gap-1">พ่อพันธุ์ <Swords className={`w-3.5 h-3.5 ${isActive ? '' : 'text-blue-500 dark:text-blue-400'}`} /></span> },
              { id: 'female', label: (isActive: boolean) => <span className="flex items-center gap-1">แม่พันธุ์ <Heart className={`w-3.5 h-3.5 ${isActive ? '' : 'text-pink-500 dark:text-pink-400'}`} /></span> },
              { id: 'chick', label: (isActive: boolean) => <span className="flex items-center gap-1">ลูกไก่ <Sparkles className={`w-3.5 h-3.5 ${isActive ? '' : 'text-amber-500 dark:text-amber-400'}`} /></span> }
            ].map(tab => {
              const isActive = genderFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setGenderFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-red-600 text-white shadow-sm shadow-red-600/30' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab.label(isActive)}
                </button>
              );
            })}
          </div>
        </div>

        {/* List Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-bold text-slate-400">กำลังโหลดข้อมูลไก่ชน...</span>
          </div>
        ) : chickens.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200/80 dark:border-white/10 text-center space-y-3">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto text-3xl">
              🐓
            </div>
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">ยังไม่มีข้อมูลไก่ชนในระบบ</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">คุณยังไม่ได้บันทึกข้อมูลไก่ชน หรือลบข้อมูลออกหมดแล้ว สามารถกดปุ่มเพิ่มไก่ชนใหม่ได้ด้านบนครับ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chickens.map((chicken) => (
              <div 
                key={chicken._id}
                onClick={() => {
                  try { sessionStorage.setItem(`cached_chicken_${chicken._id}`, JSON.stringify(chicken)); } catch (e) {}
                  onNavigate('chicken-detail', chicken._id);
                }}
                className="group bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-xl hover:border-red-500/30 dark:hover:border-red-500/30 active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden flex items-center gap-4"
              >
                {/* Image Column */}
                <div className="w-28 h-28 bg-slate-50 dark:bg-slate-800/80 rounded-2xl overflow-hidden shrink-0 border border-slate-100 dark:border-white/5 flex items-center justify-center relative shadow-inner">
                  <img 
                    src={`${import.meta.env.VITE_API_URL}/api/${chicken.gender === 'chick' ? 'chicks' : 'chickens'}/${chicken._id}/image`} 
                    alt={chicken.name} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.nextElementSibling) {
                        (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                      }
                    }}
                  />
                  <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hidden-fallback" style={{ display: 'none' }}>
                    <ChickenIcon size={28} />
                  </div>
                </div>

                {/* Text Column */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    {/* Top Row: Gender Badge, Code, Delete */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        chicken.gender === 'male' 
                          ? 'bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30' 
                          : chicken.gender === 'female'
                          ? 'bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 border border-pink-100 dark:border-pink-900/30'
                          : 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30'
                      }`}>
                        {chicken.gender === 'male' ? <Swords className="w-3 h-3" /> : chicken.gender === 'female' ? <Heart className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                        {chicken.gender === 'male' ? 'พ่อพันธุ์' : chicken.gender === 'female' ? 'แม่พันธุ์' : chicken.chickGender === 'ผู้' ? 'ลูกไก่ (ผู้)' : chicken.chickGender === 'เมีย' ? 'ลูกไก่ (เมีย)' : 'ลูกไก่'}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-black px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg max-w-[120px] truncate" title={chicken.code}>
                          {chicken.code}
                        </span>
                        <button 
                          onClick={(e) => handleDelete(e, chicken)}
                          className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                          title="ลบข้อมูลไก่ชน"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Chicken Name & Bloodline */}
                    <div>
                      <h3 className={`text-sm font-black transition-colors truncate ${
                        (chicken.gender === 'male' || (chicken.gender === 'chick' && chicken.chickGender === 'ผู้') || chicken.chickGender === 'male') ? 'text-blue-700 dark:text-blue-400 group-hover:text-blue-600' :
                        (chicken.gender === 'female' || (chicken.gender === 'chick' && chicken.chickGender === 'เมีย') || chicken.chickGender === 'female') ? 'text-pink-600 dark:text-pink-400 group-hover:text-pink-500' :
                        'text-slate-900 dark:text-white group-hover:text-red-600'
                      }`}>
                        {(() => {
                          let displayName = chicken.name || '';
                          if (displayName.includes('เจ้าชาย')) displayName = 'ไก่เพศผู้ "ยังไม่มีชื่อ"';
                          if (displayName.includes('เจ้าหญิง')) displayName = 'ไก่เพศเมีย "ยังไม่มีชื่อ"';
                          
                          if (chicken.gender === 'male' || (chicken.gender === 'chick' && chicken.chickGender === 'ผู้') || chicken.chickGender === 'male') {
                            return displayName.includes('♂') ? displayName : `♂ ${displayName}`;
                          } else if (chicken.gender === 'female' || (chicken.gender === 'chick' && chicken.chickGender === 'เมีย') || chicken.chickGender === 'female') {
                            return displayName.includes('♀') ? displayName : `♀ ${displayName}`;
                          }
                          return displayName;
                        })()}
                      </h3>
                      <div className="flex items-center justify-between mt-0.5 gap-2">
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate min-w-0">
                          สายเลือด: <strong className="text-slate-700 dark:text-slate-300 font-bold">{chicken.bloodline || chicken.breed || 'ไม่ระบุ'}</strong>
                        </p>
                        <span className="text-[10px] font-bold text-red-600 dark:text-red-400 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform shrink-0 whitespace-nowrap">
                          รายละเอียด <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Band Info */}
                  <div className="pt-2 mt-2 border-t border-slate-100 dark:border-white/5 flex items-center text-[10px]">
                    {chicken.bandNumber ? (
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 font-bold rounded-lg border min-w-0 max-w-full ${getBandColorClass(chicken.bandColor || 'แดง')}`}>
                        <Tag className="w-2.5 h-2.5 shrink-0" /> 
                        <span className="flex items-center gap-1 shrink-0">
                          {chicken.bandColor && <div className={`w-2 h-2 rounded-full ${getBandColorCircleClass(chicken.bandColor)} shadow-sm border border-black/10 shrink-0`} />}
                        </span>
                        <span className="shrink-0">{chicken.bandNumber}</span>
                        {(() => {
                          const farmText = chicken.bandText || (chicken.user ? (chicken.user.farmName || chicken.user.name) : null);
                          return farmText ? <span className="opacity-90 ml-0.5 truncate max-w-[80px]">[{farmText}]</span> : null;
                        })()}
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-400 italic shrink-0">ไม่ได้ติดกิ๊ฟ</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {alertConfig?.show && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-white/10 text-center space-y-4 animate-in scale-in duration-200">
            <div className="flex justify-center">
              {alertConfig.type === 'success' ? (
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 rounded-full flex items-center justify-center shadow-inner">
                  <CheckCircle className="w-8 h-8" />
                </div>
              ) : alertConfig.type === 'error' ? (
                <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 text-red-500 rounded-full flex items-center justify-center shadow-inner">
                  <AlertTriangle className="w-8 h-8" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/30 text-blue-500 rounded-full flex items-center justify-center shadow-inner">
                  <Heart className="w-8 h-8" />
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-black text-slate-900 dark:text-white">{alertConfig.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed">{alertConfig.message}</p>
            </div>
            <button 
              onClick={() => {
                const onConfirm = alertConfig.onConfirm;
                setAlertConfig(null);
                if (onConfirm) onConfirm();
              }}
              className="w-full py-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold rounded-2xl active:scale-95 transition-all text-xs cursor-pointer shadow-sm"
            >
              ตกลง
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {chickenToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-white/10 text-center space-y-5 animate-in scale-in duration-200">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 text-red-500 rounded-full flex items-center justify-center shadow-inner">
                <Trash2 className="w-8 h-8" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">ยืนยันการลบข้อมูล</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                คุณต้องการลบไก่ชน <br/>
                <strong className="text-red-600 dark:text-red-400">"{chickenToDelete.name}"</strong> <br/>
                <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md mt-1 inline-block max-w-[200px] truncate" title={chickenToDelete.code}>รหัส: {chickenToDelete.code}</span>
              </p>
              <p className="text-[10px] text-red-500/80 font-bold bg-red-50 dark:bg-red-950/30 px-3 py-1.5 rounded-xl mt-3 inline-block">
                ⚠️ ลบแล้วไม่สามารถกู้คืนได้
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                onClick={() => setChickenToDelete(null)}
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl active:scale-95 transition-all text-xs cursor-pointer"
              >
                ยกเลิก
              </button>
              <button 
                onClick={confirmDelete}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-md shadow-red-600/20 active:scale-95 transition-all text-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> ยืนยันลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
