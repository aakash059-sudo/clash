import { ShoppingBag } from 'lucide-react';
import type { AisleCategory } from '../types/grocery';
import { LiveDeliveryTicker } from './LiveDeliveryTicker';

interface HeaderProps {
  bagCount: number;
  onGoHome: () => void;
  onSelectAisle: (aisle: AisleCategory) => void;
  onJumpToBundles: () => void;
  onOpenBag: () => void;
}

export function Header({
  bagCount,
  onGoHome,
  onSelectAisle,
  onJumpToBundles,
  onOpenBag,
}: HeaderProps) {
  return (
    <>
      <LiveDeliveryTicker />

      <header className="sticky top-8 z-30 border-b border-[#E3BDBF] bg-[#FFF8F7]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6">
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={onGoHome}
            className="flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#95002A]"
          >
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#95002A] text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M15.5 6.5C15.5 5.1 14.1 4 12 4C9.7 4 8 5.4 8 7.3C8 9.2 9.6 10.1 12.2 10.8C14.7 11.5 16.5 12.6 16.5 15.2C16.5 17.8 14.4 19.5 11.6 19.5C8.8 19.5 6.8 18 6.5 15.8H9.5C9.8 16.7 10.6 17.2 11.7 17.2C13 17.2 13.8 16.5 13.8 15.4C13.8 14.2 12.9 13.5 10.6 12.9C7.9 12.2 5.4 10.9 5.4 7.5C5.4 4.3 8.1 2 11.9 2C15.4 2 18 3.9 18.2 6.5H15.5Z"
                  fill="currentColor"
                />
                <circle cx="19" cy="18.5" r="2.2" fill="#B9F079" />
              </svg>
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight text-[#271718]">
              Swaad &amp; Swag
            </span>
          </button>

          {/* Zone 2: 4 Concise Single-Line Aisle Links */}
          <nav aria-label="Primary aisles" className="hidden items-center gap-7 md:flex">
            <button
              type="button"
              onClick={() => onSelectAisle('Viral Pantry')}
              className="whitespace-nowrap shrink-0 text-sm font-semibold text-[#5B4041] underline-offset-4 transition-colors duration-150 hover:text-[#95002A] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#95002A]"
            >
              Viral Pantry
            </button>
            <button
              type="button"
              onClick={() => onSelectAisle('Late-Night Snacks')}
              className="whitespace-nowrap shrink-0 text-sm font-semibold text-[#5B4041] underline-offset-4 transition-colors duration-150 hover:text-[#95002A] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#95002A]"
            >
              Late-Night
            </button>
            <button
              type="button"
              onClick={() => onSelectAisle('Fresh & Staples')}
              className="whitespace-nowrap shrink-0 text-sm font-semibold text-[#5B4041] underline-offset-4 transition-colors duration-150 hover:text-[#95002A] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#95002A]"
            >
              Fresh Produce
            </button>
            <button
              type="button"
              onClick={onJumpToBundles}
              className="whitespace-nowrap shrink-0 text-sm font-semibold text-[#5B4041] underline-offset-4 transition-colors duration-150 hover:text-[#95002A] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#95002A]"
            >
              Meal Kits
            </button>
          </nav>

          {/* Zone 3: Single Primary Bag CTA */}
          <div className="flex shrink-0 items-center">
            <button
              type="button"
              onClick={onOpenBag}
              aria-label={`Open shopping bag, ${bagCount} items`}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#95002A] px-4 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#BE123C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#95002A]"
            >
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              <span>Bag</span>
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[#B9F079] px-1.5 py-0.5 font-mono text-xs font-semibold text-[#1E3700] tabular-nums">
                {bagCount}
              </span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
