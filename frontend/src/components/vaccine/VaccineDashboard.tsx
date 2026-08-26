import { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  Syringe, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  Users, 
  User, 
  Search,
  BookOpen,
  Filter,
  RefreshCw,
  Info
} from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';

const STANDARD_VACCINES = [
  { name: 'นิวคาสเซิล + หลอดลมอักเสบ (รอบ 1)', age: '7 วัน', method: 'หยอดตา / จมูก', desc: 'สร้างภูมิคุ้มกันโรคระบบทางเดินหายใจระยะเริ่มต้น' },
  { name: 'ฝีดาษไก่', age: '14 วัน', method: 'แทงปีก', desc: 'ป้องกันโรคฝีดาษบริเวณหงอน เหนียง และตุ่มปีก' },
  { name: 'นิวคาสเซิล + หลอดลมอักเสบ (รอบ 2)', age: '28 วัน (1 เดือน)', method: 'หยอดตา / จมูก', desc: 'กระตุ้นภูมิคุ้มกันความต้านทานระดับเข้มข้น' },
  { name: 'อหิวาต์เป็ดไก่', age: '60 วัน (2 เดือน)', method: 'ฉีดเข้ากล้ามเนื้อ', desc: 'ป้องกันโรคติดเชื้อแบคทีเรียอหิวาต์ในสัตว์ปีก' }
];

export default function VaccineDashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'batch' | 'individual'>('batch');
  const [activeTab, setActiveTab] = useState<'all' | 'overdue' | 'today' | 'upcoming'>(() => {
    return (sessionStorage.getItem('VaccineDashboard_activeTab') as any) || 'all';
  });

  useEffect(() => {
    sessionStorage.setItem('VaccineDashboard_activeTab', activeTab);
  }, [activeTab]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProgramGuide, setShowProgramGuide] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<any>(null);

  useEffect(() => {
    fetchSchedule();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchSchedule = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vaccines/schedule`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setSchedule(data.data);
      }
    } catch (err) {
      console.error('Error fetching vaccine schedule:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenConfirm = (item: any) => {
    setConfirmModal(item);
  };

  const executeMarkCompleted = async () => {
    if (!confirmModal) return;
    const item = confirmModal;
    setConfirmModal(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/vaccines/mark-completed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          chickenIds: item.chickenIds,
          vaccineName: item.vaccineName
        })
      });

      const data = await res.json();
      if (data.status === 'success') {
        setSchedule(prev => prev.filter(s => !item.chickenIds.includes(s.chickenId) || s.vaccineName !== item.vaccineName));
        setToast({ message: item.isGroup ? `บันทึกวัคซีนให้ลูกไก่ ${item.count} ตัวเรียบร้อย! 🎉` : `บันทึกวัคซีนให้ ${item.chickenName} เรียบร้อย! 🎉`, type: 'success' });
      } else {
        setToast({ message: data.message || 'เกิดข้อผิดพลาดในการบันทึก', type: 'error' });
      }
    } catch (err) {
      console.error('Error marking vaccine completed:', err);
      setToast({ message: 'เกิดข้อผิดพลาดในการบันทึก', type: 'error' });
    }
  };

  const displayData = useMemo(() => {
    if (viewMode === 'individual') {
      return schedule.map(s => ({ ...s, isGroup: false, chickenIds: [s.chickenId], count: 1 }));
    }

    const grouped: any[] = [];
    const map = new Map<string, any>();
    
    schedule.forEach(item => {
      if (item.batchId) {
        const key = `${item.batchId}-${item.vaccineName}`;
        if (map.has(key)) {
          const existing = map.get(key);
          existing.chickenIds.push(item.chickenId);
          existing.count += 1;
        } else {
          const newItem = {
            ...item,
            id: key,
            isGroup: true,
            chickenIds: [item.chickenId],
            count: 1
          };
          map.set(key, newItem);
          grouped.push(newItem);
        }
      } else {
        grouped.push({ ...item, isGroup: false, chickenIds: [item.chickenId], count: 1 });
      }
    });
    
    return grouped;
  }, [schedule, viewMode]);

  const filteredData = useMemo(() => {
    let result = displayData;

    if (activeTab === 'overdue') {
      result = result.filter(s => s.status === 'overdue');
    } else if (activeTab === 'today') {
      result = result.filter(s => s.status === 'today');
    } else if (activeTab === 'upcoming') {
      result = result.filter(s => s.status === 'upcoming');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(item => 
        (item.vaccineName || '').toLowerCase().includes(q) ||
        (item.chickenName || '').toLowerCase().includes(q) ||
        (item.chickenCode || '').toLowerCase().includes(q) ||
        (item.batchCode || '').toLowerCase().includes(q)
      );
    }

    return result;
  }, [displayData, activeTab, searchQuery]);

  const overdueCount = displayData.filter(s => s.status === 'overdue').length;
  const todayCount = displayData.filter(s => s.status === 'today').length;
  const upcomingCount = displayData.filter(s => s.status === 'upcoming').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col text-slate-900 dark:text-white transition-colors relative w-full">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`px-6 py-3 rounded-full shadow-lg flex items-center gap-3 ${toast.type === 'success' ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-red-500 text-white shadow-red-500/20'}`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-white/10">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Syringe className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-center mb-2">ยืนยันการทำวัคซีน?</h3>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-6 text-sm">
              {confirmModal.isGroup 
                ? `คุณต้องการบันทึกการทำวัคซีน "${confirmModal.vaccineName}" ให้ลูกไก่ คอก ${confirmModal.batchCode} ทั้งหมด ${confirmModal.count} ตัว ใช่หรือไม่?`
                : `คุณต้องการบันทึกการทำวัคซีน "${confirmModal.vaccineName}" ให้กับ "${confirmModal.chickenName}" ใช่หรือไม่?`
              }
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-3 px-4 rounded-xl font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                ยกเลิก
              </button>
              <button 
                onClick={executeMarkCompleted}
                className="flex-1 py-3 px-4 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-colors"
              >
                ยืนยันบันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Program Guide Modal */}
      {showProgramGuide && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-100 dark:border-white/10 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="font-black text-base">คู่มือโปรแกรมวัคซีนไก่ชนมาตรฐาน</h3>
              </div>
              <button onClick={() => setShowProgramGuide(false)} className="text-slate-400 hover:text-slate-600 p-1">✕</button>
            </div>

            <div className="space-y-3">
              {STANDARD_VACCINES.map((vac, i) => (
                <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-blue-600 dark:text-blue-400">{vac.name}</span>
                    <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-black rounded-full">
                      อายุ {vac.age}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-slate-700 dark:text-slate-200">วิธี: {vac.method}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{vac.desc}</p>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setShowProgramGuide(false)}
              className="w-full py-3 bg-slate-900 dark:bg-slate-800 text-white font-bold rounded-2xl text-xs cursor-pointer active:scale-95 transition-all"
            >
              เข้าใจแล้ว ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}

      {/* Top Bar Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <button onClick={() => onNavigate('dashboard')} className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 flex items-center gap-2">
                โปรแกรมทำวัคซีน 💉
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchSchedule}
                className="p-2 text-slate-500 hover:text-blue-600 bg-slate-100 dark:bg-slate-800 rounded-full transition-colors cursor-pointer"
                title="รีเฟรชตาราง"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full px-4 sm:px-6 py-6 pb-24 overflow-y-auto max-w-6xl mx-auto">
        {/* Banner with Guide Button */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 mb-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0">
              <Syringe className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-0.5">ตารางทำวัคซีนอัจฉริยะ</h2>
              <p className="text-blue-100 text-xs font-medium">คำนวณวันกำหนดทำวัคซีนยึดตามวันฟักของลูกไก่อัตโนมัติ</p>
            </div>
          </div>

          <button
            onClick={() => setShowProgramGuide(true)}
            className="relative z-10 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-2 border border-white/20 cursor-pointer active:scale-95 transition-all shrink-0"
          >
            <BookOpen className="w-4 h-4" /> ดูโปรแกรมมาตรฐาน
          </button>
        </div>

        {/* View Toggle */}
        {!isLoading && schedule.length > 0 && (
          <div className="space-y-4 mb-6">
            <div className="flex bg-slate-200/60 dark:bg-slate-800/60 p-1 rounded-2xl w-full max-w-md mx-auto shadow-inner">
              <button
                onClick={() => setViewMode('batch')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${viewMode === 'batch' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <Users className="w-4 h-4" />
                ดูแบบกลุ่ม (ตามคอก)
              </button>
              <button
                onClick={() => setViewMode('individual')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${viewMode === 'individual' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <User className="w-4 h-4" />
                ดูแบบแยกรายตัว
              </button>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${activeTab === 'all' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}
                >
                  ทั้งหมด ({displayData.length})
                </button>
                <button
                  onClick={() => setActiveTab('overdue')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${activeTab === 'overdue' ? 'bg-red-600 text-white shadow-xs' : 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'}`}
                >
                  <AlertCircle className="w-3.5 h-3.5" /> เลยกำหนด ({overdueCount})
                </button>
                <button
                  onClick={() => setActiveTab('today')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${activeTab === 'today' ? 'bg-amber-500 text-white shadow-xs' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'}`}
                >
                  <Clock className="w-3.5 h-3.5" /> วันนี้ ({todayCount})
                </button>
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${activeTab === 'upcoming' ? 'bg-blue-600 text-white shadow-xs' : 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'}`}
                >
                  <Calendar className="w-3.5 h-3.5" /> เร็วๆ นี้ ({upcomingCount})
                </button>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder="ค้นหาวัคซีน, รหัสคอก..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">✕</button>
                )}
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : schedule.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/5">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">อัปเดตวัคซีนครบถ้วน! 🎉</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">ไม่มีไก่ที่ถึงกำหนดทำวัคซีนในระบบ</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/5 text-slate-400 text-xs font-bold">
            ไม่พบรายการวัคซีนที่ตรงกับคำค้นหา
          </div>
        ) : (
          <div className="space-y-3">
            {filteredData.map(item => (
              <VaccineCard key={item.id} item={item} onComplete={() => handleOpenConfirm(item)} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function VaccineCard({ item, onComplete }: { item: any; onComplete: () => void }) {
  const isOverdue = item.status === 'overdue';
  const isToday = item.status === 'today';
  
  return (
    <div className={`p-4 rounded-3xl border ${
      isOverdue ? 'bg-red-50/60 dark:bg-red-950/20 border-red-200 dark:border-red-900/50' : 
      isToday ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50' : 
      'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-white/10'
    } shadow-xs flex items-center justify-between gap-4 transition-all hover:shadow-md`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className="font-black text-sm sm:text-base truncate">{item.vaccineName}</span>
          {isOverdue && (
            <span className="px-2.5 py-0.5 bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300 text-[10px] font-black rounded-full shrink-0">
              เลยกำหนด {item.daysOverdue} วัน
            </span>
          )}
          {isToday && (
            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-black rounded-full shrink-0">
              ต้องทำวันนี้!
            </span>
          )}
        </div>
        
        {item.isGroup ? (
          <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-bold mb-2 bg-blue-50 dark:bg-blue-900/30 w-fit px-3 py-1 rounded-xl">
            <Users className="w-3.5 h-3.5" />
            คอกผสม: {item.batchCode} <span className="text-slate-400 dark:text-slate-500 font-normal">({item.count} ตัว)</span>
          </div>
        ) : (
          <div className="text-xs text-slate-600 dark:text-slate-400 mb-2 truncate">
            <span className="font-mono font-bold text-slate-900 dark:text-slate-200 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded mr-1">
              #{item.chickenCode}
            </span> 
            <span className="font-bold text-slate-800 dark:text-slate-200">{item.chickenName}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-bold flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
            <Syringe className="w-3 h-3 text-blue-500" />
            {item.method}
          </div>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
            <Calendar className="w-3 h-3 text-indigo-500" />
            กำหนด: {new Date(item.targetDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
      </div>
      
      <button 
        onClick={onComplete}
        className="w-12 h-12 shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl flex items-center justify-center transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
        title={item.isGroup ? `บันทึกทีเดียว ${item.count} ตัว` : 'บันทึกว่าทำวัคซีนแล้ว'}
      >
        <CheckCircle2 className="w-6 h-6" />
      </button>
    </div>
  );
}
