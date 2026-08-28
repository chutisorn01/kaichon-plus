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
  Clock,
  LogOut,
  Megaphone,
  Crown,
  Menu,
  X,
  Trash2,
  Settings,
  UserPlus
} from 'lucide-react';
import AdminBanners from './AdminBanners';
import AdminVipStuds from './AdminVipStuds';
import AdminSettings from './AdminSettings';
import AdminAddUserModal from './AdminAddUserModal';
import AdminManageUserModal from './AdminManageUserModal';
import SuccessModal from './ui/SuccessModal';

interface UserItem {
  _id: string;
  name: string;
  username: string;
  email?: string;
  farmName?: string;
  farmCode?: string;
  isVerified?: boolean;
  isBlocked?: boolean;
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

interface VipSubscriptionItem {
  _id: string;
  user: {
    _id: string;
    name: string;
    farmName: string;
    email: string;
    username: string;
    isVIP: boolean;
  };
  amount: number;
  slipImage: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function AdminDashboard({ onNavigate }: { onNavigate: (page: any) => void }) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'users' | 'promotions' | 'banners' | 'vip' | 'vip-subscriptions' | 'revenue' | 'settings'>(() => {
    return (sessionStorage.getItem('AdminDashboard_activeTab') as any) || 'users';
  });

  useEffect(() => {
    sessionStorage.setItem('AdminDashboard_activeTab', activeTab);
  }, [activeTab]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [vipSubscriptions, setVipSubscriptions] = useState<VipSubscriptionItem[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSlip, setSelectedSlip] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedUserToManage, setSelectedUserToManage] = useState<UserItem | null>(null);
  const [currentAdminUsername, setCurrentAdminUsername] = useState('');
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<UserItem | null>(null);

  // Check admin role authorization & Fetch Data
  useEffect(() => {
    const checkAdminAndFetch = async () => {
      setIsLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      if (!token) {
        onNavigate('login');
        return;
      }

      try {
        // Step 1: Security Authorization Check (Admin Only)
        const authResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const authData = await authResponse.json();

        if (!authResponse.ok || authData.data?.role !== 'admin') {
          // Not an admin! Lock out to user dashboard
          onNavigate('dashboard');
          return;
        }

        setCurrentAdminUsername(authData.data?.username || '');

        // Step 2: Fetch Tab Specific Data
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // Fetch users list
        const usersResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`, { headers });
        const usersData = await usersResponse.json();
        if (!usersResponse.ok) throw new Error(usersData.message || 'Error fetching users');
        setUsers(usersData.data || []);

        // Fetch promotions list
        const promosResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/promotions`, { headers });
        const promosData = await promosResponse.json();
        if (!promosResponse.ok) throw new Error(promosData.message || 'Error fetching promotions');
        setPromotions(promosData.data || []);

        // Fetch VIP Subscriptions
        const vipResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/vip-subscriptions`, { headers });
        const vipData = await vipResponse.json();
        if (!vipResponse.ok) throw new Error(vipData.message || 'Error fetching VIP subscriptions');
        setVipSubscriptions(vipData.data || []);

      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAndFetch();
  }, [activeTab, onNavigate]);

  // Toggle Verification status of user
  const handleToggleVerify = async (userId: string, currentStatus: boolean) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/verify`, {
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

  const handleDeleteUser = async (user: UserItem) => {
    setDeleteConfirmUser(user);
  };

  const confirmDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${deleteConfirmUser._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error deleting user');
      setSuccessModal({ isOpen: true, message: 'ลบผู้ใช้งานสำเร็จ' });
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Error deleting user');
    } finally {
      setDeleteConfirmUser(null);
    }
  };

  // Toggle Partner VIP status of user
  const handleTogglePartnerVip = async (userId: string, currentStatus: boolean) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/partner-vip`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isPartnerVip: !currentStatus })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update user');

      setUsers(users.map(u => u._id === userId ? { ...u, isPartnerVip: !currentStatus } : u));
    } catch (err: any) {
      alert(err.message || 'Error updating partner VIP status');
    }
  };

  // Approve Promotion Request
  const handleApprovePromotion = async (promoId: string) => {
    if (!window.confirm(language === 'th' ? 'ยืนยันอนุมัติการโปรโมทนี้?' : 'Confirm approval for this promotion?')) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/promotions/${promoId}/approve`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/promotions/${promoId}/reject`, {
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

  // Delete Promotion
  const handleDeletePromotion = async (promoId: string) => {
    if (!window.confirm(language === 'th' ? 'ยืนยันลบรายการโปรโมทนี้อย่างถาวร?' : 'Confirm permanent deletion of this promotion?')) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/promotions/${promoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete');

      setPromotions(promotions.filter(p => p._id !== promoId));
    } catch (err: any) {
      alert(err.message || 'Error deleting request');
    }
  };

  // Approve VIP Subscription
  const handleApproveVip = async (subId: string) => {
    if (!window.confirm(language === 'th' ? 'ยืนยันอนุมัติการสมัคร VIP นี้?' : 'Confirm approval for VIP?')) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/vip-subscriptions/${subId}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to approve');

      setVipSubscriptions(vipSubscriptions.map(s => s._id === subId ? { ...s, status: 'approved' as const } : s));
    } catch (err: any) {
      alert(err.message || 'Error approving request');
    }
  };

  // Reject VIP Subscription
  const handleRejectVip = async (subId: string) => {
    if (!window.confirm(language === 'th' ? 'ยืนยันปฏิเสธการสมัคร VIP นี้?' : 'Confirm rejection for VIP?')) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/vip-subscriptions/${subId}/reject`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to reject');

      setVipSubscriptions(vipSubscriptions.map(s => s._id === subId ? { ...s, status: 'rejected' as const } : s));
    } catch (err: any) {
      alert(err.message || 'Error rejecting request');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('dashboard_user');
    onNavigate('login');
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* 🛡️ Desktop Left Sidebar (Only visible on md screens and above) */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 dark:bg-slate-950 text-slate-300 border-r border-slate-800 shrink-0 p-5 justify-between">
        <div className="space-y-6">
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-3 px-2 py-1 border-b border-slate-800/80 pb-5">
            <div className="w-10 h-10 bg-indigo-650 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <ShieldAlert className="w-5.5 h-5.5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white leading-tight">KaiChon Plus</h2>
              <span className="text-[9px] text-indigo-400 font-extrabold tracking-wider uppercase">ADMIN PORTAL</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-indigo-650 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <Users className="w-4.5 h-4.5" />
              {t('จัดการสมาชิก', 'Manage Users')}
            </button>

            <button
              onClick={() => setActiveTab('promotions')}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-black transition-all cursor-pointer relative ${
                activeTab === 'promotions'
                  ? 'bg-indigo-650 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <Award className="w-4.5 h-4.5" />
              {t('รายการโปรโมท', 'Promotions')}
              {promotions.filter(p => p.status === 'pending').length > 0 && (
                <span className="absolute right-3.5 bg-amber-500 text-white rounded-full text-[9px] w-5 h-5 flex items-center justify-center font-black animate-pulse">
                  {promotions.filter(p => p.status === 'pending').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('banners')}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'banners'
                  ? 'bg-indigo-650 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <Megaphone className="w-4.5 h-4.5 text-pink-500" />
              {t('จัดการแบนเนอร์โฆษณา', 'Banner Ads')}
            </button>

            <button
              onClick={() => setActiveTab('vip')}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'vip'
                  ? 'bg-indigo-650 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <Crown className="w-4.5 h-4.5 text-amber-500" />
              {t('ตั้งค่าพ่อพันธุ์ VIP', 'VIP Studs')}
            </button>

            <button
              onClick={() => setActiveTab('vip-subscriptions')}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-black transition-all cursor-pointer relative ${
                activeTab === 'vip-subscriptions'
                  ? 'bg-indigo-650 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <FileText className="w-4.5 h-4.5 text-emerald-500" />
              {t('คำขออัปเกรด VIP', 'VIP Upgrades')}
              {vipSubscriptions.filter(s => s.status === 'pending').length > 0 && (
                <span className="absolute right-3.5 bg-amber-500 text-white rounded-full text-[9px] w-5 h-5 flex items-center justify-center font-black animate-pulse">
                  {vipSubscriptions.filter(s => s.status === 'pending').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('revenue')}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'revenue'
                  ? 'bg-indigo-650 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <DollarSign className="w-4.5 h-4.5 text-emerald-500" />
              {t('รายได้ & บัญชี', 'Revenue & Finance')}
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-indigo-650 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <Settings className="w-4.5 h-4.5 text-indigo-400" />
              {t('ตั้งค่าระบบ', 'System Settings')}
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="space-y-2 border-t border-slate-800/80 pt-5">
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-black text-slate-350 hover:bg-slate-800/50 hover:text-white transition-all cursor-pointer"
          >
            <LayoutDashboard className="w-4.5 h-4.5 text-red-500" />
            {t('ไปโหมดซุ้มฟาร์ม', 'Farm Mode')}
          </button>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-black text-red-400 hover:bg-red-950/20 hover:text-red-305 transition-all cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5" />
            {t('ออกจากระบบ', 'Logout')}
          </button>
        </div>
      </aside>

      {/* 📱 Right Side Content Area (Scrollable content) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-24 md:pb-10">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-4 py-5 sticky top-0 z-30 border-b border-white/10 shadow-lg">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => onNavigate('dashboard')} 
                className="p-2 -ml-2 text-white/70 hover:text-white transition-colors cursor-pointer bg-white/10 hover:bg-white/20 rounded-2xl md:hidden"
                title={t('กลับหน้าหลักซุ้มฟาร์ม', 'Back to Farm Dashboard')}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-black flex items-center gap-2 tracking-tight">
                  {t('แผงควบคุมระบบแอดมิน', 'Admin Dashboard')} <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse md:hidden" />
                </h1>
                <p className="text-[10px] text-indigo-200 font-semibold">{t('ระบบตรวจสอบหลักฐานการโอนเงินและยืนยันตัวตนฟาร์ม', 'Farm pedigree validation & stud promotion receipts')}</p>
              </div>
            </div>

            <button 
              onClick={() => onNavigate('dashboard')}
              className="hidden sm:flex items-center gap-2 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-black px-4 py-2.5 rounded-2xl shadow-lg shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer border border-indigo-500/30"
            >
              <ArrowLeftRight className="w-4 h-4" />
              {t('สลับไปโหมดซุ้มฟาร์ม', 'Switch to Farm Mode')}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-white/70 hover:text-white transition-colors cursor-pointer bg-white/10 hover:bg-white/20 rounded-2xl md:hidden"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Hamburger Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-[76px] bg-slate-900/95 backdrop-blur-xl z-40 overflow-y-auto p-4 flex flex-col gap-2 shadow-2xl animate-in slide-in-from-top-2 duration-200">
            <button
              onClick={() => { setActiveTab('users'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-black transition-all cursor-pointer ${
                activeTab === 'users' ? 'bg-indigo-650 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Users className="w-5 h-5" /> {t('จัดการสมาชิก', 'Manage Users')}
            </button>
            <button
              onClick={() => { setActiveTab('promotions'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-black transition-all cursor-pointer relative ${
                activeTab === 'promotions' ? 'bg-indigo-650 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Award className="w-5 h-5" /> {t('รายการโปรโมท', 'Promotions')}
              {pendingPromotionsCount > 0 && (
                <span className="absolute right-4 bg-amber-500 text-white rounded-full text-[10px] px-2 py-0.5 animate-pulse">{pendingPromotionsCount}</span>
              )}
            </button>
            <button
              onClick={() => { setActiveTab('banners'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-black transition-all cursor-pointer ${
                activeTab === 'banners' ? 'bg-indigo-650 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Megaphone className="w-5 h-5 text-pink-500" /> {t('จัดการแบนเนอร์โฆษณา', 'Banner Ads')}
            </button>
            <button
              onClick={() => { setActiveTab('vip'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-black transition-all cursor-pointer ${
                activeTab === 'vip' ? 'bg-indigo-650 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Crown className="w-5 h-5 text-amber-500" /> {t('ตั้งค่าพ่อพันธุ์ VIP', 'VIP Studs')}
            </button>
            <button
              onClick={() => { setActiveTab('vip-subscriptions'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-black transition-all cursor-pointer relative ${
                activeTab === 'vip-subscriptions' ? 'bg-indigo-650 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <FileText className="w-5 h-5 text-emerald-500" /> {t('คำขออัปเกรด VIP', 'VIP Upgrades')}
              {vipSubscriptions.filter(s => s.status === 'pending').length > 0 && (
                <span className="absolute right-4 bg-amber-500 text-white rounded-full text-[10px] px-2 py-0.5 animate-pulse">{vipSubscriptions.filter(s => s.status === 'pending').length}</span>
              )}
            </button>
            <button
              onClick={() => { setActiveTab('revenue'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-black transition-all cursor-pointer ${
                activeTab === 'revenue' ? 'bg-indigo-650 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <DollarSign className="w-5 h-5 text-emerald-500" /> {t('รายได้ & บัญชี', 'Revenue & Finance')}
            </button>
            <button
              onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-black transition-all cursor-pointer ${
                activeTab === 'settings' ? 'bg-indigo-650 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Settings className="w-5 h-5 text-indigo-400" /> {t('ตั้งค่าระบบ', 'System Settings')}
            </button>
            <div className="h-[1px] bg-white/10 my-4"></div>
            <button
              onClick={() => { onNavigate('dashboard'); setIsMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-black text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
            >
              <LayoutDashboard className="w-5 h-5 text-red-500" /> {t('ไปโหมดซุ้มฟาร์ม', 'Farm Mode')}
            </button>
            <button
              onClick={() => { setShowLogoutConfirm(true); setIsMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-black text-red-400 hover:bg-red-950/20 transition-all cursor-pointer"
            >
              <LogOut className="w-5 h-5" /> {t('ออกจากระบบ', 'Logout')}
            </button>
          </div>
        )}

        {/* Content Container */}
        <div className="p-4 sm:p-6 max-w-5xl w-full mx-auto space-y-6">
          
          {/* Quick Metrics Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/50 dark:border-white/5 shadow-xs flex items-center gap-4 transition-all hover:shadow-md">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/40 text-blue-650 dark:text-blue-400 rounded-2xl flex items-center justify-center font-bold shadow-inner shrink-0">
                <Users className="w-5.5 h-5.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-slate-450 dark:text-slate-500 font-bold truncate uppercase">{t('สมาชิกทั้งหมด', 'Total Users')}</div>
                <div className="text-lg font-black tracking-tight mt-0.5">{users.length || '-'}</div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/50 dark:border-white/5 shadow-xs flex items-center gap-4 transition-all hover:shadow-md">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 rounded-2xl flex items-center justify-center font-bold shadow-inner shrink-0">
                <BadgeCheck className="w-5.5 h-5.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-slate-455 dark:text-slate-500 font-bold truncate uppercase">{t('ฟาร์มมาตรฐาน', 'Verified Farms')}</div>
                <div className="text-lg font-black tracking-tight mt-0.5">{totalVerifiedFarms || '-'}</div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/50 dark:border-white/5 shadow-xs flex items-center gap-4 transition-all hover:shadow-md">
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center font-bold shadow-inner shrink-0">
                <Clock className="w-5.5 h-5.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-slate-450 dark:text-slate-500 font-bold truncate uppercase">{t('คำขอรอยืนยัน', 'Pending Slips')}</div>
                <div className="text-lg font-black tracking-tight mt-0.5">{pendingPromotionsCount}</div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/50 dark:border-white/5 shadow-xs flex items-center gap-4 transition-all hover:shadow-md">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-655 dark:text-emerald-400 rounded-2xl flex items-center justify-center font-bold shadow-inner shrink-0">
                <DollarSign className="w-5.5 h-5.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-slate-450 dark:text-slate-500 font-bold truncate uppercase">{t('รายได้สะสม', 'Revenue')}</div>
                <div className="text-lg font-black text-emerald-650 dark:text-emerald-450 tracking-tight mt-0.5 truncate">{totalRevenue.toLocaleString()} ฿</div>
              </div>
            </div>
          </div>

          {/* 📱 Mobile Top Tabs switcher (hidden on desktop) */}
          <div className="flex md:hidden bg-slate-200/60 dark:bg-slate-900 p-1.5 rounded-2xl w-fit border border-slate-200/20 max-w-full overflow-x-auto">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3.5 py-2.5 rounded-xl font-bold text-[10px] sm:text-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'users'
                  ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm'
                  : 'text-slate-550 dark:text-slate-400'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              {t('สมาชิก', 'Members')}
            </button>
            <button
              onClick={() => setActiveTab('promotions')}
              className={`px-3.5 py-2.5 rounded-xl font-bold text-[10px] sm:text-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 relative ${
                activeTab === 'promotions'
                  ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm'
                  : 'text-slate-550 dark:text-slate-400'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              {t('คำขอโปรโมท', 'Promos')}
              {promotions.filter(p => p.status === 'pending').length > 0 && (
                <span className="bg-amber-500 text-white rounded-full text-[8px] w-4.5 h-4.5 flex items-center justify-center font-black animate-pulse">
                  {promotions.filter(p => p.status === 'pending').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('vip')}
              className={`px-3.5 py-2.5 rounded-xl font-bold text-[10px] sm:text-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'vip'
                  ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm'
                  : 'text-slate-550 dark:text-slate-400'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              {t('VIP Manual', 'VIP Manual')}
            </button>
            <button
              onClick={() => setActiveTab('revenue')}
              className={`px-3.5 py-2.5 rounded-xl font-bold text-[10px] sm:text-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === 'revenue'
                  ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm'
                  : 'text-slate-555 dark:text-slate-400'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              {t('รายได้', 'Revenue')}
            </button>
          </div>

          {/* Tab 1: Users View */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              {/* Search Bar & Actions */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:max-w-xs">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-450">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder={t('ค้นหาชื่อฟาร์ม หรือชื่อสมาชิก...', 'Search farm, owner...')}
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl shadow-xs focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-semibold"
                  />
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <span className="text-xs font-bold text-slate-400 shrink-0">
                    {t(`พบบัญชีผู้ใช้ทั้งหมด ${filteredUsers.length} รายการ`, `Total found ${filteredUsers.length} users`)}
                  </span>
                  <button
                    onClick={() => setShowAddUserModal(true)}
                    className="ml-auto sm:ml-0 flex items-center gap-1.5 px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all active:scale-[0.98]"
                  >
                    <UserPlus className="w-4 h-4" />
                    {t('เพิ่มผู้ใช้', 'Add User')}
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="py-20 flex justify-center">
                  <div className="w-8 h-8 border-4 border-indigo-650 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : error ? (
                <div className="p-8 text-center text-red-500 bg-red-55/10 rounded-2xl border border-red-200/30 text-sm font-bold">{error}</div>
              ) : filteredUsers.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl text-center text-slate-400 font-bold border border-slate-200/50 dark:border-white/5">{t('ไม่พบข้อมูลบัญชีผู้ใช้', 'No users found')}</div>
              ) : (
                <>
                {/* Mobile View */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                  {filteredUsers.map((u) => (
                    <div key={u._id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm p-5 space-y-4">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="font-extrabold text-slate-900 dark:text-white flex items-center flex-wrap gap-1 text-sm mb-1">
                            {u.farmName || t('ยังไม่ตั้งชื่อซุ้มฟาร์ม', 'No Farm Name')}
                            {u.isVerified && <BadgeCheck className="w-4.5 h-4.5 text-blue-500 shrink-0" />}
                            {u.isPartnerVip && <Crown className="w-4.5 h-4.5 text-yellow-500 shrink-0" title="Partner VIP 👑" />}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">@{u.username}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{u.name} {u.email ? `| ${u.email}` : ''}</p>
                        </div>
                        <span className={`inline-flex px-2 py-0.5 text-[9px] font-black rounded-md shrink-0 ${
                          u.role === 'admin' 
                            ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200/30' 
                            : 'bg-slate-105 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/50'
                        }`}>
                          {u.role.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/50">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-black rounded-md ${
                          u.isVerified 
                            ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600' 
                            : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600'
                        }`}>
                          {u.isVerified ? t('รับรองฟาร์มแล้ว 🔵✔', 'Verified 🔵✔') : t('ยังไม่รับรอง', 'Unverified')}
                        </span>
                      </div>

                      <div className="flex items-center flex-wrap gap-2 pt-2">
                        {u.username === 'adminkaichon' ? (
                          <span className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-450 px-3 py-1.5 rounded-xl text-[10px] font-extrabold tracking-wider uppercase border border-slate-200 dark:border-slate-700 w-full text-center">{t('ผู้ดูแลระบบสูงสุด 👑', 'Super Admin 👑')}</span>
                        ) : (
                          <>
                            <button
                              onClick={() => handleToggleVerify(u._id, !!u.isVerified)}
                              className={`flex-1 px-3 py-2 rounded-xl text-[10px] font-black transition-all active:scale-[0.98] cursor-pointer ${
                                u.isVerified
                                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 border border-slate-200 dark:border-slate-700'
                                  : 'bg-indigo-600 hover:bg-indigo-750 text-white shadow-md shadow-indigo-600/10'
                              }`}
                            >
                              {u.isVerified ? t('ยกเลิกรับรอง', 'Revoke') : t('อนุมัติ 🔵', 'Approve')}
                            </button>
                            <button
                              onClick={() => handleTogglePartnerVip(u._id, !!u.isPartnerVip)}
                              className={`flex-1 px-3 py-2 rounded-xl text-[10px] font-black transition-all active:scale-[0.98] cursor-pointer ${
                                u.isPartnerVip
                                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 border border-amber-200 dark:border-amber-800'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200 border border-slate-200'
                              }`}
                            >
                              {u.isPartnerVip ? t('ยกเลิก Partner', 'Revoke') : t('ให้ Partner 👑', 'Partner')}
                            </button>
                            
                            <div className="flex gap-2 w-full mt-1">
                              <button
                                onClick={() => setSelectedUserToManage(u)}
                                className="flex-1 p-2 flex justify-center items-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                              >
                                <Settings className="w-4 h-4 mr-1" /> จัดการ
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="flex-1 p-2 flex justify-center items-center rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800/30"
                              >
                                <Trash2 className="w-4 h-4 mr-1" /> ลบ
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden md:block bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-white/5 shadow-md overflow-hidden overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-850/50 text-slate-455 dark:text-slate-400 font-black text-[10px] uppercase tracking-wider border-b border-slate-150 dark:border-slate-850">
                        <th className="py-4 px-6">{t('ซุ้มฟาร์ม', 'Farm Name')}</th>
                        <th className="py-4 px-6">{t('ชื่อผู้ใช้', 'User Details')}</th>
                        <th className="py-4 px-6">{t('บทบาท', 'Role')}</th>
                        <th className="py-4 px-6">{t('สถานะรับรอง', 'Verified')}</th>
                        <th className="py-4 px-6 text-right">{t('จัดการสิทธิ์', 'Actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs font-bold text-slate-700 dark:text-slate-350">
                      {filteredUsers.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                          <td className="py-4 px-6">
                            <div>
                              <p className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1 text-sm">
                                {u.farmName || t('ยังไม่ตั้งชื่อซุ้มฟาร์ม', 'No Farm Name')}
                                {u.isVerified && <BadgeCheck className="w-4.5 h-4.5 text-blue-500 shrink-0" />}
                                {u.isPartnerVip && <Crown className="w-4.5 h-4.5 text-yellow-500 shrink-0" title="Partner VIP 👑" />}
                              </p>
                              <p className="text-[10px] font-mono text-slate-400 mt-0.5">{u.farmCode || '-'}</p>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div>
                              <p className="font-extrabold text-slate-900 dark:text-white text-sm">{u.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">@{u.username} {u.email ? `| ${u.email}` : ''}</p>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex px-2 py-0.5 text-[9px] font-black rounded-md ${
                              u.role === 'admin' 
                                ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200/30' 
                                : 'bg-slate-105 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/50'
                            }`}>
                              {u.role.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-black rounded-md ${
                              u.isVerified 
                                ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600' 
                                : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600'
                            }`}>
                              {u.isVerified ? t('รับรองฟาร์มแล้ว 🔵✔', 'Verified 🔵✔') : t('ยังไม่รับรอง', 'Unverified')}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            {u.username === 'adminkaichon' ? (
                              <span className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-450 px-3 py-1.5 rounded-xl text-[10px] font-extrabold tracking-wider uppercase border border-slate-200 dark:border-slate-700">{t('ผู้ดูแลระบบสูงสุด 👑', 'Super Admin 👑')}</span>
                            ) : (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setSelectedUserToManage(u)}
                                  className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all cursor-pointer border border-slate-200/50 dark:border-slate-700"
                                  title={t('จัดการผู้ใช้', 'Manage User')}
                                >
                                  <Settings className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleToggleVerify(u._id, !!u.isVerified)}
                                  className={`px-3 py-2 rounded-xl text-[10px] font-black transition-all active:scale-[0.98] cursor-pointer ${
                                    u.isVerified
                                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 border border-slate-200 dark:border-slate-700'
                                      : 'bg-indigo-600 hover:bg-indigo-750 text-white shadow-md shadow-indigo-600/10'
                                  }`}
                                >
                                  {u.isVerified ? t('ยกเลิกการรับรอง', 'Revoke Verify') : t('อนุมัติ Verified 🔵', 'Approve Verified')}
                                </button>
                                <button
                                  onClick={() => handleTogglePartnerVip(u._id, !!u.isPartnerVip)}
                                  className={`px-3 py-2 rounded-xl text-[10px] font-black transition-all active:scale-[0.98] cursor-pointer ${
                                    u.isPartnerVip
                                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 border border-amber-200 dark:border-amber-800'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200 border border-slate-200'
                                  }`}
                                  title="ให้สิทธิ์ใช้งานทุกอย่างฟรี ไม่มีลิมิต"
                                >
                                  {u.isPartnerVip ? t('ยกเลิก Partner', 'Revoke Partner') : t('ให้สิทธิ์ Partner 👑', 'Grant Partner VIP')}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u)}
                                  disabled={u.username === 'adminkaichon'}
                                  className={`px-3 py-2 rounded-xl text-[10px] font-black transition-all active:scale-[0.98] cursor-pointer ${
                                    u.username === 'adminkaichon' 
                                      ? 'bg-slate-100 text-slate-400 opacity-50 cursor-not-allowed'
                                      : 'bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 border border-red-200 dark:border-red-800'
                                  }`}
                                  title={u.username === 'adminkaichon' ? 'บัญชีผู้ดูแลสูงสุด ไม่สามารถลบได้' : 'ลบผู้ใช้งาน'}
                                >
                                  {t('ลบผู้ใช้', 'Delete')}
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                </>
              )}
            </div>
          )}

          {/* Tab 2: Promotions View */}
          {activeTab === 'promotions' && (
            <div className="space-y-4">
              {isLoading ? (
                <div className="py-20 flex justify-center">
                  <div className="w-8 h-8 border-4 border-indigo-650 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : error ? (
                <div className="p-8 text-center text-red-500 bg-red-55/10 rounded-2xl border border-red-200/30 text-sm font-bold">{error}</div>
              ) : promotions.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl text-center text-slate-400 font-bold border border-slate-200/50 dark:border-white/5">{t('ไม่มีรายการส่งโปรโมทของสมาชิก', 'No promotion requests found')}</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {promotions.map((p) => (
                    <div 
                      key={p._id}
                      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-white/5 shadow-md p-5 space-y-4 flex flex-col justify-between hover:shadow-lg transition-all duration-300"
                    >
                      <div>
                        {/* Upper details */}
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-extrabold text-sm text-slate-955 dark:text-white flex items-center gap-1">
                              {p.user?.farmName || t('ซุ้มฟาร์มทั่วไป', 'General Farm')}
                              {p.user?.username === 'adminkaichon' && <span className="text-[9px] bg-red-100 dark:bg-red-955 text-red-650 px-1.5 py-0.5 rounded-md font-black">ADMIN</span>}
                            </h4>
                            <p className="text-[10px] text-slate-450 font-semibold">{t('ผู้ส่งคำขอ:', 'Requester:')} {p.user?.name} (@{p.user?.username})</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg border ${
                              p.status === 'approved' 
                                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-455 border-emerald-250/30'
                                : p.status === 'rejected' 
                                ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-250/30'
                                : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-455 border-amber-250/30 animate-pulse'
                            }`}>
                              {p.status === 'approved' ? t('อนุมัติแล้ว', 'Approved') : p.status === 'rejected' ? t('ปฏิเสธแล้ว', 'Rejected') : t('รอดำเนินการ', 'Pending Review')}
                            </span>
                            <button
                              onClick={() => handleDeletePromotion(p._id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                              title={t('ลบรายการ', 'Delete')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Chicken details row */}
                        <div className="mt-4 flex gap-3 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-150 dark:border-slate-850">
                          {p.father?.image ? (
                            <img 
                              src={p.father.image} 
                              alt="Chicken" 
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200/50 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-850 rounded-xl flex items-center justify-center text-xs text-slate-450 font-bold shrink-0">🐓</div>
                          )}
                          <div>
                            <p className="text-sm font-extrabold text-slate-900 dark:text-white">{p.father?.name || t('ไม่ได้ตั้งชื่อพ่อไก่', 'Unnamed Stud')}</p>
                            <p className="text-[10px] font-bold text-slate-400">{t('รหัสสากล:', 'Global Code:')} <span className="font-mono text-slate-600 dark:text-slate-350">{p.father?.code || '-'}</span></p>
                          </div>
                        </div>

                        {/* Cost & Duration info */}
                        <div className="grid grid-cols-2 gap-4 mt-4 text-[10px] font-black">
                          <div className="bg-slate-50/50 dark:bg-slate-855/30 p-2.5 rounded-xl border border-slate-150/40 dark:border-slate-800/30">
                            <p className="text-slate-400">{t('ระยะเวลาแพ็กเกจ', 'Duration')}</p>
                            <p className="text-xs text-slate-800 dark:text-slate-200 mt-1 font-bold">{p.durationDays} {t('วัน', 'Days')}</p>
                          </div>
                          <div className="bg-slate-50/50 dark:bg-slate-855/30 p-2.5 rounded-xl border border-slate-150/40 dark:border-slate-800/30">
                            <p className="text-slate-400">{t('จำนวนเงินชำระ', 'Amount')}</p>
                            <p className="text-xs text-red-650 dark:text-red-400 mt-1 font-extrabold">{p.amount}.00 ฿</p>
                          </div>
                        </div>
                      </div>

                      {/* Slip receipt preview & Action buttons */}
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-850 space-y-4">
                        {p.slipImage ? (
                          <div className="relative group overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50">
                            <img 
                              src={p.slipImage} 
                              alt="Slip receipt" 
                              className="w-full h-36 object-cover object-center group-hover:scale-105 transition-all duration-300 filter brightness-95 group-hover:brightness-100"
                            />
                            <button
                              type="button"
                              onClick={() => setSelectedSlip(p.slipImage)}
                              className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-1.5 text-white text-xs font-black cursor-pointer backdrop-blur-xs"
                            >
                              <Eye className="w-4 h-4 text-indigo-400" /> {t('ขยายดูภาพสลิป', 'Click to view slip')}
                            </button>
                          </div>
                        ) : (
                          <div className="p-4 bg-slate-105 dark:bg-slate-850 rounded-2xl text-center text-xs text-slate-450 font-bold">
                            {t('ไม่มีรูปสลิปชำระเงินส่งเข้ามา', 'No slip image found')}
                          </div>
                        )}

                        {/* Actions */}
                        {p.status === 'pending' && (
                          <div className="flex gap-2.5">
                            <button
                              onClick={() => handleRejectPromotion(p._id)}
                              className="flex-1 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-600 dark:text-red-400 py-3 rounded-2xl text-[11px] font-black transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1 border border-red-200/50 dark:border-red-900/20"
                            >
                              <XCircle className="w-4.5 h-4.5" /> {t('ปฏิเสธสลิป', 'Reject Slip')}
                            </button>
                            <button
                              onClick={() => handleApprovePromotion(p._id)}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl text-[11px] font-black transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1 shadow-lg shadow-emerald-600/20"
                            >
                              <CheckCircle2 className="w-4.5 h-4.5" /> {t('อนุมัติโปรโมท', 'Approve')}
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

          {/* Tab 3: Revenue & Finance View */}
          {activeTab === 'banners' && <AdminBanners />}
          {activeTab === 'vip' && <AdminVipStuds />}
          {activeTab === 'settings' && <AdminSettings />}

          {/* VIP Subscriptions Tab */}
          {activeTab === 'vip-subscriptions' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-8 shadow-xs border border-slate-200/50 dark:border-white/5 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div>
                  <h2 className="text-xl font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-emerald-500" />
                    {t('คำขออัปเกรดเป็น VIP', 'VIP Upgrade Requests')}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">{t('ตรวจสอบสลิปโอนเงิน 500 บาท สำหรับระบบฝากผสม VIP', 'Review 500 THB slips for VIP Mating System')}</p>
                </div>
              </div>

              {vipSubscriptions.length === 0 ? (
                <div className="text-center py-16 text-slate-400 font-bold bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                  {t('ยังไม่มีรายการขออัปเกรด VIP', 'No VIP upgrade requests found')}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {vipSubscriptions.map(sub => (
                    <div key={sub._id} className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 overflow-hidden flex flex-col group hover:border-emerald-400/50 transition-all">
                      <div className="p-4 flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg ${
                            sub.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                            sub.status === 'approved' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                            'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          }`}>
                            {sub.status.toUpperCase()}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">
                            {new Date(sub.createdAt).toLocaleDateString('th-TH')}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-lg">
                            {sub.user?.name ? sub.user.name.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-sm">{sub.user?.name}</div>
                            <div className="text-xs text-slate-500">{sub.user?.farmName || 'No Farm'}</div>
                          </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900/50 rounded-xl p-3 border border-slate-200 dark:border-slate-800/60">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-slate-500 font-bold">จำนวนเงิน (Amount)</span>
                            <span className="text-sm font-black text-slate-900 dark:text-white">{sub.amount} ฿</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-2 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700/60 flex flex-col gap-2">
                        <button 
                          onClick={() => setSelectedSlip(sub.slipImage)}
                          className="w-full bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors border border-slate-200 dark:border-slate-700"
                        >
                          <Eye className="w-4 h-4" /> ดูสลิป (View Slip)
                        </button>
                        
                        {sub.status === 'pending' && (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleRejectVip(sub._id)}
                              className="flex-1 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 font-black py-2 rounded-xl text-xs transition-colors"
                            >
                              ไม่อนุมัติ
                            </button>
                            <button 
                              onClick={() => handleApproveVip(sub._id)}
                              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-2 rounded-xl text-xs shadow-md shadow-emerald-500/20 transition-colors"
                            >
                              อนุมัติ VIP
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
          
          {activeTab === 'revenue' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Financial breakdown cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-emerald-600 to-teal-650 text-white p-6 rounded-3xl shadow-lg border border-emerald-500/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider">{t('รายได้ทั้งหมดสะสม', 'Total Lifetime Revenue')}</p>
                      <h3 className="text-3xl font-black mt-2 tracking-tight">{totalRevenue.toLocaleString()} ฿</h3>
                    </div>
                    <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-[10px] text-emerald-200 mt-4 font-bold">{t('* รายได้จริงจากการอนุมัติโปรโมททั้งหมด', '* Actual earnings from all approved promotions')}</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/50 dark:border-white/5 shadow-sm space-y-4">
                  <p className="text-xs text-slate-450 dark:text-slate-550 font-bold uppercase tracking-wider">{t('จำนวนการโฆษณาสำเร็จ', 'Successful Promotions')}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black">{promotions.filter(p => p.status === 'approved').length}</span>
                    <span className="text-xs text-slate-400 font-bold">{t('รายการ', 'Transactions')}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-650 h-full rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/50 dark:border-white/5 shadow-sm space-y-4">
                  <p className="text-xs text-slate-455 dark:text-slate-550 font-bold uppercase tracking-wider">{t('วิเคราะห์สัดส่วนความนิยมแพ็คเกจ', 'Package Popularity')}</p>
                  <div className="space-y-2 text-xs font-bold text-slate-650 dark:text-slate-400">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>7 {t('วัน', 'Days')} (100฿)</span>
                        <span>{promotions.filter(p => p.status === 'approved' && p.durationDays === 7).length} {t('ครั้ง', 'times')}</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-amber-500 h-full rounded-full" 
                          style={{ 
                            width: `${(promotions.filter(p => p.status === 'approved').length 
                              ? (promotions.filter(p => p.status === 'approved' && p.durationDays === 7).length / promotions.filter(p => p.status === 'approved').length) * 100 
                              : 0)}%` 
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span>15 {t('วัน', 'Days')} (200฿)</span>
                        <span>{promotions.filter(p => p.status === 'approved' && p.durationDays === 15).length} {t('ครั้ง', 'times')}</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-500 h-full rounded-full" 
                          style={{ 
                            width: `${(promotions.filter(p => p.status === 'approved').length 
                              ? (promotions.filter(p => p.status === 'approved' && p.durationDays === 15).length / promotions.filter(p => p.status === 'approved').length) * 100 
                              : 0)}%` 
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span>30 {t('วัน', 'Days')} (350฿)</span>
                        <span>{promotions.filter(p => p.status === 'approved' && p.durationDays === 30).length} {t('ครั้ง', 'times')}</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-rose-500 h-full rounded-full" 
                          style={{ 
                            width: `${(promotions.filter(p => p.status === 'approved').length 
                              ? (promotions.filter(p => p.status === 'approved' && p.durationDays === 30).length / promotions.filter(p => p.status === 'approved').length) * 100 
                              : 0)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transactions Ledger Table */}
              <div className="space-y-3">
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">{t('ประวัติการรับชำระเงิน', 'Payment Transaction Ledger')}</h3>
                
                {promotions.filter(p => p.status === 'approved').length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl text-center text-slate-400 font-bold border border-slate-200/50 dark:border-white/5">{t('ยังไม่มีประวัติรายรับในระบบ', 'No earnings history yet')}</div>
                ) : (
                  
                {/* Mobile View */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                  {filteredUsers.map((u) => (
                    <div key={u._id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm p-5 space-y-4">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="font-extrabold text-slate-900 dark:text-white flex items-center flex-wrap gap-1 text-sm mb-1">
                            {u.farmName || t('ยังไม่ตั้งชื่อซุ้มฟาร์ม', 'No Farm Name')}
                            {u.isVerified && <BadgeCheck className="w-4.5 h-4.5 text-blue-500 shrink-0" />}
                            {u.isPartnerVip && <Crown className="w-4.5 h-4.5 text-yellow-500 shrink-0" title="Partner VIP 👑" />}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">@{u.username}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{u.name} {u.email ? `| ${u.email}` : ''}</p>
                        </div>
                        <span className={`inline-flex px-2 py-0.5 text-[9px] font-black rounded-md shrink-0 ${
                          u.role === 'admin' 
                            ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200/30' 
                            : 'bg-slate-105 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/50'
                        }`}>
                          {u.role.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/50">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-black rounded-md ${
                          u.isVerified 
                            ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600' 
                            : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600'
                        }`}>
                          {u.isVerified ? t('รับรองฟาร์มแล้ว 🔵✔', 'Verified 🔵✔') : t('ยังไม่รับรอง', 'Unverified')}
                        </span>
                      </div>

                      <div className="flex items-center flex-wrap gap-2 pt-2">
                        {u.username === 'adminkaichon' ? (
                          <span className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-450 px-3 py-1.5 rounded-xl text-[10px] font-extrabold tracking-wider uppercase border border-slate-200 dark:border-slate-700 w-full text-center">{t('ผู้ดูแลระบบสูงสุด 👑', 'Super Admin 👑')}</span>
                        ) : (
                          <>
                            <button
                              onClick={() => handleToggleVerify(u._id, !!u.isVerified)}
                              className={`flex-1 px-3 py-2 rounded-xl text-[10px] font-black transition-all active:scale-[0.98] cursor-pointer ${
                                u.isVerified
                                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 border border-slate-200 dark:border-slate-700'
                                  : 'bg-indigo-600 hover:bg-indigo-750 text-white shadow-md shadow-indigo-600/10'
                              }`}
                            >
                              {u.isVerified ? t('ยกเลิกรับรอง', 'Revoke') : t('อนุมัติ 🔵', 'Approve')}
                            </button>
                            <button
                              onClick={() => handleTogglePartnerVip(u._id, !!u.isPartnerVip)}
                              className={`flex-1 px-3 py-2 rounded-xl text-[10px] font-black transition-all active:scale-[0.98] cursor-pointer ${
                                u.isPartnerVip
                                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 border border-amber-200 dark:border-amber-800'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200 border border-slate-200'
                              }`}
                            >
                              {u.isPartnerVip ? t('ยกเลิก Partner', 'Revoke') : t('ให้ Partner 👑', 'Partner')}
                            </button>
                            
                            <div className="flex gap-2 w-full mt-1">
                              <button
                                onClick={() => setSelectedUserToManage(u)}
                                className="flex-1 p-2 flex justify-center items-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                              >
                                <Settings className="w-4 h-4 mr-1" /> จัดการ
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="flex-1 p-2 flex justify-center items-center rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800/30"
                              >
                                <Trash2 className="w-4 h-4 mr-1" /> ลบ
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden md:block bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-white/5 shadow-md overflow-hidden overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-850/50 text-slate-450 dark:text-slate-400 font-black text-[10px] uppercase tracking-wider border-b border-slate-150 dark:border-slate-850">
                          <th className="py-4 px-6">{t('วันเวลา', 'Date & Time')}</th>
                          <th className="py-4 px-6">{t('ซุ้มฟาร์ม', 'Farm Account')}</th>
                          <th className="py-4 px-6">{t('พ่อพันธุ์ที่โปรโมท', 'Stud Chicken')}</th>
                          <th className="py-4 px-6">{t('ความยาวโฆษณา', 'Duration')}</th>
                          <th className="py-4 px-6 text-right">{t('รายรับสุทธิ', 'Revenue')}</th>
                          <th className="py-4 px-6 text-right">{t('ใบเสร็จ', 'Slip')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs font-bold text-slate-700 dark:text-slate-350">
                        {promotions.filter(p => p.status === 'approved').map((p) => (
                          <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                            <td className="py-4 px-6">
                              <span className="text-slate-500 font-semibold">{new Date(p.createdAt).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </td>
                            <td className="py-4 px-6">
                              <div>
                                <p className="font-extrabold text-slate-900 dark:text-white">{p.user?.farmName || t('ซุ้มฟาร์มทั่วไป', 'General Farm')}</p>
                                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{p.user?.name}</p>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                {p.father?.image ? (
                                  <img src={p.father.image} className="w-7 h-7 rounded-lg object-cover border border-slate-200/50" alt="" />
                                ) : (
                                  <div className="w-7 h-7 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-[10px] border border-slate-200/50">🐓</div>
                                )}
                                <div>
                                  <p className="font-extrabold text-slate-900 dark:text-white">{p.father?.name || '-'}</p>
                                  <p className="text-[9px] font-mono text-slate-400">{p.father?.code || '-'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className="inline-flex px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 rounded-md text-[10px] font-black border border-indigo-150/30">
                                {p.durationDays} {t('วัน', 'Days')}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right font-extrabold text-emerald-600 dark:text-emerald-450 text-sm">
                              +{p.amount}.00 ฿
                            </td>
                            <td className="py-4 px-6 text-right">
                              {p.slipImage ? (
                                <button
                                  type="button"
                                  onClick={() => setSelectedSlip(p.slipImage)}
                                  className="px-2.5 py-1 bg-slate-105 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-all font-black text-[10px] cursor-pointer inline-flex items-center gap-1 border border-slate-250/20"
                                >
                                  <Eye className="w-3.5 h-3.5 text-indigo-500" />
                                  {t('ตรวจสอบ', 'View')}
                                </button>
                              ) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slip Zoom Modal */}
      {selectedSlip && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedSlip(null)}
        >
          <div className="relative max-w-sm w-full bg-white dark:bg-slate-900 rounded-3xl overflow-hidden p-2.5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <button 
              onClick={() => setSelectedSlip(null)}
              className="absolute top-4 right-4 bg-slate-950/60 hover:bg-slate-950 text-white p-2 rounded-full cursor-pointer transition-all shadow-lg hover:scale-105"
            >
              <XCircle className="w-4.5 h-4.5" />
            </button>
            <img 
              src={selectedSlip} 
              alt="Slip Zoomed" 
              className="w-full h-auto max-h-[80vh] rounded-2xl object-contain"
            />
          </div>
        </div>
      )}

      {/* 📱 Mobile Bottom Navigation Bar (Hidden on desktop) */}
      <nav className="h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 fixed bottom-0 left-0 right-0 max-w-6xl mx-auto w-full flex md:hidden items-center justify-around px-2 z-40 shadow-lg animate-fade-in">
        <button 
          onClick={() => setActiveTab('users')}
          className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all cursor-pointer ${activeTab === 'users' ? 'text-indigo-650 dark:text-indigo-400 font-black' : 'text-slate-400'}`}
        >
          <Users className={`w-5 h-5 ${activeTab === 'users' ? 'scale-110 text-indigo-500' : ''}`} />
          <span className="text-[10px]">{t('จัดการสมาชิก', 'Members')}</span>
        </button>

        <button 
          onClick={() => setActiveTab('promotions')}
          className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all cursor-pointer ${activeTab === 'promotions' ? 'text-indigo-650 dark:text-indigo-400 font-black' : 'text-slate-400'}`}
        >
          <Award className={`w-5 h-5 ${activeTab === 'promotions' ? 'scale-110 text-indigo-500' : ''}`} />
          <span className="text-[10px]">{t('คำขอโปรโมท', 'Promotions')}</span>
        </button>

        <button 
          onClick={() => onNavigate('dashboard')}
          className="flex flex-col items-center gap-1 flex-1 py-1 transition-all text-slate-450 hover:text-red-500 cursor-pointer"
        >
          <LayoutDashboard className="w-5 h-5 text-red-500 hover:scale-110 transition-transform animate-pulse" />
          <span className="text-[10px] font-black text-red-600">{t('กลับหน้าหลักฟาร์ม', 'Farm Mode')}</span>
        </button>
      </nav>

      {/* 🚪 Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center space-y-4 border border-slate-100 dark:border-white/10 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-red-100 dark:bg-red-950/50 text-red-650 rounded-full flex items-center justify-center mx-auto">
              <LogOut className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">{t('ยืนยันออกจากระบบ?', 'Confirm Logout')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-450 mt-1">{t('คุณแน่ใจว่าต้องการออกจากระบบบัญชีแอดมิน?', 'Are you sure you want to sign out of the Admin portal?')}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                {t('ยกเลิก', 'Cancel')}
              </button>
              <button 
                onClick={handleLogout}
                className="py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md shadow-red-600/20 active:scale-95 transition-all cursor-pointer"
              >
                {t('ยืนยันออกจากระบบ', 'Sign Out')}
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminAddUserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onSuccess={() => {
          // Re-fetch users to update the list
          const fetchUsers = async () => {
            try {
              const token = localStorage.getItem('token');
              const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              const data = await res.json();
              if (res.ok) setUsers(data.data);
            } catch (err) {}
          };
          fetchUsers();
        }}
      />

      <AdminManageUserModal
        isOpen={selectedUserToManage !== null}
        onClose={() => setSelectedUserToManage(null)}
        user={selectedUserToManage}
        currentAdminUsername={currentAdminUsername}
        onSuccess={() => {
          // Re-fetch users to update the list and status
          const fetchUsers = async () => {
            try {
              const token = localStorage.getItem('token');
              const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              const data = await res.json();
              if (res.ok) setUsers(data.data);
            } catch (err) {}
          };
          fetchUsers();
          setSelectedUserToManage(null);
        }}
      />

      {/* Delete User Confirm Modal */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setDeleteConfirmUser(null)}>
          <div className="relative max-w-sm w-full bg-white dark:bg-slate-900 rounded-[2rem] p-8 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-6">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">ยืนยันการลบผู้ใช้งาน</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8 text-sm">
                คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้ <span className="font-bold text-red-500">"{deleteConfirmUser.username}"</span> ?<br/>การกระทำนี้จะไม่สามารถย้อนกลับได้
              </p>
              <div className="flex w-full gap-3">
                <button
                  onClick={() => setDeleteConfirmUser(null)}
                  className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={confirmDeleteUser}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                >
                  ยืนยันลบ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <SuccessModal 
        isOpen={successModal.isOpen} 
        onClose={() => setSuccessModal({ isOpen: false, message: '' })} 
        message={successModal.message} 
      />

    </div>
  );
}
