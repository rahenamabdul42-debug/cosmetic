import React, { useEffect, useState } from 'react';
import {
  Database,
  Edit3,
  Lock,
  LogOut,
  Package,
  Plus,
  ShoppingBag,
  Trash2,
  TrendingUp,
  Upload,
  Users,
} from 'lucide-react';
import {
  CustomerRecord,
  DatabaseStatus,
  Order,
  OrderStatus,
  Product,
  ProductCategory,
} from '../types/store';
import {
  checkAdminSession,
  deleteProductById,
  formatPkr,
  signInAdmin,
  signOutAdmin,
  testDatabaseConnection,
  updateOrderStatus,
  upsertProduct,
} from '../services/storeService';
import { PRODUCT_IMAGES } from '../data/productImages';

interface AdminDashboardPageProps {
  products: Product[];
  orders: Order[];
  customers: CustomerRecord[];
  onProductsChanged: (products: Product[]) => void;
  onOrdersChanged: (orders: Order[]) => void;
}

const CATEGORIES: ProductCategory[] = [
  'Makeup',
  'Skincare',
  'Haircare',
  'Perfumes',
  'Body Care',
  'Beauty Accessories',
];

const ORDER_STATUSES: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Packed',
  'Shipped',
  'Delivered',
  'Cancelled',
];

export function AdminDashboardPage({
  products,
  orders,
  customers,
  onProductsChanged,
  onOrdersChanged,
}: AdminDashboardPageProps) {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'customers'>(
    'overview'
  );

  // Add / Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formCategory, setFormCategory] = useState<ProductCategory>('Makeup');
  const [formSubcategory, setFormSubcategory] = useState('Lipsticks');
  const [formPrice, setFormPrice] = useState('4500');
  const [formDiscount, setFormDiscount] = useState('');
  const [formStock, setFormStock] = useState('25');
  const [formVolume, setFormVolume] = useState('30ml');
  const [formImage, setFormImage] = useState(PRODUCT_IMAGES.velvetLipstick);
  const [formDesc, setFormDesc] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    (async () => {
      const [isAuthed, status] = await Promise.all([
        checkAdminSession(),
        testDatabaseConnection(),
      ]);
      setAuthenticated(isAuthed);
      setDbStatus(status);
      setCheckingAuth(false);
    })();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const res = await signInAdmin(email, password);
    if (!res.success) {
      setAuthError(res.error ?? 'Authentication failed.');
      return;
    }
    setAuthenticated(true);
  };

  const handleLogout = async () => {
    await signOutAdmin();
    setAuthenticated(false);
  };

  const openAddProduct = () => {
    setActionError('');
    setEditingProduct(null);
    setFormName('');
    setFormSubtitle('');
    setFormCategory('Makeup');
    setFormSubcategory('Lipsticks');
    setFormPrice('4800');
    setFormDiscount('');
    setFormStock('30');
    setFormVolume('30ml');
    setFormImage(PRODUCT_IMAGES.velvetLipstick);
    setFormDesc('');
    setShowProductForm(true);
  };

  const openEditProduct = (p: Product) => {
    setActionError('');
    setEditingProduct(p);
    setFormName(p.name);
    setFormSubtitle(p.subtitle);
    setFormCategory(p.category);
    setFormSubcategory(p.subcategory);
    setFormPrice(String(p.pricePkr));
    setFormDiscount(p.discountPricePkr ? String(p.discountPricePkr) : '');
    setFormStock(String(p.stock));
    setFormVolume(p.volume);
    setFormImage(p.imageUrl);
    setFormDesc(p.description);
    setShowProductForm(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProduct(true);
    setActionError('');
    try {
      const slug =
        editingProduct?.slug ??
        `${formName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')}-${Date.now().toString().slice(-4)}`;

      const next: Product = {
        id: editingProduct?.id ?? crypto.randomUUID(),
        slug,
        name: formName.trim(),
        subtitle: formSubtitle.trim() || 'Luxury Atelier Creation',
        category: formCategory,
        dbCategory: formSubcategory.trim() || formCategory,
        subcategory: formSubcategory.trim() || formCategory,
        description:
          formDesc.trim() ||
          'Crafted in our luxury obsidian & gold beauty atelier with Damask rosewater and silk peptides.',
        ingredients: editingProduct?.ingredients ?? 'Damask Rose Hydrosol, Squalane, Vitamin E',
        ritualGuide: editingProduct?.ritualGuide ?? 'Apply gently as part of your daily beauty ritual.',
        pricePkr: Number(formPrice) || 0,
        discountPricePkr: formDiscount.trim() ? Number(formDiscount) : null,
        stock: Math.max(0, Number(formStock) || 0),
        sku: editingProduct?.sku ?? `VB-AD-${Math.floor(100 + Math.random() * 899)}`,
        imageUrl: formImage,
        shades: editingProduct?.shades ?? ['Signature Edition'],
        volume: formVolume.trim() || '30ml',
        rating: editingProduct?.rating ?? 5.0,
        reviewCount: editingProduct?.reviewCount ?? 1,
        isBestSeller: editingProduct?.isBestSeller ?? false,
        isNewArrival: editingProduct?.isNewArrival ?? true,
        isFeatured: editingProduct?.isFeatured ?? false,
        isActive: true,
        createdAt: editingProduct?.createdAt ?? new Date().toISOString(),
      };

      const saved = await upsertProduct(next);
      const updatedList = editingProduct
        ? products.map((p) => (p.id === saved.id ? saved : p))
        : [saved, ...products];
      onProductsChanged(updatedList);
      setShowProductForm(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to save product.');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    setActionError('');
    try {
      await deleteProductById(id);
      onProductsChanged(products.filter((p) => p.id !== id));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to delete product.');
    }
  };

  const handleQuickStock = async (p: Product, delta: number) => {
    setActionError('');
    try {
      const updated = { ...p, stock: Math.max(0, p.stock + delta) };
      await upsertProduct(updated);
      onProductsChanged(products.map((item) => (item.id === p.id ? updated : item)));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to update stock.');
    }
  };

  const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
    setActionError('');
    try {
      await updateOrderStatus(orderId, status);
      onOrdersChanged(orders.map((o) => (o.id === orderId ? { ...o, status } : o)));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to update order status.');
    }
  };

  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalPkr, 0);
  const lowStockCount = products.filter((p) => p.stock < 15).length;

  if (checkingAuth) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-luxury-marble text-sm text-[#F4C6D0]">
        Verifying Atelier Admin Authorization...
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-[75vh] bg-luxury-marble flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-[#1B1B1B] border border-[#D4AF70]/55 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#111111] border border-[#D4AF70] flex items-center justify-center mx-auto">
              <Lock className="w-5 h-5 text-[#D4AF70]" />
            </div>
            <h1 className="font-display text-3xl font-semibold text-[#FFFFFF]">
              Vespera Admin Portal
            </h1>
            <p className="text-xs text-[#F4C6D0]/80">
              {dbStatus?.connected
                ? 'Sign in with your Supabase Auth admin credentials.'
                : 'Local mode active: sign in with any valid email & 6+ character password to manage storefront inventory.'}
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-[#111111] border border-[#E8A1B2] text-xs text-[#F4C6D0]">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#F4C6D0] mb-1">Admin Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@vesperabeauty.com"
                className="w-full px-4 py-2.5 rounded-xl bg-[#111111] border border-[#D4AF70]/45 text-sm text-[#FFFFFF] placeholder:text-[#F4C6D0]/45 focus:outline-none focus:border-[#E8A1B2]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#F4C6D0] mb-1">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-4 py-2.5 rounded-xl bg-[#111111] border border-[#D4AF70]/45 text-sm text-[#FFFFFF] placeholder:text-[#F4C6D0]/45 focus:outline-none focus:border-[#E8A1B2]"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#D4AF70] text-[#090909] text-sm font-semibold hover:bg-[#C69B52] transition-colors"
            >
              Sign In to Admin Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-luxury-marble min-h-[80vh] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Admin Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.16em] uppercase text-[#D4AF70] font-semibold">
              Protected Store Management
            </p>
            <h1 className="font-display text-4xl font-semibold text-[#FFFFFF]">
              Vespera Beauty Admin
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openAddProduct}
              className="px-4 py-2.5 rounded-xl bg-[#D4AF70] text-[#090909] text-xs font-semibold hover:bg-[#C69B52] flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-[#090909]" />
              <span>Add Product</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-[#1B1B1B] border border-[#D4AF70]/60 text-xs font-medium text-[#FFFFFF] hover:border-[#E8A1B2] flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5 text-[#D4AF70]" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {actionError && (
          <div className="p-4 rounded-2xl bg-[#1B1B1B] border border-[#E8A1B2] text-xs text-[#F4C6D0]">
            {actionError}
          </div>
        )}

        {/* Honest Database Connection Card */}
        {dbStatus && (
          <div className="bg-[#1B1B1B] border border-[#D4AF70]/45 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <Database className="w-4 h-4 text-[#D4AF70] shrink-0" />
              <div>
                <span className="font-semibold text-[#FFFFFF]">
                  {dbStatus.connected
                    ? 'Supabase Live Connection Verified'
                    : 'Local Storage Mode (Supabase Not Connected)'}
                </span>
                <p className="text-[#F4C6D0]/80 mt-0.5">{dbStatus.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[#D4AF70]/35 pb-3">
          {(
            [
              ['overview', 'Sales Overview'],
              ['products', `Products & Stock (${products.length})`],
              ['orders', `Orders (${orders.length})`],
              ['customers', `Customers (${customers.length})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === key
                  ? 'bg-[#D4AF70] text-[#090909] border border-[#D4AF70]'
                  : 'bg-[#1B1B1B] text-[#F4C6D0] border border-[#D4AF70]/35 hover:border-[#E8A1B2]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  label: 'Gross Revenue',
                  value: formatPkr(totalRevenue),
                  icon: TrendingUp,
                },
                {
                  label: 'Total Orders',
                  value: String(orders.length),
                  icon: ShoppingBag,
                },
                {
                  label: 'Catalog Products',
                  value: `${products.length} (${lowStockCount} low stock)`,
                  icon: Package,
                },
                {
                  label: 'Registered Customers',
                  value: String(customers.length),
                  icon: Users,
                },
              ].map((kpi) => {
                const Icon = kpi.icon;
                return (
                  <div
                    key={kpi.label}
                    className="bg-[#1B1B1B] border border-[#D4AF70]/45 rounded-2xl p-5 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs text-[#F4C6D0]/75">
                      <span>{kpi.label}</span>
                      <Icon className="w-4 h-4 text-[#D4AF70]" />
                    </div>
                    <div className="font-display text-2xl sm:text-3xl font-semibold text-[#D4AF70] tabular-nums">
                      {kpi.value}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-[#1B1B1B] border border-[#D4AF70]/45 rounded-2xl p-6">
              <h2 className="font-display text-2xl font-semibold text-[#FFFFFF] mb-4">
                Inventory Breakdown by Category
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {CATEGORIES.map((cat) => {
                  const list = products.filter((p) => p.category === cat);
                  const stockSum = list.reduce((s, p) => s + p.stock, 0);
                  return (
                    <div
                      key={cat}
                      className="p-4 rounded-xl bg-[#111111] border border-[#D4AF70]/35 space-y-1"
                    >
                      <div className="text-xs font-medium text-[#E8A1B2]">{cat}</div>
                      <div className="font-display text-2xl font-semibold tabular-nums text-[#FFFFFF]">
                        {list.length} SKUs
                      </div>
                      <div className="text-xs text-[#F4C6D0]/70 tabular-nums">
                        {stockSum} units in stock
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS & STOCK */}
        {activeTab === 'products' && (
          <div className="bg-[#1B1B1B] border border-[#D4AF70]/45 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#111111] border-b border-[#D4AF70]/35 text-[#D4AF70]">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Product</th>
                    <th className="py-3.5 px-4 font-semibold">Category</th>
                    <th className="py-3.5 px-4 font-semibold">Price (PKR)</th>
                    <th className="py-3.5 px-4 font-semibold">Stock</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D4AF70]/20">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-[#111111]/60">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-11 h-9 rounded-lg object-cover border border-[#D4AF70]/35 shrink-0"
                          />
                          <div>
                            <div className="font-medium text-[#FFFFFF]">{p.name}</div>
                            <div className="text-[11px] text-[#F4C6D0]/65">{p.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#F4C6D0]/85">{p.category}</td>
                      <td className="py-3 px-4 tabular-nums font-medium text-[#D4AF70]">
                        {formatPkr(p.discountPricePkr ?? p.pricePkr)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleQuickStock(p, -1)}
                            className="w-6 h-6 rounded border border-[#D4AF70]/50 text-[#D4AF70] hover:bg-[#111111]"
                          >
                            -
                          </button>
                          <span className="tabular-nums font-semibold w-7 text-center text-[#FFFFFF]">
                            {p.stock}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuickStock(p, 1)}
                            className="w-6 h-6 rounded border border-[#D4AF70]/50 text-[#D4AF70] hover:bg-[#111111]"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => openEditProduct(p)}
                          aria-label={`Edit ${p.name}`}
                          className="p-1.5 rounded-lg border border-[#D4AF70]/45 text-[#D4AF70] hover:bg-[#111111]"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p.id)}
                          aria-label={`Delete ${p.name}`}
                          className="p-1.5 rounded-lg border border-[#D4AF70]/45 text-[#E8A1B2] hover:bg-[#111111]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-[#1B1B1B] border border-[#D4AF70]/45 rounded-2xl p-10 text-center text-sm text-[#F4C6D0]/75">
                No customer orders placed yet. Complete a test checkout to manage orders here.
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-[#1B1B1B] border border-[#D4AF70]/45 rounded-2xl p-5 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="font-display text-xl font-semibold text-[#D4AF70] tabular-nums">
                        {order.trackingId} · {order.customerName}
                      </div>
                      <div className="text-xs text-[#F4C6D0]/75">
                        {order.customerPhone} · {order.shippingAddress}, {order.city} ·{' '}
                        {order.paymentMethod}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold tabular-nums text-[#FFFFFF]">
                        {formatPkr(order.totalPkr)}
                      </span>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusUpdate(order.id, e.target.value as OrderStatus)
                        }
                        className="px-3 py-1.5 rounded-xl bg-[#111111] border border-[#D4AF70]/60 text-xs font-medium text-[#D4AF70]"
                      >
                        {ORDER_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: CUSTOMERS */}
        {activeTab === 'customers' && (
          <div className="bg-[#1B1B1B] border border-[#D4AF70]/45 rounded-2xl overflow-hidden">
            {customers.length === 0 ? (
              <div className="p-10 text-center text-sm text-[#F4C6D0]/75">
                Customer profiles appear automatically when orders are placed at checkout.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#111111] border-b border-[#D4AF70]/35 text-[#D4AF70]">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Customer</th>
                      <th className="py-3.5 px-4 font-semibold">Contact</th>
                      <th className="py-3.5 px-4 font-semibold">City</th>
                      <th className="py-3.5 px-4 font-semibold">Orders</th>
                      <th className="py-3.5 px-4 font-semibold">Lifetime Spend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D4AF70]/20">
                    {customers.map((c) => (
                      <tr key={c.id}>
                        <td className="py-3 px-4 font-medium text-[#FFFFFF]">{c.fullName}</td>
                        <td className="py-3 px-4 text-[#F4C6D0]/80">
                          {c.email} · {c.phone}
                        </td>
                        <td className="py-3 px-4 text-[#F4C6D0]/80">{c.city}</td>
                        <td className="py-3 px-4 tabular-nums font-medium text-[#FFFFFF]">{c.totalOrders}</td>
                        <td className="py-3 px-4 tabular-nums font-semibold text-[#D4AF70]">
                          {formatPkr(c.totalSpentPkr)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {showProductForm && (
        <div
          className="fixed inset-0 z-50 bg-[#090909]/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowProductForm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-[#1B1B1B] border border-[#D4AF70]/60 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4"
          >
            <h2 className="font-display text-2xl font-semibold text-[#D4AF70]">
              {editingProduct ? 'Edit Product' : 'Add New Luxury Creation'}
            </h2>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#F4C6D0] mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111111] border border-[#D4AF70]/45 text-[#FFFFFF]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#F4C6D0] mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={formSubtitle}
                    onChange={(e) => setFormSubtitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111111] border border-[#D4AF70]/45 text-[#FFFFFF]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#F4C6D0] mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ProductCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111111] border border-[#D4AF70]/45 text-[#FFFFFF]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-[#F4C6D0] mb-1">Subcategory</label>
                  <input
                    type="text"
                    value={formSubcategory}
                    onChange={(e) => setFormSubcategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111111] border border-[#D4AF70]/45 text-[#FFFFFF]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#F4C6D0] mb-1">Price (PKR) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111111] border border-[#D4AF70]/45 text-[#FFFFFF]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#F4C6D0] mb-1">
                    Discount Price (PKR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formDiscount}
                    onChange={(e) => setFormDiscount(e.target.value)}
                    placeholder="Optional"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111111] border border-[#D4AF70]/45 text-[#FFFFFF]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#F4C6D0] mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111111] border border-[#D4AF70]/45 text-[#FFFFFF]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#F4C6D0] mb-1">Volume / Size</label>
                  <input
                    type="text"
                    value={formVolume}
                    onChange={(e) => setFormVolume(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111111] border border-[#D4AF70]/45 text-[#FFFFFF]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#F4C6D0] mb-1">
                  Product Image Upload or URL
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={formImage}
                    alt="Preview"
                    className="w-16 h-12 rounded-lg object-cover border border-[#D4AF70]/45 shrink-0"
                  />
                  <label className="px-3.5 py-2 rounded-xl bg-[#111111] border border-[#D4AF70]/60 cursor-pointer flex items-center gap-1.5 text-[#D4AF70] font-medium hover:border-[#E8A1B2]">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="Or paste image URL"
                    className="flex-1 px-3 py-2 rounded-xl bg-[#111111] border border-[#D4AF70]/45 text-[#FFFFFF]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#F4C6D0] mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#111111] border border-[#D4AF70]/45 text-[#FFFFFF]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProductForm(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#D4AF70]/50 text-[#F4C6D0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="px-6 py-2.5 rounded-xl bg-[#D4AF70] text-[#090909] font-semibold hover:bg-[#C69B52]"
                >
                  {savingProduct ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
