import { useEffect, useState } from 'react';
import { ArrowLeft, Check, Minus, Plus, Share2, ShoppingBag, Star, Zap } from 'lucide-react';
import type { PackOption, Product } from '../types/grocery';
import { ResilientImage } from './ResilientImage';

interface ProductDetailViewProps {
  product: Product;
  allProducts: Product[];
  onBack: () => void;
  onSelectProduct: (productId: string) => void;
  onAddToBag: (product: Product, pack: PackOption, qty: number) => void;
}

export function ProductDetailView({
  product,
  allProducts,
  onBack,
  onSelectProduct,
  onAddToBag,
}: ProductDetailViewProps) {
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedPack, setSelectedPack] = useState<PackOption>(product.packOptions[0]);
  const [qty, setQty] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    setSelectedImageIdx(0);
    setSelectedPack(product.packOptions[0]);
    setQty(1);
    setCopiedLink(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product]);

  const handleCopyProductLink = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?product=${encodeURIComponent(product.id)}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Fallback if clipboard permissions are restricted
      setCopiedLink(false);
    }
  };

  const pairings = product.pairingIds
    .map((id) => allProducts.find((item) => item.id === id))
    .filter((item): item is Product => Boolean(item));

  const lineTotal = selectedPack.price * qty;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:pt-8">
      {/* Breadcrumb Back Link + Share Action */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap text-sm font-semibold text-[#5B4041] transition-colors duration-150 hover:text-[#95002A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#95002A]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to aisles</span>
        </button>

        <button
          type="button"
          onClick={handleCopyProductLink}
          className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-full border border-[#E3BDBF] bg-white px-4 text-xs font-semibold text-[#271718] transition-colors duration-150 hover:border-[#95002A] hover:text-[#95002A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#95002A]"
        >
          {copiedLink ? (
            <>
              <Check className="h-3.5 w-3.5 text-[#3E6A00]" aria-hidden="true" />
              <span>Link copied</span>
            </>
          ) : (
            <>
              <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Share link</span>
            </>
          )}
        </button>
      </div>

      {/* Main Split PDP Module */}
      <section className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
        {/* Left Column: Product Imagery */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:col-span-6">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-[#E3BDBF] bg-[#FFF0F0]">
            <ResilientImage
              src={product.gallery[selectedImageIdx] || product.image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
            {product.tag && (
              <span className="absolute left-4 top-4 rounded-md bg-[#B9F079] px-2.5 py-1 text-xs font-semibold text-[#1E3700]">
                {product.tag}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {product.gallery.map((imgUrl, idx) => {
              const isSelected = idx === selectedImageIdx;
              return (
                <button
                  key={`${product.id}-thumb-${idx}`}
                  type="button"
                  onClick={() => setSelectedImageIdx(idx)}
                  aria-label={`View image ${idx + 1} of ${product.name}`}
                  aria-pressed={isSelected}
                  className={`aspect-square overflow-hidden rounded-xl bg-white transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#95002A] ${
                    isSelected
                      ? 'border-2 border-[#95002A]'
                      : 'border border-[#E3BDBF] opacity-80 hover:opacity-100'
                  }`}
                >
                  <ResilientImage
                    src={imgUrl}
                    alt={`${product.name} preview ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Contiguous Purchase Module */}
        <div className="flex flex-col gap-6 rounded-2xl border border-[#E3BDBF] bg-[#FFF0F0] p-6 sm:p-8 lg:sticky lg:top-24 lg:col-span-6">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-[#5B4041]">
              <span>
                {product.category} · {selectedPack.sizeNote}
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-[#271718] tabular-nums">
                <Star className="h-3.5 w-3.5 fill-[#872700] text-[#872700]" aria-hidden="true" />
                {product.rating.toFixed(1)} ({product.reviewCount})
              </span>
            </div>

            <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#271718] text-balance sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-1 flex flex-wrap items-center gap-4">
              <span className="font-mono text-2xl font-semibold text-[#271718] tabular-nums">
                ${selectedPack.price.toFixed(2)}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3E6A00]">
                <Zap className="h-3.5 w-3.5" aria-hidden="true" />
                15-min chilled drop · In stock
              </span>
            </div>
          </div>

          <p className="text-base leading-relaxed text-[#5B4041] text-pretty">
            {product.description}
          </p>

          {/* Pack Size Selector */}
          <div className="flex flex-col gap-2.5">
            <span className="text-sm font-semibold text-[#271718]">Select pack size</span>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3" role="group" aria-label="Pack size options">
              {product.packOptions.map((pack) => {
                const isActive = pack.id === selectedPack.id;
                return (
                  <button
                    key={pack.id}
                    type="button"
                    onClick={() => setSelectedPack(pack)}
                    aria-pressed={isActive}
                    className={`flex min-h-14 flex-col items-start justify-center rounded-xl px-4 py-3 text-left transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#95002A] ${
                      isActive
                        ? 'border-2 border-[#95002A] bg-white'
                        : 'border border-[#E3BDBF] bg-white hover:border-[#95002A]/60'
                    }`}
                  >
                    <span className="whitespace-nowrap text-sm font-semibold text-[#271718]">
                      {pack.label}
                    </span>
                    <span className="font-mono text-xs font-semibold text-[#5B4041] tabular-nums">
                      ${pack.price.toFixed(2)} · {pack.sizeNote}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity Stepper + Primary Add CTA */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="inline-flex h-12 items-center gap-2 rounded-full border border-[#E3BDBF] bg-white px-2">
              <button
                type="button"
                onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                aria-label="Decrease quantity"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#FFE9E9] text-[#271718] transition-colors duration-150 hover:bg-[#FFE1E2] focus-visible:outline-2 focus-visible:outline-[#95002A]"
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </button>
              <span className="w-7 text-center font-mono text-sm font-semibold text-[#271718] tabular-nums">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((prev) => prev + 1)}
                aria-label="Increase quantity"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#FFE9E9] text-[#271718] transition-colors duration-150 hover:bg-[#FFE1E2] focus-visible:outline-2 focus-visible:outline-[#95002A]"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => onAddToBag(product, selectedPack, qty)}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#95002A] px-6 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#BE123C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#95002A]"
            >
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              <span className="tabular-nums">Add to Bag · ${lineTotal.toFixed(2)}</span>
            </button>
          </div>

          {/* Product Details Specs */}
          <div className="grid grid-cols-1 gap-4 border-t border-[#E3BDBF] pt-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold tracking-wide text-[#271718]">
                Key ingredients
              </span>
              <p className="text-sm leading-relaxed text-[#5B4041]">{product.ingredients}</p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold tracking-wide text-[#271718]">
                Dietary &amp; storage
              </span>
              <p className="text-sm leading-relaxed text-[#5B4041]">{product.dietary}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Add Pairings Section */}
      {pairings.length > 0 && (
        <section className="mt-16 border-t border-[#E3BDBF] pt-12">
          <div className="mb-6 flex flex-col gap-1">
            <h2 className="font-display text-2xl font-bold tracking-tight text-[#271718] sm:text-3xl">
              Quick add pairings
            </h2>
            <p className="text-sm text-[#5B4041]">
              One-tap favorites people bundle with {product.name}.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pairings.map((pairing) => (
              <article
                key={pairing.id}
                className="group flex h-full flex-col justify-between gap-3 rounded-2xl border border-[#E3BDBF] bg-white p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-[#95002A]"
              >
                <button
                  type="button"
                  onClick={() => onSelectProduct(pairing.id)}
                  className="flex flex-col gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#95002A]"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#FFF0F0]">
                    <ResilientImage
                      src={pairing.image}
                      alt={pairing.name}
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                    />
                    {pairing.tag && (
                      <span className="absolute left-3 top-3 rounded-md bg-[#B9F079] px-2 py-0.5 text-xs font-semibold text-[#1E3700]">
                        {pairing.tag}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-[#5B4041]">
                      {pairing.unitSize} · {pairing.category}
                    </span>
                    <h3 className="font-display text-base font-bold text-[#271718] group-hover:text-[#95002A]">
                      {pairing.name}
                    </h3>
                  </div>
                </button>

                <footer className="flex items-center justify-between pt-1">
                  <span className="font-mono text-sm font-semibold text-[#271718] tabular-nums">
                    ${pairing.price.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onAddToBag(pairing, pairing.packOptions[0], 1)}
                    aria-label={`Quick add ${pairing.name}`}
                    className="inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-[#95002A] px-4 text-xs font-semibold text-white transition-colors duration-150 hover:bg-[#BE123C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#95002A]"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Quick add</span>
                  </button>
                </footer>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
