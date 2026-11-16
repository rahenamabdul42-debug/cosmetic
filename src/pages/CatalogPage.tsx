import React, { useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { PageRoute, Product, ProductCategory } from '../types/store';
import { ProductCard } from '../components/ProductCard';

interface CatalogPageProps {
  route: PageRoute;
  products: Product[];
  wishlistIds: string[];
  onToggleWishlist: (id: string) => void;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onNavigate: (route: PageRoute, slug?: string) => void;
}

const ROUTE_META: Record<
  string,
  { title: string; subtitle: string; fixedCategory?: ProductCategory; filterMode?: 'best' | 'new' }
> = {
  shop: {
    title: 'All Luxury Creations',
    subtitle: 'Explore our curated anthology across color couture, skincare, haircare, fragrance, and vanity accessories.',
  },
  makeup: {
    title: 'Makeup Couture',
    subtitle: 'Velvet lipsticks, luminous silk foundations, peony-embossed blushes, and rose-gold artistry tools.',
    fixedCategory: 'Makeup',
  },
  skincare: {
    title: 'Skincare Rituals',
    subtitle: '24K gold radiance serums, ceramide barrier creams, and Moroccan Damask rosewater essences.',
    fixedCategory: 'Skincare',
  },
  haircare: {
    title: 'Haircare Elixirs',
    subtitle: 'Cold-pressed argan & rose elixirs, vegan keratin cleansers, and cashmere repair masques.',
    fixedCategory: 'Haircare',
  },
  perfumes: {
    title: 'Fine Perfumes & Mists',
    subtitle: 'Grasse-crafted rose extraits and shimmering rosewater mists designed for unforgettable sillage.',
    fixedCategory: 'Perfumes',
  },
  'body-care': {
    title: 'Body Care Atelier',
    subtitle: 'Whipped Himalayan pink salt polishes, peony body lotions, and couture almond hand balms.',
    fixedCategory: 'Body Care',
  },
  accessories: {
    title: 'Beauty Accessories & Gift Coffrets',
    subtitle: 'Sovereign velvet gift boxes, bridal vanity trunks, obsidian-gold organizers, and rose quartz rollers.',
    fixedCategory: 'Beauty Accessories',
  },
  'best-sellers': {
    title: 'Best Sellers',
    subtitle: 'Our highest-rated, most coveted signatures adored across Pakistan.',
    filterMode: 'best',
  },
  'new-arrivals': {
    title: 'New Arrivals',
    subtitle: 'Fresh seasonal editions straight from the Vespera Beauty formulation studio.',
    filterMode: 'new',
  },
};

const ALL_CATEGORIES: ('All' | ProductCategory)[] = [
  'All',
  'Makeup',
  'Skincare',
  'Haircare',
  'Perfumes',
  'Body Care',
  'Beauty Accessories',
];

export function CatalogPage({
  route,
  products,
  wishlistIds,
  onToggleWishlist,
  onAddToCart,
  onQuickView,
  onNavigate,
}: CatalogPageProps) {
  const meta = ROUTE_META[route] ?? ROUTE_META.shop;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ProductCategory>('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [offersOnly, setOffersOnly] = useState(false);

  const activeCategory = meta.fixedCategory ?? selectedCategory;

  const subcategories = useMemo(() => {
    const base = products.filter(
      (p) => p.isActive && (activeCategory === 'All' || p.category === activeCategory)
    );
    const set = new Set(base.map((p) => p.dbCategory || p.subcategory).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [products, activeCategory]);

  const filteredProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const list = products.filter((p) => {
      if (!p.isActive) return false;
      if (meta.fixedCategory && p.category !== meta.fixedCategory) return false;
      if (!meta.fixedCategory && selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }
      if (meta.filterMode === 'best' && !p.isBestSeller) return false;
      if (meta.filterMode === 'new' && !p.isNewArrival) return false;
      if (
        selectedSubcategory !== 'All' &&
        (p.dbCategory || p.subcategory) !== selectedSubcategory
      ) {
        return false;
      }
      if (offersOnly && !(p.discountPricePkr !== null && p.discountPricePkr < p.pricePkr)) {
        return false;
      }
      if (q) {
        const hay = `${p.name} ${p.description} ${p.subtitle} ${p.category} ${p.dbCategory ?? ''} ${p.subcategory} ${p.ingredients}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      const priceA = a.discountPricePkr ?? a.pricePkr;
      const priceB = b.discountPricePkr ?? b.pricePkr;
      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'rating') return b.rating - a.rating;
      return Number(b.isFeatured) - Number(a.isFeatured) || Number(b.isBestSeller) - Number(a.isBestSeller);
    });
  }, [products, meta, selectedCategory, selectedSubcategory, offersOnly, searchTerm, sortBy]);

  return (
    <div className="bg-luxury-marble min-h-[75vh]">
      {/* Editorial Category Header */}
      <div className="bg-[#111111] border-b border-[#D4AF70]/35 py-12 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-[540px] h-40 rounded-full bg-[#E8A1B2]/10 blur-3xl"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3 relative z-10">
          <p className="text-xs tracking-[0.18em] uppercase text-[#D4AF70] font-semibold">
            Vespera Beauty Collection
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#FFFFFF]">
            {meta.title}
          </h1>
          <p className="text-sm sm:text-base text-[#F4C6D0]/85 max-w-2xl mx-auto">
            {meta.subtitle}
          </p>
        </div>
      </div>

      {/* Filter & Sort Toolbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-[#111111] border border-[#D4AF70]/40 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#D4AF70] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by product, shade, or ingredient..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1B1B1B] border border-[#D4AF70]/45 text-sm text-[#FFFFFF] placeholder:text-[#F4C6D0]/50 focus:outline-none focus:border-[#E8A1B2]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-medium text-[#F4C6D0] cursor-pointer select-none px-3 py-2 rounded-xl bg-[#1B1B1B] border border-[#D4AF70]/35">
                <input
                  type="checkbox"
                  checked={offersOnly}
                  onChange={(e) => setOffersOnly(e.target.checked)}
                  className="accent-[#D4AF70]"
                />
                <span>Special Offers Only</span>
              </label>

              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#D4AF70]" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  aria-label="Sort products"
                  className="px-3.5 py-2 rounded-xl bg-[#1B1B1B] border border-[#D4AF70]/50 text-xs font-medium text-[#FFFFFF] focus:outline-none focus:border-[#E8A1B2]"
                >
                  <option value="featured">Sort: Atelier Featured</option>
                  <option value="price-asc">Price: Low to High (PKR)</option>
                  <option value="price-desc">Price: High to Low (PKR)</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Interactive Category Filter Tabs */}
          {!meta.fixedCategory && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSelectedSubcategory('All');
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-[#D4AF70] text-[#090909] border border-[#D4AF70]'
                      : 'bg-[#1B1B1B] text-[#F4C6D0] hover:border-[#E8A1B2] border border-[#D4AF70]/30'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Subcategory Filter Buttons */}
          {subcategories.length > 2 && (
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#D4AF70]/25">
              <span className="text-xs text-[#F4C6D0]/70 mr-1">Type:</span>
              {subcategories.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSelectedSubcategory(sub)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    selectedSubcategory === sub
                      ? 'bg-[#E8A1B2] text-[#090909] border border-[#D4AF70]'
                      : 'text-[#F4C6D0]/85 hover:bg-[#1B1B1B] border border-transparent'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-[#F4C6D0]/80">
          <span className="tabular-nums">
            Showing {filteredProducts.length} luxury product{filteredProducts.length === 1 ? '' : 's'}
          </span>
          {(searchTerm || offersOnly || selectedSubcategory !== 'All' || selectedCategory !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setOffersOnly(false);
                setSelectedCategory('All');
                setSelectedSubcategory('All');
              }}
              className="underline text-[#D4AF70] hover:text-[#E8A1B2]"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* 3-Column Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-[#1B1B1B] border border-[#D4AF70]/40 rounded-2xl p-12 text-center space-y-3">
            <p className="font-display text-2xl font-semibold text-[#FFFFFF]">
              No matching creations found
            </p>
            <p className="text-sm text-[#F4C6D0]/75">
              Try clearing your filters or searching another beauty category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 pb-12">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isWishlisted={wishlistIds.includes(product.id)}
                onToggleWishlist={onToggleWishlist}
                onAddToCart={onAddToCart}
                onQuickView={onQuickView}
                onOpenDetails={(slug) => onNavigate('product-details', slug)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
