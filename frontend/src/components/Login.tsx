import { useState, useEffect } from 'react';
import { Swords, Eye, EyeOff } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import SuccessModal from './ui/SuccessModal';
import { GoogleLogin } from '@react-oauth/google';

export default function Login({ onNavigate }: { onNavigate: (page: any) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [adminLineUrl, setAdminLineUrl] = useState('https://line.me/ti/p/~your_line_id');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/settings`);
      const data = await response.json();
      if (response.ok && data.data?.adminLineUrl) {
        setAdminLineUrl(data.data.adminLineUrl);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Google login failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.message || 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
        return;
      }
      
      localStorage.setItem('token', data.token);
      setShowSuccess(true);
      // SuccessModal will automatically call onClose after 2.8s
    } catch (err) {
      setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-red-50 to-white dark:from-slate-900 dark:via-red-950 dark:to-black flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden transition-colors duration-500">
      
      <SuccessModal 
        isOpen={showSuccess} 
        onClose={() => onNavigate('dashboard')} 
        message="ยินดีต้อนรับเข้าสู่ระบบ KaiChon Plus"
      />
      <div className="absolute top-6 right-4 sm:top-8 sm:right-8 z-50 flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      {/* Back Button */}
      <button 
        onClick={() => onNavigate('home')}
        className="absolute top-6 left-4 sm:top-8 sm:left-8 inline-flex items-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors z-50 group bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm py-2 px-3 rounded-full border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-slate-800/80 shadow-sm"
      >
        <svg className="w-4 h-4 mr-1.5 transform transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        กลับหน้าแรก
      </button>

      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-red-400 dark:bg-red-600 rounded-full mix-blend-multiply dark:mix-blend-multiply filter blur-[128px] opacity-40 dark:opacity-40 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-orange-400 dark:bg-orange-600 rounded-full mix-blend-multiply dark:mix-blend-multiply filter blur-[128px] opacity-30 dark:opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center group cursor-pointer" onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); onNavigate('home'); }}>
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl shadow-lg shadow-red-500/30 mb-4 transform transition-transform group-hover:scale-105">
            <Swords className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-slate-800 dark:from-white dark:to-slate-300 drop-shadow-sm tracking-tight">
            KaiChon Plus
          </h2>
          <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-400">
            เข้าสู่ระบบเพื่อจัดการประวัติไก่ชนระดับพรีเมียม
          </p>
        </div>
      </div>

      <div className="mt-8 w-full max-w-md mx-auto relative z-10">
        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl py-10 px-6 sm:px-8 shadow-2xl rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/10 relative overflow-hidden transition-colors duration-500">
          
          <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-center animate-in fade-in slide-in-from-top-2">
                <svg className="w-5 h-5 text-red-500 dark:text-red-400 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-600 dark:text-red-200">{error}</p>
              </div>
            )}
            
            <div className="space-y-1">
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                ชื่อผู้ใช้งาน
              </label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl blur opacity-0 group-focus-within:opacity-30 transition duration-500"></div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(''); }}
                  className="relative block w-full px-4 py-3 bg-white dark:bg-slate-950/50 border border-slate-300 dark:border-slate-700/50 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all sm:text-sm"
                  placeholder="ป้อนชื่อผู้ใช้งานของคุณ"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                รหัสผ่าน
              </label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl blur opacity-0 group-focus-within:opacity-30 transition duration-500"></div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="relative block w-full pl-4 pr-12 py-3 bg-white dark:bg-slate-950/50 border border-slate-300 dark:border-slate-700/50 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all sm:text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 z-20 p-1.5 rounded-lg transition-colors cursor-pointer"
                  title={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 rounded text-red-600 focus:ring-red-500 focus:ring-offset-white dark:focus:ring-offset-slate-900 transition-colors cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                  จดจำฉันไว้
                </label>
              </div>

              <div className="text-sm">
                <a 
                  href={adminLineUrl}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 transition-colors"
                >
                  ลืมรหัสผ่าน?
                </a>
              </div>
            </div>

            <div>
              <button 
                type="submit" 
                className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-lg shadow-red-600/20 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 focus:ring-red-500 transform transition-all active:scale-[0.98]"
              >
                เข้าสู่ระบบ
              </button>
            </div>
          </form>

          <div className="mt-8 relative z-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest">
                <span className="px-3 bg-white dark:bg-slate-900/60 text-slate-500">หรือ</span>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Login Failed')}
                theme="outline"
                size="large"
                shape="pill"
                text="continue_with"
                locale="th"
              />
            </div>
          </div>
          
          <div className="mt-8 text-center text-sm relative z-10">
            <span className="text-slate-500 dark:text-slate-400">ยังไม่มีบัญชีผู้ใช้อีกเหรอ? </span>
            <button onClick={() => onNavigate('register')} className="font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors">
              ลงทะเบียนที่นี่
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
