import { useState, useEffect } from 'react';
import { Plus, ChevronLeft, Swords, Calendar, Save, Users, History, Trash2, ArrowRight, CheckCircle, Heart, AlertTriangle, Edit, X } from 'lucide-react';
import { CustomSelect } from '../ui/CustomSelect';

export default function BreedingBatch({ onNavigate }: { onNavigate: (page: any) => void }) {
  const [batches, setBatches] = useState<any[]>([]);
  const [fathers, setFathers] = useState<any[]>([]);
  const [mothers, setMothers] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [alertConfig, setAlertConfig] = useState<{ 
    show: boolean; 
    title: string; 
    message: string; 
    type: 'info' | 'success' | 'error';
    onConfirm?: () => void;
  } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    batchCode: '',
    father: '',
    mother: '',
    breedingDate: new Date().toISOString().split('T')[0],
    notes: '',
    maleCount: 3,
    maleStartBand: '001',
    maleBandColor: 'ทอง',
    femaleCount: 3,
    femaleStartBand: 'F01',
    femaleBandColor: 'ทอง',
    bandText: '',
    inputMode: 'auto' as 'auto' | 'manual',
    manualChicks: [{ name: '', gender: 'ยังไม่ระบุ', bandNumber: '', bandColor: 'ทอง', bandText: '' }]
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      batchCode: '',
      father: '',
      mother: '',
      breedingDate: new Date().toISOString().split('T')[0],
      notes: '',
      maleCount: 3,
      maleStartBand: '001',
      maleBandColor: 'ทอง',
      femaleCount: 3,
      femaleStartBand: 'F01',
      femaleBandColor: 'ทอง',
      bandText: formData.bandText, // keep the fetched farm name
      inputMode: 'auto',
      manualChicks: [{ name: '', gender: 'ยังไม่ระบุ', bandNumber: '', bandColor: 'ทอง', bandText: '' }]
    });
    setShowAddForm(true);
  };

  const handleOpenEdit = (batch: any) => {
    setEditingId(batch._id);
    setFormData({
      batchCode: batch.batchCode || '',
      father: batch.father?._id || batch.father || '',
      mother: batch.mother?._id || batch.mother || '',
      breedingDate: batch.breedingDate ? new Date(batch.breedingDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      notes: batch.notes || '',
      maleCount: 0,
      maleStartBand: '001',
      maleBandColor: 'แดง',
      femaleCount: 0,
      femaleStartBand: 'F01',
      femaleBandColor: 'เหลือง',
      bandText: '',
      inputMode: 'auto',
      manualChicks: [{ name: '', gender: 'ยังไม่ระบุ', bandNumber: '', bandColor: 'แดง', bandText: '' }]
    });
    setShowAddForm(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [batchRes, fatherRes, motherRes, profileRes] = await Promise.all([
        fetch('http://localhost:5001/api/breeding-batches', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5001/api/fathers', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5001/api/mothers', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5001/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      setBatches(await batchRes.json());
      setFathers(await fatherRes.json());
      setMothers(await motherRes.json());

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        const farmName = profileData.data?.farmName;
        if (farmName && !formData.bandText) {
          setFormData(prev => ({ ...prev, bandText: farmName }));
        }
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const filteredBatches = batches.filter(batch => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const batchCodeMatch = batch.batchCode?.toLowerCase().includes(query);
    const fatherNameMatch = batch.father?.name?.toLowerCase().includes(query);
    const fatherCodeMatch = batch.father?.code?.toLowerCase().includes(query);
    const motherNameMatch = batch.mother?.name?.toLowerCase().includes(query);
    const motherCodeMatch = batch.mother?.code?.toLowerCase().includes(query);
    const notesMatch = batch.notes?.toLowerCase().includes(query);

    return batchCodeMatch || fatherNameMatch || fatherCodeMatch || motherNameMatch || motherCodeMatch || notesMatch;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.father || !formData.mother) {
      setAlertConfig({
        show: true,
        title: '⚠️ เลือกพ่อพันธุ์-แม่พันธุ์',
        message: 'กรุณาเลือกพ่อไก่และแม่ไก่ให้ครบถ้วนก่อนบันทึกข้อมูลครับ',
        type: 'error'
      });
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const url = editingId 
        ? `http://localhost:5001/api/breeding-batches/${editingId}`
        : 'http://localhost:5001/api/breeding-batches';
      const method = editingId ? 'PUT' : 'POST';

      let bodyPayload: any = {
        batchCode: formData.batchCode,
        father: formData.father,
        mother: formData.mother,
        breedingDate: formData.breedingDate,
        notes: formData.notes
      };

      if (!editingId) {
        let chicks = [];
        if (formData.inputMode === 'auto') {
          const maleChicks = Array.from({ length: Number(formData.maleCount) }).map((_, i) => {
            const bandNum = String(Number(formData.maleStartBand) + i).padStart(formData.maleStartBand.length, '0');
            return {
              name: `ไก่เพศผู้ "ยังไม่มีชื่อ"`,
              gender: 'ผู้',
              bandNumber: bandNum,
              bandColor: formData.maleBandColor,
              bandText: formData.bandText
            };
          });

          const femaleChicks = Array.from({ length: Number(formData.femaleCount) }).map((_, i) => {
            const bandNum = String(Number(formData.femaleStartBand.replace(/\D/g, '') || 1) + i).padStart(2, '0');
            const fullBand = formData.femaleStartBand.replace(/\d+/g, '') + bandNum;
            return {
              name: `ไก่เพศเมีย "ยังไม่มีชื่อ"`,
              gender: 'เมีย',
              bandNumber: fullBand,
              bandColor: formData.femaleBandColor,
              bandText: formData.bandText
            };
          });
          
          chicks = [...maleChicks, ...femaleChicks];
        } else {
          chicks = formData.manualChicks.map((mc, i) => ({
            name: mc.name || `ดาวรุ่งชุด ${formData.batchCode} (#${i + 1})`,
            gender: mc.gender,
            bandNumber: mc.bandNumber,
            bandColor: mc.bandColor,
            bandText: mc.bandText
          }));
        }
        bodyPayload.chicks = chicks;
      }

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bodyPayload)
      });
      
      if (res.ok) {
        setAlertConfig({
          show: true,
          title: '🎉 สำเร็จเรียบร้อย',
          message: editingId ? 'แก้ไขข้อมูลชุดการผสมสำเร็จเรียบร้อย!' : 'บันทึกจับคู่ผสมพันธุ์และลงทะเบียนลูกไก่เข้าสู่ระบบสำเร็จ!',
          type: 'success',
          onConfirm: () => {
            setShowAddForm(false);
            setEditingId(null);
            fetchData();
            setFormData({
              batchCode: '',
              father: '',
              mother: '',
              breedingDate: new Date().toISOString().split('T')[0],
              notes: '',
              chickCount: 3,
              useCustomBand: false,
              startBandNumber: '001',
              bandColor: 'แดง',
              bandText: '',
              inputMode: 'auto',
              manualChicks: [{ name: '', gender: 'ยังไม่ระบุ', bandNumber: '', bandColor: 'แดง', bandText: '' }]
            });
          }
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
        message: 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์',
        type: 'error'
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันการลบชุดการผสม? ลูกไก่ในชุดนี้จะถูกลบออกทั้งหมด')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5001/api/breeding-batches/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 sticky top-0 z-30 border-b border-slate-200 dark:border-white/10">
        <div className="max-w-6xl mx-auto w-full px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate('dashboard')} className="p-2 -ml-2 text-slate-500 hover:text-red-600 transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">บันทึกการผสมพันธุ์</h1>
          </div>
          <button 
            onClick={handleOpenAdd}
            className="bg-blue-600 text-white p-2 rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto w-full p-4 flex-1 space-y-4">
        {batches.length > 0 && (
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 ค้นหาคอก (รหัส, พ่อพันธุ์, แม่พันธุ์)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 font-bold transition-all shadow-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center p-10">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : batches.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="w-10 h-10" />
            </div>
            <p>ยังไม่มีประวัติการผสมพันธุ์</p>
          </div>
        ) : filteredBatches.length === 0 ? (
          <div className="text-center py-10 opacity-50 text-xs font-bold">
            ไม่พบชุดคอกผสมพันธุ์ที่ค้นหา
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBatches.map((batch) => (
              <div key={batch._id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-md hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300">
                <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-3 flex justify-between items-center border-b border-slate-200 dark:border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 shadow-md shadow-blue-500/20 rounded-xl flex items-center justify-center text-white text-xs font-black">
                      {/^[a-fA-F0-9]{24}$/.test(batch.batchCode || '') ? 'เก่า' : batch.batchCode}
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase">
                      ชุดการผสม {/^[a-fA-F0-9]{24}$/.test(batch.batchCode || '') ? '(เก่า)' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleOpenEdit(batch)} className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(batch._id)} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-center gap-6 md:gap-12 mb-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl p-4 border border-slate-100 dark:border-white/5 mx-auto max-w-2xl">
                    <div className="text-right flex-1 md:flex-none">
                      <div className="text-[10px] text-slate-400 mb-1 uppercase font-bold flex items-center justify-end gap-1">
                        พ่อพันธุ์ <span className="text-red-500">♂</span>
                      </div>
                      <div className="font-black text-red-600 md:text-lg">{batch.father?.name || 'N/A'}</div>
                      <div className="text-[10px] text-slate-500 font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md inline-block mt-1 border border-slate-200/50 dark:border-white/5">
                        {batch.father?.code || '-'}
                      </div>
                    </div>
                    <div className="shrink-0 flex flex-col items-center justify-center bg-white dark:bg-slate-900 w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 shadow-sm z-10">
                      <span className="text-[16px]">💖</span>
                    </div>
                    <div className="text-left flex-1 md:flex-none">
                      <div className="text-[10px] text-slate-400 mb-1 uppercase font-bold flex items-center justify-start gap-1">
                        <span className="text-pink-500">♀</span> แม่พันธุ์
                      </div>
                      <div className="font-black text-pink-600 md:text-lg">{batch.mother?.name || 'N/A'}</div>
                      <div className="text-[10px] text-slate-500 font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md inline-block mt-1 border border-slate-200/50 dark:border-white/5">
                        {batch.mother?.code || '-'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-white/5 pt-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(batch.breedingDate).toLocaleDateString('th-TH')}
                    </div>
                    <button 
                      onClick={() => onNavigate('chick-registry', /^[a-fA-F0-9]{24}$/.test(batch.batchCode || '') ? undefined : batch.batchCode)}
                      className="text-blue-600 font-bold"
                    >
                      ดูรายชื่อลูกไก่ ➔
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Form Drawer */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in fade-in duration-200 max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900 shrink-0">
              <h2 className="text-xl font-bold">{editingId ? 'แก้ไขข้อมูลชุดการผสมพันธุ์' : 'สร้างชุดการผสมใหม่'}</h2>
              <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-2 -mr-2">✕</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 px-1 uppercase">รหัสชุด (Batch Code)</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="เช่น B001" 
                    className="w-full p-3 pr-9 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold"
                    value={formData.batchCode}
                    onChange={(e) => setFormData({...formData, batchCode: e.target.value})}
                    required
                  />
                  {formData.batchCode && (
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, batchCode: ''})}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 bg-white hover:bg-red-50 dark:bg-slate-900 dark:hover:bg-red-950/50 rounded-full p-1 transition-colors flex items-center justify-center shadow-sm border border-slate-200 dark:border-white/10 hover:border-red-200 dark:hover:border-red-900/50 cursor-pointer"
                      title="ล้างข้อความทั้งหมด"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 px-1 uppercase">เลือกพ่อไก่</label>
                  <CustomSelect 
                    value={formData.father}
                    onChange={(val) => setFormData({...formData, father: val})}
                    options={fathers.map(f => ({ value: f._id, label: `${f.code} - ${f.name}` }))}
                    placeholder="-- เลือกพ่อ --"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 px-1 uppercase">เลือกแม่ไก่</label>
                  <CustomSelect 
                    value={formData.mother}
                    onChange={(val) => setFormData({...formData, mother: val})}
                    options={mothers.map(m => ({ value: m._id, label: `${m.code} - ${m.name}` }))}
                    placeholder="-- เลือกแม่ --"
                  />
                </div>
              </div>

              <div className={editingId ? "space-y-1" : "grid grid-cols-2 gap-4"}>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 px-1 uppercase">วันที่ผสมพันธุ์</label>
                  <input 
                    type="date" 
                    className="w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    value={formData.breedingDate}
                    onChange={(e) => setFormData({...formData, breedingDate: e.target.value})}
                    required
                  />
                </div>
                {!editingId && (
                  <div className="space-y-4 pt-2">
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, inputMode: 'auto'})}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.inputMode === 'auto' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        สร้างอัตโนมัติ (ใส่จำนวน)
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, inputMode: 'manual'})}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.inputMode === 'manual' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        กรอกรายตัว (ระบุเพศ/เลข)
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {!editingId && (
                <div className="space-y-4">
                  {formData.inputMode === 'auto' ? (
                    <div className="space-y-4">
                      {/* 🐓 ส่วนตัวผู้ */}
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-2xl space-y-4">
                        <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-bold mb-2">
                          <Swords className="w-5 h-5" /> ตัวผู้ (ผู้)
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">จำนวน</label>
                            <input 
                              type="number" min="0" max="100"
                              className="w-full p-2.5 bg-white dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs font-bold"
                              value={formData.maleCount}
                              onChange={e => setFormData({...formData, maleCount: Math.max(0, parseInt(e.target.value) || 0)})}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">เลขกิ๊ฟเริ่ม</label>
                            <input 
                              type="text" placeholder="001"
                              className="w-full p-2.5 bg-white dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs font-bold uppercase"
                              value={formData.maleStartBand}
                              onChange={e => setFormData({...formData, maleStartBand: e.target.value.toUpperCase()})}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">สีกิ๊ฟ</label>
                            <CustomSelect 
                              value={formData.maleBandColor}
                              onChange={(val) => setFormData({...formData, maleBandColor: val})}
                              options={[
                                { value: 'ทอง', label: 'ทอง', colorCode: 'bg-amber-400' },
                                { value: 'เงิน', label: 'เงิน', colorCode: 'bg-slate-300' },
                                { value: 'แดง', label: 'แดง', colorCode: 'bg-red-500' },
                                { value: 'เหลือง', label: 'เหลือง', colorCode: 'bg-yellow-400' },
                                { value: 'เขียว', label: 'เขียว', colorCode: 'bg-green-500' },
                                { value: 'น้ำเงิน', label: 'น้ำเงิน', colorCode: 'bg-blue-600' },
                                { value: 'ดำ', label: 'ดำ', colorCode: 'bg-slate-900' }
                              ]}
                              placeholder="สี"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 💖 ส่วนตัวเมีย */}
                      <div className="p-4 bg-pink-50 dark:bg-pink-900/20 border border-pink-100 dark:border-pink-800/30 rounded-2xl space-y-4">
                        <div className="flex items-center gap-2 text-pink-800 dark:text-pink-300 font-bold mb-2">
                          <Heart className="w-5 h-5" /> ตัวเมีย (เมีย)
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">จำนวน</label>
                            <input 
                              type="number" min="0" max="100"
                              className="w-full p-2.5 bg-white dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 text-xs font-bold"
                              value={formData.femaleCount}
                              onChange={e => setFormData({...formData, femaleCount: Math.max(0, parseInt(e.target.value) || 0)})}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">เลขกิ๊ฟเริ่ม</label>
                            <input 
                              type="text" placeholder="F01"
                              className="w-full p-2.5 bg-white dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 text-xs font-bold uppercase"
                              value={formData.femaleStartBand}
                              onChange={e => setFormData({...formData, femaleStartBand: e.target.value.toUpperCase()})}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">สีกิ๊ฟ</label>
                            <CustomSelect 
                              value={formData.femaleBandColor}
                              onChange={(val) => setFormData({...formData, femaleBandColor: val})}
                              options={[
                                { value: 'ทอง', label: 'ทอง', colorCode: 'bg-amber-400' },
                                { value: 'เงิน', label: 'เงิน', colorCode: 'bg-slate-300' },
                                { value: 'แดง', label: 'แดง', colorCode: 'bg-red-500' },
                                { value: 'เหลือง', label: 'เหลือง', colorCode: 'bg-yellow-400' },
                                { value: 'เขียว', label: 'เขียว', colorCode: 'bg-green-500' },
                                { value: 'น้ำเงิน', label: 'น้ำเงิน', colorCode: 'bg-blue-600' },
                                { value: 'ดำ', label: 'ดำ', colorCode: 'bg-slate-900' }
                              ]}
                              placeholder="สี"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 🏷️ ชื่อบนกิ๊ฟ */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">ชื่อข้อความบนกิ๊ฟ (ชื่อซุ้ม/ฟาร์ม)</label>
                        <input 
                          type="text"
                          placeholder="เช่น ส.สิบทิศ (ถ้ามี) อันนี้สลักในกิ๊ฟ"
                          className="w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold"
                          value={formData.bandText}
                          onChange={(e) => setFormData({...formData, bandText: e.target.value})}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.manualChicks.map((chick, i) => (
                        <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-white/5 space-y-2 relative">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">ลูกไก่ตัวที่ {i + 1}</span>
                            {formData.manualChicks.length > 1 && (
                              <button 
                                type="button" 
                                onClick={() => {
                                  const newChicks = [...formData.manualChicks];
                                  newChicks.splice(i, 1);
                                  setFormData({...formData, manualChicks: newChicks});
                                }}
                                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-1 rounded-md transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <input 
                              type="text"
                              placeholder={`ชื่อ (ย่อหน้าจะเป็น ลูกไก่ชุด ${formData.batchCode})`}
                              className="w-full p-2 bg-white dark:bg-slate-900 rounded-lg text-xs border border-slate-200 dark:border-white/10"
                              value={chick.name}
                              onChange={e => {
                                const newChicks = [...formData.manualChicks];
                                newChicks[i].name = e.target.value;
                                setFormData({...formData, manualChicks: newChicks});
                              }}
                            />
                            <CustomSelect 
                              value={chick.gender}
                              onChange={val => {
                                const newChicks = [...formData.manualChicks];
                                newChicks[i].gender = val;
                                setFormData({...formData, manualChicks: newChicks});
                              }}
                              options={[
                                { value: 'ยังไม่ระบุ', label: 'ยังไม่ระบุเพศ' },
                                { value: 'ผู้', label: 'ตัวผู้' },
                                { value: 'เมีย', label: 'ตัวเมีย' }
                              ]}
                              buttonClassName="w-full p-2 bg-white dark:bg-slate-900 rounded-lg text-xs border border-slate-200 dark:border-white/10 flex justify-between items-center"
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <input 
                              type="text"
                              placeholder="เลขกิ๊ฟปีก"
                              className="w-full p-2 bg-white dark:bg-slate-900 rounded-lg text-xs border border-slate-200 dark:border-white/10"
                              value={chick.bandNumber}
                              onChange={e => {
                                const newChicks = [...formData.manualChicks];
                                newChicks[i].bandNumber = e.target.value;
                                setFormData({...formData, manualChicks: newChicks});
                              }}
                            />
                            <CustomSelect 
                              value={chick.bandColor}
                              onChange={val => {
                                const newChicks = [...formData.manualChicks];
                                newChicks[i].bandColor = val;
                                setFormData({...formData, manualChicks: newChicks});
                              }}
                              options={[
                                { value: 'แดง', label: 'แดง', colorCode: 'bg-red-500' },
                                { value: 'ทอง', label: 'ทอง', colorCode: 'bg-amber-400' },
                                { value: 'เงิน', label: 'เงิน', colorCode: 'bg-slate-300' },
                                { value: 'เหลือง', label: 'เหลือง', colorCode: 'bg-yellow-400' },
                                { value: 'เขียว', label: 'เขียว', colorCode: 'bg-green-500' },
                                { value: 'น้ำเงิน', label: 'น้ำเงิน', colorCode: 'bg-blue-500' },
                                { value: 'ส้ม', label: 'ส้ม', colorCode: 'bg-orange-500' },
                                { value: 'ขาว', label: 'ขาว', colorCode: 'bg-white' }
                              ]}
                              buttonClassName="w-full p-2 bg-white dark:bg-slate-900 rounded-lg text-xs border border-slate-200 dark:border-white/10 flex justify-between items-center"
                            />
                            <input 
                              type="text"
                              placeholder="ข้อความกิ๊ฟ"
                              className="w-full p-2 bg-white dark:bg-slate-900 rounded-lg text-xs border border-slate-200 dark:border-white/10"
                              value={chick.bandText}
                              onChange={e => {
                                const newChicks = [...formData.manualChicks];
                                newChicks[i].bandText = e.target.value;
                                setFormData({...formData, manualChicks: newChicks});
                              }}
                            />
                          </div>
                        </div>
                      ))}

                      <button 
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData, 
                            manualChicks: [...formData.manualChicks, { name: '', gender: 'ยังไม่ระบุ', bandNumber: '', bandColor: 'ทอง', bandText: '' }]
                          });
                        }}
                        className="w-full py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center justify-center gap-1 border border-blue-100 dark:border-blue-900/50"
                      >
                        <Plus className="w-3 h-3" /> เพิ่มลูกไก่อีกตัว
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 px-1 uppercase">หมายเหตุ</label>
                <textarea 
                  placeholder="รายละเอียดเพิ่มเติม..." 
                  className="w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm h-20"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                className="w-full py-4 mt-2 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {editingId ? 'บันทึกการแก้ไขชุดการผสม' : 'บันทึกชุดการผสมพันธุ์'}
              </button>
            </form>
            </div>
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