import { useState, useEffect } from 'react';
import { ChevronLeft, Share2, Edit3, ShieldAlert, GitBranch, Users } from 'lucide-react';

export default function ChickenDetail({ chickenId, onNavigate }: { chickenId: string, onNavigate: (page: any) => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5001/api/chickens/${chickenId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [chickenId]);

  if (loading || !data) return <div className="p-8 text-center dark:text-white">กำลังโหลด...</div>;

  const { chicken, siblings } = data;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 overflow-y-auto pb-24">
      {/* Hero Header */}
      <div className="relative h-72 bg-slate-900 overflow-hidden">
        <button 
          onClick={() => onNavigate('chicken-list')}
          className="absolute top-6 left-4 z-20 p-2 bg-black/20 backdrop-blur-md rounded-full text-white"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="absolute top-6 right-4 z-20 flex gap-2">
          <button className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white"><Share2 className="w-5 h-5" /></button>
          <button className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white"><Edit3 className="w-5 h-5" /></button>
        </div>
        
        {chicken.imageUrl ? (
          <img src={chicken.imageUrl} className="w-full h-full object-cover opacity-60" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-red-600 to-orange-500 opacity-80">
            <span className="text-8xl">🐓</span>
          </div>
        )}
        
        <div className="absolute bottom-6 left-6 text-white">
          <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase mb-2 inline-block max-w-[85vw] truncate" title={chicken.code}>
            {chicken.code}
          </span>
          <h1 className="text-3xl font-black tracking-tight">{chicken.name}</h1>
        </div>
      </div>

      {/* Info Cards */}
      <div className="p-6 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">สถานะ</p>
            <p className="text-sm font-bold text-green-600">พร้อมใช้งาน</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">เพศ</p>
            <p className="text-sm font-bold dark:text-white">{chicken.gender === 'male' ? 'ผู้' : 'เมีย'}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">ห่วงขา</p>
            <p className="text-sm font-bold dark:text-white">{chicken.bandNumber || '-'}</p>
          </div>
        </div>

        {/* Basic Info */}
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 font-bold dark:text-white">
             <ShieldAlert className="w-5 h-5 text-red-600" /> ข้อมูลพื้นฐาน
          </h2>
          <div className="grid grid-cols-2 gap-y-4 text-sm">
            <div><p className="text-slate-400 uppercase text-[10px] font-bold">สายพันธุ์</p><p className="font-bold dark:text-slate-200">{chicken.breed}</p></div>
            <div><p className="text-slate-400 uppercase text-[10px] font-bold">สีตัว</p><p className="font-bold dark:text-slate-200">{chicken.color || '-'}</p></div>
            <div><p className="text-slate-400 uppercase text-[10px] font-bold">วันที่ฟัก</p><p className="font-bold dark:text-slate-200">{chicken.hatchDate ? new Date(chicken.hatchDate).toLocaleDateString('th-TH') : '-'}</p></div>
            <div><p className="text-slate-400 uppercase text-[10px] font-bold">สีห่วงขา</p><p className="font-bold dark:text-slate-200">{chicken.bandColor || '-'}</p></div>
          </div>
        </div>

        {/* Family Tree Header */}
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 font-bold dark:text-white">
             <GitBranch className="w-5 h-5 text-blue-600" /> แผนผังสายเลือด
          </h2>
          <div className="space-y-3">
             <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-l-4 border-blue-500">
                <p className="text-[10px] font-bold text-slate-400 mb-1">พ่อ (FATHER)</p>
                <p className="font-bold dark:text-white">{chicken.father || 'ไม่ระบุ'}</p>
             </div>
             <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-l-4 border-pink-500">
                <p className="text-[10px] font-bold text-slate-400 mb-1">แม่ (MOTHER)</p>
                <p className="font-bold dark:text-white">{chicken.mother || 'ไม่ระบุ'}</p>
             </div>
          </div>
        </div>

        {/* Siblings */}
        {siblings?.length > 0 && (
          <div className="space-y-4">
            <h2 className="flex items-center gap-2 font-bold dark:text-white">
              <Users className="w-5 h-5 text-green-600" /> พี่น้องร่วมครอก
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {siblings.map((s: any) => (
                <div key={s._id} className="min-w-[140px] p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl text-center">
                  <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-2">🐓</div>
                  <p className="text-xs font-bold dark:text-white truncate">{s.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{s.code}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
