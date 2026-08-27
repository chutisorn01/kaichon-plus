import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Edit, Save, LogOut, Share2, MapPin, Phone, Globe, Camera, UserCircle2, CheckCircle, Info, Image as ImageIcon, Map, MessageCircle, BadgeCheck, Crown, Lock, AlertTriangle, Upload, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import SignaturePad from './SignaturePad';

export default function Profile({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [alertConfig, setAlertConfig] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'settings'>(() => {
    return (sessionStorage.getItem('Profile_activeTab') as any) || 'info';
  });

  useEffect(() => {
    sessionStorage.setItem('Profile_activeTab', activeTab);
  }, [activeTab]);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setUser(json.data);
        setFormData({
          name: json.data.name || '',
          farmName: json.data.farmName || '',
          description: json.data.description || '',
          phone: json.data.phone || '',
          lineId: json.data.lineId || '',
          facebook: json.data.facebook || '',
          address: json.data.address || '',
          profileImage: json.data.profileImage || '',
          coverImage: json.data.coverImage || '',
          signatureImage: json.data.signatureImage || '',
          stampText: json.data.stampText || 'ORIGINAL BREED',
          isVerified: json.data.isVerified === true
        });
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        const json = await res.json();
        setUser(json.data);
        setIsEditing(false);
        setAlertConfig({
          show: true,
          title: '✅ อัปเดตสำเร็จ',
          message: 'บันทึกข้อมูลโปรไฟล์และฟาร์มเรียบร้อยแล้ว',
          type: 'success'
        });
      } else {
        throw new Error('Update failed');
      }
    } catch (err) {
      console.error(err);
      setAlertConfig({
        show: true,
        title: '❌ เกิดข้อผิดพลาด',
        message: 'ไม่สามารถอัปเดตข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
        type: 'error'
      });
    }
    setSaving(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    onNavigate('login');
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setAlertConfig({ show: true, title: 'ข้อมูลไม่ครบถ้วน', message: 'กรุณากรอกข้อมูลให้ครบทุกช่อง', type: 'error' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setAlertConfig({ show: true, title: 'รหัสผ่านไม่ตรงกัน', message: 'รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน', type: 'error' });
      return;
    }

    setIsChangingPassword(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/password`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setShowPasswordModal(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setAlertConfig({
          show: true,
          title: '✅ สำเร็จ',
          message: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว',
          type: 'success'
        });
      } else {
        throw new Error(data.message || 'Update failed');
      }
    } catch (err: any) {
      console.error(err);
      setAlertConfig({
        show: true,
        title: '❌ เกิดข้อผิดพลาด',
        message: err.message || 'รหัสผ่านปัจจุบันไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง',
        type: 'error'
      });
    }
    setIsChangingPassword(false);
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch all data in parallel
      const [chickensRes, vipBreedingRes, fathersRes, mothersRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/chickens`, { headers }),
        fetch(`${import.meta.env.VITE_API_URL}/api/vip-breeding`, { headers }), // Adjust if endpoint is different
        fetch(`${import.meta.env.VITE_API_URL}/api/fathers`, { headers }), // Fetch fathers and we will filter if needed, or if the API returns all, we might need a specific 'me' endpoint
        fetch(`${import.meta.env.VITE_API_URL}/api/mothers`, { headers })
      ]);

      const [chickensData, vipBreedingData, fathersData, mothersData] = await Promise.all([
        chickensRes.json(),
        vipBreedingRes.json(),
        fathersRes.json(),
        mothersRes.json()
      ]);

      // Helper to extract array data safely
      const extractArray = (res: any) => {
        if (Array.isArray(res)) return res;
        if (res?.data && Array.isArray(res.data)) return res.data;
        if (res?.results && Array.isArray(res.results)) return res.results;
        return [];
      };

      const chickens = extractArray(chickensData);
      const vipBreeding = extractArray(vipBreedingData);
      // For Fathers and Breeders, we only want those belonging to the current user
      const fathers = extractArray(fathersData).filter((f: any) => f.user === user?._id || f.user?._id === user?._id || !f.user);
      const mothers = extractArray(mothersData).filter((b: any) => b.user === user?._id || b.user?._id === user?._id || !b.user);

      // Create workbook
      const wb = XLSX.utils.book_new();

      // 1. Chickens Sheet
      const wsChickens = XLSX.utils.json_to_sheet(chickens.map((c: any) => ({
        'รหัสไก่': c.code,
        'ชื่อไก่': c.name,
        'เพศ': c.gender === 'male' ? 'ผู้' : (c.gender === 'female' ? 'เมีย' : c.gender),
        'สายเลือด': c.bloodline,
        'พ่อไก่': c.father?.name || c.fatherNameText || '-',
        'แม่ไก่': c.mother?.name || c.motherNameText || '-',
        'เลขกิ๊ฟปีก': c.bandNumber || '-',
        'สีกิ๊ฟปีก': c.bandColor || '-',
        'ชื่อข้อความบนกิ๊ฟ': c.bandText || '-',
        'วันที่ฟัก': c.hatchDate ? new Date(c.hatchDate).toLocaleDateString('th-TH') : '-',
        'สถานะ': c.status || 'ปกติ',
        'ข้อมูลการขาย (ลูกค้า)': c.saleInfo?.customerName || '-',
        'ข้อมูลการขาย (ฟาร์ม)': c.saleInfo?.customerFarm || '-',
        'ข้อมูลการขาย (เบอร์โทร)': c.saleInfo?.customerPhone || '-',
        'ข้อมูลการขาย (ราคา)': c.saleInfo?.price || '-',
        'หมายเหตุ': c.notes || '-'
      })));
      XLSX.utils.book_append_sheet(wb, wsChickens, 'ไก่ชนทั้งหมด');

      // 2. VIP Breeding Sheet
      const wsVip = XLSX.utils.json_to_sheet(vipBreeding.map((v: any) => ({
        'คิวที่': v.queueNo,
        'วันที่รับเข้า': v.intakeDate ? new Date(v.intakeDate).toLocaleDateString('th-TH') : '-',
        'ชื่อแม่ไก่': v.motherName,
        'พ่อพันธุ์': v.father?.name || '-',
        'น้ำหนัก (กก.)': v.weight,
        'จำนวนไข่': v.eggCount,
        'มีเชื้อ': v.fertileEggs,
        'ลูกไก่ที่ได้': v.chickQuantity,
        'สถานะ': v.status
      })));
      XLSX.utils.book_append_sheet(wb, wsVip, 'ประวัติฝากผสม VIP');

      // 3. Fathers Sheet
      const wsFathers = XLSX.utils.json_to_sheet(fathers.map((f: any) => ({
        'รหัส': f.code,
        'ชื่อพ่อพันธุ์': f.name,
        'สายพันธุ์': f.breed || '-',
        'สี': f.color || '-',
        'เลขกิ๊ฟปีก': f.bandNumber || '-',
        'พ่อ': f.fatherNameText || '-',
        'แม่': f.motherNameText || '-',
        'วันที่ฟัก': f.hatchDate ? new Date(f.hatchDate).toLocaleDateString('th-TH') : '-',
        'ประวัติและผลงาน': f.records || '-',
        'ค่าฝากผสม (บาท)': f.studFee || f.matingFee || '-',
        'สถานะ': f.status || 'ปกติ',
        'ข้อมูลการขาย (ลูกค้า)': f.saleInfo?.customerName || '-',
        'ข้อมูลการขาย (ราคา)': f.saleInfo?.price || '-'
      })));
      XLSX.utils.book_append_sheet(wb, wsFathers, 'พ่อพันธุ์');

      // 4. Mothers Sheet
      const wsMothers = XLSX.utils.json_to_sheet(mothers.map((m: any) => ({
        'รหัส': m.code,
        'ชื่อแม่พันธุ์': m.name,
        'สายพันธุ์': m.breed || '-',
        'สี': m.color || '-',
        'เลขกิ๊ฟปีก': m.bandNumber || '-',
        'พ่อ': m.fatherNameText || '-',
        'แม่': m.motherNameText || '-',
        'แหล่งที่มา': m.source || '-',
        'วันที่ฟัก': m.hatchDate ? new Date(m.hatchDate).toLocaleDateString('th-TH') : '-',
        'ประวัติและผลงาน': m.records || '-',
        'สถานะ': m.status || 'ปกติ',
        'ข้อมูลการขาย (ลูกค้า)': m.saleInfo?.customerName || '-',
        'ข้อมูลการขาย (ราคา)': m.saleInfo?.price || '-'
      })));
      XLSX.utils.book_append_sheet(wb, wsMothers, 'แม่พันธุ์ในซุ้ม');

      // Save file
      XLSX.writeFile(wb, `KaichonPlus_Data_${new Date().toISOString().split('T')[0]}.xlsx`);

      setAlertConfig({
        show: true,
        title: '✅ ดาวน์โหลดสำเร็จ',
        message: 'ระบบได้สร้างไฟล์ Excel และดาวน์โหลดลงเครื่องของคุณแล้ว',
        type: 'success'
      });
    } catch (error) {
      console.error(error);
      setAlertConfig({
        show: true,
        title: '❌ เกิดข้อผิดพลาด',
        message: 'ไม่สามารถดึงข้อมูลเพื่อสร้างไฟล์ Excel ได้',
        type: 'error'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleQuickSaveImage = async (field: 'profileImage' | 'coverImage', base64Data: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ [field]: base64Data })
      });
      
      if (res.ok) {
        const json = await res.json();
        setUser(json.data);
        setAlertConfig({
          show: true,
          title: '✅ อัปเดตสำเร็จ',
          message: field === 'coverImage' ? 'เปลี่ยนรูปหน้าปกเรียบร้อยแล้ว' : 'เปลี่ยนรูปโปรไฟล์เรียบร้อยแล้ว',
          type: 'success'
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFormData(prev => ({ ...prev, profileImage: result }));
        if (!isEditing) handleQuickSaveImage('profileImage', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFormData(prev => ({ ...prev, coverImage: result }));
        if (!isEditing) handleQuickSaveImage('coverImage', result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center">
      <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const inputClass = "w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 text-sm font-bold transition-all";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col pb-24 text-slate-900 dark:text-slate-100 relative">
      
      {/* Cover Image Section */}
      <div className="relative h-48 sm:h-64 bg-slate-200 dark:bg-slate-800 border-b border-slate-200 dark:border-white/10 overflow-hidden">
        {formData.coverImage || user?.coverImage ? (
          <img src={isEditing ? formData.coverImage : user?.coverImage} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center opacity-50">
            <ImageIcon className="w-16 h-16 text-slate-400 dark:text-slate-700" />
          </div>
        )}
        
        <button 
          onClick={() => {
            if (isEditing) {
              setShowUnsavedModal(true);
            } else {
              onNavigate('dashboard');
            }
          }}
          className="absolute top-6 left-4 z-20 p-2.5 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="absolute top-6 right-4 z-20">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            id="cover-upload" 
            onChange={handleCoverImageChange} 
          />
          <label 
            htmlFor="cover-upload"
            className="bg-black/40 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-2.5 rounded-full border border-white/20 text-white text-xs font-bold flex items-center gap-2 cursor-pointer hover:bg-black/60 transition-colors shadow-lg"
          >
            <Camera className="w-4 h-4 sm:w-5 sm:h-5" /> 
            <span className="hidden sm:inline">เปลี่ยนรูปหน้าปก</span>
          </label>
        </div>
      </div>

      <div className="px-4 w-full max-w-2xl mx-auto -mt-16 sm:-mt-20 relative z-20">
        
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-white/10 p-5 pt-0 mb-6 flex flex-col items-center">
          {/* Profile Image Avatar */}
          <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full border-[6px] border-white dark:border-slate-900 shadow-xl -mt-20 sm:-mt-24 relative mb-4 z-30">
            <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-full relative overflow-hidden flex items-center justify-center shrink-0 group cursor-pointer">
              {formData.profileImage || user?.profileImage ? (
                <img src={isEditing ? formData.profileImage : user?.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserCircle2 className="w-16 h-16 text-slate-300 dark:text-slate-600" />
              )}
              
              <label 
                htmlFor="profile-upload"
                className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-2 text-center z-40 cursor-pointer opacity-0 md:hover:opacity-100 transition-opacity"
              >
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  id="profile-upload" 
                  onChange={handleProfileImageChange} 
                />
                <Camera className="w-8 h-8 text-white mb-1 md:group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-white">เปลี่ยนโลโก้</span>
              </label>
            </div>

            {/* Mobile persistent camera badge */}
            <label 
              htmlFor="profile-upload"
              className="absolute bottom-2 right-2 md:hidden bg-indigo-600 text-white p-2.5 rounded-full shadow-lg border-[3px] border-white dark:border-slate-900 z-50 cursor-pointer active:scale-95 transition-transform"
            >
              <Camera className="w-5 h-5" />
            </label>
          </div>

          {!isEditing ? (
            <div className="text-center space-y-1 w-full">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
                {user?.farmName || user?.name || 'ไม่มีชื่อซุ้มฟาร์ม'}
                {user?.isVerified === true && <BadgeCheck className="w-5.5 h-5.5 text-white fill-blue-500 shrink-0 drop-shadow-xs" />}
              </h1>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                @{user?.username} • รหัสฟาร์ม: {user?.farmCode || '-'}
              </p>
              <p className="text-xs text-slate-400 italic pt-2 px-4 line-clamp-2">
                "{user?.description || 'ยังไม่มีคำอธิบายฟาร์ม'}"
              </p>
              
              <div className="flex items-center justify-center gap-2 pt-4">
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-sm font-bold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Edit className="w-4 h-4" /> แก้ไขโปรไฟล์
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`https://kaichon-plus.com/${user?.username}`);
                    alert('คัดลอกลิงก์ฟาร์มเรียบร้อยแล้ว!');
                  }}
                  className="px-4 py-2.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 hover:bg-red-100 dark:hover:bg-red-900/60 rounded-full text-sm font-bold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4" /> แชร์ลิงก์
                </button>
              </div>

              {/* VIP Banner */}
              <div className="mt-6 w-full max-w-sm mx-auto">
                <div 
                  onClick={() => onNavigate('vip-breeding')}
                  className="p-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-900 rounded-2xl active:scale-95 transition-all shadow-md shadow-amber-500/30 cursor-pointer flex items-center justify-between group border border-yellow-400/50"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-slate-900 group-hover:scale-110 transition-transform">
                      <Crown className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-black block">🌟 บริการฝากผสม VIP</span>
                      <span className="text-[10px] text-slate-800/80 font-bold font-sans">จัดการประวัติกักโรคและฟักไข่ละเอียด</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-800/80 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Change Password Button */}
              <div className="mt-4 w-full max-w-sm mx-auto">
                <button 
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 rounded-2xl active:scale-95 transition-all cursor-pointer flex items-center justify-between group border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-500 group-hover:scale-110 transition-transform shadow-sm">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold block">เปลี่ยนรหัสผ่าน</span>
                      <span className="text-[10px] text-slate-400 font-sans">อัปเดตหรือตั้งรหัสผ่านใหม่เพื่อความปลอดภัย</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">ชื่อซุ้ม / ฟาร์ม (Farm Name)</label>
                <input className={inputClass} value={formData.farmName} onChange={e => setFormData({...formData, farmName: e.target.value})} placeholder="Ex. ซุ้ม ส.เจริญชัย" />
              </div>

              {/* Verified Farm Badge Toggle Switch */}
              <div className="flex items-center justify-between p-3.5 bg-blue-50/70 dark:bg-blue-950/40 rounded-2xl border border-blue-200/80 dark:border-blue-900/50">
                <div className="flex items-center gap-2.5">
                  <BadgeCheck className="w-5 h-5 text-white fill-blue-500 shrink-0" />
                  <div>
                    <div className="text-xs font-black text-slate-900 dark:text-white">เครื่องหมายรับรองฟาร์ม (Verified Badge)</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">แสดงเครื่องหมายรับรองยึกๆ กลมๆ สีฟ้าหลังชื่อฟาร์มในทุกหน้า</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input 
                    type="checkbox" 
                    checked={formData.isVerified === true} 
                    onChange={e => setFormData({...formData, isVerified: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">ชื่อผู้ดูแล (Your Name)</label>
                <input className={inputClass} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex. สมชาย" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">สโลแกน / คำอธิบาย (Slogan / Description)</label>
                <textarea rows={2} className={inputClass} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="พิมพ์คำอธิบายหรือสโลแกนฟาร์มของคุณ..." />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">ข้อความในตราประทับสีแดง (Red Stamp Text)</label>
                <select className={inputClass} value={formData.stampText} onChange={e => setFormData({...formData, stampText: e.target.value})}>
                  <option value="ORIGINAL BREED">ORIGINAL BREED</option>
                  <option value="PREMIUM QUALITY">PREMIUM QUALITY</option>
                  <option value="VIP CHAMPION">VIP CHAMPION</option>
                  <option value="CERTIFIED FARM">CERTIFIED FARM</option>
                  <option value="100% PUREBREED">100% PUREBREED</option>
                  <option value="">(ไม่มีตราประทับ)</option>
                </select>
              </div>
              <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-500 block mb-2">ลายเซ็นสำหรับประทับใบรับรองสายพันธุ์</label>
                <SignaturePad 
                  initialImage={formData.signatureImage}
                  onSave={(dataUrl) => setFormData({...formData, signatureImage: dataUrl})}
                  onClear={() => setFormData({...formData, signatureImage: ''})}
                />
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        {!isEditing && (
          <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-2xl mb-6 shadow-inner">
            <button 
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all cursor-pointer ${activeTab === 'info' ? 'bg-white dark:bg-slate-900 text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              ข้อมูลติดต่อ
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all cursor-pointer ${activeTab === 'settings' ? 'bg-white dark:bg-slate-900 text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              ตั้งค่าแอป
            </button>
          </div>
        )}

        {/* Content Area */}
        {isEditing ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-white/10 p-5 space-y-4">
            <h3 className="font-black text-sm flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
              <Phone className="w-4 h-4 text-emerald-500" /> ข้อมูลการติดต่อ (Contact Info)
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">เบอร์โทรศัพท์ (Phone)</label>
                <input className={inputClass} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="08X-XXX-XXXX" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">LINE ID</label>
                <input className={inputClass} value={formData.lineId} onChange={e => setFormData({...formData, lineId: e.target.value})} placeholder="@yourfarm" />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-500">Facebook Page URL</label>
                <input className={inputClass} value={formData.facebook} onChange={e => setFormData({...formData, facebook: e.target.value})} placeholder="https://facebook.com/..." />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-500">ที่อยู่ฟาร์ม (Address)</label>
                <textarea rows={2} className={inputClass} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="พิมพ์ที่อยู่ฟาร์ม..." />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: user?.name || '',
                    farmName: user?.farmName || '',
                    description: user?.description || '',
                    phone: user?.phone || '',
                    lineId: user?.lineId || '',
                    facebook: user?.facebook || '',
                    address: user?.address || '',
                    profileImage: user?.profileImage || '',
                    coverImage: user?.coverImage || ''
                  });
                }}
                disabled={saving}
                className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl active:scale-95 transition-all text-sm cursor-pointer"
              >
                ยกเลิก
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3.5 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-red-600/20 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                บันทึกโปรไฟล์
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-white/10 overflow-hidden mb-6">
            
            {activeTab === 'info' && (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                <div className="p-4 flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/30 rounded-full flex items-center justify-center shrink-0 text-emerald-500">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 mb-0.5">เบอร์โทรศัพท์</div>
                    <div className="font-black text-sm">{user?.phone || '-'}</div>
                  </div>
                </div>
                <div className="p-4 flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-50 dark:bg-green-950/30 rounded-full flex items-center justify-center shrink-0 text-green-500">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 mb-0.5">LINE ID</div>
                    <div className="font-black text-sm">{user?.lineId || '-'}</div>
                  </div>
                </div>
                <div className="p-4 flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/30 rounded-full flex items-center justify-center shrink-0 text-blue-500">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-400 mb-0.5">Facebook</div>
                    <div className="font-black text-sm truncate">
                      {user?.facebook ? (
                        <a href={user.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          {user.facebook}
                        </a>
                      ) : '-'}
                    </div>
                  </div>
                </div>
                <div className="p-4 flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-50 dark:bg-orange-950/30 rounded-full flex items-center justify-center shrink-0 text-orange-500">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 mb-0.5">ที่ตั้งฟาร์ม</div>
                    <div className="font-black text-sm leading-relaxed">{user?.address || '-'}</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="p-4 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider px-2">การแสดงผล (Appearance)</h3>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-white/5 p-2 flex flex-col gap-2">
                    <ThemeToggle />
                    <LanguageToggle />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider px-2">ข้อมูลฟาร์ม (Farm Data)</h3>
                  <button 
                    onClick={handleExportExcel}
                    disabled={isExporting}
                    className="w-full p-4 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-2xl flex items-center gap-3 text-emerald-600 dark:text-emerald-500 transition-colors cursor-pointer border border-emerald-100 dark:border-emerald-900/30 disabled:opacity-50"
                  >
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center shrink-0">
                      {isExporting ? <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /> : <Download className="w-5 h-5" />}
                    </div>
                    <div className="text-left">
                      <div className="font-black text-sm">ส่งออกข้อมูลเป็น Excel</div>
                      <div className="text-xs opacity-70">ดาวน์โหลดประวัติไก่และข้อมูลทั้งหมด</div>
                    </div>
                  </button>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider px-2">บัญชี (Account)</h3>
                  <button 
                    onClick={handleLogout}
                    className="w-full p-4 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-500 transition-colors cursor-pointer border border-red-100 dark:border-red-900/30"
                  >
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center shrink-0">
                      <LogOut className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-black text-sm">ออกจากระบบ</div>
                      <div className="text-xs opacity-70">ล็อกเอาท์ออกจากบัญชีนี้</div>
                    </div>
                  </button>
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
              <Lock className="w-6 h-6 text-indigo-500" />
              เปลี่ยนรหัสผ่าน
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">รหัสผ่านปัจจุบัน</label>
                <input 
                  type="password"
                  className={inputClass}
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  placeholder="รหัสผ่านเดิม"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">รหัสผ่านใหม่</label>
                <input 
                  type="password"
                  className={inputClass}
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  placeholder="รหัสผ่านใหม่"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">ยืนยันรหัสผ่านใหม่</label>
                <input 
                  type="password"
                  className={inputClass}
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="flex-1 py-3 rounded-2xl font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                ยกเลิก
              </button>
              <button 
                onClick={handleChangePassword}
                disabled={isChangingPassword}
                className="flex-1 py-3 rounded-2xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {isChangingPassword ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่าน'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unsaved Changes Modal */}
      {showUnsavedModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-white/10 text-center">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
            
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">ยังไม่ได้บันทึกข้อมูล</h3>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-8">
              คุณมีการแก้ไขที่ยังไม่ได้บันทึก ต้องการออกจากหน้านี้โดยไม่บันทึกหรือไม่?
            </p>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowUnsavedModal(false)}
                className="flex-1 py-3.5 rounded-2xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button 
                onClick={() => {
                  setShowUnsavedModal(false);
                  setIsEditing(false);
                  fetchProfile();
                  onNavigate('dashboard');
                }}
                className="flex-1 py-3.5 rounded-2xl font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                ออกโดยไม่บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
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
                  <Info className="w-8 h-8" />
                </div>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-black text-slate-900 dark:text-white">{alertConfig.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed">{alertConfig.message}</p>
            </div>
            <button 
              onClick={() => setAlertConfig(null)}
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
