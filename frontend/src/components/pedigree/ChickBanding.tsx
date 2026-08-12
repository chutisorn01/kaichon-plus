import { useState, useEffect } from 'react';
import { ChevronLeft, Tag, Swords, Heart, Save, Sparkles, Layers, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';
import { CustomSelect } from '../ui/CustomSelect';

export default function ChickBanding({ onNavigate }: { onNavigate: (page: any) => void }) {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{ 
    show: boolean; 
    title: string; 
    message: string; 
    type: 'info' | 'success' | 'error';
    onConfirm?: () => void;
  } | null>(null);

  const [formData, setFormData] = useState({
    batchId: '',
    maleCount: 3,
    maleStartBand: '001',
    maleBandColor: 'ทอง',
    femaleCount: 3,
    femaleStartBand: 'F01',
    femaleBandColor: 'ทอง',
    bandText: 'ส.เจริญ',
    hatchDate: new Date().toISOString().split('T')[0],
    inputMode: 'auto' as 'auto' | 'manual',
    manualChicks: [{ gender: 'ยังไม่ระบุ', bandNumber: '', bandColor: 'ทอง', name: '' }]
  });

  const [usedBands, setUsedBands] = useState<string[]>([]);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const token = localStorage.getItem('token');
      const [res, profileRes] = await Promise.all([
        fetch('http://localhost:5001/api/breeding-batches', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5001/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      const data = await res.json();
      if (Array.isArray(data)) {
        setBatches(data);
        if (data.length > 0) setFormData(prev => ({ ...prev, batchId: data[0]._id }));
      }
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        const farmName = profileData.data?.farmName;
        if (farmName) {
          setFormData(prev => ({ ...prev, bandText: farmName }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (formData.batchId) {
      const fetchBatchChicks = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch('http://localhost:5001/api/chicks', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const chicks = await res.json();
            // Find chicks that belong to this batch
            const batchChicks = chicks.filter((c: any) => c.batch?._id === formData.batchId || c.batch === formData.batchId);
            
            // Extract their band numbers
            const used = batchChicks.map((c: any) => c.bandNumber).filter(Boolean);
            setUsedBands(used);

            if (batchChicks.length > 0) {
              const batchChick = batchChicks.find((c: any) => c.bandText);
              if (batchChick && batchChick.bandText) {
                setFormData(prev => ({ ...prev, bandText: batchChick.bandText }));
              }
            } else {
              setUsedBands([]);
            }
          }
        } catch (err) {
          console.error('Error fetching batch chicks for bandText:', err);
        }
      };
      fetchBatchChicks();
    } else {
      setUsedBands([]);
    }
  }, [formData.batchId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.batchId) {
      setAlertConfig({
        show: true,
        title: '⚠️ เลือกคอกผสมพันธุ์',
        message: 'กรุณาเลือกชุดคอกผสมพันธุ์ก่อนดึงรหัสมาคัดเพศและติดกิ๊ฟปีกครับ',
        type: 'error'
      });
      return;
    }
    setLoading(true);

    try {
      let allNewChicks = [];

      const selectedBatch = batches.find(b => b._id === formData.batchId);
      const batchCode = selectedBatch?.batchCode || 'B00';
      const fatherId = selectedBatch?.father?._id || selectedBatch?.father;
      const motherId = selectedBatch?.mother?._id || selectedBatch?.mother;

      if (formData.inputMode === 'auto') {
        const maleChicks = Array.from({ length: Number(formData.maleCount) }).map((_, i) => {
          const startNumStr = (formData.maleStartBand || '').trim();
          const match = startNumStr.match(/(\d+)$/);
          let prefix = startNumStr;
          let startNum = 0;
          let numLength = 0;
          
          if (match) {
            prefix = startNumStr.substring(0, startNumStr.length - match[1].length);
            startNum = parseInt(match[1], 10);
            numLength = match[1].length;
          }
          
          const bandNum = match 
            ? prefix + String(startNum + i).padStart(numLength, '0')
            : startNumStr + (i + 1);

          return {
            batch: formData.batchId,
            father: fatherId,
            mother: motherId,
            code: `${batchCode}-M${bandNum}`,
            name: `ไก่เพศผู้ "ยังไม่มีชื่อ"`,
            gender: 'ผู้',
            bandNumber: bandNum,
            bandColor: formData.maleBandColor,
            bandText: formData.bandText,
            hatchDate: new Date(formData.hatchDate)
          };
        });

        const femaleChicks = Array.from({ length: Number(formData.femaleCount) }).map((_, i) => {
          const startNumStr = (formData.femaleStartBand || '').trim();
          const match = startNumStr.match(/(\d+)$/);
          let prefix = startNumStr;
          let startNum = 0;
          let numLength = 0;
          
          if (match) {
            prefix = startNumStr.substring(0, startNumStr.length - match[1].length);
            startNum = parseInt(match[1], 10);
            numLength = match[1].length;
          }
          
          const bandNum = match 
            ? prefix + String(startNum + i).padStart(numLength, '0')
            : startNumStr + (i + 1);

          return {
            batch: formData.batchId,
            father: fatherId,
            mother: motherId,
            code: `${batchCode}-F${bandNum}`,
            name: `ไก่เพศเมีย "ยังไม่มีชื่อ"`,
            gender: 'เมีย',
            bandNumber: bandNum,
            bandColor: formData.femaleBandColor,
            bandText: formData.bandText,
            hatchDate: new Date(formData.hatchDate)
          };
        });

        allNewChicks = [...maleChicks, ...femaleChicks];
      } else {
        allNewChicks = formData.manualChicks.map((mc, i) => {
          const suffix = mc.bandNumber || Date.now().toString().slice(-4);
          return {
            batch: formData.batchId,
            father: fatherId,
            mother: motherId,
            code: `${batchCode}-M${suffix}-${i+1}`,
            name: mc.name || `ลูกไก่ "ยังไม่มีชื่อ"`,
            gender: mc.gender,
            bandNumber: mc.bandNumber,
            bandColor: mc.bandColor,
            bandText: formData.bandText,
            hatchDate: new Date(formData.hatchDate)
          };
        });
      }

      const token = localStorage.getItem('token');
      const results = await Promise.all(allNewChicks.map(chick => 
        fetch('http://localhost:5001/api/chicks', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(chick)
        })
      ));

      let failedCount = 0;
      let lastError = '';
      for (const res of results) {
        if (!res.ok) {
          failedCount++;
          try {
            const errData = await res.json();
            if (errData.message) lastError = errData.message;
          } catch(e) {}
        }
      }

      if (failedCount > 0) {
        setAlertConfig({
          show: true,
          title: '⚠️ บันทึกไม่สำเร็จทั้งหมด',
          message: `มีลูกไก่ ${failedCount} ตัวที่ไม่สามารถบันทึกได้ อาจเพราะรหัสโค้ดหรือเลขกิ๊ฟปีกซ้ำกับที่มีอยู่แล้วครับ\n\n(ระบบแจ้งว่า: ${lastError || 'รหัสซ้ำ'})`,
          type: 'error'
        });
        setLoading(false);
        return;
      }

      setAlertConfig({
        show: true,
        title: '🎉 สำเร็จเรียบร้อย',
        message: `บันทึกคัดเพศและติดกิ๊ฟปีกสำเร็จ! เพิ่มลูกไก่ชนรวม ${allNewChicks.length} ตัว เข้าสู่ระบบแล้ว`,
        type: 'success',
        onConfirm: () => {
          if (window.history.length > 2) {
            window.history.back();
          } else {
            onNavigate('chick-registry');
          }
        }
      });
    } catch (err) {
      console.error(err);
      setAlertConfig({
        show: true,
        title: '❌ เกิดข้อผิดพลาด',
        message: 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500 transition-all";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col pb-24 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 px-4 py-3 shadow-xs">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if (window.history.length > 2) {
                  window.history.back();
                } else {
                  onNavigate('dashboard');
                }
              }} 
              className="p-2 -ml-2 text-slate-500 hover:text-amber-600 transition-colors cursor-pointer rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-lg font-black tracking-tight flex items-center gap-2">🏷️ บันทึกคัดเพศ & ติดกิ๊ฟปีกไก่ 1 เดือน</h1>
              <p className="text-[11px] text-slate-500">ลงทะเบียนแยกเพศและติดกิ๊ฟปีกประจำคอก</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto w-full p-4 flex-1">
        <form onSubmit={handleSubmit} className="space-y-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xl">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-500" /> เลือกชุดคอกผสมพันธุ์ (Breeding Batch) *
            </label>
            <CustomSelect
              value={formData.batchId}
              onChange={(val) => setFormData({...formData, batchId: val})}
              options={batches.map(b => ({
                value: b._id,
                label: `คอก ${b.batchCode} (พ่อ: ${b.father?.name || '-'} x แม่: ${b.mother?.name || '-'})`
              }))}
              placeholder={batches.length === 0 ? "-- ไม่พบชุดคอก (กรุณาสร้างชุดคอกก่อน) --" : "-- เลือกชุดคอก --"}
              buttonClassName="w-full px-4 py-3.5 bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-amber-500 rounded-2xl text-sm font-bold outline-none flex items-center justify-between text-left"
            />
            {usedBands.length > 0 && (
              <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 animate-in fade-in zoom-in-95 duration-200">
                <div className="font-bold flex items-center gap-1.5 mb-1.5">
                  <Tag className="w-3.5 h-3.5" /> เลขกิ๊ฟปีกที่ใช้ไปแล้วในคอกนี้ ({usedBands.length} เบอร์):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {usedBands.map((b, idx) => (
                    <span key={idx} className="px-1.5 py-0.5 bg-white dark:bg-amber-900/50 rounded shadow-sm border border-amber-100 dark:border-amber-800/50 font-mono font-bold tracking-wider">{b}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button 
                type="button"
                onClick={() => setFormData({...formData, inputMode: 'auto'})}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${formData.inputMode === 'auto' ? 'bg-white dark:bg-slate-700 shadow-sm text-amber-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                สร้างอัตโนมัติ
              </button>
              <button 
                type="button"
                onClick={() => setFormData({...formData, inputMode: 'manual'})}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${formData.inputMode === 'manual' ? 'bg-white dark:bg-slate-700 shadow-sm text-amber-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                กรอกรายตัว
              </button>
            </div>
            
            <div className="space-y-1.5 pt-2 sm:pt-0">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-slate-400" /> ชื่อข้อความบนกิ๊ฟ (ชื่อซุ้ม/ฟาร์ม)
              </label>
              <input 
                className={inputClass}
                placeholder="เช่น ส.สิบทิศ (ถ้ามี) อันนี้สลักในกิ๊ฟ"
                value={formData.bandText}
                onChange={e => setFormData({...formData, bandText: e.target.value})}
              />
            </div>
            
            <div className="space-y-1.5 pt-2 sm:pt-0">
              <label className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" /> วันที่ฟักไข่ (Hatch Date)
              </label>
              <input 
                type="date"
                className={inputClass}
                value={formData.hatchDate}
                onChange={e => setFormData({...formData, hatchDate: e.target.value})}
              />
            </div>
          </div>

          {formData.inputMode === 'auto' ? (
            <div className="space-y-4">
              {/* Male Section */}
              <div className="p-4 bg-red-50/50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-900/30 rounded-3xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-red-600 dark:text-red-400 flex items-center gap-1.5">
                    <Swords className="w-4 h-4" /> ลูกไก่ เพศผู้
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">จำนวน (ตัว)</label>
                    <input 
                      type="number"
                      min="0"
                      className={inputClass}
                      value={formData.maleCount}
                      onChange={e => {
                        const val = e.target.value;
                        const cleanVal = val.replace(/^0+/, '');
                        const num = Math.max(0, parseInt(cleanVal) || 0);
                        setFormData({...formData, maleCount: num});
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">เลขกิ๊ฟเริ่มต้น</label>
                    <input 
                      className={inputClass}
                      placeholder="001"
                      value={formData.maleStartBand}
                      onChange={e => setFormData({...formData, maleStartBand: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">สีกิ๊ฟ</label>
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
                        { value: 'ดำ', label: 'ดำ', colorCode: 'bg-slate-900' },
                        { value: 'ขาว', label: 'ขาว', colorCode: 'bg-white border border-slate-200' },
                        { value: 'ส้ม', label: 'ส้ม', colorCode: 'bg-orange-500' },
                        { value: 'ฟ้า', label: 'ฟ้า', colorCode: 'bg-sky-400' },
                        { value: 'ม่วง', label: 'ม่วง', colorCode: 'bg-purple-500' },
                        { value: 'ชมพู', label: 'ชมพู', colorCode: 'bg-pink-400' }
                      ]}
                      buttonClassName={inputClass + " flex items-center justify-between text-left font-bold"}
                    />
                  </div>
                </div>
              </div>

              {/* Female Section */}
              <div className="p-4 bg-pink-50/50 dark:bg-pink-950/30 border border-pink-200/60 dark:border-pink-900/30 rounded-3xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-pink-600 dark:text-pink-400 flex items-center gap-1.5">
                    <Heart className="w-4 h-4" /> ลูกไก่ เพศเมีย
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">จำนวน (ตัว)</label>
                    <input 
                      type="number"
                      min="0"
                      className={inputClass}
                      value={formData.femaleCount}
                      onChange={e => {
                        const val = e.target.value;
                        const cleanVal = val.replace(/^0+/, '');
                        const num = Math.max(0, parseInt(cleanVal) || 0);
                        setFormData({...formData, femaleCount: num});
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">เลขกิ๊ฟเริ่มต้น</label>
                    <input 
                      className={inputClass}
                      placeholder="F01"
                      value={formData.femaleStartBand}
                      onChange={e => setFormData({...formData, femaleStartBand: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">สีกิ๊ฟ</label>
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
                        { value: 'ดำ', label: 'ดำ', colorCode: 'bg-slate-900' },
                        { value: 'ขาว', label: 'ขาว', colorCode: 'bg-white border border-slate-200' },
                        { value: 'ส้ม', label: 'ส้ม', colorCode: 'bg-orange-500' },
                        { value: 'ฟ้า', label: 'ฟ้า', colorCode: 'bg-sky-400' },
                        { value: 'ม่วง', label: 'ม่วง', colorCode: 'bg-purple-500' },
                        { value: 'ชมพู', label: 'ชมพู', colorCode: 'bg-pink-400' }
                      ]}
                      buttonClassName={inputClass + " flex items-center justify-between text-left font-bold"}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {formData.manualChicks.map((chick, i) => (
                <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-white/5 space-y-3 relative">
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
                        <AlertTriangle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      type="text"
                      placeholder={`ชื่อ (ย่อหน้าจะเป็น ลูกไก่ (#${i + 1}))`}
                      className={inputClass}
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
                      buttonClassName={inputClass + " flex justify-between items-center"}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      type="text"
                      placeholder="เลขกิ๊ฟปีก"
                      className={inputClass}
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
                        { value: 'ทอง', label: 'ทอง', colorCode: 'bg-amber-400' },
                        { value: 'แดง', label: 'แดง', colorCode: 'bg-red-500' },
                        { value: 'เงิน', label: 'เงิน', colorCode: 'bg-slate-300' },
                        { value: 'เหลือง', label: 'เหลือง', colorCode: 'bg-yellow-400' },
                        { value: 'เขียว', label: 'เขียว', colorCode: 'bg-green-500' },
                        { value: 'น้ำเงิน', label: 'น้ำเงิน', colorCode: 'bg-blue-600' },
                        { value: 'ดำ', label: 'ดำ', colorCode: 'bg-slate-900' },
                        { value: 'ขาว', label: 'ขาว', colorCode: 'bg-white border border-slate-200' },
                        { value: 'ส้ม', label: 'ส้ม', colorCode: 'bg-orange-500' },
                        { value: 'ฟ้า', label: 'ฟ้า', colorCode: 'bg-sky-400' },
                        { value: 'ม่วง', label: 'ม่วง', colorCode: 'bg-purple-500' },
                        { value: 'ชมพู', label: 'ชมพู', colorCode: 'bg-pink-400' }
                      ]}
                      buttonClassName={inputClass + " flex justify-between items-center"}
                    />
                  </div>
                </div>
              ))}
              <button 
                type="button"
                onClick={() => setFormData({...formData, manualChicks: [...formData.manualChicks, { gender: 'ยังไม่ระบุ', bandNumber: '', bandColor: 'ทอง', name: '' }]})}
                className="w-full py-3 border-2 border-dashed border-amber-200 dark:border-amber-900/30 rounded-2xl text-amber-600 dark:text-amber-500 text-xs font-bold hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors flex items-center justify-center gap-2"
              >
                + เพิ่มลูกไก่
              </button>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-2xl shadow-xl shadow-amber-500/20 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
            บันทึกคัดเพศ & ติดกิ๊ฟปีกยกคอก
          </button>
        </form>
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
    </div>
  );
}
