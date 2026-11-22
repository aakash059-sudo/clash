import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, Plus, Search, Share2, Sparkles } from 'lucide-react';
import {
  BagDrawer,
  FREE_DELIVERY_THRESHOLD,
  STANDARD_DELIVERY_FEE,
  SWAG_POINTS_PER_DOLLAR,
  SWAG_REWARD_COST,
  SWAG_REWARD_VALUE,
} from './components/BagDrawer';
import { DeliveryTrackerModal } from './components/DeliveryTrackerModal';
import { Header } from './components/Header';
import { NewsletterBar } from './components/NewsletterBar';
import { ProductDetailView } from './components/ProductDetailView';
import { ResilientImage } from './components/ResilientImage';
import { AISLE_CATEGORIES, HERO_IMAGE, MEAL_BUNDLES, PRODUCTS } from './data/products';
import { syncSeoMetadata } from './utils/seo';
import type {
  AisleCategory,
  CartItem,
  MealBundle,
  OrderReceipt,
  PackOption,
  Product,
} from './types/grocery';

const STORAGE_CART_KEY = 'swaad_swag_cart_v1';
const STORAGE_POINTS_KEY = 'swaad_swag_points_v1';
const DEFAULT_SWAG_POINTS = 380;

const DEFAULT_BAG: CartItem[] = [
  {
    key: 'sichuan-truffle-chili-crisp::single',
    productId: 'sichuan-truffle-chili-crisp',
    name: 'Sichuan Truffle Chili Crisp',
    packLabel: 'Single Jar (170g)',
    price: 8.5,
    qty: 1,
    image: PRODUCTS[0].image,
  },
  {
    key: 'spicy-rose-carbonara-ramen::two-pack',
    productId: 'spicy-rose-carbonara-ramen',
    name: 'Spicy Rose Carbonara Ramen',
    packLabel: '2-Pack (280g)',
    price: 5.9,
    qty: 1,
    image: PRODUCTS[1].image,
  },
];

type SortOption = 'featured' | 'price-asc' | 'price-desc';

export default function App() {
  const [bag, setBag] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_CART_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Fallback to default bag if storage is unavailable
    }
    return DEFAULT_BAG;
  });

  const [selectedProductId, setSelectedProductId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    const productParam = params.get('product');
    if (productParam && PRODUCTS.some((p) => p.id === productParam)) {
      return productParam;
    }
    return null;
  });
  const [activeCategory, setActiveCategory] = useState<AisleCategory>('All Drops');
  const [searchQuery, setSearchQuery] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('q') ?? '';
  });
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [swagPoints, setSwagPoints] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_POINTS_KEY);
      if (raw !== null) {
        const parsed = Number(raw);
        if (Number.isFinite(parsed) && parsed >= 0) return Math.floor(parsed);
      }
    } catch {
      // Fallback to starter balance
    }
    return DEFAULT_SWAG_POINTS;
  });
  const [redeemReward, setRedeemReward] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<OrderReceipt | null>(null);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedStoreUrl, setCopiedStoreUrl] = useState(false);

  const catalogRef = useRef<HTMLElement | null>(null);
  const bundlesRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(bag));
    } catch {
      // Ignore storage quota errors
    }
  }, [bag]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_POINTS_KEY, String(swagPoints));
    } catch {
      // Ignore storage quota errors
    }
  }, [swagPoints]);

  useEffect(() => {
    if (swagPoints < SWAG_REWARD_COST && redeemReward) {
      setRedeemReward(false);
    }
  }, [swagPoints, redeemReward]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const bagCount = bag.reduce((sum, item) => sum + item.qty, 0);

  const selectedProduct = useMemo(
    () => PRODUCTS.find((p) => p.id === selectedProductId) ?? null,
    [selectedProductId]
  );

  useEffect(() => {
    syncSeoMetadata(selectedProduct);
    const url = new URL(window.location.href);
    if (selectedProduct) {
      url.searchParams.set('product', selectedProduct.id);
    } else {
      url.searchParams.delete('product');
    }
    if (searchQuery.trim() && !selectedProduct) {
      url.searchParams.set('q', searchQuery.trim());
    } else {
      url.searchParams.delete('q');
    }
    window.history.replaceState({}, '', `${url.pathname}${url.search}`);
  }, [selectedProduct, searchQuery]);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const productParam = params.get('product');
      setSelectedProductId(
        productParam && PRODUCTS.some((p) => p.id === productParam) ? productParam : null
      );
      setSearchQuery(params.get('q') ?? '');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const list = PRODUCTS.filter((product) => {
      const matchesCategory =
        activeCategory === 'All Drops' || product.category === activeCategory;
      const matchesQuery =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });

    if (sortBy === 'price-asc') {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-desc') {
      return [...list].sort((a, b) => b.price - a.price);
    }
    return list;
  }, [activeCategory, searchQuery, sortBy]);

  const addItemToBag = (product: Product, pack: PackOption, qty: number, openDrawer = false) => {
    setLastReceipt(null);
    const key = `${product.id}::${pack.id}`;
    const packLabel = `${pack.label} (${pack.sizeNote})`;
    setBag((prev) => {
      const existing = prev.find((item) => item.key === key);
      if (existing) {
        return prev.map((item) =>
          item.key === key ? { ...item, qty: item.qty + qty } : item
        );
      }
      return [
        ...prev,
        {
          key,
          productId: product.id,
          name: product.name,
          packLabel,
          price: pack.price,
          qty,
          image: product.image,
        },
      ];
    });

    if (openDrawer) {
      setIsBagOpen(true);
    } else {
      setToastMessage(`Added ${product.name} to bag`);
    }
  };

  const addBundleToBag = (bundle: MealBundle) => {
    setLastReceipt(null);
    const key = `bundle::${bundle.id}`;
    setBag((prev) => {
      const existing = prev.find((item) => item.key === key);
      if (existing) {
        return prev.map((item) =>
          item.key === key ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [
        ...prev,
        {
          key,
          productId: bundle.id,
          name: bundle.name,
          packLabel: 'Curated Meal Kit',
          price: bundle.bundlePrice,
          qty: 1,
          image: bundle.image,
        },
      ];
    });
    setIsBagOpen(true);
  };

  const handleUpdateQty = (key: string, delta: number) => {
    setBag((prev) =>
      prev
        .map((item) => (item.key === key ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const handleRemoveItem = (key: string) => {
    setBag((prev) => prev.filter((item) => item.key !== key));
  };

  const handlePlaceOrder = ({
    name,
    address,
    paymentMethod,
  }: {
    name: string;
    address: string;
    paymentMethod: string;
  }) => {
    const subtotal = bag.reduce((sum, item) => sum + item.price * item.qty, 0);
    const canRedeem = swagPoints >= SWAG_REWARD_COST && bag.length > 0;
    const pointsRedeemed = canRedeem && redeemReward ? SWAG_REWARD_COST : 0;
    const discount =
      pointsRedeemed > 0 ? Math.min(SWAG_REWARD_VALUE, subtotal) : 0;
    const netSubtotal = Math.max(0, subtotal - discount);
    const deliveryFee =
      subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
    const total = netSubtotal + deliveryFee;
    const pointsEarned = Math.round(netSubtotal * SWAG_POINTS_PER_DOLLAR);
    const nextBalance = swagPoints - pointsRedeemed + pointsEarned;

    const orderNumber = `SWG-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const placedAt = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setSwagPoints(nextBalance);
    setRedeemReward(false);
    setLastReceipt({
      orderNumber,
      customerName: name,
      address,
      paymentMethod,
      items: bag,
      subtotal,
      discount,
      deliveryFee,
      total,
      pointsEarned,
      pointsRedeemed,
      pointsBalanceAfter: nextBalance,
      etaMinutes: 15,
      placedAt,
    });
    setBag([]);
  };

  const handleSelectAisleFromNav = (aisle: AisleCategory) => {
    setSelectedProductId(null);
    setActiveCategory(aisle);
    window.setTimeout(() => {
      catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleJumpToBundles = () => {
    setSelectedProductId(null);
    window.setTimeout(() => {
      bundlesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleGoHome = () => {
    setSelectedProductId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FFF8F7] text-[#271718]">
      <Header
        bagCount={bagCount}
        onGoHome={handleGoHome}
        onSelectAisle={handleSelectAisleFromNav}
        onJumpToBundles={handleJumpToBundles}
        onOpenBag={() => setIsBagOpen(true)}
      />

      <main className="flex-1">
        {selectedProduct ? (
          <ProductDetailView
            product={selectedProduct}
            allProducts={PRODUCTS}
            onBack={() => setSelectedProductId(null)}
            onSelectProduct={(id) => setSelectedProductId(id)}
            onAddToBag={(product, pack, qty) => addItemToBag(product, pack, qty, true)}
          />
        ) : (
          <>
            {/* Section 1: Storefront Hero Drop Showcase */}
            <section className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 lg:pt-12">
              <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-10">
                {/* Left Hero Copy Block */}
                <div className="flex flex-col justify-between gap-8 rounded-2xl border border-[#E3BDBF] bg-[#FFF0F0] p-6 sm:p-10 lg:col-span-6">
                  <div className="flex flex-col gap-5">
                    <span className="text-xs font-semibold tracking-wide text-[#95002A]">
                      Drop #042 · Neighborhood Express Grocery
                    </span>

                    <h1 className="font-display text-[clamp(2.25rem,4vw,3.6rem)] font-extrabold leading-[1.06] tracking-tight text-[#271718] text-balance">
                      Late-night pantry drops &amp; fresh staples in 15 mins.
                    </h1>

                    <p className="max-w-xl text-base leading-relaxed text-[#5B4041] text-pretty">
                      From small-batch Sichuan truffle chili crisp and rose carbonara ramen to
                      sparkling yuzu matcha and eat-tonight avocados—delivered cold till 2 AM.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }
                      className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#95002A] px-6 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#BE123C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#95002A]"
                    >
                      <span>Shop Drop #042</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedProductId('sichuan-truffle-chili-crisp')}
                      className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-full border border-[#E3BDBF] bg-white px-5 text-sm font-semibold text-[#271718] transition-colors duration-150 hover:border-[#95002A] hover:text-[#95002A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#95002A]"
                    >
                      Inspect Truffle Chili Crisp
                    </button>
                  </div>
                </div>

                {/* Right Hero Feature Photo */}
                <div className="relative min-h-[280px] overflow-hidden rounded-2xl border border-[#E3BDBF] bg-[#FFE9E9] lg:col-span-6">
                  <ResilientImage
                    src={HERO_IMAGE}
                    alt="Curated Gen-Z grocery haul featuring Sichuan chili crisp, spicy ramen, matcha yuzu can, avocados, and sourdough"
                    className="h-full w-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#271718]/80 via-[#271718]/30 to-transparent p-6">
                    <div className="flex flex-wrap items-end justify-between gap-4 text-white">
                      <div>
                        <span className="text-xs font-semibold text-[#B9F079]">
                          Featured Drop · 15-Min Chilled Tote
                        </span>
                        <p className="font-display text-lg font-bold">
                          Midnight Crunch Snack Pack
                        </p>
                      </div>
                      <span className="font-mono text-base font-semibold text-[#B9F079] tabular-nums">
                        $16.50
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4-Column Promise Strip Below Hero Split */}
              <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-[#E3BDBF] bg-white px-6 py-4 lg:grid-cols-4">
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-sm font-semibold text-[#95002A] tabular-nums">
                    15 mins
                  </span>
                  <span className="text-xs font-medium text-[#5B4041]">
                    Avg. bike courier arrival
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-sm font-semibold text-[#271718] tabular-nums">
                    7 AM – 2 AM
                  </span>
                  <span className="text-xs font-medium text-[#5B4041]">
                    Open every night for cravings
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-sm font-semibold text-[#3E6A00] tabular-nums">
                    $25+ Free
                  </span>
                  <span className="text-xs font-medium text-[#5B4041]">
                    Zero delivery fee threshold
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-sm font-semibold text-[#271718] tabular-nums">
                    Small-Batch
                  </span>
                  <span className="text-xs font-medium text-[#5B4041]">
                    Creator &amp; local bakery drops
                  </span>
                </div>
              </div>
            </section>

            {/* Section 2: Featured Grocery Catalog */}
            <section
              ref={catalogRef}
              id="catalog"
              className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-12"
            >
              <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div className="flex flex-col gap-1">
                  <h2 className="font-display text-3xl font-bold tracking-tight text-[#271718]">
                    Fresh drops &amp; pantry staples
                  </h2>
                  <p className="text-sm text-[#5B4041]">
                    Click any item to inspect pack sizes, ingredients, and pairings.
                  </p>
                </div>

                {/* Search & Sort Controls */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 sm:w-64 sm:flex-none">
                    <Search
                      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5B4041]"
                      aria-hidden="true"
                    />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      aria-label="Search groceries"
                      placeholder="Search matcha, ramen, sourdough..."
                      className="h-11 w-full rounded-full border border-[#E3BDBF] bg-white pl-10 pr-4 text-sm text-[#271718] placeholder:text-[#8F6F70] focus:border-[#95002A] focus:outline-none"
                    />
                  </div>

                  <select
                    aria-label="Sort products"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="h-11 rounded-full border border-[#E3BDBF] bg-white px-4 text-sm font-semibold text-[#271718] focus:border-[#95002A] focus:outline-none"
                  >
                    <option value="featured">Featured drops</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Segmented Aisle Filter Tabs */}
              <div
                className="mb-8 flex flex-wrap items-center gap-2"
                role="tablist"
                aria-label="Filter by grocery aisle"
              >
                {AISLE_CATEGORIES.map((category) => {
                  const isActive = activeCategory === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveCategory(category)}
                      className={`h-10 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#95002A] ${
                        isActive
                          ? 'bg-[#271718] text-[#FFF8F7]'
                          : 'border border-[#E3BDBF] bg-white text-[#5B4041] hover:border-[#95002A] hover:text-[#95002A]'
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>

              {/* Product Grid */}
              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#E3BDBF] bg-[#FFF0F0] px-6 py-14 text-center">
                  <p className="font-display text-xl font-bold text-[#271718]">
                    No grocery drops match "{searchQuery}"
                  </p>
                  <p className="text-sm text-[#5B4041]">
                    Try another keyword or clear your aisle filter.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory('All Drops');
                    }}
                    className="mt-2 inline-flex h-10 items-center justify-center rounded-full bg-[#95002A] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#BE123C]"
                  >
                    Reset filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredProducts.map((product) => (
                    <article
                      key={product.id}
                      className="group flex h-full flex-col justify-between gap-4 rounded-2xl border border-[#E3BDBF] bg-white p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-[#95002A]"
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedProductId(product.id)}
                        className="flex flex-col gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#95002A]"
                      >
                        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#FFF0F0]">
                          <ResilientImage
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                          />
                          {product.tag && (
                            <span className="absolute left-3 top-3 rounded-md bg-[#B9F079] px-2.5 py-0.5 text-xs font-semibold text-[#1E3700]">
                              {product.tag}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-[#5B4041]">
                            {product.unitSize} · {product.category}
                          </span>
                          <h3 className="font-display text-lg font-bold leading-snug text-[#271718] group-hover:text-[#95002A]">
                            {product.name}
                          </h3>
                        </div>
                      </button>

                      <footer className="flex items-center justify-between pt-1">
                        <span className="font-mono text-base font-semibold text-[#271718] tabular-nums">
                          ${product.price.toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => addItemToBag(product, product.packOptions[0], 1)}
                          aria-label={`Quick add ${product.name}`}
                          className="inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-[#95002A] px-4 text-xs font-semibold text-white transition-colors duration-150 hover:bg-[#BE123C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#95002A]"
                        >
                          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Quick add</span>
                        </button>
                      </footer>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* Section 3: Curated Meal Kits & Bundles */}
            <section
              ref={bundlesRef}
              id="bundles"
              className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:pb-20"
            >
              <div className="mb-6 flex flex-col gap-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3E6A00]">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  Bundled for roommate hangs &amp; quick prep
                </span>
                <h2 className="font-display text-3xl font-bold tracking-tight text-[#271718]">
                  Late-night &amp; morning kits
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {MEAL_BUNDLES.map((bundle) => (
                  <article
                    key={bundle.id}
                    className="grid grid-cols-1 items-stretch overflow-hidden rounded-2xl border border-[#E3BDBF] bg-[#FFF0F0] sm:grid-cols-12"
                  >
                    <div className="relative aspect-square sm:col-span-5 sm:aspect-auto">
                      <ResilientImage
                        src={bundle.image}
                        alt={bundle.name}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute left-3 top-3 rounded-md bg-[#B9F079] px-2.5 py-0.5 text-xs font-semibold text-[#1E3700]">
                        {bundle.accentLabel}
                      </span>
                    </div>

                    <div className="flex flex-col justify-between gap-5 p-6 sm:col-span-7">
                      <div className="flex flex-col gap-2">
                        <h3 className="font-display text-xl font-bold text-[#271718]">
                          {bundle.name}
                        </h3>
                        <p className="text-sm text-[#5B4041]">{bundle.subtitle}</p>
                        <ul className="mt-2 flex flex-col gap-1.5 border-t border-[#E3BDBF] pt-3 text-xs font-medium text-[#271718]">
                          {bundle.itemsSummary.map((line) => (
                            <li key={line} className="flex items-center gap-2">
                              <Check className="h-3.5 w-3.5 shrink-0 text-[#3E6A00]" aria-hidden="true" />
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-1">
                        <div className="flex items-baseline gap-2">
                          <span className="font-mono text-lg font-bold text-[#271718] tabular-nums">
                            ${bundle.bundlePrice.toFixed(2)}
                          </span>
                          <span className="font-mono text-xs text-[#8F6F70] line-through tabular-nums">
                            ${bundle.originalPrice.toFixed(2)}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => addBundleToBag(bundle)}
                          className="inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-[#95002A] px-5 text-xs font-semibold text-white transition-colors duration-150 hover:bg-[#BE123C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#95002A]"
                        >
                          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Add kit</span>
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E3BDBF] bg-[#271718] text-[#FFF8F7]">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center">
          <div className="flex flex-col gap-1">
            <span className="font-display text-lg font-extrabold tracking-tight text-white">
              Swaad &amp; Swag Market
            </span>
            <p className="text-sm text-[#E3BDBF]">
              www.swaadswag.com · 15-minute groceries, viral pantry jars &amp; chilled drinks till 2 AM.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm font-semibold">
            <button
              type="button"
              onClick={() => handleSelectAisleFromNav('All Drops')}
              className="text-[#FFF8F7] transition-colors hover:text-[#B9F079]"
            >
              All Drops
            </button>
            <button
              type="button"
              onClick={() => handleSelectAisleFromNav('Viral Pantry')}
              className="text-[#FFF8F7] transition-colors hover:text-[#B9F079]"
            >
              Viral Pantry
            </button>
            <button
              type="button"
              onClick={handleJumpToBundles}
              className="text-[#FFF8F7] transition-colors hover:text-[#B9F079]"
            >
              Meal Kits
            </button>
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(window.location.origin);
                  setCopiedStoreUrl(true);
                  window.setTimeout(() => setCopiedStoreUrl(false), 2000);
                } catch {
                  setCopiedStoreUrl(false);
                }
              }}
              className="inline-flex items-center gap-1.5 text-[#B9F079] transition-colors hover:text-white"
            >
              {copiedStoreUrl ? (
                <>
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Store link copied</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Share store</span>
                </>
              )}
            </button>
            <span className="font-mono text-xs text-[#E3BDBF]">Open 7 AM – 2 AM</span>
          </div>
        </div>
      </footer>

      {/* Quick-Add Toast Notification */}
      {toastMessage && !isBagOpen && (
        <div
          role="status"
          className="fixed bottom-20 right-5 z-40 flex items-center gap-3 rounded-full border border-[#E3BDBF] bg-[#271718] py-2.5 pl-4 pr-2.5 text-sm font-medium text-[#FFF8F7] shadow-lg"
        >
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => {
              setToastMessage(null);
              setIsBagOpen(true);
            }}
            className="rounded-full bg-[#B9F079] px-3 py-1 text-xs font-semibold text-[#1E3700] transition-colors hover:bg-[#a9e862]"
          >
            View bag
          </button>
        </div>
      )}

      {/* Sticky Footer Newsletter Signup Bar */}
      <NewsletterBar />

      {/* Slide-Over Bag & Checkout Drawer */}
      <BagDrawer
        isOpen={isBagOpen}
        items={bag}
        swagPoints={swagPoints}
        redeemReward={redeemReward}
        lastReceipt={lastReceipt}
        onClose={() => setIsBagOpen(false)}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onToggleRedeemReward={() => setRedeemReward((prev) => !prev)}
        onPlaceOrder={handlePlaceOrder}
        onResetReceipt={() => setLastReceipt(null)}
        onOpenTracker={() => setIsTrackerOpen(true)}
      />

      {/* Visual Real-Time Delivery Tracker Modal */}
      <DeliveryTrackerModal
        isOpen={isTrackerOpen}
        receipt={lastReceipt}
        onClose={() => setIsTrackerOpen(false)}
      />
    </div>
  );
}
