import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from 'lucide-react';
import { PageRoute, Product, ProductReview } from '../types/store';
import { formatPkr } from '../services/storeService';
import { ProductCard } from '../components/ProductCard';
import { GoldDivider } from '../components/LuxuryDecor';

interface ProductDetailsPageProps {
  product: Product | undefined;
  allProducts: Product[];
  reviews: ProductReview[];
  wishlistIds: string[];
  onToggleWishlist: (id: string) => void;
  onAddToCart: (product: Product, variant: string, qty: number) => void;
  onQuickView: (product: Product) => void;
  onNavigate: (route: PageRoute, slug?: string) => void;
  onSubmitReview: (review: {
    productId: string;
    productName: string;
    customerName: string;
    customerCity: string;
    rating: number;
    title: string;
    comment: string;
  }) => Promise<void>;
}

export function ProductDetailsPage({
  product,
  allProducts,
  reviews,
  wishlistIds,
  onToggleWishlist,
  onAddToCart,
  onQuickView,
  onNavigate,
  onSubmitReview,
}: ProductDetailsPageProps) {
  const [selectedShade, setSelectedShade] = useState<string>('');
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'ingredients' | 'ritual'>('description');
  const [addedFeedback, setAddedFeedback] = useState(false);

  const [revName, setRevName] = useState('');
  const [revCity, setRevCity] = useState('Lahore');
  const [revRating, setRevRating] = useState(5);
  const [revTitle, setRevTitle] = useState('');
  const [revComment, setRevComment] = useState('');
  const [revSubmitted, setRevSubmitted] = useState(false);

  const related = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter((p) => p.category === product.category && p.id !== product.id && p.isActive)
      .slice(0, 3);
  }, [allProducts, product]);

  const productReviews = useMemo(() => {
    if (!product) return [];
    const matched = reviews.filter(
      (r) => r.productId === product.id || r.productName === product.name
    );
    return matched.length > 0 ? matched : reviews.slice(0, 2);
  }, [reviews, product]);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <h1 className="font-display text-4xl font-semibold text-[#FFFFFF]">
          Creation Not Found
        </h1>
        <p className="text-sm text-[#F4C6D0]/80">
          The requested beauty item may have moved or been archived.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('shop')}
          className="px-6 py-3 rounded-xl bg-[#D4AF70] text-[#090909] text-sm font-semibold"
        >
          Return to Shop All
        </button>
      </div>
    );
  }

  const activeVariant = selectedShade || product.shades[0] || product.volume;
  const effectivePrice = product.discountPricePkr ?? product.pricePkr;
  const hasDiscount =
    product.discountPricePkr !== null && product.discountPricePkr < product.pricePkr;
  const isWishlisted = wishlistIds.includes(product.id);

  const handleAdd = () => {
    if (product.stock <= 0) return;
    onAddToCart(product, activeVariant, qty);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1600);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revName.trim() || !revTitle.trim() || !revComment.trim()) return;
    await onSubmitReview({
      productId: product.id,
      productName: product.name,
      customerName: revName.trim(),
      customerCity: revCity.trim() || 'Karachi',
      rating: revRating,
      title: revTitle.trim(),
      comment: revComment.trim(),
    });
    setRevName('');
    setRevTitle('');
    setRevComment('');
    setRevSubmitted(true);
  };

  return (
    <div className="bg-luxury-marble">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back Breadcrumb */}
        <button
          type="button"
          onClick={() => onNavigate('shop')}
          className="inline-flex items-center gap-2 text-xs font-medium text-[#F4C6D0] hover:text-[#D4AF70] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {product.category}</span>
        </button>

        {/* Contiguous Purchase Module */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Sticky Studio Gallery Left */}
          <div className="lg:col-span-6 lg:sticky lg:top-24">
            <div className="rounded-3xl overflow-hidden border border-[#D4AF70]/55 bg-[#111111] shadow-[0_24px_60px_rgba(0,0,0,0.75)] group">
              <img
                src={product.imageUrl}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Sticky Purchase Module Right */}
          <div className="lg:col-span-6 bg-[#1B1B1B] border border-[#D4AF70]/45 rounded-3xl p-6 sm:p-9 space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#E8A1B2]">
                <span>{product.category}</span>
                <span>·</span>
                <span>{product.subcategory}</span>
                <span>·</span>
                <span className="tabular-nums text-[#F4C6D0]/80">SKU: {product.sku}</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#FFFFFF] leading-tight">
                {product.name}
              </h1>

              <p className="font-display italic text-lg text-[#F4C6D0]/90">{product.subtitle}</p>

              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#D4AF70] text-[#D4AF70]" />
                  ))}
                </div>
                <span className="text-xs font-medium tabular-nums text-[#D4AF70]">
                  {product.rating.toFixed(1)} · {product.reviewCount} verified reviews
                </span>
              </div>
            </div>

            {/* Price & Stock */}
            <div className="py-4 border-y border-[#D4AF70]/30 flex flex-wrap items-baseline justify-between gap-4">
              <div className="flex items-baseline gap-3 tabular-nums">
                <span className="text-2xl sm:text-3xl font-semibold text-[#D4AF70]">
                  {formatPkr(effectivePrice)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-base line-through text-[#F4C6D0]/45">
                      {formatPkr(product.pricePkr)}
                    </span>
                    <span className="text-xs font-semibold text-[#E8A1B2]">
                      Save {formatPkr(product.pricePkr - effectivePrice)}
                    </span>
                  </>
                )}
              </div>

              <span className="text-xs font-medium text-[#F4C6D0]">
                {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Currently Sold Out'}
              </span>
            </div>

            {/* Shade / Edition Selection */}
            {product.shades.length > 0 && (
              <div className="space-y-2.5">
                <div className="text-xs font-medium text-[#FFFFFF]">
                  Variant / Shade: <span className="font-semibold text-[#E8A1B2]">{activeVariant}</span> · {product.volume}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.shades.map((shade) => (
                    <button
                      key={shade}
                      type="button"
                      onClick={() => setSelectedShade(shade)}
                      className={`px-4 py-2 rounded-xl text-xs font-medium border transition-colors ${
                        activeVariant === shade
                          ? 'bg-[#E8A1B2] text-[#090909] border-[#D4AF70]'
                          : 'bg-[#111111] text-[#F4C6D0] border-[#D4AF70]/40 hover:border-[#D4AF70]'
                      }`}
                    >
                      {shade}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Action Row */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="flex items-center border border-[#D4AF70]/55 rounded-xl bg-[#111111]">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="p-3 text-[#D4AF70] hover:bg-[#090909] rounded-l-xl"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-semibold tabular-nums text-[#FFFFFF]">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(Math.max(1, product.stock), q + 1))}
                  aria-label="Increase quantity"
                  className="p-3 text-[#D4AF70] hover:bg-[#090909] rounded-r-xl"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                disabled={product.stock <= 0}
                onClick={handleAdd}
                className="flex-1 min-h-[48px] px-6 py-3 rounded-xl bg-[#D4AF70] text-[#090909] text-sm font-semibold border border-[#D4AF70] hover:bg-[#C69B52] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {addedFeedback ? (
                  <>
                    <Check className="w-4 h-4 text-[#090909]" />
                    <span>Added to Atelier Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-[#090909]" />
                    <span>{product.stock <= 0 ? 'Sold Out' : 'Add to Bag'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onToggleWishlist(product.id)}
                aria-label="Toggle wishlist"
                className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-colors ${
                  isWishlisted
                    ? 'bg-[#E8A1B2] border-[#D4AF70] text-[#090909]'
                    : 'bg-[#111111] border-[#D4AF70]/55 text-[#E8A1B2] hover:border-[#D4AF70]'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-[#090909]' : ''}`} />
              </button>
            </div>

            {/* Service Promises */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#F4C6D0] pt-2">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#111111] border border-[#D4AF70]/30">
                <Truck className="w-4 h-4 text-[#D4AF70] shrink-0" />
                <span>Cash on Delivery · Free over PKR 12,000</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#111111] border border-[#D4AF70]/30">
                <ShieldCheck className="w-4 h-4 text-[#D4AF70] shrink-0" />
                <span>100% Authentic &amp; Cruelty-Free</span>
              </div>
            </div>

            {/* Tabs: Description / Ingredients / Ritual */}
            <div className="pt-2 space-y-4">
              <div className="flex gap-2 border-b border-[#D4AF70]/30 pb-2">
                {(
                  [
                    ['description', 'Atelier Notes'],
                    ['ingredients', 'Key Botanicals'],
                    ['ritual', 'Application Ritual'],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveTab(key)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      activeTab === key
                        ? 'bg-[#D4AF70] text-[#090909]'
                        : 'text-[#F4C6D0]/80 hover:bg-[#111111]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <p className="text-sm text-[#F4C6D0]/90 leading-relaxed">
                {activeTab === 'description' && product.description}
                {activeTab === 'ingredients' && product.ingredients}
                {activeTab === 'ritual' && product.ritualGuide}
              </p>
            </div>
          </div>
        </div>

        <GoldDivider className="my-16" />

        {/* Product Reviews + Review Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-5">
            <h2 className="font-display text-3xl font-semibold text-[#FFFFFF]">
              Client Impressions
            </h2>
            <div className="space-y-4">
              {productReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-[#1B1B1B] border border-[#D4AF70]/40 rounded-2xl p-5 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: rev.rating }).map((_, idx) => (
                        <Star key={idx} className="w-3.5 h-3.5 fill-[#D4AF70] text-[#D4AF70]" />
                      ))}
                    </div>
                    <span className="text-xs text-[#F4C6D0]/70">
                      {rev.customerName} · {rev.customerCity}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-[#FFFFFF]">
                    {rev.title}
                  </h3>
                  <p className="text-sm text-[#F4C6D0]/85 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#111111] border border-[#D4AF70]/45 rounded-2xl p-6 space-y-4">
            <h3 className="font-display text-2xl font-semibold text-[#D4AF70]">
              Share Your Review
            </h3>
            {revSubmitted ? (
              <div className="p-4 rounded-xl bg-[#1B1B1B] border border-[#D4AF70] text-sm text-[#F4C6D0]">
                Thank you. Your verified review has been published.
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={revName}
                    onChange={(e) => setRevName(e.target.value)}
                    placeholder="Your Name"
                    className="px-3.5 py-2.5 rounded-xl bg-[#1B1B1B] border border-[#D4AF70]/45 text-sm text-[#FFFFFF] placeholder:text-[#F4C6D0]/50 focus:outline-none focus:border-[#E8A1B2]"
                  />
                  <input
                    type="text"
                    required
                    value={revCity}
                    onChange={(e) => setRevCity(e.target.value)}
                    placeholder="City (e.g. Lahore)"
                    className="px-3.5 py-2.5 rounded-xl bg-[#1B1B1B] border border-[#D4AF70]/45 text-sm text-[#FFFFFF] placeholder:text-[#F4C6D0]/50 focus:outline-none focus:border-[#E8A1B2]"
                  />
                </div>
                <select
                  value={revRating}
                  onChange={(e) => setRevRating(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1B1B1B] border border-[#D4AF70]/45 text-sm text-[#FFFFFF]"
                >
                  <option value={5}>5 Stars — Extraordinary</option>
                  <option value={4}>4 Stars — Very Pleased</option>
                  <option value={3}>3 Stars — Good</option>
                </select>
                <input
                  type="text"
                  required
                  value={revTitle}
                  onChange={(e) => setRevTitle(e.target.value)}
                  placeholder="Headline for your review"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1B1B1B] border border-[#D4AF70]/45 text-sm text-[#FFFFFF] placeholder:text-[#F4C6D0]/50 focus:outline-none focus:border-[#E8A1B2]"
                />
                <textarea
                  required
                  rows={3}
                  value={revComment}
                  onChange={(e) => setRevComment(e.target.value)}
                  placeholder="Describe texture, longevity, and finish..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1B1B1B] border border-[#D4AF70]/45 text-sm text-[#FFFFFF] placeholder:text-[#F4C6D0]/50 focus:outline-none focus:border-[#E8A1B2]"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#D4AF70] text-[#090909] text-sm font-semibold hover:bg-[#C69B52] transition-colors"
                >
                  Publish Review
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-16 space-y-8">
            <h2 className="font-display text-3xl font-semibold text-[#FFFFFF]">
              Complementary {product.category} Creations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
              {related.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isWishlisted={wishlistIds.includes(p.id)}
                  onToggleWishlist={onToggleWishlist}
                  onAddToCart={(prod) => onAddToCart(prod, prod.shades[0] || prod.volume, 1)}
                  onQuickView={onQuickView}
                  onOpenDetails={(slug) => onNavigate('product-details', slug)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
