import { useState } from 'react';
import { ChevronLeft, Camera, Save, Swords, Tag, ShieldCheck, Calendar, Palette, Heart, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { CustomSelect } from '../ui/CustomSelect';

export default function ChickenAdd({ onNavigate }: { onNavigate: (page: any) => void }) {
  const [alertConfig, setAlertConfig] = useState<{ 
    show: boolean; 
    title: string; 
    message: string; 
    type: 'info' | 'success' | 'error';
    onConfirm?: () => void;
  } | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    gender: 'male',
    breed: '',
    color: '',
    hatchDate: '',
    bandColor: '',
    bandNumber: '',
    bandText: '',
    father: '',
    mother: '',
    status: 'ปกติพร้อมผสม',
    fatherNameText: '',
    motherNameText: '',
    notes: '',
    image: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        bloodline: formData.breed || 'พม่า-ง่อน'
      };

      const res = await fetch('http://localhost:5001/api/chickens', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setAlertConfig({
          show: true,
          title: '🎉 สำเร็จเรียบร้อย',
          message: 'บันทึกข้อมูลไก่ชนใหม่สำเร็จเรียบร้อยแล้ว!',
          type: 'success',
          onConfirm: () => onNavigate('chicken-list')
        });
      } else {
        setErrorMsg(data.message || 'ไม่สามารถบันทึกข้อมูลได้ กรุณาตรวจสอบข้อมูล');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all shadow-xs";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col pb-24 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Dynamic Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 px-4 py-3 shadow-xs">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onNavigate('chicken-list')} 
              className="p-2 -ml-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
              🐓 ลงทะเบียนเพิ่มไก่ชนใหม่
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto w-full p-4 flex-1">
        {errorMsg && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-2xl text-xs font-bold animate-in fade-in">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xl">
          {/* Image Upload Area */}
          <div className="flex flex-col items-center gap-2">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              id="image-upload" 
              onChange={handleImageChange} 
            />
            <label 
              htmlFor="image-upload" 
              className="w-28 h-28 bg-slate-100 dark:bg-slate-800/80 rounded-3xl flex flex-col items-center justify-center gap-2 text-slate-400 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-red-500 transition-colors cursor-pointer group overflow-hidden relative"
            >
              {formData.image ? (
                <>
                  <img src={formData.image} alt="Chicken" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </>
              ) : (
                <>
                  <Camera className="w-7 h-7 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold">อัปโหลดรูปไก่</span>
                </>
              )}
            </label>
            {formData.image && (
              <button 
                type="button" 
                onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                className="text-[10px] text-red-500 font-bold hover:underline cursor-pointer"
              >
                ลบรูปภาพ
              </button>
            )}
            {!formData.image && <span className="text-[11px] text-slate-400">(ถ้ามีรูปภาพไก่ชนประจำฟาร์ม)</span>}
          </div>

          <div className="space-y-4">
            {/* Code & Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-red-600" /> รหัสประจำตัวไก่ *
                </label>
                <div className="relative">
                  <input 
                    required
                    className={`${inputClass} pr-9`}
                    placeholder="Ex. SCJ-2026-001"
                    value={formData.code}
                    onChange={e => setFormData({...formData, code: e.target.value})}
                  />
                  {formData.code && (
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, code: ''})}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/50 rounded-full p-1 transition-colors flex items-center justify-center shadow-sm border border-transparent hover:border-red-200 dark:hover:border-red-900/50 cursor-pointer"
                      title="ล้างข้อความทั้งหมด"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1 flex items-center gap-1">
                  🐓 ชื่อเรียกไก่ *
                </label>
                <input 
                  required
                  className={inputClass}
                  placeholder="Ex. เจ้าแสนกล"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            {/* Gender & Breed */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">เพศไก่ชน *</label>
                <CustomSelect 
                  value={formData.gender}
                  onChange={(val) => setFormData({...formData, gender: val as any})}
                  options={[
                    { value: 'male', label: 'พ่อพันธุ์ / ผู้ (Male)', colorCode: 'bg-red-500' },
                    { value: 'female', label: 'แม่พันธุ์ / เมีย (Female)', colorCode: 'bg-pink-500' }
                  ]}
                  buttonClassName={inputClass + " flex items-center justify-between text-left font-bold"}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1 flex items-center gap-1">
                  <Swords className="w-3.5 h-3.5 text-orange-500" /> สายพันธุ์ / สายเลือด
                </label>
                <input 
                  className={inputClass}
                  placeholder="Ex. พม่า-ง่อน / ป่าก๋อย"
                  value={formData.breed}
                  onChange={e => setFormData({...formData, breed: e.target.value})}
                />
              </div>
            </div>

            {/* Color & Hatch Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-purple-500" /> ลักษณะเด่น / หมายเหตุ
                </label>
                <input 
                  className={inputClass}
                  placeholder="Ex. สีแดงเพลิง, หงอนแจ้, หรือจุดเด่นอื่นๆ..."
                  value={formData.color}
                  onChange={e => setFormData({...formData, color: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" /> วันที่ฟัก
                </label>
                <input 
                  type="date"
                  className={inputClass}
                  value={formData.hatchDate}
                  onChange={e => setFormData({...formData, hatchDate: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">สถานะไก่ชน</label>
              <CustomSelect
                value={formData.status}
                onChange={(val) => setFormData({...formData, status: val})}
                options={[
                  { value: 'ปกติพร้อมผสม', label: 'ปกติพร้อมผสม (Ready)' },
                  { value: 'พร้อมออกชน', label: 'พร้อมออกชน (Ready to Fight)' },
                  { value: 'กำลังทำตัว/เข้าคอร์ส', label: 'กำลังทำตัว/เข้าคอร์ส (Training)' },
                  { value: 'กำลังพัฒนา/คัดสายพันธุ์', label: 'กำลังพัฒนา/คัดสายพันธุ์ (Developing)' },
                  { value: 'กำลังฟักไข่', label: 'กำลังฟักไข่ (Incubating)' },
                  { value: 'พักฟื้นหลังชน', label: 'พักฟื้นหลังชน (Recovering)' },
                  { value: 'ป่วย/รักษาตัว', label: 'ป่วย/รักษาตัว (Sick)' },
                  { value: 'ถ่ายขน', label: 'ถ่ายขน (Molting)' },
                  { value: 'ขายแล้ว', label: 'ขายแล้ว (Sold)' },
                  { value: 'ปลดระวาง', label: 'ปลดระวาง (Retired)' },
                  { value: 'เสียชีวิต', label: 'เสียชีวิต (Deceased)' }
                ]}
                buttonClassName={inputClass + " flex items-center justify-between text-left font-bold"}
              />
            </div>

            {/* Parent Information (Text) */}
            <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-2xl border border-orange-200/60 dark:border-orange-900/30 space-y-3">
              <span className="text-xs font-black text-orange-700 dark:text-orange-400 flex items-center gap-1">
                🧬 ข้อมูลพ่อแม่สายเลือด (กรณีซื้อมาจากฟาร์มอื่น)
              </span>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-orange-600 dark:text-orange-500">ชื่อพ่อไก่ (พิมพ์ข้อความ)</label>
                  <input 
                    className={inputClass + " border-orange-200 focus:ring-orange-500"}
                    placeholder="Ex. พ่อแดงเพลิง (ฟาร์ม A)"
                    value={formData.fatherNameText}
                    onChange={e => setFormData({...formData, fatherNameText: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-orange-600 dark:text-orange-500">ชื่อแม่ไก่ (พิมพ์ข้อความ)</label>
                  <input 
                    className={inputClass + " border-orange-200 focus:ring-orange-500"}
                    placeholder="Ex. แม่สา (ฟาร์ม A)"
                    value={formData.motherNameText}
                    onChange={e => setFormData({...formData, motherNameText: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Band Number & Color */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-white/5 space-y-3">
              <span className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1">
                🏷️ ข้อมูลการติดกิ๊ฟปีก / ห่วงขา (Physical Band Details)
              </span>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">เลขกิ๊ฟปีก (Band No.)</label>
                  <input 
                    className={inputClass}
                    placeholder="Ex. 001"
                    value={formData.bandNumber}
                    onChange={e => setFormData({...formData, bandNumber: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">สีกิ๊ฟปีก (Color)</label>
                  <CustomSelect 
                    value={formData.bandColor}
                    onChange={(val) => setFormData({...formData, bandColor: val})}
                    options={[
                      { value: 'ทอง', label: 'ทอง', colorCode: 'bg-amber-400' },
                      { value: 'เงิน', label: 'เงิน', colorCode: 'bg-slate-300' },
                      { value: 'แดง', label: 'แดง', colorCode: 'bg-red-500' },
                      { value: 'เหลือง', label: 'เหลือง', colorCode: 'bg-yellow-400' },
                      { value: 'เขียว', label: 'เขียว', colorCode: 'bg-green-500' },
                      { value: 'น้ำเงิน', label: 'น้ำเงิน', colorCode: 'bg-blue-500' }
                    ]}
                    buttonClassName={inputClass + " flex items-center justify-between text-left font-bold"}
                  />
                </div>
              </div>
              <div className="space-y-1 mt-3">
                <label className="text-[11px] font-bold text-slate-500">ชื่อข้อความบนกิ๊ฟ (ชื่อซุ้ม/ฟาร์ม)</label>
                <input 
                  className={inputClass}
                  placeholder="เช่น ส.สิบทิศ (ถ้ามี) อันนี้สลักในกิ๊ฟ"
                  value={formData.bandText}
                  onChange={e => setFormData({...formData, bandText: e.target.value})}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">บันทึกเพิ่มเติม / ประวัติประจักษ์ชัย</label>
              <textarea 
                rows={3}
                className={inputClass}
                placeholder="บันทึกรายละเอียดเพิ่มเติม เช่น ลีลาการชน, น้ำหนัก, ประวัติชัยชนะ..."
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-bold rounded-2xl shadow-xl shadow-red-600/20 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
            บันทึกข้อมูลไก่ชนเข้าฟาร์ม
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
