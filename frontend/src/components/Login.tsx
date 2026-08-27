import { useState } from 'react';
import { Swords, Eye, EyeOff } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import SuccessModal from './ui/SuccessModal';

export default function Login({ onNavigate }: { onNavigate: (page: any) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  const handleGoogleAuth = async (email: string, name: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });
      
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'ไม่สามารถเข้าสู่ระบบด้วย Google ได้');
        return;
      }

      localStorage.setItem('token', data.token);
      setShowGoogleModal(false);
      setShowSuccess(true);
    } catch (err) {
      setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
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
        <div className="text-center group cursor-pointer" onClick={() => onNavigate('home')}>
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
                  href="https://line.me/ti/p/~your_line_id" 
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

            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowGoogleModal(true)}
                className="w-full inline-flex justify-center items-center py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/30 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white transition-all group shadow-sm cursor-pointer"
              >
                <div className="bg-white p-1 rounded-full mr-3 group-hover:scale-110 transition-transform shadow-sm">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </div>
                <span>เข้าสู่ระบบด้วย Google</span>
              </button>
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

      {/* Google Account Selector Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-white/10 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">เลือกบัญชี Google เพื่อดำเนินการต่อ</h3>
              <p className="text-xs text-slate-500">ไปที่แอปพลิเคชัน KaiChon Plus</p>
            </div>

            <div className="space-y-2 pt-2">
              <button 
                onClick={() => handleGoogleAuth('chutisorn.farm@gmail.com', 'ฟาร์มชุติศรณ์')}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-left flex items-center gap-3 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                  ช
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">ฟาร์มชุติศรณ์ (chutisorn.farm@gmail.com)</div>
                  <div className="text-[10px] text-slate-400">เข้าสู่ระบบด้วย Google Account</div>
                </div>
              </button>

              <button 
                onClick={() => handleGoogleAuth('gosem.farm@gmail.com', 'โกเซ้ม ฟาร์ม')}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-left flex items-center gap-3 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                  ก
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">โกเซ้ม ฟาร์ม (gosem.farm@gmail.com)</div>
                  <div className="text-[10px] text-slate-400">เข้าสู่ระบบด้วย Google Account</div>
                </div>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-500">หรือใช้อีเมล Google อื่นๆ</div>
              <input 
                type="email"
                placeholder="your.email@gmail.com"
                value={customGoogleEmail}
                onChange={(e) => setCustomGoogleEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:border-red-500 font-bold"
              />
              <input 
                type="text"
                placeholder="ชื่อซุ้ม/ฟาร์ม (ไม่ระบุก็ได้)"
                value={customGoogleName}
                onChange={(e) => setCustomGoogleName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:border-red-500 font-bold"
              />
              <button
                onClick={() => {
                  if (!customGoogleEmail.trim()) return alert('กรุณาระบุอีเมล Google');
                  handleGoogleAuth(customGoogleEmail.trim(), customGoogleName.trim());
                }}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md shadow-red-600/20 active:scale-95 transition-all cursor-pointer"
              >
                เข้าสู่ระบบด้วยอีเมลนี้ ➔
              </button>
            </div>

            <button 
              onClick={() => setShowGoogleModal(false)}
              className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold rounded-xl text-xs cursor-pointer hover:bg-slate-200 transition-colors"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
