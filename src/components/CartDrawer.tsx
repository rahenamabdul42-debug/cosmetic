import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { CartItem, PageRoute } from '../types/store';
import { formatPkr } from '../services/storeService';

interface CartDrawerProps {
  open: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQty: (productId: string, variant: string, qty: number) => void;
  onRemoveItem: (productId: string, variant: string) => void;
  onNavigate: (route: PageRoute) => void;
}

const FREE_SHIPPING_THRESHOLD = 12000;

export function CartDrawer({
  open,
  items,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onNavigate,
}: CartDrawerProps) {
  const subtotal = items.reduce((sum, item) => sum + item.unitPricePkr * item.quantity, 0);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

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
            aria-label="Shopping Bag"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#D4AF70]/35 flex items-center justify-between bg-[#090909]">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-[#D4AF70]" />
                <h2 className="font-display text-2xl font-semibold text-[#D4AF70]">
                  Your Atelier Bag
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close shopping bag"
                className="p-2 rounded-full text-[#F4C6D0] hover:bg-[#1B1B1B] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Delivery Progress */}
            <div className="px-6 py-3.5 bg-[#1B1B1B] border-b border-[#D4AF70]/25 space-y-2">
              <p className="text-xs text-[#F4C6D0]">
                {remaining === 0
                  ? 'You have unlocked complimentary express delivery & royal gift box.'
                  : `Add ${formatPkr(remaining)} more for complimentary express delivery.`}
              </p>
              <div className="h-1.5 w-full rounded-full bg-[#090909] overflow-hidden">
                <div
                  className="h-full bg-gold-shimmer transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#1B1B1B] border border-[#D4AF70]/50 flex items-center justify-center">
                    <ShoppingBag className="w-7 h-7 text-[#D4AF70]" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-display text-2xl font-semibold text-[#FFFFFF]">
                      Your bag is empty
                    </p>
                    <p className="text-sm text-[#F4C6D0]/75">
                      Explore our luxury makeup, 24K serums, and French extraits.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigate('shop');
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#D4AF70] text-[#090909] text-sm font-semibold hover:bg-[#C69B52] transition-colors"
                  >
                    Explore Collection
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={`${item.productId}-${item.selectedVariant}`}
                    className="flex gap-4 pb-4 border-b border-[#D4AF70]/25"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 rounded-xl object-cover bg-[#1B1B1B] border border-[#D4AF70]/35 shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-display text-base font-semibold text-[#FFFFFF] leading-snug line-clamp-1">
                            {item.name}
                          </h3>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.productId, item.selectedVariant)}
                            aria-label={`Remove ${item.name}`}
                            className="text-[#F4C6D0]/60 hover:text-[#E8A1B2] p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-[#F4C6D0]/75 mt-0.5">{item.selectedVariant}</p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-[#D4AF70]/45 rounded-lg bg-[#1B1B1B]">
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateQty(item.productId, item.selectedVariant, item.quantity - 1)
                            }
                            aria-label="Decrease quantity"
                            className="px-2 py-1 text-[#D4AF70] hover:bg-[#090909] rounded-l-lg"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-medium tabular-nums text-[#FFFFFF]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateQty(item.productId, item.selectedVariant, item.quantity + 1)
                            }
                            aria-label="Increase quantity"
                            className="px-2 py-1 text-[#D4AF70] hover:bg-[#090909] rounded-r-lg"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-sm font-semibold tabular-nums text-[#D4AF70]">
                          {formatPkr(item.unitPricePkr * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Actions */}
            {items.length > 0 && (
              <div className="p-6 border-t border-[#D4AF70]/40 bg-[#090909] space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#F4C6D0]">Subtotal</span>
                  <span className="text-lg font-semibold tabular-nums text-[#D4AF70]">
                    {formatPkr(subtotal)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigate('cart');
                    }}
                    className="py-3 px-4 rounded-xl border border-[#D4AF70] bg-[#1B1B1B] text-xs font-medium text-[#FFFFFF] hover:bg-[#D4AF70]/15 transition-colors"
                  >
                    View Full Bag
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigate('checkout');
                    }}
                    className="py-3 px-4 rounded-xl bg-[#D4AF70] text-[#090909] text-xs font-semibold hover:bg-[#C69B52] border border-[#D4AF70] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Checkout</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#090909]" />
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
