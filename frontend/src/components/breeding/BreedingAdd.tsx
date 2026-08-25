import { useState } from 'react';
import { ChevronLeft, Plus, Save, Trash2 } from 'lucide-react';

export default function BreedingAdd({ onNavigate }: { onNavigate: (page: any) => void }) {
  const [formData, setFormData] = useState({
    batchCode: '',
    father: '',
    mother: '',
    breedingDate: new Date().toISOString().split('T')[0],
    breed: 'พม่า-ง่อน'
  });
  const [chicks, setChicks] = useState<any[]>([{ bandColor: '', bandNumber: '' }]);
  const [loading, setLoading] = useState(false);

  const addChick = () => setChicks([...chicks, { bandColor: '', bandNumber: '' }]);
  const removeChick = (idx: number) => setChicks(chicks.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL}/api/breeding-batches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...formData, chicks })
      });
      onNavigate('dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm outline-none";

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto pb-24">
      <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 flex items-center gap-4">
        <button onClick={() => onNavigate('dashboard')} className="p-2"><ChevronLeft /></button>
        <h1 className="font-bold dark:text-white">บันทึกผสมพันธุ์ & ผลิตลูกขุน</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-red-600">1. ข้อมูลการผสม</h3>
          <div className="space-y-3">
             <input required placeholder="รหัสครอก (Batch Code)" className={inputClass} value={formData.batchCode} onChange={e => setFormData({...formData, batchCode: e.target.value})} />
             <div className="grid grid-cols-2 gap-3">
               <input required placeholder="รหัสพ่อไก่" className={inputClass} value={formData.father} onChange={e => setFormData({...formData, father: e.target.value})} />
               <input required placeholder="รหัสแม่ไก่" className={inputClass} value={formData.mother} onChange={e => setFormData({...formData, mother: e.target.value})} />
             </div>
             <input type="date" className={inputClass} value={formData.breedingDate} onChange={e => setFormData({...formData, breedingDate: e.target.value})} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-blue-600">2. รายการลูกไก่ ({chicks.length})</h3>
            <button type="button" onClick={addChick} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1"><Plus className="w-3 h-3"/> เพิ่ม</button>
          </div>
          
          <div className="space-y-4">
            {chicks.map((chick, idx) => (
              <div key={idx} className="flex gap-3 items-end border-b border-slate-100 dark:border-white/5 pb-4">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">สีห่วงขา</label>
                  <input placeholder="แดง" className={inputClass} value={chick.bandColor} onChange={e => {
                    const newChicks = [...chicks];
                    newChicks[idx].bandColor = e.target.value;
                    setChicks(newChicks);
                  }} />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">เลขห่วง</label>
                  <input placeholder="001" className={inputClass} value={chick.bandNumber} onChange={e => {
                    const newChicks = [...chicks];
                    newChicks[idx].bandNumber = e.target.value;
                    setChicks(newChicks);
                  }} />
                </div>
                {idx > 0 && (
                   <button type="button" onClick={() => removeChick(idx)} className="p-3 text-red-500"><Trash2 className="w-5 h-5"/></button>
                )}
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full py-4 bg-red-600 text-white font-bold rounded-2xl shadow-lg active:scale-95 disabled:opacity-50">
           {loading ? 'กำลังบันทึก...' : 'บันทึกและสร้างลูกไห่อัตโนมัติ'}
        </button>
      </form>
    </div>
  );
}
