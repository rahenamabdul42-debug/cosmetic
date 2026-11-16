import React, { useState } from 'react';
import { Eye, Heart, ShoppingBag, Star } from 'lucide-react';
import { Product } from '../types/store';
import { formatPkr } from '../services/storeService';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onOpenDetails: (slug: string) => void;
}

export function ProductCard({
  product,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onQuickView,
  onOpenDetails,
}: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const effectivePrice = product.discountPricePkr ?? product.pricePkr;
  const hasDiscount =
    product.discountPricePkr !== null && product.discountPricePkr < product.pricePkr;
  const outOfStock = product.stock <= 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (outOfStock) return;
    onAddToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <article
      className="group bg-[#1B1B1B] border border-[#D4AF70]/40 hover:border-[#D4AF70] rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.45)] hover:shadow-[0_16px_42px_rgba(212,175,112,0.14)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
    >
      {/* Product Photography (65-75% visual weight) */}
      <div
        onClick={() => onOpenDetails(product.slug)}
        className="relative aspect-[4/3] w-full overflow-hidden bg-[#111111] cursor-pointer"
      >
        {!imgError && product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-blush-silk flex flex-col items-center justify-center p-6 text-center">
            <span className="font-display text-2xl text-[#D4AF70]">{product.name}</span>
            <span className="text-xs text-[#F4C6D0]/80 mt-1">{product.category}</span>
          </div>
        )}

        {/* Top-Right Functional Affordance Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product.id);
            }}
            aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
            className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border transition-colors ${
              isWishlisted
                ? 'bg-[#E8A1B2] text-[#090909] border-[#D4AF70]'
                : 'bg-[#090909]/80 text-[#F4C6D0] border-[#D4AF70]/50 hover:bg-[#1B1B1B] hover:border-[#D4AF70]'
            }`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#090909]' : ''}`} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            aria-label={`Quick view ${product.name}`}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#090909]/80 text-[#D4AF70] border border-[#D4AF70]/50 hover:bg-[#1B1B1B] hover:border-[#D4AF70] backdrop-blur-md transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Single Clean Editorial Kicker */}
        {(product.isBestSeller || product.isNewArrival || outOfStock) && (
          <div className="absolute top-3 left-3 bg-[#090909]/85 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium tracking-wide text-[#D4AF70] border border-[#D4AF70]/50 rounded-lg">
            {outOfStock ? 'Sold Out' : product.isNewArrival ? 'New Arrival' : 'Best Seller'}
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-1.5">
          {/* Unboxed Clean Metadata */}
          <div className="flex items-center justify-between gap-2 text-xs text-[#F4C6D0]/80">
            <span className="truncate">
              {product.dbCategory ?? `${product.category} · ${product.subcategory}`}
            </span>
            <span className="flex items-center gap-1 shrink-0 tabular-nums font-medium text-[#D4AF70]">
              <Star className="w-3.5 h-3.5 fill-[#D4AF70] text-[#D4AF70]" />
              {product.rating.toFixed(1)}
            </span>
          </div>

          <h3
            onClick={() => onOpenDetails(product.slug)}
            className="font-display text-xl font-semibold leading-snug text-[#FFFFFF] cursor-pointer hover:text-[#D4AF70] transition-colors line-clamp-2"
          >
            {product.name}
          </h3>

          <p className="text-xs text-[#F4C6D0]/80 line-clamp-2">
            {product.description || product.subtitle}
          </p>
        </div>

        <div className="space-y-3 pt-1">
          {/* Price Row */}
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2.5 tabular-nums">
              <span className="text-base font-semibold text-[#D4AF70]">
                {formatPkr(effectivePrice)}
              </span>
              {hasDiscount && (
                <span className="text-xs line-through text-[#F4C6D0]/50">
                  {formatPkr(product.pricePkr)}
                </span>
              )}
            </div>
            <span className="text-xs text-[#F4C6D0]/75">{product.volume}</span>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            disabled={outOfStock}
            onClick={handleAdd}
            className={`w-full min-h-[42px] px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${
              outOfStock
                ? 'bg-[#111111] text-[#F4C6D0]/40 cursor-not-allowed border border-[#D4AF70]/25'
                : justAdded
                ? 'bg-[#E8A1B2] text-[#090909] border border-[#E8A1B2]'
                : 'bg-[#D4AF70] text-[#090909] hover:bg-[#C69B52] border border-[#D4AF70]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{outOfStock ? 'Out of Stock' : justAdded ? 'Added to Bag' : 'Add to Bag'}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
