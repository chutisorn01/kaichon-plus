import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { ChevronLeft, Users, ShieldAlert, Award, FileText, CheckCircle2, XCircle, Search, BadgeCheck, Eye } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col pb-20 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 px-4 py-4 flex items-center justify-between sticky top-0 z-30 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('dashboard')} className="p-2 -ml-2 text-slate-500 hover:text-red-600 transition-colors cursor-pointer">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              {t('ระบบจัดการผู้ดูแลระบบ', 'Admin Control Center')} <ShieldAlert className="w-5 h-5 text-red-500" />
            </h1>
            <p className="text-xs text-slate-500">{t('จัดการสมาชิก การเงิน และรายการโปรโมทซุ้มฟาร์ม', 'Manage members, payments, and highlighted stud promotions')}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 max-w-5xl mx-auto w-full space-y-6">
        
        {/* Tabs navigation */}
        <div className="flex bg-slate-200/60 dark:bg-slate-900 p-1.5 rounded-2xl w-fit border border-slate-200/20">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            {t('จัดการสมาชิก', 'Manage Users')}
          </button>
          <button
            onClick={() => setActiveTab('promotions')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'promotions'
                ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            {t('รายการโปรโมท', 'Promoted Requests')}
            {promotions.filter(p => p.status === 'pending').length > 0 && (
              <span className="bg-amber-500 text-white rounded-full text-[10px] w-5 h-5 flex items-center justify-center animate-pulse">
                {promotions.filter(p => p.status === 'pending').length}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Users */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Search Box */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Search className="w-5 h-5" />
              </span>
              <input
                type="text"
                placeholder={t('ค้นหาซุ้มฟาร์ม หรือชื่อเจ้าของ...', 'Search farm name, owner...')}
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm"
              />
            </div>

            {isLoading ? (
              <div className="py-12 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-500 font-medium">{error}</div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-slate-500">{t('ไม่พบข้อมูลสมาชิก', 'No members found')}</div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase border-b border-slate-100 dark:border-slate-800">
                      <th className="py-4 px-6">{t('ซุ้มฟาร์ม', 'Farm Name')}</th>
                      <th className="py-4 px-6">{t('เจ้าของ', 'Owner Name')}</th>
                      <th className="py-4 px-6">{t('สิทธิ์การใช้งาน', 'Role')}</th>
                      <th className="py-4 px-6">{t('เครื่องหมายรับรอง', 'Verified Badge')}</th>
                      <th className="py-4 px-6 text-right">{t('การจัดการ', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {filteredUsers.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                              {u.farmName || t('ยังไม่ตั้งชื่อซุ้ม', 'No Farm Name')}
                              {u.isVerified && <BadgeCheck className="w-4 h-4 text-blue-500 shrink-0" />}
                            </p>
                            <p className="text-xs font-semibold text-slate-400 mt-0.5">{u.farmCode || '-'}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                            <p className="text-xs font-semibold text-slate-400 mt-0.5">@{u.username} {u.email ? `| ${u.email}` : ''}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-lg ${
                            u.role === 'admin' 
                              ? 'bg-red-50 dark:bg-red-950/20 text-red-600' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-lg ${
                            u.isVerified 
                              ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600' 
                              : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600'
                          }`}>
                            {u.isVerified ? t('รับรองแล้ว 🔵✔', 'Verified 🔵✔') : t('ยังไม่รับรอง', 'Unverified')}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {u.username === 'adminkaichon' ? (
                            <span className="text-xs text-slate-400 font-bold italic">{t('ผู้ดูแลระบบสูงสุด', 'Primary Admin')}</span>
                          ) : (
                            <button
                              onClick={() => handleToggleVerify(u._id, !!u.isVerified)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-[0.98] cursor-pointer ${
                                u.isVerified
                                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/10'
                              }`}
                            >
                              {u.isVerified ? t('ยกเลิกการรับรอง', 'Revoke Verify') : t('อนุมัติ Verified', 'Grant Verify')}
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
              <div className="py-12 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-500 font-medium">{error}</div>
            ) : promotions.length === 0 ? (
              <div className="p-8 text-center text-slate-500">{t('ไม่มีรายการคำขอโปรโมท', 'No promotion requests found')}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {promotions.map((p) => (
                  <div 
                    key={p._id}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm p-5 space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Row: User details & Status */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-extrabold text-base text-slate-950 dark:text-white">
                            {p.user?.farmName || t('ซุ้มฟาร์มทั่วไป', 'General Farm')}
                          </h4>
                          <p className="text-xs text-slate-400 font-semibold">{t('เจ้าของ:', 'Owner:')} {p.user?.name}</p>
                        </div>
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                          p.status === 'approved' 
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600'
                            : p.status === 'rejected' 
                            ? 'bg-red-50 dark:bg-red-950/20 text-red-600'
                            : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 animate-pulse'
                        }`}>
                          {p.status === 'approved' ? t('อนุมัติแล้ว', 'Approved') : p.status === 'rejected' ? t('ปฏิเสธแล้ว', 'Rejected') : t('รอดำเนินการ', 'Pending')}
                        </span>
                      </div>

                      {/* Chicken & Package Details */}
                      <div className="mt-4 flex gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                        {p.father?.image ? (
                          <img 
                            src={p.father.image} 
                            alt="Chicken" 
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200/50"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center justify-center text-xs font-bold text-slate-400">🐓</div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{p.father?.name || t('ไม่มีชื่อไก่', 'Unnamed Chicken')}</p>
                          <p className="text-xs font-semibold text-slate-400">{t('รหัสสากล:', 'Global Code:')} {p.father?.code || '-'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4 text-xs font-bold">
                        <div>
                          <p className="text-slate-400 font-semibold">{t('ระยะเวลาแพ็กเกจ', 'Duration Package')}</p>
                          <p className="text-sm text-slate-800 dark:text-slate-200 mt-0.5">{p.durationDays} {t('วัน', 'Days')}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-semibold">{t('จำนวนเงิน', 'Amount Paid')}</p>
                          <p className="text-sm text-red-600 dark:text-red-400 mt-0.5 font-extrabold">{p.amount}.00 ฿</p>
                        </div>
                      </div>
                    </div>

                    {/* Receipt Image Preview & Actions */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                      {p.slipImage ? (
                        <div className="relative group overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50">
                          <img 
                            src={p.slipImage} 
                            alt="Slip receipt" 
                            className="w-full h-32 object-cover object-center group-hover:scale-105 transition-all duration-300"
                          />
                          <button
                            onClick={() => setSelectedSlip(p.slipImage)}
                            className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-bold cursor-pointer"
                          >
                            <Eye className="w-4 h-4" /> {t('ดูภาพใบเสร็จสลิปโอน', 'View slip receipt')}
                          </button>
                        </div>
                      ) : (
                        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-center text-xs text-slate-500 font-bold flex items-center justify-center gap-1">
                          <FileText className="w-4 h-4" /> {t('ไม่มีสลิปชำระเงิน', 'No transfer slip provided')}
                        </div>
                      )}

                      {/* Actions */}
                      {p.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRejectPromotion(p._id)}
                            className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1 border border-red-200/50"
                          >
                            <XCircle className="w-4 h-4" /> {t('ปฏิเสธ', 'Reject')}
                          </button>
                          <button
                            onClick={() => handleApprovePromotion(p._id)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1 shadow-lg shadow-emerald-600/10"
                          >
                            <CheckCircle2 className="w-4 h-4" /> {t('อนุมัติโปรโมท', 'Approve')}
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
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedSlip(null)}
        >
          <div className="relative max-w-sm w-full bg-white dark:bg-slate-900 rounded-3xl overflow-hidden p-2 shadow-2xl">
            <button 
              onClick={() => setSelectedSlip(null)}
              className="absolute top-4 right-4 bg-slate-950/50 hover:bg-slate-950 text-white p-2 rounded-full cursor-pointer transition-all shadow-md"
            >
              <Eye className="w-4 h-4" />
            </button>
            <img 
              src={selectedSlip} 
              alt="Slip Zoomed" 
              className="w-full h-auto max-h-[80vh] rounded-2xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
