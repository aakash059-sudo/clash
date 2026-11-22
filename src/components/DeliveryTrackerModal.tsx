import { useEffect, useMemo, useState } from 'react';
import { Bike, CheckCircle2, MapPin, Navigation, RotateCcw, Store, X } from 'lucide-react';
import type { OrderReceipt } from '../types/grocery';

interface DeliveryTrackerModalProps {
  isOpen: boolean;
  receipt: OrderReceipt | null;
  onClose: () => void;
}

interface Point {
  x: number;
  y: number;
}

const ROUTE_POINTS: Point[] = [
  { x: 84, y: 258 },
  { x: 218, y: 258 },
  { x: 218, y: 162 },
  { x: 404, y: 162 },
  { x: 404, y: 88 },
  { x: 544, y: 88 },
];

function computeRouteMetrics(points: Point[]) {
  const segmentLengths: number[] = [];
  let totalLength = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;
    const len = Math.hypot(dx, dy);
    segmentLengths.push(len);
    totalLength += len;
  }
  return { segmentLengths, totalLength };
}

function getPositionAlongRoute(
  points: Point[],
  segmentLengths: number[],
  totalLength: number,
  progress: number
): { point: Point; angleDeg: number } {
  const clamped = Math.max(0, Math.min(1, progress));
  let targetDist = clamped * totalLength;

  for (let i = 0; i < segmentLengths.length; i++) {
    const segLen = segmentLengths[i];
    if (targetDist <= segLen || i === segmentLengths.length - 1) {
      const t = segLen === 0 ? 0 : Math.min(1, targetDist / segLen);
      const start = points[i];
      const end = points[i + 1];
      return {
        point: {
          x: start.x + (end.x - start.x) * t,
          y: start.y + (end.y - start.y) * t,
        },
        angleDeg: (Math.atan2(end.y - start.y, end.x - start.x) * 180) / Math.PI,
      };
    }
    targetDist -= segLen;
  }

  return { point: points[points.length - 1], angleDeg: 0 };
}

export function DeliveryTrackerModal({
  isOpen,
  receipt,
  onClose,
}: DeliveryTrackerModalProps) {
  const [progress, setProgress] = useState(0.08);
  const [speedMultiplier, setSpeedMultiplier] = useState<1 | 2>(1);

  const { segmentLengths, totalLength } = useMemo(
    () => computeRouteMetrics(ROUTE_POINTS),
    []
  );

  useEffect(() => {
    if (!isOpen) return;
    setProgress(0.08);
  }, [isOpen, receipt?.orderNumber]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !receipt) return;
    const interval = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 1) return 1;
        return Math.min(1, prev + 0.0045 * speedMultiplier);
      });
    }, 100);
    return () => window.clearInterval(interval);
  }, [isOpen, receipt, speedMultiplier]);

  if (!isOpen || !receipt) return null;

  const { point: courierPos } = getPositionAlongRoute(
    ROUTE_POINTS,
    segmentLengths,
    totalLength,
    progress
  );

  const pathD = ROUTE_POINTS.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const dashOffset = totalLength * (1 - progress);

  const etaRemaining = Math.max(0, Math.ceil((1 - progress) * receipt.etaMinutes));
  const distanceRemaining = Math.max(0, (1 - progress) * 1.4).toFixed(1);
  const pctDisplay = Math.round(progress * 100);

  const currentStatusText =
    progress >= 1
      ? `Delivered to ${receipt.address}`
      : progress >= 0.7
        ? '2 blocks away — turning onto your street'
        : progress >= 0.25
          ? 'Aria is riding north with your chilled tote'
          : 'Packed & chilled — leaving Swaad & Swag Hub';

  const milestones = [
    { label: 'Packed & chilled', threshold: 0 },
    { label: 'Courier picked up', threshold: 0.2 },
    { label: '2 blocks away', threshold: 0.7 },
    { label: 'Arrived at door', threshold: 1 },
  ];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#271718]/60 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tracker-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#E3BDBF] bg-[#FFF8F7] text-[#271718] shadow-xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-4 border-b border-[#E3BDBF] px-6 py-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#95002A]">
              <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Order #{receipt.orderNumber} · Live Route</span>
            </div>
            <h2 id="tracker-modal-title" className="font-display text-xl font-bold text-[#271718]">
              {progress >= 1 ? 'Your drop has arrived' : `Arriving in ${etaRemaining} min`}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSpeedMultiplier((prev) => (prev === 1 ? 2 : 1))}
              className={`h-9 rounded-full px-3.5 font-mono text-xs font-semibold transition-colors ${
                speedMultiplier === 2
                  ? 'bg-[#271718] text-[#B9F079]'
                  : 'border border-[#E3BDBF] bg-white text-[#271718] hover:border-[#95002A]'
              }`}
            >
              {speedMultiplier}x speed
            </button>
            <button
              type="button"
              onClick={() => setProgress(0.08)}
              aria-label="Replay delivery route"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E3BDBF] bg-white text-[#271718] transition-colors hover:border-[#95002A]"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close live delivery tracker"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#FFE9E9] text-[#271718] transition-colors hover:bg-[#FFE1E2]"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Scrollable Map + Details Body */}
        <div className="flex flex-col gap-5 overflow-y-auto p-6">
          {/* Interactive Neighborhood SVG Map */}
          <div className="relative overflow-hidden rounded-2xl border border-[#E3BDBF] bg-[#FFF0F0]">
            <svg
              viewBox="0 0 640 340"
              className="block h-auto w-full"
              role="img"
              aria-label={`Simulated delivery map from Swaad and Swag Hub to ${receipt.address}`}
            >
              {/* Background Map Grid & City Blocks */}
              <rect width="640" height="340" fill="#FFF8F7" />

              {/* Neighborhood Blocks */}
              <rect x="28" y="24" width="144" height="106" rx="10" fill="#FFE9E9" />
              <rect x="248" y="24" width="128" height="106" rx="10" fill="#B9F079" fillOpacity="0.28" />
              <rect x="434" y="24" width="178" height="44" rx="10" fill="#FFE9E9" />
              <rect x="434" y="114" width="178" height="90" rx="10" fill="#FFE9E9" />
              <rect x="28" y="186" width="156" height="50" rx="10" fill="#FFE9E9" />
              <rect x="248" y="186" width="128" height="120" rx="10" fill="#FFE9E9" />
              <rect x="404" y="226" width="208" height="80" rx="10" fill="#FFE9E9" />
              <rect x="28" y="280" width="188" height="36" rx="8" fill="#FFE9E9" />

              {/* Arterial Streets */}
              <path
                d="M 0 162 H 640 M 0 258 H 640 M 0 88 H 640 M 218 0 V 340 M 404 0 V 340"
                stroke="#E3BDBF"
                strokeWidth="12"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 0 162 H 640 M 0 258 H 640 M 0 88 H 640 M 218 0 V 340 M 404 0 V 340"
                stroke="#FFFFFF"
                strokeWidth="8"
                strokeLinecap="round"
                fill="none"
              />

              {/* Street Labels */}
              <text x="266" y="82" fill="#5B4041" fontSize="10" fontWeight="600">
                Dolores Park
              </text>
              <text x="108" y="156" fill="#8F6F70" fontSize="9" fontWeight="600">
                16th Street
              </text>
              <text x="274" y="156" fill="#8F6F70" fontSize="9" fontWeight="600">
                Market Ave
              </text>
              <text x="454" y="82" fill="#8F6F70" fontSize="9" fontWeight="600">
                Valencia Corridor
              </text>

              {/* Base Route Track */}
              <path
                d={pathD}
                fill="none"
                stroke="#E3BDBF"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Active Crimson Progress Path */}
              <path
                d={pathD}
                fill="none"
                stroke="#95002A"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={totalLength}
                strokeDashoffset={dashOffset}
              />

              {/* Origin Hub Marker */}
              <g transform="translate(84, 258)">
                <circle r="15" fill="#271718" />
                <circle r="11" fill="#95002A" />
                <rect x="-4" y="-4" width="8" height="8" rx="1.5" fill="#FFFFFF" />
              </g>
              <g transform="translate(36, 286)">
                <rect width="102" height="22" rx="6" fill="#271718" />
                <text x="51" y="14" textAnchor="middle" fill="#FFF8F7" fontSize="10" fontWeight="700">
                  Swaad &amp; Swag Hub
                </text>
              </g>

              {/* Destination Customer Marker */}
              <g transform="translate(544, 88)">
                <circle r="17" fill="#B9F079" fillOpacity="0.45" />
                <circle r="12" fill="#3E6A00" />
                <circle r="4.5" fill="#B9F079" />
              </g>
              <g transform="translate(468, 42)">
                <rect width="144" height="24" rx="6" fill="#3E6A00" />
                <text x="72" y="15" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700">
                  Drop-off: {receipt.address.slice(0, 18)}
                  {receipt.address.length > 18 ? '…' : ''}
                </text>
              </g>

              {/* Live Courier Bike Marker */}
              <g transform={`translate(${courierPos.x}, ${courierPos.y})`}>
                <circle r="18" fill="#95002A" fillOpacity="0.18" />
                <circle r="13" fill="#FFFFFF" stroke="#95002A" strokeWidth="3" />
                <circle r="5" fill="#95002A" />
              </g>
            </svg>

            {/* Bottom Overlay Telemetry Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E3BDBF] bg-white px-4 py-3 text-xs">
              <div className="flex items-center gap-2 font-semibold text-[#271718]">
                <Bike className="h-4 w-4 text-[#95002A]" aria-hidden="true" />
                <span>{currentStatusText}</span>
              </div>
              <div className="flex items-center gap-4 font-mono font-semibold text-[#5B4041] tabular-nums">
                <span>{distanceRemaining} mi away</span>
                <span className="text-[#95002A]">{pctDisplay}%</span>
              </div>
            </div>
          </div>

          {/* 4-Stage Milestone Progress */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {milestones.map((step) => {
              const reached = progress >= step.threshold;
              return (
                <div
                  key={step.label}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors ${
                    reached
                      ? 'border-[#3E6A00]/40 bg-[#B9F079]/30 text-[#1E3700]'
                      : 'border-[#E3BDBF] bg-white text-[#8F6F70]'
                  }`}
                >
                  <CheckCircle2
                    className={`h-4 w-4 shrink-0 ${
                      reached ? 'text-[#3E6A00]' : 'text-[#E3BDBF]'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="leading-tight">{step.label}</span>
                </div>
              );
            })}
          </div>

          {/* Courier & Address Metadata Row */}
          <div className="grid grid-cols-1 gap-3 rounded-xl border border-[#E3BDBF] bg-[#FFF0F0] p-4 sm:grid-cols-2">
            <div className="flex items-start gap-2.5">
              <Store className="mt-0.5 h-4 w-4 shrink-0 text-[#95002A]" aria-hidden="true" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#5B4041]">Courier &amp; Tote</span>
                <span className="text-sm font-bold text-[#271718]">
                  Aria M. · E-Cargo Bike · Chilled 38°F
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#3E6A00]" aria-hidden="true" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#5B4041]">Delivering to</span>
                <span className="text-sm font-bold text-[#271718]">
                  {receipt.customerName} · {receipt.address}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
