import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Megaphone } from 'lucide-react';

export default function AdminBanners() {
  const { language } = useLanguage();
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '', subtitle: '', description: '', buttonText: '', targetUrl: '', order: 0, isActive: true
  });

  const fetchBanners = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/banners', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setBanners(data.data || []);
    } catch (err) {
      console.error('Fetch banners error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editId ? `http://localhost:5001/api/banners/${editId}` : 'http://localhost:5001/api/banners';
      const method = editId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setShowForm(false);
        setEditId(null);
        fetchBanners();
      } else {
        alert('Error saving banner');
      }
    } catch (err) {
      alert('Error saving banner');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this banner?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5001/api/banners/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchBanners();
    } catch (err) {
      alert('Error deleting banner');
    }
  };

  const resetForm = () => {
    setFormData({ title: '', subtitle: '', description: '', buttonText: '', targetUrl: '', order: 0, isActive: true });
    setEditId(null);
    setShowForm(true);
  };

  const editForm = (banner: any) => {
    setFormData(banner);
    setEditId(banner._id);
    setShowForm(true);
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading banners...</div>;

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Megaphone className="text-indigo-500 w-6 h-6" /> 
            ระบบจัดการแบนเนอร์โฆษณา (B2B)
          </h2>
          <p className="text-xs text-slate-500 mt-1">เพิ่มลบแก้ไขโฆษณาที่จะแสดงในหน้าแรกของเว็บไซต์</p>
        </div>
        <button onClick={resetForm} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md flex items-center gap-2 cursor-pointer">
          <Plus className="w-4 h-4" /> สร้างแบนเนอร์ใหม่
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-indigo-200 dark:border-indigo-900 space-y-4">
          <h3 className="font-bold text-lg mb-4">{editId ? 'แก้ไขแบนเนอร์' : 'สร้างแบนเนอร์ใหม่'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-xs font-bold mb-1">หัวข้อหลัก (Title)</label><input required className="w-full p-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="อาหารไก่ชน พลังช้าง" /></div>
            <div><label className="block text-xs font-bold mb-1">ป้ายกำกับ (Subtitle)</label><input required className="w-full p-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700" value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} placeholder="ผู้สนับสนุนหลัก (Sponsor)" /></div>
            <div className="md:col-span-2"><label className="block text-xs font-bold mb-1">รายละเอียด (Description)</label><textarea required className="w-full p-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="โปรตีนสูตรเข้มข้นพิเศษ ฟื้นฟูกล้ามเนื้อไว..." /></div>
            <div><label className="block text-xs font-bold mb-1">ข้อความปุ่ม (Button Text)</label><input required className="w-full p-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700" value={formData.buttonText} onChange={e => setFormData({...formData, buttonText: e.target.value})} placeholder="รับโค้ดส่วนลด 20%" /></div>
            <div><label className="block text-xs font-bold mb-1">ลิงก์เป้าหมาย (Target URL)</label><input required className="w-full p-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700" value={formData.targetUrl} onChange={e => setFormData({...formData, targetUrl: e.target.value})} placeholder="https://line.me/ti/p/..." /></div>
            <div><label className="block text-xs font-bold mb-1">ลำดับการแสดงผล (Order)</label><input type="number" className="w-full p-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700" value={formData.order} onChange={e => setFormData({...formData, order: Number(e.target.value)})} /></div>
            <div className="flex items-center gap-2 mt-6">
              <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
              <label htmlFor="isActive" className="font-bold text-sm text-slate-700 dark:text-slate-300">เปิดใช้งาน (Active)</label>
            </div>
          </div>
          <div className="flex gap-3 justify-end mt-6">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer">ยกเลิก</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md cursor-pointer">บันทึกข้อมูล</button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {banners.map((b) => (
          <div key={b._id} className={`p-5 rounded-2xl border ${b.isActive ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm' : 'bg-slate-50 dark:bg-slate-900/50 border-dashed border-slate-300 dark:border-slate-700 opacity-70'} flex justify-between items-center`}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                {b.isActive ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-slate-400" />}
                <h4 className="font-black text-lg text-slate-900 dark:text-white">{b.title}</h4>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-mono text-slate-500">Order: {b.order}</span>
              </div>
              <p className="text-sm text-slate-500 max-w-xl line-clamp-1">{b.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => editForm(b)} className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-500 rounded-xl cursor-pointer"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(b._id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950 dark:text-red-500 rounded-xl cursor-pointer"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {banners.length === 0 && !showForm && (
          <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            ไม่มีข้อมูลแบนเนอร์โฆษณา กด "สร้างแบนเนอร์ใหม่" เพื่อเริ่มต้น
          </div>
        )}
      </div>
    </div>
  );
}
