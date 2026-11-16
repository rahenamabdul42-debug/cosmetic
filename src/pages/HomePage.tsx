import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Star } from 'lucide-react';
import { PageRoute, Product, ProductReview } from '../types/store';
import { EDITORIAL_IMAGES, PRODUCT_IMAGES } from '../data/productImages';
import { subscribeNewsletter } from '../services/storeService';
import { ProductCard } from '../components/ProductCard';
import {
  BotanicalFlourish,
  FloatingGoldenSparkles,
  GoldDivider,
} from '../components/LuxuryDecor';

interface HomePageProps {
  products: Product[];
  reviews: ProductReview[];
  wishlistIds: string[];
  onToggleWishlist: (id: string) => void;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onNavigate: (route: PageRoute, slug?: string) => void;
}

const CATEGORY_SHOWCASE: {
  title: string;
  route: PageRoute;
  matchCategories: string[];
  fallbackImage: string;
}[] = [
  {
    title: 'Makeup Couture',
    route: 'makeup',
    matchCategories: ['Makeup', 'Lipsticks', 'Foundations', 'Eyeshadow Palettes'],
    fallbackImage: PRODUCT_IMAGES.velvetLipstick,
  },
  {
    title: 'Skincare Rituals',
    route: 'skincare',
    matchCategories: ['Skincare', 'Face Serums', 'Moisturizers'],
    fallbackImage: PRODUCT_IMAGES.goldSerum,
  },
  {
    title: 'Fine Perfumes',
    route: 'perfumes',
    matchCategories: ['Perfumes'],
    fallbackImage: PRODUCT_IMAGES.roseraiePerfume,
  },
  {
    title: 'Haircare Elixirs',
    route: 'haircare',
    matchCategories: ['Haircare'],
    fallbackImage: PRODUCT_IMAGES.hairElixir,
  },
  {
    title: 'Body Care',
    route: 'body-care',
    matchCategories: ['Body Care'],
    fallbackImage: PRODUCT_IMAGES.bodyLotion,
  },
  {
    title: 'Gift Boxes & Tools',
    route: 'accessories',
    matchCategories: ['Beauty Accessories'],
    fallbackImage: PRODUCT_IMAGES.giftBoxSovereign,
  },
];

export function HomePage({
  products,
  reviews,
  wishlistIds,
  onToggleWishlist,
  onAddToCart,
  onQuickView,
  onNavigate,
}: HomePageProps) {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterMsg, setNewsletterMsg] = useState('');
  const [newsletterError, setNewsletterError] = useState('');

  const activeProducts = products.filter((p) => p.isActive);
  const bestSellers = activeProducts.filter((p) => p.isBestSeller).slice(0, 6);
  const displayedBestSellers = bestSellers.length > 0 ? bestSellers : activeProducts.slice(0, 6);
  const newArrivals = activeProducts.filter((p) => p.isNewArrival).slice(0, 6);
  const displayedNewArrivals =
    newArrivals.length > 0 ? newArrivals : activeProducts.slice(0, 6);
  const featuredOffers = activeProducts
    .filter((p) => p.discountPricePkr !== null)
    .slice(0, 3);
  const heroSpotlight = activeProducts[0];

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || newsletterLoading) return;
    setNewsletterLoading(true);
    setNewsletterError('');
    try {
      const res = await subscribeNewsletter(newsletterEmail);
      setNewsletterMsg(
        res.alreadySubscribed
          ? 'You are already part of the Vespera Beauty Inner Circle. Use code VESPERA10 at checkout.'
          : 'Thank you for joining Vespera Beauty. Your welcome code VESPERA10 is ready.'
      );
      setNewsletterEmail('');
    } catch (err) {
      setNewsletterError(
        err instanceof Error ? err.message : 'Unable to subscribe right now. Please try again.'
      );
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <div className="bg-[#090909]">
      {/* 1. LUXURY BLACK HERO BANNER */}
      <section className="relative overflow-hidden bg-luxury-marble border-b border-[#D4AF70]/35">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#E8A1B2]/12 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 right-10 w-[420px] h-[420px] rounded-full bg-[#D4AF70]/12 blur-3xl"
        />
        <FloatingGoldenSparkles />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            {/* Editorial Copy Column */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 flex flex-col justify-center space-y-6 relative z-10"
            >
              <div className="text-xs tracking-[0.18em] uppercase text-[#D4AF70] font-semibold">
                Vespera Beauty · Paris &amp; Karachi
              </div>

              <h1
                className="font-display font-semibold text-[#FFFFFF] leading-[1.06]"
                style={{ fontSize: 'clamp(2.5rem, 4.2vw, 3.85rem)', textWrap: 'balance' }}
              >
                Discover Your Beauty, Define Your Glow
              </h1>

              <p className="font-display italic text-2xl text-[#E8A1B2]">
                Luxury Beauty. Timeless Elegance.
              </p>

              <p className="text-sm sm:text-base text-[#F4C6D0]/85 leading-relaxed max-w-lg">
                Artisanal rose-infused skincare, velvet couture lipsticks, and Grasse extraits crafted in obsidian glass, rose pink, and brushed champagne gold.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('shop')}
                  className="px-7 py-3.5 rounded-xl bg-[#D4AF70] text-[#090909] text-sm font-semibold border border-[#D4AF70] hover:bg-[#C69B52] transition-colors flex items-center gap-2 whitespace-nowrap shadow-[0_10px_28px_rgba(212,175,112,0.22)]"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4 text-[#090909]" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('best-sellers')}
                  className="px-7 py-3.5 rounded-xl bg-[#1B1B1B] text-[#FFFFFF] text-sm font-medium border border-[#D4AF70]/70 hover:border-[#E8A1B2] hover:text-[#F4C6D0] transition-colors whitespace-nowrap"
                >
                  Explore Collection
                </button>
              </div>

              {/* Clean Unboxed Trust Line */}
              <div className="pt-4 border-t border-[#D4AF70]/30 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#F4C6D0]/80">
                <span>{activeProducts.length} Curated Creations</span>
                <span aria-hidden="true" className="text-[#D4AF70]">·</span>
                <span>Cash on Delivery Nationwide</span>
                <span aria-hidden="true" className="text-[#D4AF70]">·</span>
                <span>Cruelty-Free Atelier</span>
              </div>
            </motion.div>

            {/* Studio Photography Column */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 relative"
            >
              <div className="relative h-full min-h-[340px] lg:min-h-[480px] rounded-2xl overflow-hidden border border-[#D4AF70]/55 shadow-[0_24px_70px_rgba(212,175,112,0.12)] bg-[#111111]">
                <img
                  src={EDITORIAL_IMAGES.heroLuxuryCosmetics}
                  alt="Vespera Beauty luxury crystal perfume, engraved gold lipstick, and rose serum on black marble"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090909]/85 via-[#090909]/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-5 left-5 right-5 bg-[#111111]/90 backdrop-blur-md border border-[#D4AF70]/55 rounded-xl px-5 py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-display text-lg font-semibold text-[#D4AF70]">
                      The Vespera Obsidian &amp; 24K Gold Collection
                    </p>
                    <p className="text-xs text-[#F4C6D0]/85">
                      Aura Rosa Parfum · Velvet Crimson Silk · Golden Glow Elixir
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      heroSpotlight
                        ? onNavigate('product-details', heroSpotlight.slug)
                        : onNavigate('shop')
                    }
                    className="px-4 py-2 rounded-lg bg-[#E8A1B2] text-[#090909] text-xs font-semibold whitespace-nowrap shrink-0 hover:bg-[#F4C6D0] transition-colors"
                  >
                    Discover
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED COLLECTIONS STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs tracking-[0.16em] uppercase text-[#D4AF70] font-semibold">
              Curated Houses
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#FFFFFF] mt-1">
              Explore by Beauty Ritual
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('shop')}
            className="text-sm font-medium text-[#E8A1B2] hover:text-[#D4AF70] flex items-center gap-1.5 transition-colors"
          >
            <span>View All Creations</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORY_SHOWCASE.map((cat) => {
            const matching = activeProducts.filter(
              (p) =>
                cat.matchCategories.includes(p.category) ||
                (p.dbCategory ? cat.matchCategories.includes(p.dbCategory) : false)
            );
            const sample = matching[0];
            return (
              <button
                key={cat.route}
                type="button"
                onClick={() => onNavigate(cat.route)}
                className="group text-left bg-[#1B1B1B] border border-[#D4AF70]/40 hover:border-[#D4AF70] rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5 shadow-[0_6px_22px_rgba(0,0,0,0.4)]"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#111111]">
                  <img
                    src={sample?.imageUrl || cat.fallbackImage}
                    alt={cat.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-3.5">
                  <div className="font-display text-lg font-semibold text-[#FFFFFF] group-hover:text-[#D4AF70] leading-tight transition-colors">
                    {cat.title}
                  </div>
                  <div className="text-xs text-[#F4C6D0]/75 mt-0.5">
                    {matching.length > 0 ? `${matching.length} Creations` : 'Explore House'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. BEST SELLERS SECTION */}
      <section className="bg-[#111111] border-y border-[#D4AF70]/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs tracking-[0.16em] uppercase text-[#D4AF70] font-semibold">
                Atelier Icons
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#FFFFFF] mt-1">
                Best Sellers
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('best-sellers')}
              className="text-sm font-medium text-[#E8A1B2] hover:text-[#D4AF70] flex items-center gap-1.5 transition-colors"
            >
              <span>Shop All Best Sellers</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {displayedBestSellers.map((product) => (
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
        </div>
      </section>

      {/* 4. SPECIAL OFFERS & LUXURY GIFT COFFRET BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-3xl overflow-hidden border border-[#D4AF70]/55 bg-blush-silk shadow-[0_22px_60px_rgba(0,0,0,0.65)] grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center space-y-5">
            <BotanicalFlourish className="w-28 h-10 -ml-2" />
            <div className="text-xs tracking-[0.16em] uppercase text-[#D4AF70] font-semibold">
              Special Seasonal Offer · Up to 10% Privilege
            </div>
            <h2
              className="font-display text-3xl sm:text-4xl font-semibold text-[#FFFFFF] leading-tight"
              style={{ textWrap: 'balance' }}
            >
              The Vespera Velvet Coffrets &amp; Bridal Trunks
            </h2>
            <p className="text-sm sm:text-base text-[#F4C6D0]/85 leading-relaxed">
              Curated obsidian velvet presentation boxes accented in blush silk—paired with complimentary gold-foil calligraphy and insured nationwide Cash on Delivery. Use code{' '}
              <span className="font-semibold text-[#D4AF70]">VESPERA10</span> at checkout.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('shop')}
                className="px-6 py-3 rounded-xl bg-[#D4AF70] text-[#090909] text-sm font-semibold border border-[#D4AF70] hover:bg-[#C69B52] transition-colors flex items-center gap-2"
              >
                <span>Shop All Creations</span>
                <ArrowRight className="w-4 h-4 text-[#090909]" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('about')}
                className="px-6 py-3 rounded-xl bg-[#1B1B1B] text-[#FFFFFF] text-sm font-medium border border-[#D4AF70]/70 hover:border-[#E8A1B2] hover:text-[#F4C6D0] transition-colors"
              >
                Our Craftsmanship
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 min-h-[280px] lg:min-h-[420px] bg-[#090909]">
            <img
              src={EDITORIAL_IMAGES.giftCollectionBanner}
              alt="Luxury black velvet cosmetics gift coffret with rose pink silk ribbon and gold cosmetics"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Special Offer Trio */}
        {featuredOffers.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-7">
            {featuredOffers.map((product) => (
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
      </section>

      {/* 5. NEW ARRIVALS SECTION */}
      <section className="bg-[#111111] border-y border-[#D4AF70]/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs tracking-[0.16em] uppercase text-[#D4AF70] font-semibold">
                Just Unveiled
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#FFFFFF] mt-1">
                New Arrivals
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('new-arrivals')}
              className="text-sm font-medium text-[#E8A1B2] hover:text-[#D4AF70] flex items-center gap-1.5 transition-colors"
            >
              <span>Explore All New Releases</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {displayedNewArrivals.map((product) => (
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
        </div>
      </section>

      {/* 6. CLIENT TESTIMONIALS & NEWSLETTER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs tracking-[0.16em] uppercase text-[#D4AF70] font-semibold">
                Verified Impressions
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#FFFFFF] mt-1">
                Loved Across Pakistan
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('reviews')}
              className="text-sm font-medium text-[#E8A1B2] hover:text-[#D4AF70] flex items-center gap-1.5 transition-colors"
            >
              <span>Read All Reviews</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {reviews.slice(0, 3).map((rev) => (
              <div
                key={rev.id}
                className="bg-[#1B1B1B] border border-[#D4AF70]/40 rounded-2xl p-6 flex flex-col justify-between gap-4 shadow-[0_8px_28px_rgba(0,0,0,0.45)]"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: rev.rating }).map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-[#D4AF70] text-[#D4AF70]" />
                    ))}
                  </div>
                  <h3 className="font-display text-xl font-semibold text-[#FFFFFF]">
                    "{rev.title}"
                  </h3>
                  <p className="text-sm text-[#F4C6D0]/85 leading-relaxed">{rev.comment}</p>
                </div>

                <div className="pt-3 border-t border-[#D4AF70]/25 text-xs text-[#F4C6D0]/75">
                  <span className="font-semibold text-[#D4AF70]">{rev.customerName}</span>
                  <span className="mx-1.5">·</span>
                  <span>{rev.customerCity}</span>
                  <span className="mx-1.5">·</span>
                  <span>{rev.productName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <GoldDivider />

        {/* Newsletter Section */}
        <div className="bg-blush-silk border border-[#D4AF70]/50 rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-5 shadow-[0_20px_50px_rgba(0,0,0,0.55)]">
          <p className="text-xs tracking-[0.18em] uppercase text-[#D4AF70] font-semibold">
            Private Atelier Privilege
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#FFFFFF]">
            Join the Vespera Beauty Inner Circle
          </h2>
          <p className="text-sm sm:text-base text-[#F4C6D0]/85 max-w-xl mx-auto">
            Receive early invitations to limited bridal coffrets, formulation notes, and an instant 10% welcome privilege with code <span className="font-semibold text-[#D4AF70]">VESPERA10</span>.
          </p>
          {newsletterMsg ? (
            <div className="inline-block px-6 py-3 rounded-xl bg-[#1B1B1B] border border-[#D4AF70] text-sm font-medium text-[#F4C6D0]">
              {newsletterMsg}
            </div>
          ) : (
            <form
              onSubmit={handleNewsletter}
              className="space-y-3 max-w-lg mx-auto pt-2"
            >
              {newsletterError && (
                <div className="p-3 rounded-xl bg-[#1B1B1B] border border-[#E8A1B2] text-xs text-[#F4C6D0]">
                  {newsletterError}
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-1 px-4 py-3 rounded-xl bg-[#090909] border border-[#D4AF70]/55 text-sm text-[#FFFFFF] placeholder:text-[#F4C6D0]/50 focus:outline-none focus:border-[#E8A1B2]"
                />
                <button
                  type="submit"
                  disabled={newsletterLoading}
                  className="px-7 py-3 rounded-xl bg-[#D4AF70] text-[#090909] text-sm font-semibold border border-[#D4AF70] hover:bg-[#C69B52] transition-colors whitespace-nowrap disabled:opacity-60"
                >
                  {newsletterLoading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
