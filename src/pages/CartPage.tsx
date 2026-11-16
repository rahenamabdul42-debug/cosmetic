import React, { useState } from 'react';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { CartItem, PageRoute } from '../types/store';
import { formatPkr } from '../services/storeService';

interface CartPageProps {
  items: CartItem[];
  promoCode: string;
  onApplyPromo: (code: string) => void;
  onUpdateQty: (productId: string, variant: string, qty: number) => void;
  onRemoveItem: (productId: string, variant: string) => void;
  onNavigate: (route: PageRoute, slug?: string) => void;
}

export function CartPage({
  items,
  promoCode,
  onApplyPromo,
  onUpdateQty,
  onRemoveItem,
  onNavigate,
}: CartPageProps) {
  const [promoInput, setPromoInput] = useState(promoCode);
  const [promoMessage, setPromoMessage] = useState('');

  const subtotal = items.reduce((sum, item) => sum + item.unitPricePkr * item.quantity, 0);
  const upperPromo = promoCode.toUpperCase();
  const discount =
    upperPromo === 'VESPERA10' || upperPromo === 'ROSERAIE10'
      ? Math.round(subtotal * 0.1)
      : 0;
  const shipping = subtotal >= 12000 || subtotal === 0 ? 0 : 350;
  const total = Math.max(0, subtotal - discount + shipping);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = promoInput.trim().toUpperCase();
    if (cleaned === 'VESPERA10' || cleaned === 'ROSERAIE10') {
      onApplyPromo(cleaned);
      setPromoMessage(`${cleaned} applied — 10% Atelier privilege deducted.`);
    } else if (!cleaned) {
      onApplyPromo('');
      setPromoMessage('');
    } else {
      setPromoMessage('Invalid code. Try VESPERA10 for 10% off.');
    }
  };

  return (
    <div className="bg-luxury-marble min-h-[75vh] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs tracking-[0.18em] uppercase text-[#D4AF70] font-semibold">
            Vespera Beauty
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#FFFFFF] mt-1">
            Shopping Bag
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="bg-[#1B1B1B] border border-[#D4AF70]/45 rounded-3xl p-12 text-center space-y-5 max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#111111] border border-[#D4AF70]/55 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-7 h-7 text-[#D4AF70]" />
            </div>
            <h2 className="font-display text-3xl font-semibold text-[#FFFFFF]">
              Your Atelier Bag is Empty
            </h2>
            <p className="text-sm text-[#F4C6D0]/80">
              Discover our velvet lipsticks, 24K gold serums, and French extraits crafted for luminous elegance.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('shop')}
              className="px-7 py-3 rounded-xl bg-[#D4AF70] text-[#090909] text-sm font-semibold hover:bg-[#C69B52] transition-colors"
            >
              Explore Shop All
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-8 bg-[#1B1B1B] border border-[#D4AF70]/45 rounded-3xl p-6 sm:p-8 space-y-6">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.selectedVariant}`}
                  className="flex flex-col sm:flex-row gap-5 pb-6 border-b border-[#D4AF70]/25 last:border-b-0 last:pb-0"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    onClick={() => onNavigate('product-details', item.slug)}
                    className="w-28 h-24 rounded-2xl object-cover bg-[#111111] border border-[#D4AF70]/40 cursor-pointer shrink-0"
                  />

                  <div className="flex-1 flex flex-col justify-between gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs text-[#E8A1B2]">{item.category}</div>
                        <h3
                          onClick={() => onNavigate('product-details', item.slug)}
                          className="font-display text-xl font-semibold text-[#FFFFFF] cursor-pointer hover:text-[#D4AF70]"
                        >
                          {item.name}
                        </h3>
                        <p className="text-xs text-[#F4C6D0]/75 mt-0.5">
                          Selection: {item.selectedVariant}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.productId, item.selectedVariant)}
                        aria-label={`Remove ${item.name}`}
                        className="p-2 rounded-lg text-[#F4C6D0]/60 hover:text-[#E8A1B2] hover:bg-[#111111] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-[#D4AF70]/50 rounded-xl bg-[#111111]">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateQty(item.productId, item.selectedVariant, item.quantity - 1)
                          }
                          aria-label="Decrease quantity"
                          className="p-2 text-[#D4AF70] hover:bg-[#090909] rounded-l-xl"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3.5 text-sm font-medium tabular-nums text-[#FFFFFF]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateQty(item.productId, item.selectedVariant, item.quantity + 1)
                          }
                          aria-label="Increase quantity"
                          className="p-2 text-[#D4AF70] hover:bg-[#090909] rounded-r-xl"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right tabular-nums">
                        <div className="text-base font-semibold text-[#D4AF70]">
                          {formatPkr(item.unitPricePkr * item.quantity)}
                        </div>
                        <div className="text-xs text-[#F4C6D0]/65">
                          {formatPkr(item.unitPricePkr)} each
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4 bg-[#111111] border border-[#D4AF70]/50 rounded-3xl p-6 sm:p-7 space-y-5">
              <h2 className="font-display text-2xl font-semibold text-[#D4AF70]">
                Order Summary
              </h2>

              <form onSubmit={handleApplyPromo} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Promo code (VESPERA10)"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-[#1B1B1B] border border-[#D4AF70]/50 text-xs text-[#FFFFFF] placeholder:text-[#F4C6D0]/50 focus:outline-none focus:border-[#E8A1B2]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#1B1B1B] border border-[#D4AF70] text-xs font-medium text-[#D4AF70] hover:bg-[#D4AF70] hover:text-[#090909] transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {promoMessage && <p className="text-xs text-[#E8A1B2]">{promoMessage}</p>}
              </form>

              <div className="space-y-2.5 text-sm border-t border-[#D4AF70]/30 pt-4">
                <div className="flex justify-between text-[#F4C6D0]/85">
                  <span>Subtotal</span>
                  <span className="tabular-nums font-medium text-[#FFFFFF]">{formatPkr(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#E8A1B2]">
                    <span>Privilege Discount (10%)</span>
                    <span className="tabular-nums font-medium">-{formatPkr(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#F4C6D0]/85">
                  <span>Express Courier</span>
                  <span className="tabular-nums font-medium text-[#FFFFFF]">
                    {shipping === 0 ? 'Complimentary' : formatPkr(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-semibold text-[#D4AF70] border-t border-[#D4AF70]/35 pt-3">
                  <span>Total (PKR)</span>
                  <span className="tabular-nums">{formatPkr(total)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('checkout')}
                className="w-full py-3.5 px-6 rounded-xl bg-[#D4AF70] text-[#090909] text-sm font-semibold border border-[#D4AF70] hover:bg-[#C69B52] transition-colors flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 text-[#090909]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
