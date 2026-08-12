import React from 'react';
import { useLanguage } from './LanguageContext';
import { Globe } from 'lucide-react';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'th' ? 'en' : 'th')}
      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all focus:outline-none cursor-pointer shadow-xs active:scale-95"
      title={language === 'th' ? 'สลับเป็น ภาษาอังกฤษ (English)' : 'Switch to Thai (ภาษาไทย)'}
    >
      <Globe className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
      <span className="uppercase tracking-wider font-mono font-black">
        {language === 'th' ? 'TH 🇹🇭' : 'EN 🇬🇧'}
      </span>
    </button>
  );
}
