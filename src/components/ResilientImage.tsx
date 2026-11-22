import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function ResilientImage({ src, alt, className = '' }: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#FFF0F0] via-[#FFE1E2] to-[#FFDBD0] p-4 text-center text-[#5B4041] ${className}`}
      >
        <ShoppingBag className="h-8 w-8 text-[#95002A]" strokeWidth={1.75} aria-hidden="true" />
        <span className="max-w-[16ch] text-xs font-medium leading-snug text-[#271718]">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
