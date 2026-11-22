import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

const SIMULATED_UPDATES = [
  'Maya in Mission just ordered Sichuan Truffle Chili Crisp · 12 min ETA',
  'Dev near Campus Quad grabbed 2 AM Ramen Club Kit · 14 min ETA',
  'Zoe in Williamsburg ordered Sparkling Matcha Yuzu Tonic · 11 min ETA',
  'Ari in Silver Lake unlocked free 15-min delivery on Drop #042',
  'Kian in SoHo added Hibiscus & Matcha Mochi · 13 min ETA',
  'Nadia on Oak St just ordered Country Sourdough & Butter · 15 min ETA',
  'Rohan near Northgate grabbed Salted Cream Cold Brew · 10 min ETA',
  'Talia in Midtown ordered Midnight Crunch Snack Pack · 14 min ETA',
];

const TICKER_INTERVAL_MS = 30_000;

export function LiveDeliveryTicker() {
  const [updateIdx, setUpdateIdx] = useState(() =>
    Math.floor(Math.random() * SIMULATED_UPDATES.length)
  );
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    let fadeTimeout: number | undefined;
    const interval = window.setInterval(() => {
      setIsTransitioning(true);
      fadeTimeout = window.setTimeout(() => {
        setUpdateIdx((prev) => {
          let next = Math.floor(Math.random() * SIMULATED_UPDATES.length);
          if (next === prev) {
            next = (prev + 1) % SIMULATED_UPDATES.length;
          }
          return next;
        });
        setIsTransitioning(false);
      }, 150);
    }, TICKER_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
      if (fadeTimeout !== undefined) {
        window.clearTimeout(fadeTimeout);
      }
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-0 z-40 border-b border-white/10 bg-[#271718] text-[#FFF8F7]"
    >
      <div className="mx-auto flex h-8 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <Zap className="h-3.5 w-3.5 shrink-0 text-[#B9F079]" aria-hidden="true" />
          <p
            className={`truncate text-xs font-medium tracking-wide transition-opacity duration-150 ${
              isTransitioning ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {SIMULATED_UPDATES[updateIdx]}
          </p>
        </div>
        <span className="hidden shrink-0 font-mono text-[11px] font-semibold text-[#B9F079] tabular-nums sm:inline">
          15-min delivery till 2 AM
        </span>
      </div>
    </div>
  );
}
