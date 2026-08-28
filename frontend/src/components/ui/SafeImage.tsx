import React, { useState, useEffect } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({ src, className, alt, ...props }) => {
  const [base64Src, setBase64Src] = useState<string | null>(null);

  useEffect(() => {
    if (!src) return;
    
    // If it's already a data URL, just use it
    if (src.startsWith('data:')) {
      setBase64Src(src);
      return;
    }

    let isMounted = true;
    
    // Fetch image and convert to base64 to bypass iOS Safari Canvas CORS bugs
    fetch(src, { mode: 'cors' })
      .then(res => res.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (isMounted) setBase64Src(reader.result as string);
        };
        reader.readAsDataURL(blob);
      })
      .catch(err => {
        console.error("SafeImage fetch error:", err);
        // Fallback to original src if fetch fails
        if (isMounted) setBase64Src(src);
      });

    return () => { isMounted = false; };
  }, [src]);

  if (!base64Src) {
    return <div className={`animate-pulse bg-slate-800 ${className}`}></div>;
  }

  return <img src={base64Src} className={className} alt={alt} {...props} />;
};
