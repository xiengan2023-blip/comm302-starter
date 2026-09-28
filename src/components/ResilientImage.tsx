import React, { useState } from 'react';
import { BarChart2 } from 'lucide-react';

interface ResilientImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export const ResilientImage: React.FC<ResilientImageProps> = ({
  src,
  alt,
  className = '',
  fallbackLabel
}) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#131722] via-[#181F2E] to-[#0B0E14] text-[#94A3B8] select-none ${className}`}
        role="img"
        aria-label={alt}
      >
        <BarChart2 className="w-7 h-7 text-[#2962FF] mb-2 opacity-80" />
        <span className="text-xs font-medium tracking-tight text-[#CBD5E1] px-4 text-center line-clamp-1">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
