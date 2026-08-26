import { useState } from 'react';
import { X, KeyRound, ShieldAlert, CheckCircle2, Eye, EyeOff, UserCog } from 'lucide-react';
import { useLanguage } from './LanguageContext';

interface UserItem {
  _id: string;
  name: string;
  username: string;
  email: string;
  role?: string;
  isBlocked?: boolean;
}

interface AdminManageUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserItem | null;
  currentAdminUsername?: string;
  onSuccess: () => void;
}

export default function AdminManageUserModal({ isOpen, onClose, user, currentAdminUsername, onSuccess }: AdminManageUserModalProps) {
  const { language } = useLanguage();
  const t = (th: string, en: string) => (language === 'th' ? th : en);

  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  if (!isOpen || !user) return null;

  const handleToggleBlock = async () => {
    setIsBlocking(true);
    setMessage({ text: '', type: '' });
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${user._id}/block`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isBlocked: !user.isBlocked })
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to update user block status');
      
      setMessage({ 
        text: !user.isBlocked 
          ? t('ระงับบัญชีผู้ใช้นี้เรียบร้อยแล้ว', 'User has been blocked') 
          : t('ปลดระงับบัญชีผู้ใช้นี้เรียบร้อยแล้ว', 'User has been unblocked'), 
        type: 'success' 
      });
      onSuccess();
    } catch (err: any) {
      setMessage({ text: err.message || 'Error updating status', type: 'error' });
    } finally {
      setIsBlocking(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setMessage({ text: t('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร', 'Password must be at least 8 characters long'), type: 'error' });
      return;
    }

    setIsChangingPassword(true);
    setMessage({ text: '', type: '' });
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${user._id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword })
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to change password');
      
      setMessage({ text: t('เปลี่ยนรหัสผ่านสำเร็จ', 'Password changed successfully'), type: 'success' });
      setNewPassword('');
    } catch (err: any) {
      setMessage({ text: err.message || 'Error changing password', type: 'error' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleToggleRole = async () => {
    setIsChangingRole(true);
    setMessage({ text: '', type: '' });
    try {
      const token = localStorage.getItem('token');
      const newRole = user.role === 'admin' ? 'user' : 'admin';
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${user._id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to change role');
      
      setMessage({ 
        text: newRole === 'admin' 
          ? t('ตั้งเป็นแอดมินรองเรียบร้อยแล้ว', 'Promoted to Admin successfully') 
          : t('ถอดสิทธิ์แอดมินรองเรียบร้อยแล้ว', 'Demoted to User successfully'), 
        type: 'success' 
      });
      onSuccess();
    } catch (err: any) {
      setMessage({ text: err.message || 'Error changing role', type: 'error' });
    } finally {
      setIsChangingRole(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
              {t('จัดการบัญชีผู้ใช้', 'Manage User Account')}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">@{user.username}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {message.text && (
            <div className={`p-3 rounded-xl text-xs font-bold border flex items-center gap-2 ${
              message.type === 'success' 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200/50' 
                : 'bg-red-50 text-red-600 border-red-200/50'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <ShieldAlert className="w-4 h-4 shrink-0" />}
              {message.text}
            </div>
          )}

          {/* Block/Unblock Section */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                user.isBlocked ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
              }`}>
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('สถานะการใช้งานบัญชี', 'Account Status')}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  {user.isBlocked 
                    ? t('บัญชีนี้ถูกระงับการใช้งานชั่วคราว ผู้ใช้จะไม่สามารถล็อกอินได้', 'This account is currently blocked. The user cannot log in.')
                    : t('บัญชีนี้สามารถใช้งานได้ตามปกติ', 'This account is active and can be used normally.')}
                </p>
                <button
                  onClick={handleToggleBlock}
                  disabled={isBlocking}
                  className={`mt-3 w-full py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                    user.isBlocked 
                      ? 'bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white'
                      : 'bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400'
                  }`}
                >
                  {isBlocking && <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>}
                  {!isBlocking && <ShieldAlert className="w-4 h-4" />}
                  {user.isBlocked ? t('ปลดระงับบัญชี (Unblock)', 'Unblock Account') : t('ระงับบัญชี (Block User)', 'Block Account')}
                </button>
              </div>
            </div>
          </div>

          {/* Change Password Section */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <KeyRound className="w-4 h-4 text-indigo-500" />
              {t('เปลี่ยนรหัสผ่านใหม่', 'Change Password')}
            </h4>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t('รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)', 'New password (min 8 chars)')}
                  className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1 rounded-md"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                type="submit"
                disabled={isChangingPassword || !newPassword}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-indigo-600/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isChangingPassword && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                {!isChangingPassword && <KeyRound className="w-4 h-4" />}
                {t('อัปเดตรหัสผ่าน', 'Update Password')}
              </button>
            </form>
          </div>

          {/* Super Admin Only: Role Management */}
          {currentAdminUsername === 'adminkaichon' && user.username !== 'adminkaichon' && (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  user.role === 'admin' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  <UserCog className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('จัดการสิทธิ์ (แอดมินรอง)', 'Role Management')}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    {user.role === 'admin' 
                      ? t('บัญชีนี้เป็นแอดมินรอง สามารถจัดการระบบได้', 'This account is an Admin and can manage the system.')
                      : t('บัญชีนี้เป็นผู้ใช้ทั่วไป', 'This account is a normal user.')}
                  </p>
                  <button
                    onClick={handleToggleRole}
                    disabled={isChangingRole}
                    className={`mt-3 w-full py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                      user.role === 'admin'
                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-700 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 dark:text-amber-400'
                        : 'bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400'
                    }`}
                  >
                    {isChangingRole && <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>}
                    {!isChangingRole && <UserCog className="w-4 h-4" />}
                    {user.role === 'admin' ? t('ถอดสิทธิ์แอดมินรอง', 'Demote to User') : t('ตั้งเป็นแอดมินรอง', 'Promote to Admin')}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
