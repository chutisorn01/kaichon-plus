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

const renderBloodlineSegment = (text: string) => {
  const bloodlines = text.split('+').map(b => b.trim()).filter(Boolean);
  if (bloodlines.length <= 1) {
    return <span className="font-semibold text-slate-800 dark:text-slate-100">{text}</span>;
  }

  return (
    <span className="inline-flex items-center flex-wrap gap-0.5 px-2 py-0.5 bg-slate-100 dark:bg-slate-800/90 rounded-lg border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 my-0.5">
      {bloodlines.map((blood, bIdx) => (
        <span key={bIdx} className="inline-flex items-center">
          {bIdx > 0 && <span className="text-red-500 font-bold text-xs mx-1 select-none">+</span>}
          <span>{blood}</span>
        </span>
      ))}
    </span>
  );
};

export function FormatOptionLabel({ label }: { label: string }) {
  if (!label) return null;
  const parts = label.split(' - ');
  if (parts.length <= 1) {
    return renderBloodlineSegment(label);
  }

  return (
    <span className="inline-flex items-center flex-wrap gap-1.5 min-w-0">
      {parts.map((part, index) => {
        // 1. Code part (e.g. M001 or F001 - first part if short)
        if (index === 0 && (part.length <= 12 || (!part.includes('+') && !part.includes(' ')))) {
          return (
            <span key={index} className="font-mono text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-200/80 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-300/50 dark:border-slate-700 shrink-0">
              {part}
            </span>
          );
        }

        // 2. Farm / Owner Suffix (e.g. กมล, ส.สิบทิศ - last part)
        if (index === parts.length - 1 && index > 0) {
          return (
            <span key={index} className="inline-flex items-center gap-1 shrink-0">
              <span className="text-slate-400 font-normal text-xs">-</span>
              <span className="px-1.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 rounded-md border border-amber-200/80 dark:border-amber-800/40">
                {part}
              </span>
            </span>
          );
        }

        // 3. Main Name / Bloodlines (e.g. ทันใจ+กุมารจีน+มหานคร+แดงเล็ก+ปลาเงิน+ถุงเงิน)
        return (
          <span key={index} className="inline-flex items-center gap-1">
            {index > 0 && <span className="text-slate-400 font-normal text-xs mr-0.5">-</span>}
            {renderBloodlineSegment(part)}
          </span>
        );
      })}
    </span>
  );
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
            {selectedOption ? <FormatOptionLabel label={selectedOption.label} /> : placeholder}
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
                  <div className="flex items-center gap-2 min-w-0">
                    {opt.colorCode && (
                      <span className={`w-3.5 h-3.5 rounded-full border border-black/10 dark:border-white/20 shrink-0 ${opt.colorCode}`} />
                    )}
                    <FormatOptionLabel label={opt.label} />
                  </div>
                  {value === opt.value && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
