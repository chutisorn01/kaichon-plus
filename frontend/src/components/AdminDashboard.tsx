import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { 
  ChevronLeft, 
  Users, 
  ShieldAlert, 
  Award, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Search, 
  BadgeCheck, 
  Eye, 
  LayoutDashboard, 
  ArrowLeftRight, 
  DollarSign, 
  Clock 
} from 'lucide-react';

interface UserItem {
  _id: string;
  name: string;
  username: string;
  email?: string;
  farmName?: string;
  farmCode?: string;
  isVerified?: boolean;
  role: string;
  createdAt: string;
}

interface PromotionItem {
  _id: string;
  user: {
    _id: string;
    name: string;
    farmName: string;
    email: string;
    username: string;
  };
  father: {
    _id: string;
    name: string;
    code: string;
    breed: string;
    color: string;
    bandNumber?: string;
    image?: string;
  };
  durationDays: number;
  amount: number;
  slipImage: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function AdminDashboard({ onNavigate }: { onNavigate: (page: any) => void }) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'users' | 'promotions'>('users');
  const [users, setUsers] = useState<UserItem[]>([]);
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSlip, setSelectedSlip] = useState<string | null>(null);

  // Fetch Data
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      if (activeTab === 'users') {
        const response = await fetch('http://localhost:5001/api/admin/users', { headers });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error fetching users');
        setUsers(data.data || []);
      } else {
        const response = await fetch('http://localhost:5001/api/admin/promotions', { headers });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error fetching promotions');
        setPromotions(data.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Verification status of user
  const handleToggleVerify = async (userId: string, currentStatus: boolean) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5001/api/admin/users/${userId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isVerified: !currentStatus })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update user');

      setUsers(users.map(u => u._id === userId ? { ...u, isVerified: !currentStatus } : u));
    } catch (err: any) {
      alert(err.message || 'Error updating verification status');
    }
  };

  // Approve Promotion Request
  const handleApprovePromotion = async (promoId: string) => {
    if (!window.confirm(language === 'th' ? 'ยืนยันอนุมัติการโปรโมทนี้?' : 'Confirm approval for this promotion?')) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5001/api/admin/promotions/${promoId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to approve');

      setPromotions(promotions.map(p => p._id === promoId ? { ...p, status: 'approved' as const } : p));
    } catch (err: any) {
      alert(err.message || 'Error approving request');
    }
  };

  // Reject Promotion Request
  const handleRejectPromotion = async (promoId: string) => {
    if (!window.confirm(language === 'th' ? 'ยืนยันปฏิเสธการโปรโมทนี้?' : 'Confirm rejection for this promotion?')) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5001/api/admin/promotions/${promoId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to reject');

      setPromotions(promotions.map(p => p._id === promoId ? { ...p, status: 'rejected' as const } : p));
    } catch (err: any) {
      alert(err.message || 'Error rejecting request');
    }
  };

  const filteredUsers = users.filter(u => 
    (u.name && u.name.toLowerCase().includes(userSearchQuery.toLowerCase())) ||
    (u.farmName && u.farmName.toLowerCase().includes(userSearchQuery.toLowerCase())) ||
    (u.username && u.username.toLowerCase().includes(userSearchQuery.toLowerCase()))
  );

  const t = (th: string, en: string) => (language === 'th' ? th : en);

  // Stats calculation
  const totalVerifiedFarms = users.filter(u => u.isVerified).length;
  const pendingPromotionsCount = promotions.filter(p => p.status === 'pending').length;
  const totalRevenue = promotions
    .filter(p => p.status === 'approved')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col pb-24 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 text-white px-4 py-6 sticky top-0 z-30 border-b border-white/10 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onNavigate('dashboard')} 
              className="p-2 -ml-2 text-white/70 hover:text-white transition-colors cursor-pointer bg-white/10 hover:bg-white/20 rounded-2xl"
              title={t('กลับหน้าหลักซุ้มฟาร์ม', 'Back to Farm Dashboard')}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-black flex items-center gap-2 tracking-tight">
                {t('แผงจัดการผู้ดูแลระบบ', 'Admin Control Center')} <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
              </h1>
              <p className="text-[11px] text-indigo-200 font-semibold">{t('ระบบตรวจสอบธุรกรรม การเงิน และรับรองฟาร์มมาตรฐาน', 'Platform transaction tracking, payments & farm validation')}</p>
            </div>
          </div>

          <button 
            onClick={() => onNavigate('dashboard')}
            className="hidden sm:flex items-center gap-2 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-black px-4 py-2.5 rounded-2xl shadow-lg shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer border border-indigo-500/30"
          >
            <ArrowLeftRight className="w-4 h-4" />
            {t('สลับไปโหมดซุ้มฟาร์ม', 'Switch to Farm Mode')}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 max-w-5xl mx-auto w-full space-y-6">
        
        {/* Admin Dashboard Quick Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/50 dark:border-white/5 shadow-sm flex items-center gap-4.5 transition-all hover:shadow-md">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center font-bold shadow-inner">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 dark:text-slate-500 font-bold">{t('สมาชิกทั้งหมด', 'Total Users')}</div>
              <div className="text-xl font-black tracking-tight mt-0.5">{users.length || '-'}</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/50 dark:border-white/5 shadow-sm flex items-center gap-4.5 transition-all hover:shadow-md">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center font-bold shadow-inner">
              <BadgeCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 dark:text-slate-500 font-bold">{t('ฟาร์มรับรองแล้ว', 'Verified Farms')}</div>
              <div className="text-xl font-black tracking-tight mt-0.5">{totalVerifiedFarms || '-'}</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/50 dark:border-white/5 shadow-sm flex items-center gap-4.5 transition-all hover:shadow-md">
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center font-bold shadow-inner">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 dark:text-slate-500 font-bold">{t('คำขอค้างอนุมัติ', 'Pending Promos')}</div>
              <div className="text-xl font-black tracking-tight mt-0.5">{pendingPromotionsCount}</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/50 dark:border-white/5 shadow-sm flex items-center gap-4.5 transition-all hover:shadow-md">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center font-bold shadow-inner">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 dark:text-slate-500 font-bold">{t('รายได้โฆษณาสะสม', 'Total Revenue')}</div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight mt-0.5">{totalRevenue.toLocaleString()} ฿</div>
            </div>
          </div>
        </div>

        {/* Tab 1: Users */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Control Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:max-w-xs">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder={t('ค้นหาซุ้มฟาร์ม หรือชื่อเจ้าของ...', 'Search farm name, owner...')}
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-xs focus:ring-2 focus:ring-indigo-500 outline-none text-xs transition-all font-semibold"
                />
              </div>
              <span className="text-xs font-bold text-slate-400">
                {t(`พบบัญชีผู้ใช้งานทั้งหมด ${filteredUsers.length} รายการ`, `Found total ${filteredUsers.length} user accounts`)}
              </span>
            </div>

            {isLoading ? (
              <div className="py-20 flex justify-center">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-950/20 rounded-3xl border border-red-150 font-bold text-sm">{error}</div>
            ) : filteredUsers.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200/50 dark:border-white/5 text-center text-slate-400 font-bold">{t('ไม่พบข้อมูลสมาชิก', 'No members found')}</div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-white/5 shadow-md overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-850/50 text-slate-450 dark:text-slate-400 font-black text-[10px] uppercase tracking-wider border-b border-slate-150 dark:border-slate-850">
                      <th className="py-4 px-6">{t('ซุ้มฟาร์ม', 'Farm Name')}</th>
                      <th className="py-4 px-6">{t('เจ้าของบัญชี', 'Owner Name')}</th>
                      <th className="py-4 px-6">{t('บทบาท', 'Role')}</th>
                      <th className="py-4 px-6">{t('สถานะรับรองฟาร์ม', 'Verification Status')}</th>
                      <th className="py-4 px-6 text-right">{t('จัดการสิทธิ์', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs font-bold text-slate-700 dark:text-slate-300">
                    {filteredUsers.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 text-sm">
                              {u.farmName || t('ยังไม่กำหนดชื่อซุ้มฟาร์ม', 'No Farm Name')}
                              {u.isVerified && <BadgeCheck className="w-4.5 h-4.5 text-blue-500 shrink-0" />}
                            </p>
                            <p className="text-[10px] font-mono text-slate-400 mt-0.5">{u.farmCode || '-'}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-extrabold text-slate-900 dark:text-white text-sm">{u.name}</p>
                            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">@{u.username} {u.email ? `| ${u.email}` : ''}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex px-2 py-0.5 text-[9px] font-black rounded-md ${
                            u.role === 'admin' 
                              ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200/30' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50'
                          }`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold rounded-lg ${
                            u.isVerified 
                              ? 'bg-blue-50 dark:bg-blue-950/25 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30' 
                              : 'bg-amber-50 dark:bg-amber-950/25 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30'
                          }`}>
                            {u.isVerified ? t('รับรองฟาร์มแล้ว 🔵✔', 'Verified Farm 🔵✔') : t('ยังไม่ได้รับรอง', 'Not Verified')}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {u.username === 'adminkaichon' ? (
                            <span className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-450 px-3 py-1.5 rounded-xl text-[10px] font-extrabold tracking-wider uppercase border border-slate-200 dark:border-slate-750">{t('ผู้ดูแลระบบสูงสุด 👑', 'Super Admin 👑')}</span>
                          ) : (
                            <button
                              onClick={() => handleToggleVerify(u._id, !!u.isVerified)}
                              className={`px-3 py-2 rounded-xl text-[10px] font-black transition-all active:scale-[0.98] cursor-pointer ${
                                u.isVerified
                                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-450 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 active:shadow-none'
                              }`}
                            >
                              {u.isVerified ? t('ยกเลิกการรับรอง', 'Revoke Verify') : t('อนุมัติ Verified 🔵', 'Approve Verified')}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Promotions */}
        {activeTab === 'promotions' && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="py-20 flex justify-center">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-500 font-bold bg-red-50 dark:bg-red-950/20 rounded-3xl border border-red-150 text-sm">{error}</div>
            ) : promotions.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200/50 dark:border-white/5 text-center text-slate-400 font-bold">{t('ไม่มีรายการคำขอโปรโมทในระบบ', 'No promotion requests found')}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {promotions.map((p) => (
                  <div 
                    key={p._id}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-white/5 shadow-md p-5 space-y-4 flex flex-col justify-between hover:shadow-lg transition-all duration-300"
                  >
                    <div>
                      {/* Top Row: User details & Status */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-950 dark:text-white flex items-center gap-1">
                            {p.user?.farmName || t('ซุ้มฟาร์มทั่วไป', 'General Farm')}
                            {p.user?.username === 'adminkaichon' && <span className="text-[9px] bg-red-100 dark:bg-red-950 text-red-650 px-1.5 py-0.5 rounded-md font-black">ADMIN</span>}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-semibold">{t('ผู้ส่งขอ:', 'Requested by:')} {p.user?.name} (@{p.user?.username})</p>
                        </div>
                        <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg border ${
                          p.status === 'approved' 
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 border-emerald-250/30'
                            : p.status === 'rejected' 
                            ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-250/30'
                            : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-250/30 animate-pulse'
                        }`}>
                          {p.status === 'approved' ? t('อนุมัติโปรโมทแล้ว', 'Approved') : p.status === 'rejected' ? t('ปฏิเสธแล้ว', 'Rejected') : t('รอดำเนินการ ตรวจสอบสลิป', 'Pending Review')}
                        </span>
                      </div>

                      {/* Chicken details card */}
                      <div className="mt-4 flex gap-3.5 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-150 dark:border-slate-850">
                        {p.father?.image ? (
                          <img 
                            src={p.father.image} 
                            alt="Chicken" 
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200/50"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-slate-200 dark:bg-slate-850 rounded-xl flex items-center justify-center text-xs font-bold text-slate-450 border border-slate-300/40">🐓</div>
                        )}
                        <div>
                          <p className="text-sm font-extrabold text-slate-900 dark:text-white">{p.father?.name || t('ไม่ได้ระบุชื่อพ่อไก่', 'Unnamed Stud')}</p>
                          <p className="text-[10px] font-bold text-slate-400">{t('รหัสสากล:', 'Global Code:')} <span className="font-mono text-slate-600 dark:text-slate-350">{p.father?.code || '-'}</span></p>
                          <p className="text-[9px] text-slate-400 mt-0.5">{t('สายเลือด:', 'Breed:')} {p.father?.breed || 'ไม่ระบุ'}</p>
                        </div>
                      </div>

                      {/* Details of Promo */}
                      <div className="grid grid-cols-2 gap-4 mt-4 text-[11px] font-black">
                        <div className="bg-slate-50/50 dark:bg-slate-850/30 p-2.5 rounded-xl border border-slate-150/40 dark:border-slate-800/30">
                          <p className="text-slate-400 font-semibold">{t('แพ็คเกจโฆษณา', 'Promo Package')}</p>
                          <p className="text-xs text-slate-850 dark:text-slate-200 mt-1">{p.durationDays} {t('วัน', 'Days')}</p>
                        </div>
                        <div className="bg-slate-50/50 dark:bg-slate-850/30 p-2.5 rounded-xl border border-slate-150/40 dark:border-slate-800/30">
                          <p className="text-slate-400 font-semibold">{t('ยอดชำระเงิน', 'Amount Paid')}</p>
                          <p className="text-xs text-red-650 dark:text-red-400 mt-1 font-extrabold">{p.amount}.00 ฿</p>
                        </div>
                      </div>
                    </div>

                    {/* Receipt Image / Actions */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-850 space-y-4">
                      {p.slipImage ? (
                        <div className="relative group overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                          <img 
                            src={p.slipImage} 
                            alt="Slip receipt" 
                            className="w-full h-36 object-cover object-center group-hover:scale-[1.02] transition-all duration-300 filter brightness-95 group-hover:brightness-100"
                          />
                          <button
                            type="button"
                            onClick={() => setSelectedSlip(p.slipImage)}
                            className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-1.5 text-white text-xs font-black cursor-pointer backdrop-blur-xs"
                          >
                            <Eye className="w-4.5 h-4.5 text-indigo-400" /> {t('คลิกขยายดูสลิปใบโอน', 'Click to view full receipt')}
                          </button>
                        </div>
                      ) : (
                        <div className="p-4 bg-slate-100 dark:bg-slate-850 rounded-2xl text-center text-xs text-slate-500 font-black flex items-center justify-center gap-1">
                          <FileText className="w-4 h-4 text-slate-400" /> {t('ไม่มีไฟล์รูปภาพสลิป', 'No transfer slip provided')}
                        </div>
                      )}

                      {/* Pending Action Buttons */}
                      {p.status === 'pending' && (
                        <div className="flex gap-2.5">
                          <button
                            onClick={() => handleRejectPromotion(p._id)}
                            className="flex-1 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-600 dark:text-red-400 py-3 rounded-2xl text-[11px] font-black transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1 border border-red-200/50 dark:border-red-900/20 shadow-xs"
                          >
                            <XCircle className="w-4 h-4 shrink-0" /> {t('ปฏิเสธรายการ', 'Reject Slip')}
                          </button>
                          <button
                            onClick={() => handleApprovePromotion(p._id)}
                            className="flex-1 bg-indigo-650 hover:bg-indigo-700 text-white py-3 rounded-2xl text-[11px] font-black transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1 shadow-lg shadow-indigo-650/20"
                          >
                            <CheckCircle2 className="w-4 h-4 shrink-0" /> {t('อนุมัติโปรโมท', 'Approve Promo')}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Slip Zoom Modal */}
      {selectedSlip && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedSlip(null)}
        >
          <div className="relative max-w-sm w-full bg-white dark:bg-slate-900 rounded-3xl overflow-hidden p-2.5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <button 
              onClick={() => setSelectedSlip(null)}
              className="absolute top-4 right-4 bg-slate-950/60 hover:bg-slate-950 text-white p-2 rounded-full cursor-pointer transition-all shadow-lg backdrop-blur-xs hover:scale-105"
            >
              <XCircle className="w-4 h-4" />
            </button>
            <img 
              src={selectedSlip} 
              alt="Slip Zoomed" 
              className="w-full h-auto max-h-[80vh] rounded-2xl object-contain shadow-inner"
            />
          </div>
        </div>
      )}

      {/* Modern Bottom Navigation Bar matching the theme */}
      <nav className="h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 fixed bottom-0 left-0 right-0 max-w-6xl mx-auto w-full flex items-center justify-around px-2 z-40 shadow-lg">
        <button 
          onClick={() => setActiveTab('users')}
          className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all cursor-pointer ${activeTab === 'users' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400'}`}
        >
          <Users className={`w-5 h-5 ${activeTab === 'users' ? 'scale-110 text-indigo-500' : ''}`} />
          <span className="text-[10px]">{t('จัดการสมาชิก', 'Members')}</span>
        </button>

        <button 
          onClick={() => setActiveTab('promotions')}
          className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all cursor-pointer ${activeTab === 'promotions' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400'}`}
        >
          <Award className={`w-5 h-5 ${activeTab === 'promotions' ? 'scale-110 text-indigo-500' : ''}`} />
          <span className="text-[10px]">{t('คำขอโปรโมท', 'Promotions')}</span>
        </button>

        <button 
          onClick={() => onNavigate('dashboard')}
          className="flex flex-col items-center gap-1 flex-1 py-1 transition-all text-slate-450 hover:text-red-500 cursor-pointer"
        >
          <LayoutDashboard className="w-5 h-5 text-red-500 hover:scale-110 transition-transform" />
          <span className="text-[10px] font-extrabold text-red-650">{t('กลับหน้าหลักฟาร์ม', 'Farm Mode')}</span>
        </button>
      </nav>
    </div>
  );
}
