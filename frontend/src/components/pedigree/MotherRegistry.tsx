import { Plus, Search, Trash2, Edit, ChevronLeft, Heart, Tag, Camera, CheckCircle, AlertTriangle } from 'lucide-react';
import { ChickenIcon } from '../ui/ChickenIcon';
import { CustomSelect } from '../ui/CustomSelect';
import { getBandColorClass, getBandColorCircleClass } from './FatherRegistry';

import { useState, useEffect } from 'react';

export default function MotherRegistry({ onNavigate }: { onNavigate: (page: any) => void }) {
  const [mothers, setMothers] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [alertConfig, setAlertConfig] = useState<{ 
    show: boolean; 
    title: string; 
    message: string; 
    type: 'info' | 'success' | 'error';
    onConfirm?: () => void;
  } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    breed: '',
    color: '',
    bandNumber: '',
    bandColor: 'เหลือง',
    notes: '',
    status: 'ปกติ',
    image: ''
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    fetchMothers();
  }, []);

  const fetchMothers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/mothers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setMothers(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ code: '', name: '', breed: '', color: '', bandNumber: '', bandColor: 'เหลือง', notes: '', status: 'ปกติ', image: '' });
    setShowAddForm(true);
  };

  const handleOpenEdit = (mother: any) => {
    setEditingId(mother._id);
    setFormData({
      code: mother.code || '',
      name: mother.name || '',
      breed: mother.breed || '',
      color: mother.color || '',
      bandNumber: mother.bandNumber || '',
      bandColor: mother.bandColor || 'เหลือง',
      notes: mother.notes || '',
      status: mother.status || 'ปกติ',
      image: mother.image || ''
    });
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingId 
        ? `http://localhost:5001/api/mothers/${editingId}`
        : 'http://localhost:5001/api/mothers';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowAddForm(false);
        setEditingId(null);
        fetchMothers();
        setFormData({ code: '', name: '', breed: '', color: '', bandNumber: '', bandColor: 'เหลือง', notes: '', status: 'ปกติ', image: '' });
        setAlertConfig({
          show: true,
          title: '🎉 สำเร็จเรียบร้อย',
          message: editingId ? 'แก้ไขข้อมูลแม่ไก่สำเร็จเรียบร้อยแล้ว!' : 'เพิ่มแม่ไก่ใหม่สำเร็จเรียบร้อยแล้ว!',
          type: 'success'
        });
      } else {
        setAlertConfig({
          show: true,
          title: '⚠️ บันทึกไม่สำเร็จ',
          message: 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
          type: 'error'
        });
      }
    } catch (err) {
      console.error(err);
      setAlertConfig({
        show: true,
        title: '❌ เกิดข้อผิดพลาด',
        message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
        type: 'error'
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบข้อมูลแม่ไก่?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5001/api/mothers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchMothers();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredMothers = mothers.filter(m => 
    m.name?.toLowerCase().includes(search.toLowerCase()) || 
    m.code?.toLowerCase().includes(search.toLowerCase()) ||
    m.bandNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const inputClass = "w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-pink-500 text-sm font-bold transition-all";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col pb-24 text-slate-900 dark:text-slate-100 transition-colors relative">
      {/* Header */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl sticky top-0 z-30 border-b border-slate-200 dark:border-white/10 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button 
              onClick={() => onNavigate('dashboard')} 
              className="p-2 -ml-2 text-slate-500 hover:text-pink-600 transition-colors cursor-pointer rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2 truncate">
                💖 ทะเบียนแม่พันธุ์หลัก
              </h1>
              <p className="text-[11px] text-slate-400 font-medium truncate">จัดการข้อมูลแม่ไก่ชนจ่ายลูกดีประจำฟาร์ม</p>
            </div>
          </div>
          
          <button 
            onClick={handleOpenAdd}
            className="bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white px-3.5 py-2.5 rounded-2xl shadow-md shadow-pink-600/20 active:scale-95 transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">เพิ่มแม่ไก่</span><span className="sm:hidden">เพิ่ม</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 max-w-6xl mx-auto w-full flex-1 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="ค้นหาแม่ไก่ (ชื่อ, รหัส, หรือเลขกิ๊ฟปีก)..." 
            className="w-full pl-10 pr-20 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-pink-500 transition-all text-sm shadow-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl transition-colors active:scale-95"
            >
              ล้าง
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : mothers.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200/80 dark:border-white/10 text-center space-y-3">
            <div className="w-16 h-16 bg-pink-100 dark:bg-pink-950/50 text-pink-600 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-base">ยังไม่มีข้อมูลแม่พันธุ์ในระบบ</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">กดปุ่มเพิ่มแม่ไก่ด้านบนเพื่อบันทึกแม่พันธุ์สายเลือดหลักประจำฟาร์ม</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMothers.map((mother, index) => (
              <div 
                key={mother._id || `mother-${index}`}
                onClick={() => onNavigate('chicken-detail', mother._id)}
                className="group bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-xl hover:border-pink-500/30 dark:hover:border-pink-500/30 active:scale-[0.98] transition-all relative overflow-hidden flex items-center gap-4 cursor-pointer"
              >
                {/* Image Column */}
                <div className="w-28 h-28 bg-slate-50 dark:bg-slate-800/80 rounded-2xl overflow-hidden shrink-0 border border-slate-100 dark:border-white/5 flex items-center justify-center relative shadow-inner">
                  {mother.image ? (
                    <img src={mother.image} alt={mother.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-14 h-14 bg-pink-100 dark:bg-pink-950/40 rounded-full flex items-center justify-center text-pink-600">
                      <ChickenIcon size={28} />
                    </div>
                  )}
                </div>

                {/* Text Column */}
                <div className="flex-1 flex flex-col justify-between min-w-0 h-28">
                  <div>
                    {/* Top Row: Code & Edit/Delete */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-mono text-[10px] font-black px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">
                        {mother.code}
                      </span>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(mother);
                          }} 
                          className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(mother._id);
                          }} 
                          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Chicken Name & Bloodline */}
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                        {mother.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        สายเลือด: <strong className="text-slate-700 dark:text-slate-300 font-bold">{mother.breed || 'แม่พันธุ์หลัก'}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Bottom Row: Band Info */}
                  <div className="pt-2 mt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2 text-[10px] min-w-0">
                    {mother.bandNumber ? (
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 font-bold rounded-lg border min-w-0 max-w-full ${getBandColorClass(mother.bandColor || 'เหลือง')}`}>
                        <Tag className="w-2.5 h-2.5 shrink-0" />
                        <span className="flex items-center gap-1 shrink-0">
                          {mother.bandColor && <div className={`w-2 h-2 rounded-full ${getBandColorCircleClass(mother.bandColor)} shadow-sm border border-black/10 shrink-0`} />}
                        </span>
                        <span className="shrink-0">#{mother.bandNumber}</span>
                        {mother.bandText && <span className="truncate">[{mother.bandText}]</span>}
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-400 italic">ไม่ได้ติดกิ๊ฟ</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Form Drawer/Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-100 dark:border-white/10">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-black flex items-center gap-2">
                {editingId ? <Edit className="w-5 h-5 text-blue-600" /> : <Heart className="w-5 h-5 text-pink-600" />}
                {editingId ? 'แก้ไขข้อมูลแม่ไก่ชน' : 'บันทึกเพิ่มแม่พันธุ์ใหม่'}
              </h2>
              <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload Area */}
              <div className="flex flex-col items-center gap-2 pb-2">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  id="mother-image-upload" 
                  onChange={handleImageChange} 
                />
                <label 
                  htmlFor="mother-image-upload" 
                  className="w-24 h-24 bg-slate-100 dark:bg-slate-800/80 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-slate-400 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-red-500 transition-colors cursor-pointer group overflow-hidden relative"
                >
                  {formData.image ? (
                    <>
                      <img src={formData.image} alt="Mother" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Camera className="w-5 h-5 text-white" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Camera className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      <span className="text-[9px] font-bold">อัปโหลดรูปภาพ</span>
                    </>
                  )}
                </label>
                {formData.image && (
                  <button 
                    type="button" 
                    onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                    className="text-[9px] text-red-500 font-bold hover:underline cursor-pointer"
                  >
                    ลบรูปภาพ
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">รหัสแม่ไก่ *</label>
                  <input 
                    type="text" 
                    placeholder="เช่น F-001" 
                    className={inputClass}
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">ชื่อแม่ไก่ *</label>
                  <input 
                    type="text" 
                    placeholder="ระบุชื่อ..." 
                    className={inputClass}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">สายพันธุ์</label>
                  <input 
                    type="text" 
                    placeholder="เช่น พม่า-ง่อน" 
                    className={inputClass}
                    value={formData.breed}
                    onChange={(e) => setFormData({...formData, breed: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">ลักษณะเด่น / หมายเหตุ</label>
                  <input 
                    type="text" 
                    placeholder="เช่น สีสา, เหลือง" 
                    className={inputClass}
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">เลขกิ๊ฟปีก</label>
                  <input 
                    type="text" 
                    placeholder="เช่น F01" 
                    className={inputClass}
                    value={formData.bandNumber}
                    onChange={(e) => setFormData({...formData, bandNumber: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">สีกิ๊ฟปีก</label>
                      <CustomSelect 
                        value={formData.bandColor}
                        onChange={(val) => setFormData({...formData, bandColor: val})}
                        options={[
                          { value: 'ทอง', label: 'ทอง', colorCode: 'bg-amber-400' },
                          { value: 'เงิน', label: 'เงิน', colorCode: 'bg-slate-300' },
                          { value: 'แดง', label: 'แดง', colorCode: 'bg-red-500' },
                          { value: 'เหลือง', label: 'เหลือง', colorCode: 'bg-yellow-400' },
                          { value: 'เขียว', label: 'เขียว', colorCode: 'bg-green-500' },
                          { value: 'น้ำเงิน', label: 'น้ำเงิน', colorCode: 'bg-blue-500' },
                          { value: 'ส้ม', label: 'ส้ม', colorCode: 'bg-orange-500' },
                          { value: 'ขาว', label: 'ขาว', colorCode: 'bg-white border border-slate-200' },
                          { value: 'ฟ้า', label: 'ฟ้า', colorCode: 'bg-sky-400' },
                          { value: 'ม่วง', label: 'ม่วง', colorCode: 'bg-purple-500' },
                          { value: 'ชมพู', label: 'ชมพู', colorCode: 'bg-pink-400' }
                        ]}
                        buttonClassName={inputClass}
                      />
                </div>
              </div>

              <button 
                type="submit"
                className={`w-full py-4 ${editingId ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20' : 'bg-gradient-to-r from-pink-600 to-rose-500 shadow-pink-600/20'} text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-all cursor-pointer text-sm`}
              >
                {editingId ? 'บันทึกการแก้ไขข้อมูลแม่ไก่' : 'บันทึกข้อมูลแม่ไก่ใหม่'}
              </button>
            </form>
          </div>
        </div>
      )}
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
    </div>
  );
}