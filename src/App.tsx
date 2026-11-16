import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CartItem,
  CustomerRecord,
  Order,
  PageRoute,
  Product,
  ProductReview,
} from './types/store';
import { INITIAL_PRODUCTS, INITIAL_REVIEWS } from './data/catalog';
import { isSupabaseConfigured } from './lib/supabase';
import {
  fetchCustomersFromOrders,
  fetchOrders,
  fetchProducts,
  fetchReviews,
  submitReview,
} from './services/storeService';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { QuickViewModal } from './components/QuickViewModal';
import { SearchModal } from './components/SearchModal';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import {
  AboutPage,
  ContactPage,
  FaqPage,
  ReviewsPage,
} from './pages/EditorialPages';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

const CART_STORAGE_KEY = 'vb_cart_v1';
const WISHLIST_STORAGE_KEY = 'vb_wishlist_v1';

function parseLocation(): { route: PageRoute; slug?: string } {
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  if (!path) return { route: 'home' };
  if (path.startsWith('product/')) {
    return { route: 'product-details', slug: path.slice('product/'.length) };
  }
  const validRoutes: PageRoute[] = [
    'home',
    'about',
    'shop',
    'makeup',
    'skincare',
    'haircare',
    'perfumes',
    'body-care',
    'accessories',
    'best-sellers',
    'new-arrivals',
    'cart',
    'checkout',
    'contact',
    'reviews',
    'faq',
    'admin',
  ];
  if (validRoutes.includes(path as PageRoute)) {
    return { route: path as PageRoute };
  }
  return { route: 'home' };
}

export default function App() {
  const initialLoc = parseLocation();
  const [route, setRoute] = useState<PageRoute>(initialLoc.route);
  const [productSlug, setProductSlug] = useState<string | undefined>(initialLoc.slug);

  const [products, setProducts] = useState<Product[]>(
    isSupabaseConfigured() ? [] : INITIAL_PRODUCTS
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>(INITIAL_REVIEWS);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as string[]) : [];
    } catch {
      return [];
    }
  });

  const [promoCode, setPromoCode] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  useEffect(() => {
    const handlePop = () => {
      const next = parseLocation();
      setRoute(next.route);
      setProductSlug(next.slug);
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const loadStoreData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [prodResult, ordResult, revList] = await Promise.allSettled([
        fetchProducts(),
        fetchOrders(),
        fetchReviews(),
      ]);

      if (prodResult.status === 'fulfilled') {
        setProducts(prodResult.value);
      } else {
        setLoadError(
          prodResult.reason instanceof Error
            ? prodResult.reason.message
            : 'Unable to load products from Supabase.'
        );
      }

      if (ordResult.status === 'fulfilled') {
        setOrders(ordResult.value);
        const derivedCustomers = await fetchCustomersFromOrders(ordResult.value);
        setCustomers(derivedCustomers);
      }

      if (revList.status === 'fulfilled') {
        setReviews(revList.value);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStoreData();
  }, [loadStoreData]);

  const navigate = useCallback((nextRoute: PageRoute, slug?: string) => {
    setRoute(nextRoute);
    setProductSlug(slug);
    const targetUrl =
      nextRoute === 'home'
        ? '/'
        : nextRoute === 'product-details' && slug
        ? `/product/${slug}`
        : `/${nextRoute}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState({}, '', targetUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleToggleWishlist = useCallback((productId: string) => {
    setWishlistIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  }, []);

  const handleAddToCart = useCallback(
    (product: Product, variant?: string, qty = 1) => {
      if (product.stock <= 0) return;
      const selectedVariant = variant || product.shades[0] || product.volume;
      const unitPricePkr = product.discountPricePkr ?? product.pricePkr;

      setCart((prev) => {
        const existingIdx = prev.findIndex(
          (i) => i.productId === product.id && i.selectedVariant === selectedVariant
        );
        if (existingIdx >= 0) {
          return prev.map((item, idx) =>
            idx === existingIdx
              ? { ...item, quantity: Math.min(product.stock, item.quantity + qty) }
              : item
          );
        }
        return [
          ...prev,
          {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            category: product.category,
            imageUrl: product.imageUrl,
            selectedVariant,
            unitPricePkr,
            originalPricePkr: product.pricePkr,
            quantity: Math.min(product.stock, qty),
            stock: product.stock,
          },
        ];
      });
      setCartOpen(true);
    },
    []
  );

  const handleUpdateCartQty = useCallback((productId: string, variant: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) =>
        prev.filter((i) => !(i.productId === productId && i.selectedVariant === variant))
      );
      return;
    }
    setCart((prev) =>
      prev.map((i) =>
        i.productId === productId && i.selectedVariant === variant
          ? { ...i, quantity: Math.min(i.stock, qty) }
          : i
      )
    );
  }, []);

  const handleRemoveCartItem = useCallback((productId: string, variant: string) => {
    setCart((prev) =>
      prev.filter((i) => !(i.productId === productId && i.selectedVariant === variant))
    );
  }, []);

  const handleOrderCreated = useCallback(async (order: Order) => {
    setOrders((prev) => {
      const nextOrders = [order, ...prev];
      void fetchCustomersFromOrders(nextOrders).then(setCustomers);
      return nextOrders;
    });
    try {
      const [freshProducts, freshOrders] = await Promise.all([
        fetchProducts(),
        fetchOrders(),
      ]);
      setProducts(freshProducts);
      setOrders(freshOrders);
      const derivedCustomers = await fetchCustomersFromOrders(freshOrders);
      setCustomers(derivedCustomers);
    } catch {
      // Keep confirmed order in state even if background refresh fails
    }
  }, []);

  const handleReviewSubmit = useCallback(
    async (reviewInput: {
      productId?: string;
      productName: string;
      customerName: string;
      customerCity: string;
      rating: number;
      title: string;
      comment: string;
    }) => {
      const created = await submitReview(reviewInput);
      setReviews((prev) => [created, ...prev]);
    },
    []
  );

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const activeProduct = useMemo(
    () => products.find((p) => p.slug === productSlug),
    [products, productSlug]
  );

  const isCatalogRoute = [
    'shop',
    'makeup',
    'skincare',
    'haircare',
    'perfumes',
    'body-care',
    'accessories',
    'best-sellers',
    'new-arrivals',
  ].includes(route);

  return (
    <div className="min-h-screen flex flex-col bg-[#090909] text-[#FFFFFF]">
      <Header
        currentRoute={route}
        onNavigate={navigate}
        cartCount={cartCount}
        wishlistCount={wishlistIds.length}
        onOpenCart={() => setCartOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenWishlist={() => setWishlistOpen(true)}
      />

      <main className="flex-1">
        {loadError && (
          <div className="bg-[#111111] border-b border-[#E8A1B2]/60 px-4 py-3 text-center text-xs text-[#F4C6D0] flex flex-wrap items-center justify-center gap-3">
            <span>{loadError}</span>
            <button
              type="button"
              onClick={() => void loadStoreData()}
              className="px-3 py-1 rounded-lg bg-[#D4AF70] text-[#090909] font-semibold hover:bg-[#C69B52] transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {loading && products.length === 0 ? (
          <div className="min-h-[70vh] flex flex-col items-center justify-center bg-luxury-marble gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-[#D4AF70] border-t-[#E8A1B2] animate-spin" />
            <p className="font-display text-2xl text-[#F4C6D0]">Opening Vespera Beauty...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${route}-${productSlug ?? ''}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {route === 'home' && (
                <HomePage
                  products={products}
                  reviews={reviews}
                  wishlistIds={wishlistIds}
                  onToggleWishlist={handleToggleWishlist}
                  onAddToCart={(p) => handleAddToCart(p)}
                  onQuickView={setQuickViewProduct}
                  onNavigate={navigate}
                />
              )}

              {isCatalogRoute && (
                <CatalogPage
                  route={route}
                  products={products}
                  wishlistIds={wishlistIds}
                  onToggleWishlist={handleToggleWishlist}
                  onAddToCart={(p) => handleAddToCart(p)}
                  onQuickView={setQuickViewProduct}
                  onNavigate={navigate}
                />
              )}

              {route === 'product-details' && (
                <ProductDetailsPage
                  product={activeProduct}
                  allProducts={products}
                  reviews={reviews}
                  wishlistIds={wishlistIds}
                  onToggleWishlist={handleToggleWishlist}
                  onAddToCart={handleAddToCart}
                  onQuickView={setQuickViewProduct}
                  onNavigate={navigate}
                  onSubmitReview={handleReviewSubmit}
                />
              )}

              {route === 'cart' && (
                <CartPage
                  items={cart}
                  promoCode={promoCode}
                  onApplyPromo={setPromoCode}
                  onUpdateQty={handleUpdateCartQty}
                  onRemoveItem={handleRemoveCartItem}
                  onNavigate={navigate}
                />
              )}

              {route === 'checkout' && (
                <CheckoutPage
                  items={cart}
                  promoCode={promoCode}
                  orders={orders}
                  onOrderCreated={handleOrderCreated}
                  onClearCart={() => {
                    setCart([]);
                    setPromoCode('');
                  }}
                  onNavigate={navigate}
                />
              )}

              {route === 'about' && <AboutPage onNavigate={navigate} />}
              {route === 'contact' && <ContactPage />}
              {route === 'reviews' && (
                <ReviewsPage reviews={reviews} onSubmitReview={handleReviewSubmit} />
              )}
              {route === 'faq' && <FaqPage />}

              {route === 'admin' && (
                <AdminDashboardPage
                  products={products}
                  orders={orders}
                  customers={customers}
                  onProductsChanged={setProducts}
                  onOrdersChanged={setOrders}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      <Footer onNavigate={(r) => navigate(r)} />

      {/* Interactive Overlays */}
      <CartDrawer
        open={cartOpen}
        items={cart}
        onClose={() => setCartOpen(false)}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onNavigate={(r) => navigate(r)}
      />

      <WishlistDrawer
        open={wishlistOpen}
        products={products}
        wishlistIds={wishlistIds}
        onClose={() => setWishlistOpen(false)}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={(p) => handleAddToCart(p)}
        onViewProduct={(slug) => navigate('product-details', slug)}
      />

      <QuickViewModal
        product={quickViewProduct}
        isWishlisted={quickViewProduct ? wishlistIds.includes(quickViewProduct.id) : false}
        onClose={() => setQuickViewProduct(null)}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
        onViewDetails={(slug) => navigate('product-details', slug)}
      />

      <SearchModal
        open={searchOpen}
        products={products}
        onClose={() => setSearchOpen(false)}
        onSelectProduct={(slug) => navigate('product-details', slug)}
      />
    </div>
  );
}
