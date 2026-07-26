import { useLanguage } from "./language-provider"

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = () => {
    setLanguage(language === "th" ? "en" : "th")
  }

  return (
    <button
      onClick={toggleLanguage}
      className="inline-flex items-center justify-center rounded-full px-3 h-10 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none shadow-sm"
      aria-label="Toggle language"
    >
      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
        {language === "th" ? "TH" : "EN"}
      </span>
    </button>
  )
}
