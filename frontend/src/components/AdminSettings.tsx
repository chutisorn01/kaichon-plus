import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { Settings, Save, Download, AlertTriangle, UserPlus, CheckCircle2, XCircle } from 'lucide-react';

interface SystemSettings {
  isRegistrationOpen: boolean;
}

export default function AdminSettings() {
  const { language } = useLanguage();
  const [settings, setSettings] = useState<SystemSettings>({ isRegistrationOpen: true });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const t = (th: string, en: string) => (language === 'th' ? th : en);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setSettings(data.data);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRegistration = async () => {
    setIsSaving(true);
    setMessage({ text: '', type: '' });
    try {
      const token = localStorage.getItem('token');
      const newValue = !settings.isRegistrationOpen;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/settings`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isRegistrationOpen: newValue })
      });
      
      if (!response.ok) throw new Error('Failed to update settings');
      
      setSettings({ ...settings, isRegistrationOpen: newValue });
      setMessage({ 
        text: t('บันทึกการตั้งค่าสำเร็จ', 'Settings saved successfully'), 
        type: 'success' 
      });
      
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err: any) {
      setMessage({ text: err.message || 'Error updating settings', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackupData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/backup`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to backup data');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kaichon-plus-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (err: any) {
      alert(t('เกิดข้อผิดพลาดในการสำรองข้อมูล', 'Error backing up data'));
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-8 h-8 border-4 border-indigo-650 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-8 shadow-xs border border-slate-200/50 dark:border-white/5 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Settings className="w-6 h-6 text-indigo-500" />
              {t('ตั้งค่าระบบ', 'System Settings')}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {t('จัดการการเปิด/ปิดรับสมัครสมาชิก และสำรองข้อมูลฐานข้อมูล', 'Manage registration access and database backups')}
            </p>
          </div>
          {message.text && (
            <div className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-300 ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/50' : 'bg-red-50 text-red-600 border border-red-200/50'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {message.text}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Registration Toggle Panel */}
          <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
                settings.isRegistrationOpen 
                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
              }`}>
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {t('ระบบสมัครสมาชิก', 'Registration System')}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {settings.isRegistrationOpen 
                    ? t('ขณะนี้ระบบเปิดให้บุคคลภายนอกสามารถสมัครสมาชิกได้ตามปกติ', 'The system is currently open for new public registrations.') 
                    : t('ขณะนี้ระบบปิดรับสมัครสมาชิกใหม่ บุคคลภายนอกไม่สามารถสมัครได้', 'Public registration is currently closed. New users cannot sign up.')}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200/50 dark:border-slate-700/50 flex justify-end">
              <button
                onClick={handleToggleRegistration}
                disabled={isSaving}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.98] flex items-center gap-2 shadow-md ${
                  settings.isRegistrationOpen
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                } ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {settings.isRegistrationOpen ? t('ปิดรับสมัครสมาชิก', 'Close Registration') : t('เปิดรับสมัครสมาชิก', 'Open Registration')}
              </button>
            </div>
          </div>

          {/* Backup Panel */}
          <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-6 space-y-4 flex flex-col">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {t('สำรองข้อมูล (Data Backup)', 'Data Backup')}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {t('ดาวน์โหลดข้อมูลทั้งหมดในระบบ (Users, Fathers, Promotions, VIP) ออกมาเป็นไฟล์ JSON เพื่อเก็บเป็นข้อมูลสำรอง (Backup)', 'Download all database records as a JSON file for safekeeping.')}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded-lg border border-amber-200/50 dark:border-amber-900/30 w-fit">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {t('แนะนำให้สำรองข้อมูลสัปดาห์ละ 1 ครั้ง', 'Recommended: Backup once a week')}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200/50 dark:border-slate-700/50 flex justify-end mt-auto">
              <button
                onClick={handleBackupData}
                className="px-5 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.98] flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20"
              >
                <Download className="w-4 h-4" />
                {t('ดาวน์โหลด Backup', 'Download Backup')}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
