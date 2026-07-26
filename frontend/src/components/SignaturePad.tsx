import React, { useRef, useState, useEffect } from 'react';
import { Eraser } from 'lucide-react';

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  onClear: () => void;
  initialImage?: string;
  className?: string;
}

export default function SignaturePad({ onSave, onClear, initialImage, className = '' }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && initialImage) {
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        setHasDrawn(true);
      };
      img.src = initialImage;
    }
  }, [initialImage]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Prevent scrolling while drawing on mobile
    if ('touches' in e) {
      // We can't e.preventDefault() here easily in React without passive:false, but touch-action:none handles it usually
    }

    const { x, y } = getCoordinates(e);

    ctx.lineTo(x, y);
    ctx.strokeStyle = '#d97706'; // amber-600 to look like a gold/orange pen
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    // Auto-save on stop drawing
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
      onClear();
    }
  };

  return (
    <div className={`flex flex-col gap-2 w-full ${className}`}>
      <div className="border-2 border-dashed border-amber-500/30 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800/50 cursor-crosshair relative touch-none shadow-inner">
        {!hasDrawn && !isDrawing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
            <span className="text-slate-400 font-medium" style={{ fontFamily: "'Charm', cursive", fontSize: '1.5rem' }}>เซ็นชื่อที่นี่...</span>
          </div>
        )}
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          className="w-full h-[150px] object-contain"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {hasDrawn && (
          <button 
            type="button" 
            onClick={clearCanvas}
            className="absolute bottom-2 right-2 flex items-center gap-1 text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded hover:bg-red-200 transition-colors"
          >
            <Eraser className="w-3 h-3" /> ล้าง
          </button>
        )}
      </div>
      <p className="text-[10px] text-slate-500 text-center">ใช้นิ้วหรือเมาส์วาดลายเซ็นของคุณลงในกรอบด้านบน เพื่อใช้ประทับในใบเซอร์</p>
    </div>
  );
}
