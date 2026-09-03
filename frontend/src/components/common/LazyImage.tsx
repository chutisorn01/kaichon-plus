import React, { useState, useEffect } from 'react';
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
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    
    const fetchImage = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!res.ok) {
          throw new Error('Failed to fetch image');
        }
        
        const data = await res.json();
        if (isMounted) {
          if (data.image) {
            setImageSrc(data.image);
          } else {
            setError(true);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
    };
  }, [url]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 dark:bg-slate-800 animate-pulse ${className}`}>
        <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (error || !imageSrc) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 dark:bg-slate-800 ${className}`}>
        {fallbackIcon || <span className="text-xs text-slate-400">ไม่มีรูป</span>}
      </div>
    );
  }

  return (
    <img 
      src={imageSrc} 
      alt={alt} 
      className={className} 
      loading="lazy" 
    />
  );
};
