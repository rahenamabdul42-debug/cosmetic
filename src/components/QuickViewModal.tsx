import React, { useState } from 'react';
import { ArrowRight, Heart, Minus, Plus, ShoppingBag, Star, X } from 'lucide-react';
import { Product } from '../types/store';
import { formatPkr } from '../services/storeService';

interface QuickViewModalProps {
  product: Product | null;
  isWishlisted: boolean;
  onClose: () => void;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, variant: string, qty: number) => void;
  onViewDetails: (slug: string) => void;
}

export function QuickViewModal({
  product,
  isWishlisted,
  onClose,
  onToggleWishlist,
  onAddToCart,
  onViewDetails,
}: QuickViewModalProps) {
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [qty, setQty] = useState(1);

  if (!product) return null;

  const activeVariant = selectedVariant || product.shades[0] || product.volume;
  const effectivePrice = product.discountPricePkr ?? product.pricePkr;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090909]/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view ${product.name}`}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-[#1B1B1B] border border-[#D4AF70]/60 rounded-2xl shadow-[0_24px_70px_rgba(0,0,0,0.85)] overflow-hidden grid grid-cols-1 md:grid-cols-2"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close quick view"
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-[#090909]/85 border border-[#D4AF70]/55 flex items-center justify-center text-[#D4AF70] hover:bg-[#111111] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Image Side */}
        <div className="bg-[#111111] aspect-[4/3] md:aspect-auto md:h-full">
          <img
            src={product.imageUrl}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Details Side */}
        <div className="p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div className="space-y-3">
            <div className="text-xs text-[#F4C6D0]/80 flex items-center gap-2">
              <span>{product.category}</span>
              <span>·</span>
              <span>{product.subcategory}</span>
              <span>·</span>
              <span className="inline-flex items-center gap-1 text-[#D4AF70] font-medium tabular-nums">
                <Star className="w-3.5 h-3.5 fill-[#D4AF70] text-[#D4AF70]" />
                {product.rating.toFixed(1)} ({product.reviewCount})
              </span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#FFFFFF] leading-tight">
              {product.name}
            </h2>

            <div className="flex items-baseline gap-3 tabular-nums">
              <span className="text-xl font-semibold text-[#D4AF70]">
                {formatPkr(effectivePrice)}
              </span>
              {product.discountPricePkr && product.discountPricePkr < product.pricePkr && (
                <span className="text-sm line-through text-[#F4C6D0]/50">
                  {formatPkr(product.pricePkr)}
                </span>
              )}
            </div>

            <p className="text-sm text-[#F4C6D0]/85 leading-relaxed line-clamp-3">
              {product.description}
            </p>

            {/* Variant Selector */}
            {product.shades.length > 0 && (
              <div className="pt-2 space-y-2">
                <div className="text-xs font-medium text-[#FFFFFF]">
                  Selection: <span className="text-[#E8A1B2]">{activeVariant}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.shades.map((shade) => (
                    <button
                      key={shade}
                      type="button"
                      onClick={() => setSelectedVariant(shade)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
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
          </div>

          <div className="space-y-3 pt-2 border-t border-[#D4AF70]/30">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-[#D4AF70]/50 rounded-xl bg-[#111111]">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="p-2.5 text-[#D4AF70] hover:bg-[#1B1B1B] rounded-l-xl"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 text-sm font-medium tabular-nums text-[#FFFFFF]">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  aria-label="Increase quantity"
                  className="p-2.5 text-[#D4AF70] hover:bg-[#1B1B1B] rounded-r-xl"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                disabled={product.stock <= 0}
                onClick={() => {
                  onAddToCart(product, activeVariant, qty);
                  onClose();
                }}
                className="flex-1 min-h-[42px] px-4 py-2.5 rounded-xl bg-[#D4AF70] text-[#090909] text-sm font-semibold hover:bg-[#C69B52] border border-[#D4AF70] flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4 text-[#090909]" />
                <span>{product.stock <= 0 ? 'Out of Stock' : 'Add to Bag'}</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleWishlist(product.id)}
                aria-label="Toggle wishlist"
                className="w-11 h-11 rounded-xl border border-[#D4AF70]/50 bg-[#111111] flex items-center justify-center text-[#E8A1B2] hover:border-[#D4AF70] transition-colors"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#E8A1B2] text-[#E8A1B2]' : ''}`} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onViewDetails(product.slug);
              }}
              className="w-full py-2 text-xs font-medium text-[#D4AF70] hover:text-[#F4C6D0] flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>View Full Product Details &amp; Ingredients</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
