import { useState, useEffect } from 'react';
import { ChevronLeft, Swords, Calendar, Tag, User, Users, Info, ArrowUpRight, Share2, Heart, Edit, Trash2, Save, CheckCircle, Camera, AlertTriangle, Activity, Archive, XCircle, BadgeCheck, Award, Phone, MessageCircle, MapPin } from 'lucide-react';
import { ChickenIcon } from '../ui/ChickenIcon';
import { CustomSelect } from '../ui/CustomSelect';
import { getBandColorClass } from './FatherRegistry';
import CertificateModal from './CertificateModal';

export const getBandColorCircleClass = (color: string) => {
  switch (color) {
    case 'ทอง': return 'bg-amber-400';
    case 'เงิน': return 'bg-slate-300';
    case 'แดง': return 'bg-red-500';
    case 'เหลือง': return 'bg-yellow-400';
    case 'เขียว': return 'bg-green-500';
    case 'น้ำเงิน': return 'bg-blue-500';
    case 'ส้ม': return 'bg-orange-500';
    case 'ขาว': return 'bg-white border border-slate-300';
    case 'ฟ้า': return 'bg-sky-400';
    case 'ม่วง': return 'bg-purple-500';
    case 'ชมพู': return 'bg-pink-400';
    default: return 'bg-slate-400';
  }
};
export const getBandTextColorClass = (color: string) => {
  switch (color) {
    case 'ทอง': return 'text-amber-400';
    case 'เงิน': return 'text-slate-300';
    case 'แดง': return 'text-red-500';
    case 'เหลือง': return 'text-yellow-400';
    case 'เขียว': return 'text-green-500';
    case 'น้ำเงิน': return 'text-blue-500';
    case 'ส้ม': return 'text-orange-500';
    case 'ขาว': return 'text-slate-100 drop-shadow-sm';
    case 'ฟ้า': return 'text-sky-400';
    case 'ม่วง': return 'text-purple-500';
    case 'ชมพู': return 'text-pink-400';
    default: return 'text-slate-400';
  }
};

export const getBandContrastTextClass = (color: string) => {
  switch (color) {
    case 'ทอง':
    case 'เงิน':
    case 'เหลือง':
    case 'ขาว':
      return 'text-slate-900';
    case 'แดง':
    case 'เขียว':
    case 'น้ำเงิน':
    case 'ดำ':
    case 'ส้ม':
    case 'ม่วง':
    case 'ฟ้า':
    case 'ชมพู':
    default:
      return 'text-white';
  }
};

export const getBandBorderColorClass = (color: string) => {
  switch (color) {
    case 'ทอง': return 'border-amber-400';
    case 'เงิน': return 'border-slate-300';
    case 'แดง': return 'border-red-500';
    case 'เหลือง': return 'border-yellow-400';
    case 'เขียว': return 'border-green-500';
    case 'น้ำเงิน': return 'border-blue-500';
    case 'ส้ม': return 'border-orange-500';
    case 'ขาว': return 'border-slate-100';
    case 'ฟ้า': return 'border-sky-400';
    case 'ม่วง': return 'border-purple-500';
    case 'ชมพู': return 'border-pink-400';
    default: return 'border-slate-400';
  }
};

export const getBandBgFadedClass = (color: string) => {
  switch (color) {
    case 'ทอง': return 'bg-amber-400/15';
    case 'เงิน': return 'bg-slate-300/15';
    case 'แดง': return 'bg-red-500/15';
    case 'เหลือง': return 'bg-yellow-400/15';
    case 'เขียว': return 'bg-green-500/15';
    case 'น้ำเงิน': return 'bg-blue-500/15';
    case 'ส้ม': return 'bg-orange-500/15';
    case 'ขาว': return 'bg-slate-100/10';
    case 'ฟ้า': return 'bg-sky-400/15';
    case 'ม่วง': return 'bg-purple-500/15';
    case 'ชมพู': return 'bg-pink-400/15';
    default: return 'bg-slate-800/40';
  }
};

export const getStatusConfig = (status: string) => {
  switch (status) {
    case 'ปกติพร้อมผสม':
    case 'พร้อมผสม':
      return { colorClass: 'text-emerald-500', bgClass: 'bg-emerald-500', icon: <CheckCircle className="w-4 h-4" /> };
    case 'กำลังทำตัว/เข้าคอร์ส':
    case 'กำลังพัฒนา/คัดสายพันธุ์':
      return { colorClass: 'text-blue-500', bgClass: 'bg-blue-500', icon: <Swords className="w-4 h-4" /> };
    case 'พร้อมออกชน':
      return { colorClass: 'text-orange-500', bgClass: 'bg-orange-500', icon: <Swords className="w-4 h-4" /> };
    case 'กำลังฟักไข่':
      return { colorClass: 'text-pink-500', bgClass: 'bg-pink-500', icon: <Heart className="w-4 h-4" /> };
    case 'พักฟื้นหลังชน':
      return { colorClass: 'text-amber-500', bgClass: 'bg-amber-500', icon: <Activity className="w-4 h-4" /> };
    case 'ป่วย/รักษาตัว':
    case 'ป่วย':
      return { colorClass: 'text-red-500', bgClass: 'bg-red-500', icon: <AlertTriangle className="w-4 h-4" /> };
    case 'ถ่ายขน':
      return { colorClass: 'text-slate-500', bgClass: 'bg-slate-500', icon: <Info className="w-4 h-4" /> };
    case 'ขายแล้ว':
    case 'ปลดระวาง':
      return { colorClass: 'text-slate-400', bgClass: 'bg-slate-400', icon: <Archive className="w-4 h-4" /> };
    case 'เสียชีวิต':
      return { colorClass: 'text-red-700', bgClass: 'bg-red-700', icon: <XCircle className="w-4 h-4" /> };
    default:
      return { colorClass: 'text-emerald-500', bgClass: 'bg-emerald-500', icon: <CheckCircle className="w-4 h-4" /> };
  }
};

export default function ChickenDetail({ chickenId, onNavigate }: { chickenId: string, onNavigate: (page: any) => void }) {
  const isPublic = !localStorage.getItem('token');
  const [chick, setChick] = useState<any>(() => {
    try {
      const cached = sessionStorage.getItem(`cached_chicken_${chickenId}`);
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return null;
  });
  const [siblings, setSiblings] = useState<any[]>([]);
  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem(`cached_chicken_${chickenId}`);
    } catch (e) { return true; }
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{ 
    show: boolean; 
    title: string; 
    message: string; 
    type: 'info' | 'success' | 'error';
    onConfirm?: () => void;
  } | null>(null);
  
  // Sale form state
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [saleForm, setSaleForm] = useState({
    customerName: '',
    customerPhone: '',
    customerFarm: '',
    saleDate: new Date().toISOString().split('T')[0],
    price: '',
    notes: ''
  });

  useEffect(() => {
    if (chick?.saleInfo) {
      setSaleForm({
        customerName: chick.saleInfo.customerName || '',
        customerPhone: chick.saleInfo.customerPhone || '',
        customerFarm: chick.saleInfo.customerFarm || '',
        saleDate: chick.saleInfo.saleDate ? new Date(chick.saleInfo.saleDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        price: chick.saleInfo.price?.toString() || '',
        notes: chick.saleInfo.notes || ''
      });
    }
  }, [chick]);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    code: '',
    bloodline: '',
    color: '',
    bandNumber: '',
    bandColor: '',
    bandText: '',
    notes: '',
    status: '',
    gender: '',
    hatchDate: '',
    fatherNameText: '',
    motherNameText: ''
  });

  useEffect(() => {
    if (chickenId) {
      fetchDetail();
    }
  }, [chickenId]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0];
    if (file) {
      // Handle iPhone HEIC format
      if (file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic') {
        try {
          const heic2any = (await import('heic2any')).default;
          const convertedBlob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.8 });
          file = new File([convertedBlob as Blob], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' });
        } catch (error) {
          console.error('Error converting HEIC to JPEG:', error);
          alert('ไม่สามารถแปลงไฟล์รูปภาพจาก iPhone ได้ กรุณาลองใช้รูปอื่น');
          return;
        }
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQuickImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0];
    if (file && chick) {
      if (!chick) setLoading(true);
      // Handle iPhone HEIC format
      if (file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic') {
        try {
          const heic2any = (await import('heic2any')).default;
          const convertedBlob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.8 });
          file = new File([convertedBlob as Blob], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' });
        } catch (error) {
          console.error('Error converting HEIC to JPEG:', error);
          alert('ไม่สามารถแปลงไฟล์รูปภาพจาก iPhone ได้ กรุณาลองใช้รูปอื่น');
          setLoading(false);
          return;
        }
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        try {
          const token = localStorage.getItem('token');
          const endpoint = `${import.meta.env.VITE_API_URL}/api/${chick._sourceCollection || 'chickens'}/${chickenId}`;
          const res = await fetch(endpoint, {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ image: base64Image })
          });
          
          if (res.ok) {
            setAlertConfig({
              show: true,
              title: '🎉 อัปโหลดรูปสำเร็จ',
              message: 'อัปเดตรูปภาพโปรไฟล์ไก่เรียบร้อยแล้ว!',
              type: 'success',
              onConfirm: () => fetchDetail()
            });
          }
        } catch (err) {
          console.error(err);
          alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchDetail = async () => {
    try {
      if (!chick) setLoading(true);
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Fetch using the unified includeAny endpoint with cache buster
      let res = await fetch(`${import.meta.env.VITE_API_URL}/api/chickens/${chickenId}?includeAny=true&t=${Date.now()}`, { headers }).catch(() => null);
      
      let data: any = null;
      let sourceCollection = 'chickens';

      if (res && res.ok) {
        const json = await res.json();
        data = json.data || json;
        if (data._sourceCollection) {
          sourceCollection = data._sourceCollection;
        }
      }

      if (data) {
        data._sourceCollection = sourceCollection;
        setChick(data);
        setEditForm({
          name: (data.name || '').replace(/^[♂♀]\s*/, ''),
          code: data.code || '',
          bloodline: data.bloodline || data.breed || '',
          color: data.color || '',
          bandNumber: data.bandNumber || '',
          bandColor: data.bandColor || '',
          bandText: data.bandText || '',
          notes: data.notes || data.records || '',
          status: data.status || 'ปกติ',
          image: data.image || '',
          gender: data.gender || (data._sourceCollection === 'fathers' ? 'male' : data._sourceCollection === 'mothers' ? 'female' : ''),
          hatchDate: data.hatchDate ? new Date(data.hatchDate).toISOString().split('T')[0] : '',
          fatherNameText: data.fatherNameText || '',
          motherNameText: data.motherNameText || ''
        });
      }

      // Fetch siblings if batch exists

      
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      };

      const endpoint = `${import.meta.env.VITE_API_URL}/api/${chick._sourceCollection || 'chickens'}/${chickenId}`;

      const payload = { ...editForm };
      if (payload.bloodline !== undefined) {
        (payload as any).breed = payload.bloodline;
      }
      if (payload.hatchDate === '') {
        (payload as any).hatchDate = null;
      }

      const res = await fetch(endpoint, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setAlertConfig({
          show: true,
          title: '🎉 อัปเดตสำเร็จ',
          message: 'อัปเดตข้อมูลไก่ชนเรียบร้อยแล้ว!',
          type: 'success',
          onConfirm: () => {
            setShowEditModal(false);
            fetchDetail();
          }
        });
      } else {
        setAlertConfig({
          show: true,
          title: '⚠️ อัปเดตไม่สำเร็จ',
          message: 'ไม่สามารถอัปเดตข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
          type: 'error'
        });
      }
    } catch (err) {
      console.error(err);
      setAlertConfig({
        show: true,
        title: '❌ เกิดข้อผิดพลาด',
        message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล',
        type: 'error'
      });
    }
  };

  const handleSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      };

      const endpoint = `${import.meta.env.VITE_API_URL}/api/${chick._sourceCollection || 'chickens'}/${chickenId}`;

      const payload = { 
        status: 'ขายแล้ว',
        saleInfo: {
          ...saleForm,
          price: saleForm.price ? Number(saleForm.price) : undefined
        }
      };

      const res = await fetch(endpoint, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setAlertConfig({
          show: true,
          title: '🎉 บันทึกการขายสำเร็จ',
          message: 'บันทึกการขายและอัปเดตข้อมูลเรียบร้อยแล้ว!',
          type: 'success',
          onConfirm: () => {
            setShowSaleModal(false);
            fetchDetail();
          }
        });
      } else {
        throw new Error('Update failed');
      }
    } catch (err) {
      console.error(err);
      setAlertConfig({
        show: true,
        title: '❌ เกิดข้อผิดพลาด',
        message: 'เกิดข้อผิดพลาดในการบันทึกการขาย',
        type: 'error'
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบไก่ชน "${chick?.name}" ออกจากระบบถาวร?`)) return;

    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const collection = chick?._sourceCollection || 'chickens';
      const endpoint = `${import.meta.env.VITE_API_URL}/api/${collection}/${chickenId}`;

      const res = await fetch(endpoint, { method: 'DELETE', headers });
      
      if (!res.ok) {
        throw new Error('Delete failed');
      }

      setAlertConfig({
        show: true,
        title: '🗑️ ลบข้อมูลเรียบร้อย',
        message: 'ลบข้อมูลไก่ชนออกจากระบบเรียบร้อยแล้ว',
        type: 'success',
        onConfirm: () => onNavigate('chicken-list')
      });
    } catch (err) {
      console.error(err);
      setAlertConfig({
        show: true,
        title: '❌ เกิดข้อผิดพลาด',
        message: 'เกิดข้อผิดพลาดในการลบข้อมูล',
        type: 'error'
      });
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!chick) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-10 text-center flex flex-col items-center justify-center space-y-4">
      <p className="text-slate-500 font-bold">ไม่พบข้อมูลไก่ชนตัวนี้ในระบบ</p>
      <button 
        onClick={() => {
          if (window.history.length > 2) {
            window.history.back();
          } else {
            onNavigate(isPublic ? 'home' : 'chicken-list');
          }
        }} 
        className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold"
      >
        {isPublic ? 'กลับ' : 'ย้อนกลับ'}
      </button>
    </div>
  );

  const inputClass = "w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 text-sm font-bold transition-all";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col pb-24 text-slate-900 dark:text-slate-100 transition-colors relative">
      {/* Header Area */}
      <div className="relative h-64 sm:h-72 md:h-80 lg:h-96 bg-gradient-to-br from-slate-900 via-red-950 to-black overflow-hidden border-b border-white/5">
        <button 
          onClick={() => {
            if (window.history.length > 2) {
              window.history.back();
            } else {
              onNavigate(isPublic ? 'home' : 'chicken-list');
            }
          }}
          className="absolute top-6 left-4 z-20 p-2.5 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition-all cursor-pointer border border-white/10"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        {!isPublic && (
          <div className="absolute top-6 right-4 z-20 flex gap-2">
            <button 
              onClick={() => setShowSaleModal(true)}
              className="px-3 py-2 bg-white text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-lg shadow-black/10"
            >
              {chick.status === 'ขายแล้ว' ? '📝 แก้ไขการขาย' : '💰 บันทึกขาย'}
            </button>
            <button 
              onClick={() => setShowEditModal(true)}
              className="px-3 py-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-xl text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold border border-white/10"
            >
              <Edit className="w-3.5 h-3.5" /> แก้ไข
            </button>
            <button 
              onClick={handleDelete}
              className="p-2 bg-black/20 hover:bg-red-500 backdrop-blur-md rounded-xl text-white transition-all cursor-pointer border border-white/10"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
        

        
        {chick.user ? (
          <>
            <img 
              src={`${import.meta.env.VITE_API_URL}/api/auth/${chick.user._id}/cover-image`} 
              alt="Cover" 
              className="absolute inset-0 w-full h-full object-cover object-[center_30%] opacity-100 z-0"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-red-950/80 via-red-900/30 to-transparent z-0 pointer-events-none"></div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-10 z-0">
            <Swords className="w-48 h-48 text-white rotate-12" />
          </div>
        )}
      </div>

      {/* Main Details */}
      <div className="p-4 max-w-2xl mx-auto w-full -mt-24 sm:-mt-28 md:-mt-32 relative z-20 space-y-4">
        {/* Profile Card with overlapping Image */}
        <div className="flex flex-col items-center sm:items-start sm:flex-row gap-5 p-5 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-white/10">
          {/* Chicken Image container */}
          <div className="relative -mt-24 sm:-mt-28 group">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              id="quick-image-upload" 
              onChange={handleQuickImageUpload}
              disabled={isPublic}
            />
            <label 
              key={chick.updatedAt?.toString()}
              htmlFor={!isPublic ? "quick-image-upload" : undefined}
              className={`block w-40 h-40 sm:w-48 sm:h-48 bg-slate-50 dark:bg-slate-800 rounded-3xl overflow-hidden shrink-0 border-4 border-white dark:border-slate-900 shadow-lg flex flex-col items-center justify-center relative ${!isPublic ? 'cursor-pointer hover:border-red-500 transition-colors' : ''}`}
            >
              <>
                <img 
                  src={chick.image || `${import.meta.env.VITE_API_URL}/api/${chick._sourceCollection || 'chickens'}/${chick._id}/image?t=${chick.updatedAt ? new Date(chick.updatedAt).getTime() : ''}`}
                  alt={chick.name} 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextElementSibling) {
                      (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 hidden-fallback bg-slate-50 dark:bg-slate-800" style={{ display: 'none' }}>
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-2">
                    <Swords className="w-8 h-8" />
                  </div>
                  {!isPublic && <span className="text-[10px] font-bold text-slate-400 group-hover:text-red-500 transition-colors">อัปโหลดรูปภาพ</span>}
                </div>
                {!isPublic && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                )}
              </>
            </label>
          </div>

          {/* Core Info */}
          <div className="flex-1 text-center sm:text-left space-y-3 w-full mt-2 sm:mt-0">
            <div className="space-y-1.5">
              <div className="flex flex-col items-center sm:items-start gap-1">
                <span className={`text-[10px] w-fit font-bold px-2.5 py-0.5 rounded-xl flex items-center gap-1 border ${
                  (chick.gender === 'male' || chick.gender === 'ผู้')
                    ? 'bg-blue-50/80 text-blue-600 border-blue-100/50 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30' 
                    : (chick.gender === 'female' || chick.gender === 'เมีย')
                    ? 'bg-pink-50/80 text-pink-600 border-pink-100/50 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800/30'
                    : 'bg-slate-50/80 text-slate-500 border-slate-100/50 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700/50'
                }`}>
                  {(chick.gender === 'male' || chick.gender === 'ผู้') ? '♂ เพศผู้' :
                   (chick.gender === 'female' || chick.gender === 'เมีย') ? '♀ เพศเมีย' :
                   '❓ ไม่ระบุเพศ'}
                </span>
                <h1 className="text-2xl font-black leading-tight text-slate-900 dark:text-white mt-0.5">
                  {(() => {
                    let displayName = chick.name || '';
                    if (displayName.includes('เจ้าชาย')) return 'ไก่เพศผู้ "ยังไม่มีชื่อ"';
                    if (displayName.includes('เจ้าหญิง')) return 'ไก่เพศเมีย "ยังไม่มีชื่อ"';
                    return displayName;
                  })()}
                </h1>
              </div>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                {chick.bandNumber && (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black text-sm border shadow-sm max-w-full min-w-0 ${getBandColorClass(chick.bandColor || 'แดง')}`}>
                    <Tag className="w-4 h-4 shrink-0" /> 
                    <div className={`w-3 h-3 shrink-0 rounded-full shadow-sm border border-black/10 ${getBandColorCircleClass(chick.bandColor || 'แดง')}`}></div>
                    <span className="shrink-0">{chick.bandNumber}</span>
                    {(() => {
                      const farmText = chick.bandText || (chick.user ? (chick.user.farmName || chick.user.name) : null);
                      return farmText ? <span className="opacity-90 ml-0.5 truncate leading-normal pt-0.5">[{farmText}]</span> : null;
                    })()}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 border-t border-slate-50 dark:border-white/5">
              {chick.user && (
                <span className="text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2.5 py-1.5 rounded-xl flex items-center gap-1 border border-blue-200 dark:border-blue-800/50 shadow-sm">
                  {chick.user.isVerified && <BadgeCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                  {chick.user.farmName || chick.user.name || 'ฟาร์มสมาชิก'}
                </span>
              )}
              <span className="text-[11px] font-black bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50 px-2.5 py-1.5 rounded-xl uppercase tracking-wider shadow-sm break-all max-w-full">
                {chick.code}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0 inline-flex items-center shadow-sm">
                {chick.bloodline || chick.breed || 'ไม่ระบุ'}
              </span>
            </div>
            {/* Action Buttons - Only visible to the owner */}
            {!isPublic && (
              <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 flex justify-center sm:justify-start w-full">
                <button 
                  onClick={() => setShowCertificate(true)}
                  className="flex items-center justify-center gap-2 px-6 py-3 sm:py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 transition-all active:scale-95 w-full sm:w-auto"
                >
                  <Award className="w-4 h-4" /> ดูใบเซอร์ดิจิทัล (Certificate)
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl space-y-6 border border-slate-100 dark:border-white/10">
          
          {/* Parents Section (Minimal) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-sm min-w-0">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-xl flex items-center justify-center font-black shadow-sm shrink-0">
                พ่อ
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">สายพ่อพันธุ์</div>
                <div className="font-bold text-sm text-slate-900 dark:text-white break-words leading-tight">
                  {chick.father?.name || chick.fatherNameText || 'ไม่ระบุสายพ่อ'}
                </div>
                <div className="text-[10px] text-slate-500 break-all leading-normal mt-0.5">
                  {chick.father ? `${chick.father.code || '-'} • ${chick.father.breed || 'พม่า-ง่อน'}` : (chick.fatherNameText ? 'สายเลือดนอก' : '-')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-sm min-w-0">
              <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 rounded-xl flex items-center justify-center font-black shadow-sm shrink-0">
                แม่
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">สายแม่พันธุ์</div>
                <div className="font-bold text-sm text-slate-900 dark:text-white break-words leading-tight">
                  {chick.mother?.name || chick.motherNameText || 'ไม่ระบุสายแม่'}
                </div>
                <div className="text-[10px] text-slate-500 break-all leading-normal mt-0.5">
                  {chick.mother ? `${chick.mother.code || '-'} • ${chick.mother.breed || 'แม่พันธุ์สืบสาย'}` : (chick.motherNameText ? 'สายเลือดนอก' : '-')}
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-white/5">
              <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">สถานะไก่ชน</div>
              <div className={`font-black text-sm flex items-center gap-1.5 ${getStatusConfig(chick.status || 'ปกติพร้อมผสม').colorClass}`}>
                {getStatusConfig(chick.status || 'ปกติพร้อมผสม').icon}
                <span className="truncate">{chick.status || 'ปกติพร้อมผสม'}</span>
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-white/5 min-w-0">
              <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">วันเกิด / ฟักไข่</div>
              <div className="font-black text-sm text-slate-700 dark:text-slate-300 flex items-center gap-1 truncate">
                <Calendar className="w-4 h-4 shrink-0" /> <span className="truncate">{chick.hatchDate ? new Date(chick.hatchDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : 'ไม่ระบุ'}</span>
              </div>
            </div>
          </div>

          {/* Registration Certificate Number */}
          <div className="mt-3 p-3.5 sm:p-4 bg-amber-500/5 dark:bg-amber-500/5 border border-amber-500/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 shadow-[0_2px_12px_rgba(251,191,36,0.05)] relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full blur-xl pointer-events-none"></div>
            
            <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-inner">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider truncate">
                  เลขใบรับรองดิจิทัล
                </div>
                <div className="text-[9px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5 truncate">
                  Digital Certificate No.
                </div>
              </div>
            </div>

            <div className="shrink-0 w-full sm:w-auto text-left sm:text-right">
              <span className="inline-block w-full sm:w-auto text-center sm:text-right font-mono font-black text-[13px] sm:text-sm text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-2 sm:py-1.5 rounded-xl shadow-sm tracking-wide select-all whitespace-nowrap">
                KP-{chick._id.substring(12, 18).toUpperCase()}-{chick._id.substring(18, 24).toUpperCase()}
              </span>
            </div>
          </div>

          {chick.color && (
            <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-white/5">
              <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">ลักษณะเด่น</div>
              <div className="font-bold text-sm text-slate-700 dark:text-slate-300">
                {chick.color}
              </div>
            </div>
          )}

          {chick.status === 'ขายแล้ว' && chick.saleInfo?.customerName && (
            <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400/80 font-bold uppercase tracking-wider">เจ้าของปัจจุบัน (Current Owner)</div>
                  <div className="font-black text-slate-800 dark:text-emerald-100 text-sm">
                    {chick.saleInfo.customerName} {chick.saleInfo.customerFarm ? `(${chick.saleInfo.customerFarm})` : ''}
                  </div>
                </div>
              </div>
            </div>
          )}



          {/* Notes & Victory Records */}
          <div className="p-4 bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/30 rounded-2xl space-y-1">
            <span className="text-xs font-black text-amber-800 dark:text-amber-300 block">📝 ประวัติชัยชนะ / บันทึกเพิ่มเติมประจำตัว</span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {chick.notes || chick.records || 'ยังไม่มีบันทึกเพิ่มเติม กดปุ่ม "แก้ไข" ด้านบนเพื่อบันทึกประวัติชัยชนะหรือลักษณะเด่น'}
            </p>
          </div>

          {/* Owner Farm Contact Card (Only display if at least one contact info is available) */}
          {chick.user && (chick.user.phone || chick.user.lineId || chick.user.facebook || chick.user.address) && (
            <div className="p-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 rounded-2xl space-y-3.5 shadow-sm relative overflow-hidden text-left">
              
              <div className="flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-700/50 pb-2">
                <Phone className="w-4 h-4 text-red-600 dark:text-amber-400" />
                <span className="text-xs font-black text-slate-800 dark:text-amber-400/90 uppercase tracking-wider">
                  ข้อมูลการติดต่อเจ้าของฟาร์ม / ผู้เพาะพันธุ์
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Farm Name */}
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">ฟาร์มเพาะพันธุ์</div>
                    <div className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1 mt-0.5">
                      {chick.user.farmName || chick.user.name || 'ฟาร์มสมาชิก'}
                      {chick.user.isVerified && <BadgeCheck className="w-4 h-4 text-blue-500" title="ฟาร์มที่ได้รับการยืนยัน" />}
                    </div>
                  </div>
                </div>

                {/* Phone */}
                {chick.user.phone && (
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">เบอร์โทรศัพท์</div>
                      <a href={`tel:${chick.user.phone}`} className="text-xs font-bold text-red-600 dark:text-amber-300 hover:underline transition-colors inline-block mt-0.5">
                        {chick.user.phone}
                      </a>
                    </div>
                  </div>
                )}

                {/* Line ID */}
                {chick.user.lineId && (
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Line ID</div>
                      <div className="text-xs font-bold text-slate-800 dark:text-white mt-0.5 select-all">
                        {chick.user.lineId}
                      </div>
                    </div>
                  </div>
                )}

                {/* Facebook */}
                {chick.user.facebook && (
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Facebook</div>
                      <div className="text-xs font-bold text-slate-800 dark:text-white mt-0.5 break-all">
                        {chick.user.facebook}
                      </div>
                    </div>
                  </div>
                )}

                {/* Address */}
                {chick.user.address && (
                  <div className="flex items-start gap-2.5 sm:col-span-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-500/10 border border-slate-500/20 text-slate-500 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">ที่อยู่ฟาร์ม / สถานที่ติดต่อ</div>
                      <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
                        {chick.user.address}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 pb-12 sm:pb-6 shadow-2xl space-y-4 max-h-[85dvh] sm:max-h-[90vh] overflow-y-auto border border-slate-100 dark:border-white/10 custom-scrollbar">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-black flex items-center gap-2">
                <Edit className="w-5 h-5 text-red-600" /> แก้ไขข้อมูลไก่ชน
              </h2>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              {/* Image Upload Area */}
              <div className="flex flex-col items-center gap-2 pb-2">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  id="edit-image-upload" 
                  onChange={handleImageChange} 
                />
                <label 
                  htmlFor="edit-image-upload" 
                  className="w-24 h-24 bg-slate-100 dark:bg-slate-800/80 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-slate-400 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-red-500 transition-colors cursor-pointer group overflow-hidden relative"
                >
                  {editForm.image ? (
                    <>
                      <img src={editForm.image} alt="Chicken" className="w-full h-full object-cover" />
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
                {editForm.image && (
                  <button 
                    type="button" 
                    onClick={() => setEditForm(prev => ({ ...prev, image: '' }))}
                    className="text-[9px] text-red-500 font-bold hover:underline cursor-pointer"
                  >
                    ลบรูปภาพ
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">รหัสประจำตัว</label>
                  <div className="relative flex items-center group">
                    <input 
                      type="text" 
                      className={`${inputClass} pr-10`}
                      value={editForm.code}
                      onChange={e => setEditForm({...editForm, code: e.target.value})}
                    />
                    {editForm.code && (
                      <button
                        type="button"
                        onClick={() => setEditForm({...editForm, code: ''})}
                        className="absolute right-2 text-slate-300 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors p-1 cursor-pointer"
                        title="ลบข้อความทั้งหมด"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">ชื่อเรียกไก่</label>
                  <div className="relative flex items-center group">
                    <input 
                      type="text" 
                      className={`${inputClass} pr-10`}
                      value={editForm.name}
                      onChange={e => setEditForm({...editForm, name: e.target.value})}
                      placeholder='เช่น "ขุนศึก" หรือปล่อยว่างไว้'
                    />
                    {editForm.name && (
                      <button
                        type="button"
                        onClick={() => setEditForm({...editForm, name: ''})}
                        className="absolute right-2 text-slate-300 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors p-1 cursor-pointer"
                        title="ลบชื่อทั้งหมด"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">สถานะ</label>
                <CustomSelect
                  value={editForm.status}
                  onChange={(val) => setEditForm({...editForm, status: val})}
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
                  placeholder="เลือกสถานะไก่ชน"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    สายพันธุ์
                  </label>
                  <input 
                    type="text" 
                    className={inputClass}
                    value={editForm.bloodline}
                    onChange={e => setEditForm({...editForm, bloodline: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">ลักษณะเด่น / หมายเหตุ</label>
                  <input 
                    type="text" 
                    className={inputClass}
                    value={editForm.color}
                    onChange={e => setEditForm({...editForm, color: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">เพศ</label>
                  <CustomSelect 
                    value={editForm.gender}
                    onChange={(val) => setEditForm({...editForm, gender: val})}
                    options={chick?._sourceCollection === 'chicks' ? [
                      { value: 'ผู้', label: 'ตัวผู้' },
                      { value: 'เมีย', label: 'ตัวเมีย' },
                      { value: 'ยังไม่ระบุ', label: 'ยังไม่ระบุ' }
                    ] : [
                      { value: 'male', label: 'ตัวผู้' },
                      { value: 'female', label: 'ตัวเมีย' }
                    ]}
                    buttonClassName={inputClass + " flex items-center justify-between"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">เลขกิ๊ฟปีก</label>
                  <input 
                    type="text" 
                    className={inputClass}
                    value={editForm.bandNumber}
                    onChange={e => setEditForm({...editForm, bandNumber: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">สีกิ๊ฟปีก</label>
                  <CustomSelect 
                    value={editForm.bandColor}
                    onChange={(val) => setEditForm({...editForm, bandColor: val})}
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
                    buttonClassName={inputClass + " flex items-center justify-between"}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">ชื่อข้อความบนกิ๊ฟ (ชื่อซุ้ม/ฟาร์ม)</label>
                <input 
                  type="text" 
                  className={inputClass}
                  value={editForm.bandText}
                  onChange={e => setEditForm({...editForm, bandText: e.target.value})}
                  placeholder="เช่น ส.สิบทิศ (ถ้ามี) อันนี้สลักในกิ๊ฟ"
                />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">วันเกิด / ฟักไข่</label>
                  <input 
                    type="date"
                    className={inputClass}
                    value={editForm.hatchDate}
                    onChange={e => setEditForm({...editForm, hatchDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-xl border border-orange-200/60 dark:border-orange-900/30 space-y-3">
                <span className="text-[10px] font-black text-orange-700 dark:text-orange-400">🧬 ข้อมูลพ่อแม่สายเลือด (กรณีไม่มีในระบบ)</span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-orange-600 dark:text-orange-500">ชื่อพ่อไก่ (พิมพ์ข้อความ)</label>
                    <input 
                      type="text" 
                      className={inputClass + " border-orange-200 focus:ring-orange-500 text-xs py-2"}
                      placeholder="Ex. พ่อแดงเพลิง"
                      value={editForm.fatherNameText}
                      onChange={e => setEditForm({...editForm, fatherNameText: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-orange-600 dark:text-orange-500">ชื่อแม่ไก่ (พิมพ์ข้อความ)</label>
                    <input 
                      type="text" 
                      className={inputClass + " border-orange-200 focus:ring-orange-500 text-xs py-2"}
                      placeholder="Ex. แม่สา"
                      value={editForm.motherNameText}
                      onChange={e => setEditForm({...editForm, motherNameText: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">ประวัติชัยชนะ / บันทึกเพิ่มเติม</label>
                <textarea 
                  rows={3}
                  className={inputClass}
                  value={editForm.notes}
                  onChange={e => setEditForm({...editForm, notes: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-2xl font-bold shadow-lg shadow-red-600/20 active:scale-95 transition-all cursor-pointer text-sm flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> บันทึกการแก้ไข
              </button>
            </form>
          </div>
        </div>
      )}
      {alertConfig?.show && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
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

      {/* Sale Modal */}
      {showSaleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg sm:rounded-3xl rounded-t-3xl p-6 pb-12 sm:pb-6 shadow-2xl border border-slate-100 dark:border-white/10 max-h-[85dvh] sm:max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 custom-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                💰 บันทึกการขาย
              </h2>
              <button 
                onClick={() => setShowSaleModal(false)}
                className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 rotate-180" />
              </button>
            </div>
            
            <form onSubmit={handleSaleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">ชื่อลูกค้า / ผู้ซื้อ *</label>
                <input 
                  required
                  className={inputClass}
                  placeholder="เช่น เสี่ย A, คุณม่อน"
                  value={saleForm.customerName}
                  onChange={e => setSaleForm({...saleForm, customerName: e.target.value})}
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">ชื่อฟาร์ม / ซุ้มลูกค้า (ถ้ามี)</label>
                <input 
                  className={inputClass}
                  placeholder="เช่น ซุ้มเพชรเจริญ"
                  value={saleForm.customerFarm}
                  onChange={e => setSaleForm({...saleForm, customerFarm: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">เบอร์โทรศัพท์ติดต่อ</label>
                  <input 
                    className={inputClass}
                    placeholder="094-xxx-xxxx"
                    value={saleForm.customerPhone}
                    onChange={e => setSaleForm({...saleForm, customerPhone: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">วันที่ขาย</label>
                  <input 
                    type="date"
                    className={inputClass}
                    value={saleForm.saleDate}
                    onChange={e => setSaleForm({...saleForm, saleDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">ราคาขาย (บาท)</label>
                <input 
                  type="number"
                  className={inputClass}
                  placeholder="เช่น 15000"
                  value={saleForm.price}
                  onChange={e => setSaleForm({...saleForm, price: e.target.value})}
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">บันทึกเพิ่มเติม</label>
                <textarea 
                  className={`${inputClass} resize-none h-20`}
                  placeholder="เช่น จัดส่งทางรถตู้, ลูกค้ามารับเอง"
                  value={saleForm.notes}
                  onChange={e => setSaleForm({...saleForm, notes: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                className="w-full mt-4 py-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer text-sm flex items-center justify-center gap-2"
              >
                ยืนยันการขายไก่ตัวนี้
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {showCertificate && chick && (
        <CertificateModal chicken={chick} onClose={() => setShowCertificate(false)} />
      )}
    </div>
  );
}