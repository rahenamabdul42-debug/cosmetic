import { INITIAL_PRODUCTS, INITIAL_REVIEWS } from '../data/catalog';
import { PRODUCT_IMAGES } from '../data/productImages';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  CustomerRecord,
  DatabaseStatus,
  InquiryInput,
  NewsletterResult,
  Order,
  OrderStatus,
  Product,
  ProductCategory,
  ProductReview,
} from '../types/store';

const LS_KEYS = {
  PRODUCTS: 'vb_store_products_v1',
  ORDERS: 'vb_store_orders_v1',
  REVIEWS: 'vb_store_reviews_v1',
  NEWSLETTER: 'vb_newsletter_v1',
  INQUIRIES: 'vb_inquiries_v1',
  ADMIN_SESSION: 'vb_admin_session_v1',
};

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage quota errors
  }
}

function slugify(name: string, id: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${base}-${id.slice(0, 6).toLowerCase()}`;
}

function mapCategoryToStorefront(rawCategory: string): ProductCategory {
  const c = rawCategory.trim().toLowerCase();
  if (
    c.includes('lipstick') ||
    c.includes('foundation') ||
    c.includes('eyeshadow') ||
    c.includes('palette') ||
    c.includes('blush') ||
    c.includes('mascara') ||
    c.includes('concealer') ||
    c.includes('makeup')
  ) {
    return 'Makeup';
  }
  if (
    c.includes('serum') ||
    c.includes('moisturizer') ||
    c.includes('cream') ||
    c.includes('cleanser') ||
    c.includes('toner') ||
    c.includes('sunscreen') ||
    c.includes('skincare')
  ) {
    return 'Skincare';
  }
  if (c.includes('hair') || c.includes('shampoo') || c.includes('conditioner')) {
    return 'Haircare';
  }
  if (c.includes('perfume') || c.includes('fragrance') || c.includes('parfum') || c.includes('mist')) {
    return 'Perfumes';
  }
  if (c.includes('body') || c.includes('hand') || c.includes('scrub')) {
    return 'Body Care';
  }
  return 'Beauty Accessories';
}

function resolveProductImage(name: string, category: string, imageUrl: unknown): string {
  if (typeof imageUrl === 'string' && imageUrl.trim().length > 0) {
    return imageUrl.trim();
  }
  const n = name.toLowerCase();
  const c = category.toLowerCase();

  if (n.includes('crimson') || n.includes('matte lipstick')) return PRODUCT_IMAGES.velvetLipstick;
  if (n.includes('plum') || n.includes('champagne') || n.includes('satin') || c.includes('lipstick')) {
    return n.includes('champagne') ? PRODUCT_IMAGES.lipGloss : PRODUCT_IMAGES.satinLipstick;
  }
  if (n.includes('warm beige')) return PRODUCT_IMAGES.facePowder;
  if (n.includes('foundation') || n.includes('ivory') || c.includes('foundation')) {
    return PRODUCT_IMAGES.silkFoundation;
  }
  if (n.includes('eyeshadow') || n.includes('palette') || c.includes('eyeshadow')) {
    return PRODUCT_IMAGES.eyeshadowPalette;
  }
  if (n.includes('glow oil') || n.includes('oil elixir')) return PRODUCT_IMAGES.facialOil;
  if (n.includes('hyaluronic') && n.includes('serum')) return PRODUCT_IMAGES.niacinamideSerum;
  if (n.includes('serum') || c.includes('serum')) return PRODUCT_IMAGES.goldSerum;
  if (n.includes('moisturizer') || n.includes('crème') || n.includes('creme') || c.includes('moisturizer')) {
    return PRODUCT_IMAGES.barrierMoisturizer;
  }
  if (n.includes('aura rosa')) return PRODUCT_IMAGES.roseraiePerfume;
  if (n.includes('aurum') || n.includes('oud') || n.includes('amber')) return PRODUCT_IMAGES.ambrePerfume;
  if (n.includes('jasmin') || c.includes('perfume')) return PRODUCT_IMAGES.bodyMist;

  return PRODUCT_IMAGES.goldSerum;
}

function inferVolumeFromName(name: string, category: string): string {
  const match = name.match(/(\d+\s?(?:ml|g|oz))/i);
  if (match) return match[1];
  const c = category.toLowerCase();
  if (c.includes('lipstick')) return '3.8g';
  if (c.includes('foundation') || c.includes('serum')) return '30ml';
  if (c.includes('moisturizer')) return '50ml';
  if (c.includes('palette')) return '14.4g';
  if (c.includes('perfume')) return '100ml';
  return '30ml';
}

function formatSupabaseError(err: { code?: string; message?: string }, actionLabel: string): string {
  const code = err.code ?? '';
  const msg = err.message ?? 'Database operation failed.';
  if (code === '42501' || msg.toLowerCase().includes('row-level security')) {
    return `Permission denied by Supabase Row Level Security while trying to ${actionLabel}. Please enable the public INSERT policy on this table in your Supabase dashboard.`;
  }
  if (code === '23505') {
    return 'This record already exists.';
  }
  return msg;
}

function mapProductFromDb(
  row: Record<string, unknown>,
  index: number,
  treatZeroStockAsAvailable: boolean
): Product {
  const id = String(row.id);
  const name = String(row.name ?? 'Vespera Beauty Creation');
  const dbCategory = String(row.category ?? 'Makeup');
  const storefrontCategory = mapCategoryToStorefront(dbCategory);
  const rawPrice = Number(row.price ?? row.price_pkr ?? 0);
  const rawStock = Number(row.stock ?? 0);
  const effectiveStock = treatZeroStockAsAvailable && rawStock <= 0 ? 25 : Math.max(0, rawStock);
  const description = String(row.description ?? '');

  return {
    id,
    slug: slugify(name, id),
    name,
    subtitle: description,
    category: storefrontCategory,
    dbCategory,
    subcategory: dbCategory,
    description,
    ingredients:
      'Formulated with cold-pressed Damask rosewater, plant squalane, niacinamide, and vitamin E.',
    ritualGuide:
      'Apply evenly to clean skin or lips as part of your morning and evening Vespera Beauty ritual.',
    pricePkr: rawPrice,
    discountPricePkr: null,
    stock: effectiveStock,
    sku: `VB-${id.slice(0, 6).toUpperCase()}`,
    imageUrl: resolveProductImage(name, dbCategory, row.image_url),
    shades: [],
    volume: inferVolumeFromName(name, dbCategory),
    rating: 4.9,
    reviewCount: 18 + (index % 7) * 5,
    isBestSeller: index < 6,
    isNewArrival: index >= 3 && index < 9,
    isFeatured: index < 6,
    isActive: true,
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

export async function testDatabaseConnection(): Promise<DatabaseStatus> {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      mode: 'local',
      connected: false,
      message:
        'Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY) are not configured.',
    };
  }
  try {
    const { error } = await supabase.from('products').select('id').limit(1);
    if (error) {
      return {
        mode: 'local',
        connected: false,
        message: `Supabase query returned: ${error.message}`,
      };
    }
    return {
      mode: 'supabase',
      connected: true,
      message: 'Connected live to Supabase PostgreSQL (products, orders, order_items, newsletter_subscribers, inquiries).',
    };
  } catch (err) {
    return {
      mode: 'local',
      connected: false,
      message: err instanceof Error ? err.message : 'Unable to reach Supabase.',
    };
  }
}

export async function fetchProducts(): Promise<Product[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, description, price, category, image_url, stock, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(formatSupabaseError(error, 'load products'));
    }

    if (data && data.length > 0) {
      // Deduplicate identical seeded rows by name+category+price while preserving real DB UUIDs
      const seen = new Set<string>();
      const uniqueRows: Record<string, unknown>[] = [];
      for (const row of data as Record<string, unknown>[]) {
        const key = `${String(row.name ?? '').trim().toLowerCase()}::${String(row.category ?? '').trim().toLowerCase()}::${Number(row.price ?? 0)}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueRows.push(row);
        }
      }

      const hasAnyPositiveStock = uniqueRows.some((r) => Number(r.stock ?? 0) > 0);
      return uniqueRows.map((row, idx) =>
        mapProductFromDb(row, idx, !hasAnyPositiveStock)
      );
    }

    return [];
  }

  const local = readLocal<Product[]>(LS_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  if (local.length === 0) {
    writeLocal(LS_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    return INITIAL_PRODUCTS;
  }
  return local;
}

export async function upsertProduct(product: Product): Promise<Product> {
  if (supabase) {
    const payload = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.pricePkr,
      category: product.dbCategory ?? product.subcategory ?? product.category,
      image_url: product.imageUrl || null,
      stock: product.stock,
    };

    const { data, error } = await supabase
      .from('products')
      .upsert(payload, { onConflict: 'id' })
      .select('id, name, description, price, category, image_url, stock, created_at')
      .single();

    if (error) {
      throw new Error(formatSupabaseError(error, 'save product'));
    }
    if (data) {
      return mapProductFromDb(data as Record<string, unknown>, 0, false);
    }
  }

  const existing = readLocal<Product[]>(LS_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const idx = existing.findIndex((p) => p.id === product.id);
  const updated =
    idx >= 0
      ? existing.map((p) => (p.id === product.id ? product : p))
      : [product, ...existing];
  writeLocal(LS_KEYS.PRODUCTS, updated);
  return product;
}

export async function deleteProductById(productId: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) throw new Error(formatSupabaseError(error, 'delete product'));
    return;
  }
  const existing = readLocal<Product[]>(LS_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  writeLocal(
    LS_KEYS.PRODUCTS,
    existing.filter((p) => p.id !== productId)
  );
}

export async function createOrder(
  orderInput: Omit<Order, 'id' | 'trackingId' | 'createdAt' | 'status'>
): Promise<Order> {
  const now = new Date().toISOString();
  const orderId = crypto.randomUUID();
  const trackingId = `VB-${orderId.slice(0, 8).toUpperCase()}`;

  if (supabase) {
    const formattedAddressParts = [
      orderInput.shippingAddress,
      orderInput.city,
      orderInput.postalCode ? `Postal Code: ${orderInput.postalCode}` : '',
      `Payment: ${orderInput.paymentMethod}`,
      orderInput.promoCode ? `Promo: ${orderInput.promoCode}` : '',
      orderInput.orderNotes ? `Notes: ${orderInput.orderNotes}` : '',
    ].filter(Boolean);

    const { error: orderError } = await supabase.from('orders').insert({
      id: orderId,
      customer_name: orderInput.customerName,
      email: orderInput.customerEmail,
      phone: orderInput.customerPhone,
      address: formattedAddressParts.join(' · '),
      total_amount: orderInput.totalPkr,
      status: 'Pending',
    });

    if (orderError) {
      throw new Error(formatSupabaseError(orderError, 'place order'));
    }

    const itemPayloads = orderInput.items.map((item) => ({
      order_id: orderId,
      product_id: item.productId,
      product_name: item.selectedVariant
        ? `${item.productName} (${item.selectedVariant})`
        : item.productName,
      price: item.unitPricePkr,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(itemPayloads);
    if (itemsError) {
      throw new Error(formatSupabaseError(itemsError, 'save order items'));
    }

    const savedOrder: Order = {
      ...orderInput,
      id: orderId,
      trackingId,
      status: 'Pending',
      createdAt: now,
    };

    // Keep customer's own order history locally when public SELECT on orders is restricted by RLS
    const localOrders = readLocal<Order[]>(LS_KEYS.ORDERS, []);
    writeLocal(LS_KEYS.ORDERS, [savedOrder, ...localOrders.filter((o) => o.id !== orderId)]);

    return savedOrder;
  }

  const randomCode = Math.floor(1000 + Math.random() * 9000);
  const newOrder: Order = {
    ...orderInput,
    id: orderId,
    trackingId: `VB-2026-${randomCode}`,
    status: 'Pending',
    createdAt: now,
  };

  const orders = readLocal<Order[]>(LS_KEYS.ORDERS, []);
  writeLocal(LS_KEYS.ORDERS, [newOrder, ...orders]);
  return newOrder;
}

export async function fetchOrders(): Promise<Order[]> {
  const localOrders = readLocal<Order[]>(LS_KEYS.ORDERS, []);
  if (supabase) {
    const { data, error } = await supabase
      .from('orders')
      .select(
        'id, customer_name, email, phone, address, total_amount, status, created_at, order_items(id, order_id, product_id, product_name, price, quantity)'
      )
      .order('created_at', { ascending: false });

    if (error) {
      if (localOrders.length > 0) return localOrders;
      throw new Error(formatSupabaseError(error, 'load orders'));
    }

    if (data && data.length > 0) {
      const remoteOrders: Order[] = data.map((row: Record<string, unknown>) => {
        const orderIdStr = String(row.id);
        const totalAmt = Number(row.total_amount ?? 0);
        const rawItems = Array.isArray(row.order_items)
          ? (row.order_items as Record<string, unknown>[])
          : [];
        return {
          id: orderIdStr,
          trackingId: `VB-${orderIdStr.slice(0, 8).toUpperCase()}`,
          customerName: String(row.customer_name ?? ''),
          customerEmail: String(row.email ?? ''),
          customerPhone: String(row.phone ?? ''),
          shippingAddress: String(row.address ?? ''),
          city: '',
          postalCode: '',
          orderNotes: '',
          paymentMethod: 'Cash on Delivery',
          subtotalPkr: totalAmt,
          shippingPkr: 0,
          discountPkr: 0,
          totalPkr: totalAmt,
          promoCode: '',
          status: (row.status as OrderStatus) ?? 'Pending',
          createdAt: String(row.created_at ?? new Date().toISOString()),
          items: rawItems.map((it) => {
            const unitPrice = Number(it.price ?? 0);
            const quantity = Number(it.quantity ?? 1);
            return {
              id: String(it.id),
              productId: String(it.product_id ?? ''),
              productName: String(it.product_name ?? ''),
              productImage: '',
              selectedVariant: '',
              unitPricePkr: unitPrice,
              quantity,
              lineTotalPkr: unitPrice * quantity,
            };
          }),
        };
      });
      const seen = new Set(remoteOrders.map((o) => o.id));
      return [...remoteOrders, ...localOrders.filter((o) => !seen.has(o.id))];
    }
  }
  return localOrders;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (error) throw new Error(formatSupabaseError(error, 'update order status'));
    return;
  }
  const orders = readLocal<Order[]>(LS_KEYS.ORDERS, []);
  writeLocal(
    LS_KEYS.ORDERS,
    orders.map((o) => (o.id === orderId ? { ...o, status } : o))
  );
}

export async function subscribeNewsletter(email: string): Promise<NewsletterResult> {
  const cleaned = email.trim().toLowerCase();
  if (!cleaned || !cleaned.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }

  if (supabase) {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: cleaned });

    if (error) {
      if (error.code === '23505') {
        return { alreadySubscribed: true, email: cleaned };
      }
      throw new Error(formatSupabaseError(error, 'subscribe to the newsletter'));
    }

    return { alreadySubscribed: false, email: cleaned };
  }

  const existing = readLocal<string[]>(LS_KEYS.NEWSLETTER, []);
  if (existing.includes(cleaned)) {
    return { alreadySubscribed: true, email: cleaned };
  }
  writeLocal(LS_KEYS.NEWSLETTER, [cleaned, ...existing]);
  return { alreadySubscribed: false, email: cleaned };
}

export async function submitInquiry(input: InquiryInput): Promise<void> {
  const payload = {
    name: input.name.trim(),
    phone: input.phone.trim(),
    subject: input.subject.trim(),
    message: input.message.trim(),
  };

  if (!payload.name || !payload.phone || !payload.message) {
    throw new Error('Please fill in your name, phone number, and message.');
  }

  if (supabase) {
    const { error } = await supabase.from('inquiries').insert(payload);
    if (error) {
      throw new Error(formatSupabaseError(error, 'submit your inquiry'));
    }
    return;
  }

  const existing = readLocal<InquiryInput[]>(LS_KEYS.INQUIRIES, []);
  writeLocal(LS_KEYS.INQUIRIES, [payload, ...existing]);
}

export async function fetchCustomersFromOrders(orders: Order[]): Promise<CustomerRecord[]> {
  const map = new Map<string, CustomerRecord>();
  for (const ord of orders) {
    const key = (ord.customerEmail || ord.customerPhone || ord.id).toLowerCase();
    const existing = map.get(key);
    if (existing) {
      existing.totalOrders += 1;
      existing.totalSpentPkr += ord.totalPkr;
    } else {
      map.set(key, {
        id: key,
        fullName: ord.customerName,
        email: ord.customerEmail,
        phone: ord.customerPhone,
        city: ord.city || 'Pakistan',
        address: ord.shippingAddress,
        postalCode: ord.postalCode,
        totalOrders: 1,
        totalSpentPkr: ord.totalPkr,
        createdAt: ord.createdAt,
      });
    }
  }
  return Array.from(map.values());
}

export async function fetchReviews(): Promise<ProductReview[]> {
  const local = readLocal<ProductReview[]>(LS_KEYS.REVIEWS, INITIAL_REVIEWS);
  if (local.length === 0) {
    writeLocal(LS_KEYS.REVIEWS, INITIAL_REVIEWS);
    return INITIAL_REVIEWS;
  }
  return local;
}

export async function submitReview(
  review: Omit<ProductReview, 'id' | 'createdAt' | 'verifiedPurchase'>
): Promise<ProductReview> {
  const created: ProductReview = {
    ...review,
    id: crypto.randomUUID(),
    verifiedPurchase: true,
    createdAt: new Date().toISOString(),
  };
  const existing = readLocal<ProductReview[]>(LS_KEYS.REVIEWS, INITIAL_REVIEWS);
  writeLocal(LS_KEYS.REVIEWS, [created, ...existing]);
  return created;
}

export async function signInAdmin(
  email: string,
  password: string
): Promise<{ success: boolean; mode: 'supabase' | 'local'; error?: string }> {
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.user) {
      return { success: true, mode: 'supabase' };
    }
    if (error) {
      return { success: false, mode: 'supabase', error: error.message };
    }
  }

  if (email.trim().toLowerCase().includes('@') && password.length >= 6) {
    writeLocal(LS_KEYS.ADMIN_SESSION, { email, authenticatedAt: new Date().toISOString() });
    return { success: true, mode: 'local' };
  }
  return {
    success: false,
    mode: 'local',
    error: 'Enter a valid email and password (minimum 6 characters).',
  };
}

export async function checkAdminSession(): Promise<boolean> {
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) return true;
  }
  const local = readLocal<{ email?: string } | null>(LS_KEYS.ADMIN_SESSION, null);
  return Boolean(local?.email);
}

export async function signOutAdmin(): Promise<void> {
  if (supabase) {
    await supabase.auth.signOut();
  }
  localStorage.removeItem(LS_KEYS.ADMIN_SESSION);
}

export function formatPkr(amount: number): string {
  return `PKR ${Math.round(amount).toLocaleString('en-PK')}`;
}
