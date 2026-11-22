import type { Product } from '../types/grocery';

const DEFAULT_TITLE = 'Swaad & Swag Market — 15-Min Gen-Z Grocery Store';
const DEFAULT_DESCRIPTION =
  'Shop Swaad & Swag Market (swaadswag.com) for 15-minute Gen-Z grocery drops, viral chili crisp, spicy ramen, matcha drinks, and fresh produce till 2 AM.';
const DEFAULT_IMAGE = '/src/assets/images/hero_genz_grocery_drop_1795329869073.jpg';

function setMetaContent(selector: string, content: string) {
  const el = document.querySelector<HTMLMetaElement>(selector);
  if (el) {
    el.content = content;
  }
}

export function syncSeoMetadata(product: Product | null) {
  const origin = window.location.origin;
  const currentUrl = product
    ? `${origin}${window.location.pathname}?product=${encodeURIComponent(product.id)}`
    : `${origin}${window.location.pathname}`;

  const canonicalEl = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (canonicalEl) {
    canonicalEl.href = currentUrl;
  }

  const title = product
    ? `${product.name} — Swaad & Swag Market`
    : DEFAULT_TITLE;
  const description = product ? product.description : DEFAULT_DESCRIPTION;
  const image = product ? `${origin}${product.image}` : `${origin}${DEFAULT_IMAGE}`;

  document.title = title;
  setMetaContent('meta[name="description"]', description);
  setMetaContent('meta[property="og:url"]', currentUrl);
  setMetaContent('meta[property="og:title"]', title);
  setMetaContent('meta[property="og:description"]', description);
  setMetaContent('meta[property="og:image"]', image);
  setMetaContent('meta[name="twitter:title"]', title);
  setMetaContent('meta[name="twitter:description"]', description);
  setMetaContent('meta[name="twitter:image"]', image);

  const existingProductScript = document.getElementById('dynamic-product-jsonld');
  if (product) {
    const schemaPayload = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image: [image],
      description: product.description,
      category: product.category,
      brand: {
        '@type': 'Brand',
        name: 'Swaad & Swag Market',
      },
      offers: {
        '@type': 'Offer',
        url: currentUrl,
        priceCurrency: 'USD',
        price: product.price.toFixed(2),
        availability: 'https://schema.org/InStock',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating.toFixed(1),
        reviewCount: product.reviewCount,
      },
    };

    const scriptEl =
      existingProductScript ??
      Object.assign(document.createElement('script'), {
        id: 'dynamic-product-jsonld',
        type: 'application/ld+json',
      });
    scriptEl.textContent = JSON.stringify(schemaPayload);
    if (!existingProductScript) {
      document.head.appendChild(scriptEl);
    }
  } else if (existingProductScript) {
    existingProductScript.remove();
  }
}
