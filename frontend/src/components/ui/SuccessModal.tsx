import React, { useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export default function SuccessModal({ isOpen, onClose, message }: SuccessModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for exit animation
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen && !isVisible) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
      ></div>

      {/* Modal Content */}
      <div className={`relative bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-2xl border border-white/20 dark:border-white/10 max-w-sm w-full transform transition-all duration-500 scale-100 ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95'}`}>
        <div className="flex flex-col items-center text-center">
          {/* Success Icon Animation */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping scale-150 opacity-20"></div>
            <div className="relative bg-gradient-to-br from-green-400 to-emerald-600 rounded-full p-4 shadow-lg shadow-green-500/30">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
          </div>

          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
            สำเร็จแล้ว!
          </h3>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            {message}
          </p>

          <div className="mt-8 w-full">
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-green-500 transition-all duration-[2500ms] ease-linear"
                    style={{ width: isVisible ? '100%' : '0%' }}
                ></div>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
