import { useState, useEffect } from 'react';
import { ChevronLeft, Edit, Save, LogOut, Share2, MapPin, Phone, Globe, Camera, UserCircle2, CheckCircle, Info, Image as ImageIcon, Map, MessageCircle } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'info' | 'settings'>('info');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/auth/me', {
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
          stampText: json.data.stampText || 'ORIGINAL BREED'
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
      const res = await fetch('http://localhost:5001/api/auth/profile', {
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

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profileImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, coverImage: reader.result as string }));
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
          onClick={() => onNavigate('dashboard')}
          className="absolute top-6 left-4 z-20 p-2.5 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {isEditing && (
          <div className="absolute bottom-4 right-4 z-20">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              id="cover-upload" 
              onChange={handleCoverImageChange} 
            />
            <label 
              htmlFor="cover-upload"
              className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-white text-xs font-bold flex items-center gap-2 cursor-pointer hover:bg-black/80 transition-colors shadow-lg"
            >
              <Camera className="w-4 h-4" /> เปลี่ยนรูปหน้าปก
            </label>
          </div>
        )}
      </div>

      <div className="px-4 w-full max-w-2xl mx-auto -mt-16 sm:-mt-20 relative z-20">
        
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-white/10 p-5 pt-0 mb-6 flex flex-col items-center">
          {/* Profile Image Avatar */}
          <div className="w-40 h-40 sm:w-48 sm:h-48 bg-slate-100 dark:bg-slate-800 rounded-full border-[6px] border-white dark:border-slate-900 shadow-xl -mt-20 sm:-mt-24 relative overflow-hidden flex items-center justify-center shrink-0 mb-4 z-30">
            {formData.profileImage || user?.profileImage ? (
              <img src={isEditing ? formData.profileImage : user?.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <UserCircle2 className="w-16 h-16 text-slate-300 dark:text-slate-600" />
            )}
            
            {isEditing && (
              <label 
                htmlFor="profile-upload"
                className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-2 text-center z-40 cursor-pointer hover:bg-black/70 transition-colors group"
              >
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  id="profile-upload" 
                  onChange={handleProfileImageChange} 
                />
                <Camera className="w-8 h-8 text-white mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-white">เปลี่ยนโลโก้</span>
              </label>
            )}
          </div>

          {!isEditing ? (
            <div className="text-center space-y-1 w-full">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
                {user?.farmName || user?.name || 'ไม่มีชื่อซุ้มฟาร์ม'}
                {user?.isVerified && <CheckCircle className="w-5 h-5 text-blue-500 shrink-0" />}
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
            </div>
          ) : (
            <div className="w-full space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">ชื่อซุ้ม / ฟาร์ม (Farm Name)</label>
                <input className={inputClass} value={formData.farmName} onChange={e => setFormData({...formData, farmName: e.target.value})} placeholder="Ex. ซุ้ม ส.เจริญชัย" />
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
