export type ProductCategory =
  | 'Makeup'
  | 'Skincare'
  | 'Haircare'
  | 'Perfumes'
  | 'Body Care'
  | 'Beauty Accessories';

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Packed'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export type PaymentMethod = 'Cash on Delivery' | 'Bank Transfer' | 'Card on Delivery';

export type PageRoute =
  | 'home'
  | 'about'
  | 'shop'
  | 'makeup'
  | 'skincare'
  | 'haircare'
  | 'perfumes'
  | 'body-care'
  | 'accessories'
  | 'best-sellers'
  | 'new-arrivals'
  | 'product-details'
  | 'cart'
  | 'checkout'
  | 'contact'
  | 'reviews'
  | 'faq'
  | 'admin';

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  category: ProductCategory;
  dbCategory?: string;
  subcategory: string;
  description: string;
  ingredients: string;
  ritualGuide: string;
  pricePkr: number;
  discountPricePkr: number | null;
  stock: number;
  sku: string;
  imageUrl: string;
  shades: string[];
  volume: string;
  rating: number;
  reviewCount: number;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  category: ProductCategory;
  imageUrl: string;
  selectedVariant: string;
  unitPricePkr: number;
  originalPricePkr: number;
  quantity: number;
  stock: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  selectedVariant: string;
  unitPricePkr: number;
  quantity: number;
  lineTotalPkr: number;
}

export interface Order {
  id: string;
  trackingId: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  orderNotes: string;
  paymentMethod: PaymentMethod;
  subtotalPkr: number;
  shippingPkr: number;
  discountPkr: number;
  totalPkr: number;
  promoCode: string;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
}

export interface CustomerRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  postalCode: string;
  totalOrders: number;
  totalSpentPkr: number;
  createdAt: string;
}

export interface ProductReview {
  id: string;
  productId?: string;
  productName: string;
  customerName: string;
  customerCity: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface DatabaseStatus {
  mode: 'supabase' | 'local';
  connected: boolean;
  message: string;
}

export interface InquiryInput {
  name: string;
  phone: string;
  subject: string;
  message: string;
}

export interface NewsletterResult {
  alreadySubscribed: boolean;
  email: string;
}
