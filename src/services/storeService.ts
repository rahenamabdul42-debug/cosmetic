import { INITIAL_PRODUCTS, INITIAL_REVIEWS } from '../data/catalog';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  CustomerRecord,
  DatabaseStatus,
  Order,
  OrderStatus,
  Product,
  ProductReview,
} from '../types/store';

const LS_KEYS = {
  PRODUCTS: 'mr_store_products_v1',
  ORDERS: 'mr_store_orders_v1',
  CUSTOMERS: 'mr_store_customers_v1',
  REVIEWS: 'mr_store_reviews_v1',
  ADMIN_SESSION: 'mr_admin_session_v1',
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

function mapProductFromDb(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    subtitle: String(row.subtitle ?? ''),
    category: row.category as Product['category'],
    subcategory: String(row.subcategory ?? ''),
    description: String(row.description ?? ''),
    ingredients: String(row.ingredients ?? ''),
    ritualGuide: String(row.ritual_guide ?? ''),
    pricePkr: Number(row.price_pkr ?? 0),
    discountPricePkr: row.discount_price_pkr != null ? Number(row.discount_price_pkr) : null,
    stock: Number(row.stock ?? 0),
    sku: String(row.sku ?? ''),
    imageUrl: String(row.image_url ?? ''),
    shades: Array.isArray(row.shades) ? (row.shades as string[]) : [],
    volume: String(row.volume ?? ''),
    rating: Number(row.rating ?? 4.9),
    reviewCount: Number(row.review_count ?? 0),
    isBestSeller: Boolean(row.is_best_seller),
    isNewArrival: Boolean(row.is_new_arrival),
    isFeatured: Boolean(row.is_featured),
    isActive: row.is_active !== false,
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

export async function testDatabaseConnection(): Promise<DatabaseStatus> {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      mode: 'local',
      connected: false,
      message:
        'Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are not configured. Running with browser LocalStorage persistence.',
    };
  }
  try {
    const { error } = await supabase.from('products').select('id').limit(1);
    if (error) {
      return {
        mode: 'local',
        connected: false,
        message: `Supabase configured, but query returned: ${error.message}. Run supabase/schema.sql first.`,
      };
    }
    return {
      mode: 'supabase',
      connected: true,
      message: 'Connected live to Supabase PostgreSQL with Row Level Security.',
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
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((row) => mapProductFromDb(row as Record<string, unknown>));
    }
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
      slug: product.slug,
      name: product.name,
      subtitle: product.subtitle,
      category: product.category,
      subcategory: product.subcategory,
      description: product.description,
      ingredients: product.ingredients,
      ritual_guide: product.ritualGuide,
      price_pkr: product.pricePkr,
      discount_price_pkr: product.discountPricePkr,
      stock: product.stock,
      sku: product.sku,
      image_url: product.imageUrl,
      shades: product.shades,
      volume: product.volume,
      rating: product.rating,
      review_count: product.reviewCount,
      is_best_seller: product.isBestSeller,
      is_new_arrival: product.isNewArrival,
      is_featured: product.isFeatured,
      is_active: product.isActive,
    };

    const { data, error } = await supabase
      .from('products')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    if (data) {
      return mapProductFromDb(data as Record<string, unknown>);
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
    if (error) throw new Error(error.message);
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
  const randomCode = Math.floor(1000 + Math.random() * 9000);
  const trackingId = `MR-2026-${randomCode}`;
  const now = new Date().toISOString();

  if (supabase) {
    // 1. Upsert Customer
    let customerId: string | undefined;
    const { data: existingCust } = await supabase
      .from('customers')
      .select('id, total_orders, total_spent_pkr')
      .eq('email', orderInput.customerEmail)
      .maybeSingle();

    if (existingCust) {
      customerId = existingCust.id;
    } else {
      const { data: newCust } = await supabase
        .from('customers')
        .insert({
          full_name: orderInput.customerName,
          email: orderInput.customerEmail,
          phone: orderInput.customerPhone,
          city: orderInput.city,
          address: orderInput.shippingAddress,
          postal_code: orderInput.postalCode,
          total_orders: 1,
          total_spent_pkr: orderInput.totalPkr,
        })
        .select('id')
        .single();
      customerId = newCust?.id;
    }

    // 2. Insert Order
    const { data: orderRow, error: orderError } = await supabase
      .from('orders')
      .insert({
        tracking_id: trackingId,
        customer_id: customerId ?? null,
        customer_name: orderInput.customerName,
        customer_email: orderInput.customerEmail,
        customer_phone: orderInput.customerPhone,
        shipping_address: orderInput.shippingAddress,
        city: orderInput.city,
        postal_code: orderInput.postalCode,
        order_notes: orderInput.orderNotes,
        payment_method: orderInput.paymentMethod,
        subtotal_pkr: orderInput.subtotalPkr,
        shipping_pkr: orderInput.shippingPkr,
        discount_pkr: orderInput.discountPkr,
        total_pkr: orderInput.totalPkr,
        promo_code: orderInput.promoCode,
        status: 'Pending',
      })
      .select()
      .single();

    if (orderError || !orderRow) {
      throw new Error(orderError?.message ?? 'Failed to save order to Supabase.');
    }

    // 3. Insert Order Items
    const itemPayloads = orderInput.items.map((item) => ({
      order_id: orderRow.id,
      product_id: item.productId,
      product_name: item.productName,
      product_image: item.productImage,
      selected_variant: item.selectedVariant,
      unit_price_pkr: item.unitPricePkr,
      quantity: item.quantity,
      line_total_pkr: item.lineTotalPkr,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(itemPayloads);
    if (itemsError) {
      throw new Error(itemsError.message);
    }

    return {
      ...orderInput,
      id: orderRow.id,
      trackingId: orderRow.tracking_id,
      customerId,
      status: 'Pending',
      createdAt: orderRow.created_at,
    };
  }

  // LocalStorage fallback
  const newOrder: Order = {
    ...orderInput,
    id: crypto.randomUUID(),
    trackingId,
    status: 'Pending',
    createdAt: now,
  };

  const orders = readLocal<Order[]>(LS_KEYS.ORDERS, []);
  writeLocal(LS_KEYS.ORDERS, [newOrder, ...orders]);

  // Upsert local customer
  const customers = readLocal<CustomerRecord[]>(LS_KEYS.CUSTOMERS, []);
  const existingCustomerIdx = customers.findIndex(
    (c) => c.email.toLowerCase() === orderInput.customerEmail.toLowerCase()
  );
  if (existingCustomerIdx >= 0) {
    const prev = customers[existingCustomerIdx];
    customers[existingCustomerIdx] = {
      ...prev,
      fullName: orderInput.customerName,
      phone: orderInput.customerPhone,
      city: orderInput.city,
      address: orderInput.shippingAddress,
      postalCode: orderInput.postalCode,
      totalOrders: prev.totalOrders + 1,
      totalSpentPkr: prev.totalSpentPkr + orderInput.totalPkr,
    };
  } else {
    customers.unshift({
      id: crypto.randomUUID(),
      fullName: orderInput.customerName,
      email: orderInput.customerEmail,
      phone: orderInput.customerPhone,
      city: orderInput.city,
      address: orderInput.shippingAddress,
      postalCode: orderInput.postalCode,
      totalOrders: 1,
      totalSpentPkr: orderInput.totalPkr,
      createdAt: now,
    });
  }
  writeLocal(LS_KEYS.CUSTOMERS, customers);

  // Decrement stock locally
  const products = readLocal<Product[]>(LS_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const updatedProducts = products.map((p) => {
    const bought = orderInput.items.find((i) => i.productId === p.id);
    if (!bought) return p;
    return { ...p, stock: Math.max(0, p.stock - bought.quantity) };
  });
  writeLocal(LS_KEYS.PRODUCTS, updatedProducts);

  return newOrder;
}

export async function fetchOrders(): Promise<Order[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data.map((row: Record<string, unknown>) => ({
        id: String(row.id),
        trackingId: String(row.tracking_id),
        customerId: row.customer_id ? String(row.customer_id) : undefined,
        customerName: String(row.customer_name),
        customerEmail: String(row.customer_email),
        customerPhone: String(row.customer_phone),
        shippingAddress: String(row.shipping_address),
        city: String(row.city),
        postalCode: String(row.postal_code ?? ''),
        orderNotes: String(row.order_notes ?? ''),
        paymentMethod: (row.payment_method as Order['paymentMethod']) ?? 'Cash on Delivery',
        subtotalPkr: Number(row.subtotal_pkr ?? 0),
        shippingPkr: Number(row.shipping_pkr ?? 0),
        discountPkr: Number(row.discount_pkr ?? 0),
        totalPkr: Number(row.total_pkr ?? 0),
        promoCode: String(row.promo_code ?? ''),
        status: (row.status as OrderStatus) ?? 'Pending',
        createdAt: String(row.created_at),
        items: Array.isArray(row.order_items)
          ? (row.order_items as Record<string, unknown>[]).map((it) => ({
              id: String(it.id),
              productId: String(it.product_id ?? ''),
              productName: String(it.product_name),
              productImage: String(it.product_image ?? ''),
              selectedVariant: String(it.selected_variant ?? ''),
              unitPricePkr: Number(it.unit_price_pkr ?? 0),
              quantity: Number(it.quantity ?? 1),
              lineTotalPkr: Number(it.line_total_pkr ?? 0),
            }))
          : [],
      }));
    }
  }
  return readLocal<Order[]>(LS_KEYS.ORDERS, []);
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (error) throw new Error(error.message);
    return;
  }
  const orders = readLocal<Order[]>(LS_KEYS.ORDERS, []);
  writeLocal(
    LS_KEYS.ORDERS,
    orders.map((o) => (o.id === orderId ? { ...o, status } : o))
  );
}

export async function fetchCustomers(): Promise<CustomerRecord[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) {
      return data.map((c: Record<string, unknown>) => ({
        id: String(c.id),
        fullName: String(c.full_name),
        email: String(c.email),
        phone: String(c.phone),
        city: String(c.city ?? ''),
        address: String(c.address ?? ''),
        postalCode: String(c.postal_code ?? ''),
        totalOrders: Number(c.total_orders ?? 0),
        totalSpentPkr: Number(c.total_spent_pkr ?? 0),
        createdAt: String(c.created_at),
      }));
    }
  }
  return readLocal<CustomerRecord[]>(LS_KEYS.CUSTOMERS, []);
}

export async function fetchReviews(): Promise<ProductReview[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      return data.map((r: Record<string, unknown>) => ({
        id: String(r.id),
        productId: r.product_id ? String(r.product_id) : undefined,
        productName: String(r.product_name ?? ''),
        customerName: String(r.customer_name),
        customerCity: String(r.customer_city ?? 'Lahore'),
        rating: Number(r.rating ?? 5),
        title: String(r.title),
        comment: String(r.comment),
        verifiedPurchase: Boolean(r.verified_purchase),
        createdAt: String(r.created_at),
      }));
    }
  }
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
  if (supabase) {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        product_id: review.productId ?? null,
        product_name: review.productName,
        customer_name: review.customerName,
        customer_city: review.customerCity,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        verified_purchase: true,
      })
      .select()
      .single();
    if (!error && data) {
      return {
        ...review,
        id: String(data.id),
        verifiedPurchase: true,
        createdAt: String(data.created_at),
      };
    }
  }

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
    if (error) {
      return { success: false, mode: 'supabase', error: error.message };
    }
    if (data.user) {
      const { data: adminRow } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', data.user.id)
        .maybeSingle();
      if (!adminRow) {
        await supabase.auth.signOut();
        return {
          success: false,
          mode: 'supabase',
          error: 'This account does not have admin authorization in admin_users.',
        };
      }
      return { success: true, mode: 'supabase' };
    }
  }

  // Local demo mode when Supabase isn't configured yet
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
    if (!data.session?.user) return false;
    const { data: adminRow } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', data.session.user.id)
      .maybeSingle();
    return Boolean(adminRow);
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
