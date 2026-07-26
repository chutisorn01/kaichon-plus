import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
  colorCode?: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
}

export function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = 'เลือกรายการ',
  className = '',
  buttonClassName = '',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opt.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          if (isOpen) {
            setSearchQuery('');
          }
          setIsOpen(!isOpen);
        }}
        className={buttonClassName || "w-full p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-white/5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm flex items-center justify-between text-left font-bold transition-all"}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.colorCode && (
            <span className={`w-3.5 h-3.5 rounded-full border border-black/10 dark:border-white/20 shrink-0 ${selectedOption.colorCode}`} />
          )}
          <span className={selectedOption ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Options List */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl animate-in fade-in zoom-in-95 duration-100 flex flex-col overflow-hidden max-h-72">
          {options.length >= 5 && (
            <div className="p-2 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/30">
              <input
                type="text"
                placeholder="ค้นหา..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-750 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                onClick={e => e.stopPropagation()}
              />
            </div>
          )}
          <ul className="overflow-y-auto py-1 max-h-48">
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-2.5 text-xs text-slate-400 text-center">ไม่พบผลการค้นหา</li>
            ) : (
              filteredOptions.map(opt => (
                <li
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  className={`px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                    value === opt.value
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {opt.colorCode && (
                      <span className={`w-3.5 h-3.5 rounded-full border border-black/10 dark:border-white/20 shrink-0 ${opt.colorCode}`} />
                    )}
                    <span>{opt.label}</span>
                  </div>
                  {value === opt.value && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
