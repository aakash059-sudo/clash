export type AisleCategory =
  | 'All Drops'
  | 'Viral Pantry'
  | 'Late-Night Snacks'
  | 'Fresh & Staples'
  | 'Chilled Drinks';

export interface PackOption {
  id: string;
  label: string;
  sizeNote: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  category: Exclude<AisleCategory, 'All Drops'>;
  unitSize: string;
  price: number;
  rating: number;
  reviewCount: number;
  tag?: string;
  image: string;
  gallery: string[];
  description: string;
  ingredients: string;
  dietary: string;
  packOptions: PackOption[];
  pairingIds: string[];
}

export interface MealBundle {
  id: string;
  name: string;
  subtitle: string;
  itemsSummary: string[];
  originalPrice: number;
  bundlePrice: number;
  image: string;
  accentLabel: string;
}

export interface CartItem {
  key: string;
  productId: string;
  name: string;
  packLabel: string;
  price: number;
  qty: number;
  image: string;
}

export interface OrderReceipt {
  orderNumber: string;
  customerName: string;
  address: string;
  paymentMethod: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  pointsEarned: number;
  pointsRedeemed: number;
  pointsBalanceAfter: number;
  etaMinutes: number;
  placedAt: string;
}
