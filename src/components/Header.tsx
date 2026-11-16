import React, { useState } from 'react';
import {
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  X,
} from 'lucide-react';
import { PageRoute } from '../types/store';

interface HeaderProps {
  currentRoute: PageRoute;
  onNavigate: (route: PageRoute, slug?: string) => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenSearch: () => void;
  onOpenWishlist: () => void;
}

const COLLECTION_LINKS: { label: string; route: PageRoute; subtitle: string }[] = [
  { label: 'Makeup', route: 'makeup', subtitle: 'Lipsticks, Foundations & Palettes' },
  { label: 'Skincare', route: 'skincare', subtitle: '24K Gold Serums & Barrier Creams' },
  { label: 'Haircare', route: 'haircare', subtitle: 'Argan Elixirs & Silk Masques' },
  { label: 'Perfumes', route: 'perfumes', subtitle: 'French Extraits & Shimmer Mists' },
  { label: 'Body Care', route: 'body-care', subtitle: 'Himalayan Scrubs & Peony Lotions' },
  { label: 'Beauty Accessories', route: 'accessories', subtitle: 'Gift Boxes, Mirrors & Gua Sha' },
  { label: 'Best Sellers', route: 'best-sellers', subtitle: 'Most Adored Atelier Icons' },
  { label: 'New Arrivals', route: 'new-arrivals', subtitle: 'Seasonal Atelier Releases' },
];

export function Header({
  currentRoute,
  onNavigate,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenSearch,
  onOpenWishlist,
}: HeaderProps) {
  const [bannerVisible, setBannerVisible] = useState(true);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = (route: PageRoute) => {
    setCollectionsOpen(false);
    setMobileMenuOpen(false);
    onNavigate(route);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#090909]">
      {/* Slim Dismissible Announcement Strip */}
      {bannerVisible && (
        <div className="bg-[#111111] border-b border-[#D4AF70]/30 text-[#F4C6D0] px-4 py-1.5 text-xs flex items-center justify-center relative">
          <p className="text-center truncate pr-6">
            Complimentary Royal Gift Wrapping &amp; Express Delivery across Pakistan on orders above{' '}
            <span className="text-[#D4AF70] font-semibold">PKR 12,000</span>
          </p>
          <button
            type="button"
            onClick={() => setBannerVisible(false)}
            aria-label="Dismiss announcement"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#D4AF70] hover:text-[#FFFFFF] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main 3-Zone Top Bar */}
      <div className="glass-atelier border-b border-[#D4AF70]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-element Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="lg:hidden p-2 -ml-2 text-[#D4AF70] hover:bg-[#1B1B1B] rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <button
              type="button"
              onClick={() => handleLinkClick('home')}
              className="font-display text-2xl sm:text-[26px] font-semibold tracking-tight text-[#D4AF70] hover:text-[#F4C6D0] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#D4AF70]"
            >
              Vespera Beauty
            </button>
          </div>

          {/* Zone 2: 5 Single-Line Navigation Links */}
          <nav
            aria-label="Primary"
            className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#FFFFFF]"
          >
            <button
              type="button"
              onClick={() => handleLinkClick('home')}
              className={`whitespace-nowrap shrink-0 py-1 border-b transition-colors ${
                currentRoute === 'home'
                  ? 'border-[#D4AF70] text-[#D4AF70]'
                  : 'border-transparent hover:border-[#E8A1B2] hover:text-[#F4C6D0]'
              }`}
            >
              Home
            </button>

            <button
              type="button"
              onClick={() => handleLinkClick('shop')}
              className={`whitespace-nowrap shrink-0 py-1 border-b transition-colors ${
                currentRoute === 'shop'
                  ? 'border-[#D4AF70] text-[#D4AF70]'
                  : 'border-transparent hover:border-[#E8A1B2] hover:text-[#F4C6D0]'
              }`}
            >
              Shop All
            </button>

            <div
              className="relative"
              onMouseEnter={() => setCollectionsOpen(true)}
              onMouseLeave={() => setCollectionsOpen(false)}
            >
              <button
                type="button"
                onClick={() => setCollectionsOpen((prev) => !prev)}
                aria-expanded={collectionsOpen}
                className={`whitespace-nowrap shrink-0 py-1 border-b flex items-center gap-1 transition-colors ${
                  [
                    'makeup',
                    'skincare',
                    'haircare',
                    'perfumes',
                    'body-care',
                    'accessories',
                    'best-sellers',
                    'new-arrivals',
                  ].includes(currentRoute)
                    ? 'border-[#D4AF70] text-[#D4AF70]'
                    : 'border-transparent hover:border-[#E8A1B2] hover:text-[#F4C6D0]'
                }`}
              >
                <span>Collections</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#D4AF70]" />
              </button>

              {collectionsOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 w-[540px] z-50">
                  <div className="bg-[#111111] border border-[#D4AF70]/50 rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.85)] p-6">
                    <div className="grid grid-cols-2 gap-3">
                      {COLLECTION_LINKS.map((item) => (
                        <button
                          key={item.route}
                          type="button"
                          onClick={() => handleLinkClick(item.route)}
                          className="text-left p-3 rounded-xl bg-[#1B1B1B]/60 hover:bg-[#1B1B1B] border border-transparent hover:border-[#D4AF70]/45 transition-colors group"
                        >
                          <div className="font-display text-lg font-semibold text-[#D4AF70] group-hover:text-[#F4C6D0]">
                            {item.label}
                          </div>
                          <div className="text-xs text-[#F4C6D0]/75 mt-0.5">{item.subtitle}</div>
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#D4AF70]/30 flex items-center justify-between text-xs text-[#F4C6D0]/85">
                      <button
                        type="button"
                        onClick={() => handleLinkClick('faq')}
                        className="hover:text-[#D4AF70] transition-colors"
                      >
                        Concierge FAQ
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLinkClick('contact')}
                        className="hover:text-[#D4AF70] transition-colors"
                      >
                        Boutique Contact
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLinkClick('admin')}
                        className="font-medium text-[#D4AF70] hover:text-[#F4C6D0] transition-colors"
                      >
                        Admin Portal
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleLinkClick('reviews')}
              className={`whitespace-nowrap shrink-0 py-1 border-b transition-colors ${
                currentRoute === 'reviews'
                  ? 'border-[#D4AF70] text-[#D4AF70]'
                  : 'border-transparent hover:border-[#E8A1B2] hover:text-[#F4C6D0]'
              }`}
            >
              Reviews
            </button>

            <button
              type="button"
              onClick={() => handleLinkClick('about')}
              className={`whitespace-nowrap shrink-0 py-1 border-b transition-colors ${
                currentRoute === 'about'
                  ? 'border-[#D4AF70] text-[#D4AF70]'
                  : 'border-transparent hover:border-[#E8A1B2] hover:text-[#F4C6D0]'
              }`}
            >
              About Us
            </button>
          </nav>

          {/* Zone 3: Primary Action & Utility Cluster */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenSearch}
              aria-label="Search products"
              className="p-2.5 rounded-xl text-[#D4AF70] hover:bg-[#1B1B1B] hover:text-[#F4C6D0] transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>

            <button
              type="button"
              onClick={onOpenWishlist}
              aria-label="Open wishlist"
              className="relative p-2.5 rounded-xl text-[#E8A1B2] hover:bg-[#1B1B1B] hover:text-[#F4C6D0] transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <Heart className="w-[18px] h-[18px]" />
              {wishlistCount > 0 && (
                <span className="absolute top-1.5 right-1.5 text-[10px] font-semibold tabular-nums leading-none text-[#090909] bg-[#E8A1B2] px-1 py-0.5 rounded-full">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenCart}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4AF70] text-[#090909] text-xs font-semibold hover:bg-[#C69B52] border border-[#D4AF70] transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
            >
              <ShoppingBag className="w-4 h-4 text-[#090909]" />
              <span>Bag</span>
              <span className="tabular-nums text-[#090909]">({cartCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#111111] border-b border-[#D4AF70]/45 shadow-2xl max-h-[80vh] overflow-y-auto">
          <div className="px-5 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-2.5">
              {(
                [
                  { label: 'Home', route: 'home' },
                  { label: 'Shop All', route: 'shop' },
                  { label: 'Makeup', route: 'makeup' },
                  { label: 'Skincare', route: 'skincare' },
                  { label: 'Haircare', route: 'haircare' },
                  { label: 'Perfumes', route: 'perfumes' },
                  { label: 'Body Care', route: 'body-care' },
                  { label: 'Accessories', route: 'accessories' },
                  { label: 'Best Sellers', route: 'best-sellers' },
                  { label: 'New Arrivals', route: 'new-arrivals' },
                  { label: 'About Us', route: 'about' },
                  { label: 'Reviews', route: 'reviews' },
                  { label: 'Contact Us', route: 'contact' },
                  { label: 'FAQ', route: 'faq' },
                  { label: 'Shopping Cart', route: 'cart' },
                  { label: 'Admin Portal', route: 'admin' },
                ] as { label: string; route: PageRoute }[]
              ).map((item) => (
                <button
                  key={item.route}
                  type="button"
                  onClick={() => handleLinkClick(item.route)}
                  className={`min-h-[44px] px-3 py-2 rounded-xl text-left text-sm font-medium transition-colors border ${
                    currentRoute === item.route
                      ? 'bg-[#1B1B1B] border-[#D4AF70] text-[#D4AF70]'
                      : 'bg-[#090909] border-[#D4AF70]/30 text-[#FFFFFF] hover:border-[#E8A1B2] hover:text-[#F4C6D0]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
