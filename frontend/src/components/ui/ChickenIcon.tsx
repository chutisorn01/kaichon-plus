import React from 'react';
import { Swords } from 'lucide-react';

interface ChickenIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export function ChickenIcon({ className = '', size = 24, ...props }: ChickenIconProps) {
  return (
    <Swords size={size} className={`inline-block ${className}`} {...(props as any)} />
  );
}
