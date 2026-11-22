import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  MapPin,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import type { CartItem, OrderReceipt } from '../types/grocery';
import { ResilientImage } from './ResilientImage';

export const FREE_DELIVERY_THRESHOLD = 25;
export const STANDARD_DELIVERY_FEE = 2.99;
export const SWAG_POINTS_PER_DOLLAR = 10;
export const SWAG_REWARD_COST = 500;
export const SWAG_REWARD_VALUE = 5;

interface BagDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  swagPoints: number;
  redeemReward: boolean;
  lastReceipt: OrderReceipt | null;
  onClose: () => void;
  onUpdateQty: (key: string, delta: number) => void;
  onRemoveItem: (key: string) => void;
  onToggleRedeemReward: () => void;
  onPlaceOrder: (details: { name: string; address: string; paymentMethod: string }) => void;
  onResetReceipt: () => void;
  onOpenTracker: () => void;
}

export function BagDrawer({
  isOpen,
  items,
  swagPoints,
  redeemReward,
  lastReceipt,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onToggleRedeemReward,
  onPlaceOrder,
  onResetReceipt,
  onOpenTracker,
}: BagDrawerProps) {
  const [step, setStep] = useState<'bag' | 'checkout' | 'confirmed'>('bag');
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Apple Pay / Card');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (lastReceipt) {
      setStep('confirmed');
    } else if (items.length === 0 && step === 'checkout') {
      setStep('bag');
    }
  }, [lastReceipt, items.length, step]);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const canRedeem = swagPoints >= SWAG_REWARD_COST && items.length > 0;
  const discount =
    canRedeem && redeemReward ? Math.min(SWAG_REWARD_VALUE, subtotal) : 0;
  const netSubtotal = Math.max(0, subtotal - discount);
  const deliveryFee =
    items.length === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
  const total = netSubtotal + deliveryFee;

  const remainingForFree = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const freeDeliveryPct = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100);

  const pointsToEarn = Math.round(netSubtotal * SWAG_POINTS_PER_DOLLAR);
  const pointsProgressPct = Math.min(100, (swagPoints / SWAG_REWARD_COST) * 100);
  const pointsNeeded = Math.max(0, SWAG_REWARD_COST - swagPoints);

  const handleCheckoutSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!customerName.trim() || !address.trim()) {
      setFormError('Please enter your name and drop-off address.');
      return;
    }
    setFormError('');
    onPlaceOrder({
      name: customerName.trim(),
      address: address.trim(),
      paymentMethod,
    });
  };

  const handleContinueShopping = () => {
    onResetReceipt();
    setStep('bag');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#271718]/50 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bag-drawer-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex h-full w-full max-w-md flex-col justify-between border-l border-[#E3BDBF] bg-[#FFF8F7] text-[#271718]">
        {/* Top Drawer Header */}
        <div className="flex items-center justify-between border-b border-[#E3BDBF] px-6 py-4">
          <div className="flex flex-col">
            <h2 id="bag-drawer-title" className="font-display text-xl font-bold text-[#271718]">
              {step === 'confirmed'
                ? 'Order confirmed'
                : step === 'checkout'
                  ? 'Express checkout'
                  : 'Your bag'}
            </h2>
            <span className="text-xs font-medium text-[#5B4041]">
              {step === 'confirmed'
                ? 'Preparing your 15-minute drop'
                : `15-minute express drop · ${swagPoints.toLocaleString()} Swag Points`}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close bag"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#FFE9E9] text-[#271718] transition-colors duration-150 hover:bg-[#FFE1E2] focus-visible:outline-2 focus-visible:outline-[#95002A]"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 'confirmed' && lastReceipt ? (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2 rounded-2xl border border-[#E3BDBF] bg-[#FFF0F0] p-5">
                <div className="flex items-center gap-2 text-[#3E6A00]">
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  <span className="text-sm font-bold">
                    Order #{lastReceipt.orderNumber} confirmed
                  </span>
                </div>
                <p className="text-sm text-[#5B4041]">
                  Arriving in ~{lastReceipt.etaMinutes} minutes to{' '}
                  <span className="font-semibold text-[#271718]">{lastReceipt.address}</span> for{' '}
                  <span className="font-semibold text-[#271718]">{lastReceipt.customerName}</span>.
                </p>
                <span className="font-mono text-xs text-[#5B4041]">
                  Paid via {lastReceipt.paymentMethod} · {lastReceipt.placedAt}
                </span>
                <button
                  type="button"
                  onClick={onOpenTracker}
                  className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#95002A] px-4 text-xs font-semibold text-white transition-colors duration-150 hover:bg-[#BE123C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#95002A]"
                >
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  <span>Track live delivery</span>
                </button>
              </div>

              {/* Swag Points Earned Summary */}
              <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E3BDBF] bg-[#B9F079]/35 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <Award className="h-5 w-5 shrink-0 text-[#3E6A00]" aria-hidden="true" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#1E3700]">
                      +{lastReceipt.pointsEarned} Swag Points earned
                    </span>
                    <span className="text-xs text-[#3E6A00]">
                      New balance: {lastReceipt.pointsBalanceAfter.toLocaleString()} pts
                      {lastReceipt.pointsRedeemed > 0
                        ? ` · ${lastReceipt.pointsRedeemed} pts redeemed`
                        : ''}
                    </span>
                  </div>
                </div>
                {lastReceipt.pointsBalanceAfter >= SWAG_REWARD_COST && (
                  <span className="font-mono text-xs font-semibold text-[#1E3700]">
                    $5 off ready
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold tracking-wide text-[#5B4041]">
                  Order summary
                </span>
                {lastReceipt.items.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between border-b border-[#E3BDBF] pb-2 text-sm"
                  >
                    <span className="text-[#271718]">
                      <span className="font-mono font-semibold tabular-nums">{item.qty}x</span>{' '}
                      {item.name} ({item.packLabel})
                    </span>
                    <span className="font-mono font-semibold text-[#271718] tabular-nums">
                      ${(item.price * item.qty).toFixed(2)}
                    </span>
                  </div>
                ))}
                {lastReceipt.discount > 0 && (
                  <div className="flex items-center justify-between text-sm font-semibold text-[#3E6A00]">
                    <span>Swag Points reward</span>
                    <span className="font-mono tabular-nums">
                      -${lastReceipt.discount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1 text-base font-bold text-[#271718]">
                  <span>Total</span>
                  <span className="font-mono tabular-nums">${lastReceipt.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : step === 'checkout' ? (
            <form
              id="express-checkout-form"
              onSubmit={handleCheckoutSubmit}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <label htmlFor="checkout-name" className="text-xs font-semibold text-[#271718]">
                  Full name
                </label>
                <input
                  id="checkout-name"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Maya Lin"
                  className="h-11 rounded-xl border border-[#E3BDBF] bg-white px-3.5 text-sm text-[#271718] placeholder:text-[#8F6F70] focus:border-[#95002A] focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="checkout-address" className="text-xs font-semibold text-[#271718]">
                  Drop-off street address &amp; apt / dorm
                </label>
                <input
                  id="checkout-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="412 Valencia St, Apt 4B"
                  className="h-11 rounded-xl border border-[#E3BDBF] bg-white px-3.5 text-sm text-[#271718] placeholder:text-[#8F6F70] focus:border-[#95002A] focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-[#271718]">Payment method</span>
                <div className="grid grid-cols-1 gap-2">
                  {['Apple Pay / Card', 'Cash on Delivery (COD)', 'Venmo / UPI Express'].map(
                    (method) => {
                      const active = paymentMethod === method;
                      return (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          aria-pressed={active}
                          className={`flex h-11 items-center justify-between rounded-xl px-3.5 text-sm font-semibold transition-colors duration-150 ${
                            active
                              ? 'border-2 border-[#95002A] bg-white text-[#271718]'
                              : 'border border-[#E3BDBF] bg-white text-[#5B4041] hover:border-[#95002A]/60'
                          }`}
                        >
                          <span>{method}</span>
                          {active && (
                            <span className="text-xs font-semibold text-[#95002A]">Selected</span>
                          )}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-[#E3BDBF] bg-[#FFF0F0] px-3.5 py-2.5 text-xs text-[#5B4041]">
                You will earn{' '}
                <span className="font-mono font-semibold text-[#271718] tabular-nums">
                  +{pointsToEarn} Swag Points
                </span>{' '}
                with this order ({SWAG_POINTS_PER_DOLLAR} pts per $1 spent).
              </div>

              {formError && (
                <p
                  role="alert"
                  className="rounded-lg bg-[#FFDAD6] px-3 py-2 text-xs font-semibold text-[#93000A]"
                >
                  {formError}
                </p>
              )}
            </form>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Swag Points Loyalty Progress & Redemption */}
              <div className="rounded-xl border border-[#E3BDBF] bg-white p-3.5">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#271718]">
                    <Award className="h-4 w-4 text-[#95002A]" aria-hidden="true" />
                    <span>Swag Points</span>
                  </div>
                  <span className="font-mono text-xs font-semibold text-[#95002A] tabular-nums">
                    {swagPoints.toLocaleString()} / {SWAG_REWARD_COST} pts
                  </span>
                </div>

                <div
                  role="progressbar"
                  aria-label="Swag Points toward $5.00 reward"
                  aria-valuenow={Math.min(swagPoints, SWAG_REWARD_COST)}
                  aria-valuemin={0}
                  aria-valuemax={SWAG_REWARD_COST}
                  className="h-2 w-full overflow-hidden rounded-full bg-[#FFE9E9]"
                >
                  <div
                    className="h-full rounded-full bg-[#95002A] transition-all duration-200"
                    style={{ width: `${pointsProgressPct}%` }}
                  />
                </div>

                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-[#5B4041]">
                    {swagPoints >= SWAG_REWARD_COST
                      ? '$5.00 reward unlocked'
                      : `${pointsNeeded} pts to $5.00 off · +${pointsToEarn} pts this bag`}
                  </span>

                  {swagPoints >= SWAG_REWARD_COST && (
                    <button
                      type="button"
                      disabled={items.length === 0}
                      onClick={onToggleRedeemReward}
                      aria-pressed={redeemReward}
                      className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold transition-colors duration-150 ${
                        redeemReward
                          ? 'bg-[#3E6A00] text-white'
                          : 'bg-[#B9F079] text-[#1E3700] hover:bg-[#a9e862]'
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      {redeemReward ? 'Applied (-$5.00)' : 'Redeem 500 pts (-$5)'}
                    </button>
                  )}
                </div>
              </div>

              {/* Free Delivery Threshold Indicator */}
              <div className="rounded-xl border border-[#E3BDBF] bg-[#FFF0F0] p-3.5">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#271718]">
                    {remainingForFree === 0
                      ? 'Free 15-min delivery unlocked!'
                      : `Add $${remainingForFree.toFixed(2)} more for free delivery`}
                  </span>
                  <span className="font-mono text-[#3E6A00] tabular-nums">
                    ${Math.min(subtotal, FREE_DELIVERY_THRESHOLD).toFixed(0)}/$
                    {FREE_DELIVERY_THRESHOLD}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#FFE1E2]">
                  <div
                    className="h-full rounded-full bg-[#3E6A00] transition-all duration-200"
                    style={{ width: `${freeDeliveryPct}%` }}
                  />
                </div>
              </div>

              {/* Cart Items */}
              {items.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF0F0] text-[#95002A]">
                    <ShoppingBag className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="font-display text-lg font-bold text-[#271718]">
                    Your bag is empty
                  </p>
                  <p className="max-w-[26ch] text-sm text-[#5B4041]">
                    Add viral pantry jars, chilled matcha, or a 2 AM snack kit to earn Swag Points.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {items.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[#E3BDBF] bg-white p-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#FFF0F0]">
                          <ResilientImage
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate text-sm font-semibold text-[#271718]">
                            {item.name}
                          </span>
                          <span className="text-xs text-[#5B4041]">{item.packLabel}</span>
                          <span className="font-mono text-xs font-semibold text-[#271718] tabular-nums">
                            ${(item.price * item.qty).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.key, -1)}
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#FFE9E9] text-[#271718] transition-colors hover:bg-[#FFE1E2]"
                        >
                          <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <span className="w-6 text-center font-mono text-xs font-semibold tabular-nums">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.key, 1)}
                          aria-label={`Increase quantity of ${item.name}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#FFE9E9] text-[#271718] transition-colors hover:bg-[#FFE1E2]"
                        >
                          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.key)}
                          aria-label={`Remove ${item.name}`}
                          className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-[#8F6F70] transition-colors hover:bg-[#FFE9E9] hover:text-[#95002A]"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-[#E3BDBF] bg-[#FFF8F7] px-6 py-5">
          {step === 'confirmed' ? (
            <button
              type="button"
              onClick={handleContinueShopping}
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#95002A] px-6 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#BE123C]"
            >
              Continue shopping
            </button>
          ) : step === 'checkout' ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#5B4041]">Total (incl. delivery)</span>
                <span className="font-mono text-lg font-bold text-[#271718] tabular-nums">
                  ${total.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setStep('bag')}
                  className="inline-flex h-12 items-center justify-center rounded-full border border-[#E3BDBF] bg-white px-5 text-sm font-semibold text-[#271718] transition-colors hover:border-[#95002A]"
                >
                  Back
                </button>
                <button
                  type="submit"
                  form="express-checkout-form"
                  className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#95002A] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#BE123C]"
                >
                  <span>Place order · ${total.toFixed(2)}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex items-center justify-between text-[#5B4041]">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums">${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex items-center justify-between font-semibold text-[#3E6A00]">
                    <span>Swag Points (-500 pts)</span>
                    <span className="font-mono tabular-nums">-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-[#5B4041]">
                  <span>15-min delivery</span>
                  <span className="font-mono tabular-nums">
                    {deliveryFee === 0 ? 'Free' : `$${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-base font-bold text-[#271718]">
                  <span>Total</span>
                  <span className="font-mono tabular-nums">${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="button"
                disabled={items.length === 0}
                onClick={() => setStep('checkout')}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#95002A] px-6 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#BE123C] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <span>Checkout · ${total.toFixed(2)}</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
