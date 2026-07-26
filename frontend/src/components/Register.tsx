import { useState } from 'react';
import { Swords } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import SuccessModal from './ui/SuccessModal';

export default function Register({ onNavigate }: { onNavigate: (page: any) => void }) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !email || !password || !confirmPassword) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    if (password.length < 8) {
      setError('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษรเพื่อความปลอดภัย');
      return;
    }
    if (password !== confirmPassword) {
      setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.message || 'ไม่สามารถสมัครสมาชิกได้ โปรดลองอีกครั้ง');
        return;
      }
      
      localStorage.setItem('token', data.token);
      setShowSuccess(true);
      setTimeout(() => {
        onNavigate('dashboard');
      }, 2800);
    } catch (err) {
      setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-tr from-slate-50 via-red-50 to-white dark:from-slate-900 dark:via-red-950 dark:to-black flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden transition-colors duration-500">
      
      <SuccessModal 
        isOpen={showSuccess} 
        onClose={() => onNavigate('home')} 
        message="สมัครสมาชิกสำเร็จ! เริ่มต้นจัดการประวัติไก่ได้เลย"
      />
      <div className="absolute top-6 right-4 sm:top-8 sm:right-8 z-50">
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
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 sm:w-96 sm:h-96 bg-red-400 dark:bg-red-600 rounded-full mix-blend-multiply dark:mix-blend-multiply filter blur-[96px] sm:blur-[128px] opacity-40 dark:opacity-40 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 sm:w-96 sm:h-96 bg-orange-400 dark:bg-orange-600 rounded-full mix-blend-multiply dark:mix-blend-multiply filter blur-[96px] sm:blur-[128px] opacity-30 dark:opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md mx-auto relative z-10 mb-6 sm:mb-8">
        <div className="text-center group cursor-pointer" onClick={() => onNavigate('home')}>
          <div className="inline-flex items-center justify-center p-3 bg-linear-to-br from-red-500 to-orange-600 rounded-2xl shadow-lg shadow-red-500/30 mb-3 sm:mb-4 transform transition-transform group-hover:scale-105">
            <Swords className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-red-600 to-slate-800 dark:from-white dark:to-slate-300 drop-shadow-sm tracking-tight">
            KaiChon Plus
          </h2>
          <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">
            ลงทะเบียนเพื่อเข้าถึงระบบจัดการไก่ชนแบบครบวงจร
          </p>
        </div>
      </div>

      <div className="w-full max-w-md mx-auto relative z-10">
        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl py-8 px-6 sm:py-10 sm:px-8 shadow-2xl rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/10 relative overflow-hidden transition-colors duration-500">
          
          <form className="space-y-5 relative z-10" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-3 flex items-center animate-in fade-in slide-in-from-top-2">
                <svg className="w-5 h-5 text-red-500 dark:text-red-400 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-600 dark:text-red-200">{error}</p>
              </div>
            )}
            
            <div className="space-y-1">
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">ชื่อ - นามสกุล</label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl blur opacity-0 group-focus-within:opacity-30 transition duration-500"></div>
                <input
                  id="name" name="name" type="text" required
                  value={name} onChange={(e) => { setName(e.target.value); setError(''); }}
                  className="relative block w-full px-4 py-2.5 bg-white dark:bg-slate-950/50 border border-slate-300 dark:border-slate-700/50 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all sm:text-sm"
                  placeholder="สมชาย ใจสู้"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">ชื่อผู้ใช้งาน (Username)</label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl blur opacity-0 group-focus-within:opacity-30 transition duration-500"></div>
                <input
                  id="username" name="username" type="text" required
                  value={username} onChange={(e) => { setUsername(e.target.value); setError(''); }}
                  className="relative block w-full px-4 py-2.5 bg-white dark:bg-slate-950/50 border border-slate-300 dark:border-slate-700/50 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all sm:text-sm"
                  placeholder="somchai99"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">อีเมล</label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl blur opacity-0 group-focus-within:opacity-30 transition duration-500"></div>
                <input
                  id="email" name="email" type="email" required
                  value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className="relative block w-full px-4 py-2.5 bg-white dark:bg-slate-950/50 border border-slate-300 dark:border-slate-700/50 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all sm:text-sm"
                  placeholder="somchai@example.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">รหัสผ่าน</label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl blur opacity-0 group-focus-within:opacity-30 transition duration-500"></div>
                <input
                  id="password" name="password" type="password" required
                  value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="relative block w-full px-4 py-2.5 bg-white dark:bg-slate-950/50 border border-slate-300 dark:border-slate-700/50 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all sm:text-sm"
                  placeholder="อย่างน้อย 8 ตัวอักษร"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">ยืนยันรหัสผ่าน</label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl blur opacity-0 group-focus-within:opacity-30 transition duration-500"></div>
                <input
                  id="confirmPassword" name="confirmPassword" type="password" required
                  value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                  className="relative block w-full px-4 py-2.5 bg-white dark:bg-slate-950/50 border border-slate-300 dark:border-slate-700/50 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all sm:text-sm"
                  placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                />
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-lg shadow-red-600/20 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 focus:ring-red-500 transform transition-all active:scale-[0.98]"
              >
                สร้างบัญชีผู้ใช้
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm relative z-10">
            <span className="text-slate-500 dark:text-slate-400">มีบัญชีอยู่แล้วใช่ไหม? </span>
            <button onClick={() => onNavigate('login')} className="font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors">
              เข้าสู่ระบบเลย
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
