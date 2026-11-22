import { useEffect, useState } from 'react';
import { Bell, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { getSubscribersCount, saveDropSubscriber } from '../utils/subscriberDb';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NewsletterBar() {
  const [email, setEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'info' | 'error';
    text: string;
  } | null>(null);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    let mounted = true;
    getSubscribersCount().then((count) => {
      if (mounted) setSubscriberCount(count);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_PATTERN.test(trimmed)) {
      setStatusMessage({
        type: 'error',
        text: 'Enter a valid email address.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await saveDropSubscriber(trimmed);
      setSubscriberCount(result.totalCount);
      if (result.status === 'already_subscribed') {
        setStatusMessage({
          type: 'info',
          text: `${result.subscriber.email} is already subscribed to Viral Drop Alerts.`,
        });
      } else {
        setStatusMessage({
          type: 'success',
          text: `Subscribed ${result.subscriber.email} to Viral Drop Alerts.`,
        });
        setEmail('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCollapsed) {
    return (
      <div className="fixed bottom-3 right-4 z-30">
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-[#E3BDBF] bg-[#271718] px-4 text-xs font-semibold text-[#FFF8F7] shadow-lg transition-colors hover:bg-[#3E2C2D] focus-visible:outline-2 focus-visible:outline-[#B9F079]"
        >
          <Bell className="h-3.5 w-3.5 text-[#B9F079]" aria-hidden="true" />
          <span>Viral Drop Alerts</span>
          <ChevronUp className="h-3.5 w-3.5 text-[#E3BDBF]" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <aside
      aria-label="Viral Drop Alerts newsletter signup"
      className="sticky bottom-0 z-30 border-t border-[#5B4041] bg-[#271718]/98 text-[#FFF8F7] backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-2.5 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        {/* Left Copy */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#95002A] text-[#B9F079]">
              <Bell className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-display text-sm font-bold tracking-tight text-white">
                  Viral Drop Alerts
                </span>
                {subscriberCount !== null && subscriberCount > 0 && (
                  <span className="font-mono text-[11px] font-semibold text-[#B9F079] tabular-nums">
                    {subscriberCount} joined
                  </span>
                )}
              </div>
              <p className="text-xs text-[#E3BDBF]">
                First dibs on small-batch chili crisp, matcha &amp; 2 AM snack drops.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            aria-label="Minimize Viral Drop Alerts bar"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#E3BDBF] transition-colors hover:bg-white/10 lg:hidden"
          >
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Right Signup Form + Status */}
        <div className="flex flex-col gap-1.5 lg:items-end">
          <form onSubmit={handleSubmit} className="flex w-full items-center gap-2 sm:w-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (statusMessage) setStatusMessage(null);
              }}
              aria-label="Email address for Viral Drop Alerts"
              placeholder="you@domain.com"
              className="h-10 min-w-0 flex-1 rounded-full border border-[#5B4041] bg-[#180A0B] px-4 text-sm text-[#FFF8F7] placeholder:text-[#AA888A] focus:border-[#B9F079] focus:outline-none sm:w-64"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-[#B9F079] px-5 text-xs font-bold text-[#1E3700] transition-colors duration-150 hover:bg-[#a9e862] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B9F079]"
            >
              {isSubmitting ? 'Saving...' : 'Get alerts'}
            </button>
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              aria-label="Minimize Viral Drop Alerts bar"
              className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#E3BDBF] transition-colors hover:bg-white/10 lg:inline-flex"
            >
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>

          {statusMessage && (
            <p
              role={statusMessage.type === 'error' ? 'alert' : 'status'}
              className={`flex items-center gap-1.5 text-xs font-medium ${
                statusMessage.type === 'error'
                  ? 'text-[#FFB4AB]'
                  : 'text-[#B9F079]'
              }`}
            >
              {statusMessage.type !== 'error' && (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              )}
              <span>{statusMessage.text}</span>
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
