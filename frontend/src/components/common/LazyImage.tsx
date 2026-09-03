import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyImageProps {
  url: string;
  alt: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
}

export const LazyImage: React.FC<LazyImageProps> = ({ 
  url, 
  alt, 
  className = "", 
  fallbackIcon
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl z-10">
          <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
        </div>
      )}
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-2xl z-10">
          {fallbackIcon || <span className="text-xs text-slate-400">ไม่มีรูป</span>}
        </div>
      ) : (
        <img 
          src={url} 
          alt={alt} 
          className={`w-full h-full object-cover transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`} 
          loading="lazy"
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
        />
      )}
    </div>
  );
};
