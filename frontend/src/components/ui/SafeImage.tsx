import React, { useState, useEffect } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({ src, className, alt, crossOrigin, ...props }) => {
  const [base64Src, setBase64Src] = useState<string | null>(null);

  useEffect(() => {
    if (!src) return;
    
    let isMounted = true;

    const processImage = (imageSrc: string) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // iOS Safari html-to-image crashes if base64 images are too large.
        // Limit max dimensions to 1000px and compress to JPEG.
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width > height) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          } else {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85); // 85% quality JPEG
            if (isMounted) setBase64Src(compressedBase64);
            return;
          }
        }
        
        // If already small enough or canvas fails
        if (isMounted) setBase64Src(imageSrc);
      };
      img.onerror = () => {
        if (isMounted) setBase64Src(imageSrc);
      };
      img.src = imageSrc;
    };

    if (src.startsWith('data:')) {
      processImage(src);
      return;
    }

    // Fetch external URL to bypass Canvas CORS issues, then compress
    fetch(src, { mode: 'cors' })
      .then(res => res.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          processImage(reader.result as string);
        };
        reader.readAsDataURL(blob);
      })
      .catch(err => {
        console.error("SafeImage fetch error:", err);
        if (isMounted) processImage(src);
      });

    return () => { isMounted = false; };
  }, [src]);

  if (!base64Src) {
    return <div className={`animate-pulse bg-slate-800 ${className}`}></div>;
  }

  return <img src={base64Src} className={className} alt={alt} {...props} />;
};
