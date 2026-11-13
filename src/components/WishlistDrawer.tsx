import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Heart, ShoppingBag, Trash2, X } from 'lucide-react';
import { Product } from '../types/store';
import { formatPkr } from '../services/storeService';

interface WishlistDrawerProps {
  open: boolean;
  products: Product[];
  wishlistIds: string[];
  onClose: () => void;
  onToggleWishlist: (id: string) => void;
  onAddToCart: (product: Product) => void;
  onViewProduct: (slug: string) => void;
}

export function WishlistDrawer({
  open,
  products,
  wishlistIds,
  onClose,
  onToggleWishlist,
  onAddToCart,
  onViewProduct,
}: WishlistDrawerProps) {
  const savedProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#090909]/80 backdrop-blur-xs"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md bg-[#111111] border-l border-[#D4AF70]/50 shadow-2xl flex flex-col h-full z-10 text-[#FFFFFF]"
            aria-label="Wishlist"
          >
            <div className="px-6 py-5 border-b border-[#D4AF70]/35 flex items-center justify-between bg-[#090909]">
              <div className="flex items-center gap-2.5">
                <Heart className="w-5 h-5 text-[#E8A1B2] fill-[#E8A1B2]" />
                <h2 className="font-display text-2xl font-semibold text-[#D4AF70]">
                  Saved Wishlist
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close wishlist"
                className="p-2 rounded-full text-[#F4C6D0] hover:bg-[#1B1B1B] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {savedProducts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-3">
                  <Heart className="w-8 h-8 text-[#D4AF70]" />
                  <p className="font-display text-2xl font-semibold text-[#FFFFFF]">
                    No saved favorites yet
                  </p>
                  <p className="text-sm text-[#F4C6D0]/75">
                    Tap the heart icon on any creation to curate your personal vanity list.
                  </p>
                </div>
              ) : (
                savedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex gap-4 pb-4 border-b border-[#D4AF70]/25"
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      onClick={() => {
                        onClose();
                        onViewProduct(product.slug);
                      }}
                      className="w-20 h-20 rounded-xl object-cover bg-[#1B1B1B] border border-[#D4AF70]/35 cursor-pointer shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3
                            onClick={() => {
                              onClose();
                              onViewProduct(product.slug);
                            }}
                            className="font-display text-base font-semibold text-[#FFFFFF] cursor-pointer hover:text-[#D4AF70] line-clamp-1"
                          >
                            {product.name}
                          </h3>
                          <button
                            type="button"
                            onClick={() => onToggleWishlist(product.id)}
                            aria-label="Remove from wishlist"
                            className="text-[#F4C6D0]/60 hover:text-[#E8A1B2] p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs font-semibold tabular-nums text-[#D4AF70] mt-1">
                          {formatPkr(product.discountPricePkr ?? product.pricePkr)}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={product.stock <= 0}
                        onClick={() => {
                          onAddToCart(product);
                          onClose();
                        }}
                        className="mt-2 py-1.5 px-3 rounded-lg bg-[#D4AF70] text-[#090909] text-xs font-semibold hover:bg-[#C69B52] flex items-center justify-center gap-1.5 w-fit"
                      >
                        <ShoppingBag className="w-3 h-3 text-[#090909]" />
                        <span>{product.stock <= 0 ? 'Out of Stock' : 'Move to Bag'}</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
