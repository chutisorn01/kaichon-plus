import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, Syringe, Calendar, CheckCircle2, AlertCircle, Clock, ShieldCheck, Users, User, X } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';

export default function VaccineDashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'batch' | 'individual'>('batch');
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
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/vaccines/schedule', {
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
      const res = await fetch('http://localhost:5001/api/vaccines/mark-completed', {
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

  const overdue = displayData.filter(s => s.status === 'overdue');
  const today = displayData.filter(s => s.status === 'today');
  const upcoming = displayData.filter(s => s.status === 'upcoming');

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

      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button onClick={() => onNavigate('dashboard')} className="p-2 -ml-2 mr-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                โปรแกรมทำวัคซีน
              </h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 w-full px-4 sm:px-6 py-6 pb-24 overflow-y-auto">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 mb-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0">
              <Syringe className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-1">ตารางวัคซีนอัจฉริยะ</h2>
              <p className="text-blue-100 text-sm">ระบบแจ้งเตือนคำนวณจากวันที่ฟักอัตโนมัติ</p>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        {!isLoading && schedule.length > 0 && (
          <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-2xl mb-8 w-full max-w-sm mx-auto shadow-inner">
            <button
              onClick={() => setViewMode('batch')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${viewMode === 'batch' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              <Users className="w-4 h-4" />
              ดูแบบกลุ่ม (คอก)
            </button>
            <button
              onClick={() => setViewMode('individual')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${viewMode === 'individual' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              <User className="w-4 h-4" />
              ดูแบบแยกรายตัว
            </button>
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
            <h3 className="text-xl font-bold mb-2">อัปเดตวัคซีนครบถ้วน!</h3>
            <p className="text-slate-500 dark:text-slate-400">ไม่มีไก่ที่ถึงกำหนดทำวัคซีนในเร็วๆ นี้</p>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Overdue Section */}
            {overdue.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <h3 className="font-bold text-red-500">เลยกำหนดแล้ว ({overdue.length})</h3>
                </div>
                <div className="space-y-3">
                  {overdue.map(item => (
                    <VaccineCard key={item.id} item={item} onComplete={() => handleOpenConfirm(item)} />
                  ))}
                </div>
              </section>
            )}

            {/* Today Section */}
            {today.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-amber-500">กำหนดทำวันนี้ ({today.length})</h3>
                </div>
                <div className="space-y-3">
                  {today.map(item => (
                    <VaccineCard key={item.id} item={item} onComplete={() => handleOpenConfirm(item)} />
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming Section */}
            {upcoming.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <h3 className="font-bold text-blue-500">เร็วๆ นี้ ({upcoming.length})</h3>
                </div>
                <div className="space-y-3">
                  {upcoming.map(item => (
                    <VaccineCard key={item.id} item={item} onComplete={() => handleOpenConfirm(item)} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function VaccineCard({ item, onComplete }: { item: any; onComplete: () => void }) {
  const isOverdue = item.status === 'overdue';
  
  return (
    <div className={`p-4 rounded-2xl border ${isOverdue ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10'} shadow-sm flex items-center justify-between gap-4 transition-all hover:shadow-md`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-lg truncate">{item.vaccineName}</span>
          {isOverdue && <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full whitespace-nowrap">เลย {item.daysOverdue} วัน</span>}
        </div>
        
        {item.isGroup ? (
          <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-medium mb-2 bg-blue-50 dark:bg-blue-900/20 w-fit px-3 py-1 rounded-lg">
            <Users className="w-4 h-4" />
            คอกผสม {item.batchCode} <span className="text-slate-400 dark:text-slate-500 font-normal">({item.count} ตัว)</span>
          </div>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-2 truncate">
            <span className="font-medium text-slate-900 dark:text-slate-300">#{item.chickenCode}</span> • {item.chickenName}
          </div>
        )}
        
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-500 font-medium">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
            <Syringe className="w-3 h-3" />
            {item.method}
          </div>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
            <Calendar className="w-3 h-3" />
            {new Date(item.targetDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
          </div>
        </div>
      </div>
      
      <button 
        onClick={onComplete}
        className="w-12 h-12 shrink-0 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center transition-colors border border-blue-200/50 dark:border-blue-500/20 active:scale-95"
        title={item.isGroup ? `บันทึกทีเดียว ${item.count} ตัว` : 'บันทึกว่าทำวัคซีนแล้ว'}
      >
        <CheckCircle2 className="w-6 h-6" />
      </button>
    </div>
  );
}
