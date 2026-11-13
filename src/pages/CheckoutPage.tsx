import React, { useState } from 'react';
import { CheckCircle2, PackageCheck, Search, ShieldCheck, Truck } from 'lucide-react';
import { CartItem, Order, PageRoute, PaymentMethod } from '../types/store';
import { createOrder, formatPkr } from '../services/storeService';

interface CheckoutPageProps {
  items: CartItem[];
  promoCode: string;
  orders: Order[];
  onOrderCreated: (order: Order) => void;
  onClearCart: () => void;
  onNavigate: (route: PageRoute) => void;
}

export function CheckoutPage({
  items,
  promoCode,
  orders,
  onOrderCreated,
  onClearCart,
  onNavigate,
}: CheckoutPageProps) {
  const [tab, setTab] = useState<'checkout' | 'track'>(items.length > 0 ? 'checkout' : 'track');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Karachi');
  const [postalCode, setPostalCode] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash on Delivery');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const [lookupQuery, setLookupQuery] = useState('');

  const subtotal = items.reduce((sum, item) => sum + item.unitPricePkr * item.quantity, 0);
  const discount = promoCode.toUpperCase() === 'ROSERAIE10' ? Math.round(subtotal * 0.1) : 0;
  const shipping = subtotal >= 12000 || subtotal === 0 ? 0 : 350;
  const total = Math.max(0, subtotal - discount + shipping);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setErrorMsg('');
    setSubmitting(true);

    try {
      const order = await createOrder({
        customerName: fullName.trim(),
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        shippingAddress: address.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        orderNotes: orderNotes.trim(),
        paymentMethod,
        subtotalPkr: subtotal,
        shippingPkr: shipping,
        discountPkr: discount,
        totalPkr: total,
        promoCode,
        items: items.map((item) => ({
          id: crypto.randomUUID(),
          productId: item.productId,
          productName: item.name,
          productImage: item.imageUrl,
          selectedVariant: item.selectedVariant,
          unitPricePkr: item.unitPricePkr,
          quantity: item.quantity,
          lineTotalPkr: item.unitPricePkr * item.quantity,
        })),
      });

      onOrderCreated(order);
      onClearCart();
      setConfirmedOrder(order);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Unable to place order. Please verify your details.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const matchedHistory = orders.filter((o) => {
    const q = lookupQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      o.trackingId.toLowerCase().includes(q) ||
      o.customerEmail.toLowerCase().includes(q) ||
      o.customerPhone.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-luxury-marble min-h-[75vh] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header & Mode Switch */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.18em] uppercase text-[#D4AF70] font-semibold">
              Insured Nationwide Dispatch
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#FFFFFF] mt-1">
              {confirmedOrder ? 'Order Confirmed' : 'Checkout & Order Tracking'}
            </h1>
          </div>

          {!confirmedOrder && (
            <div className="flex gap-1 p-1 rounded-xl bg-[#111111] border border-[#D4AF70]/45">
              <button
                type="button"
                onClick={() => setTab('checkout')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  tab === 'checkout'
                    ? 'bg-[#D4AF70] text-[#090909]'
                    : 'text-[#F4C6D0] hover:bg-[#1B1B1B]'
                }`}
              >
                Checkout ({items.length})
              </button>
              <button
                type="button"
                onClick={() => setTab('track')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  tab === 'track'
                    ? 'bg-[#D4AF70] text-[#090909]'
                    : 'text-[#F4C6D0] hover:bg-[#1B1B1B]'
                }`}
              >
                Track &amp; Order History ({orders.length})
              </button>
            </div>
          )}
        </div>

        {/* CONFIRMED RECEIPT VIEW */}
        {confirmedOrder ? (
          <div className="max-w-3xl mx-auto bg-[#1B1B1B] border border-[#D4AF70]/60 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-[#D4AF70]/35">
              <div className="w-14 h-14 rounded-full bg-[#111111] border border-[#D4AF70] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7 text-[#D4AF70]" />
              </div>
              <div>
                <p className="text-xs tracking-wider uppercase text-[#D4AF70] font-semibold">
                  Order #{confirmedOrder.trackingId} Confirmed — Preparing Shipment
                </p>
                <h2 className="font-display text-3xl font-semibold text-[#FFFFFF]">
                  Thank you, {confirmedOrder.customerName}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-[#111111] border border-[#D4AF70]/35 rounded-2xl p-5">
              <div>
                <span className="text-xs text-[#F4C6D0]/70 block">Unique Tracking ID</span>
                <span className="font-semibold text-[#D4AF70] tabular-nums">
                  {confirmedOrder.trackingId}
                </span>
              </div>
              <div>
                <span className="text-xs text-[#F4C6D0]/70 block">Payment Method</span>
                <span className="font-semibold text-[#FFFFFF]">{confirmedOrder.paymentMethod}</span>
              </div>
              <div>
                <span className="text-xs text-[#F4C6D0]/70 block">Destination</span>
                <span className="text-[#F4C6D0]">
                  {confirmedOrder.shippingAddress}, {confirmedOrder.city}
                </span>
              </div>
              <div>
                <span className="text-xs text-[#F4C6D0]/70 block">Total Payable</span>
                <span className="font-semibold text-[#D4AF70] tabular-nums">
                  {formatPkr(confirmedOrder.totalPkr)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-display text-xl font-semibold text-[#FFFFFF]">Items Ordered</h3>
              {confirmedOrder.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm py-2 border-b border-[#D4AF70]/20"
                >
                  <div>
                    <span className="font-medium text-[#FFFFFF]">{item.productName}</span>
                    <span className="text-xs text-[#F4C6D0]/70 ml-2">
                      ({item.selectedVariant} × {item.quantity})
                    </span>
                  </div>
                  <span className="tabular-nums font-medium text-[#D4AF70]">
                    {formatPkr(item.lineTotalPkr)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmedOrder(null);
                  setTab('track');
                }}
                className="px-6 py-3 rounded-xl bg-[#D4AF70] text-[#090909] text-sm font-semibold hover:bg-[#C69B52]"
              >
                View Order History &amp; Status
              </button>
              <button
                type="button"
                onClick={() => onNavigate('shop')}
                className="px-6 py-3 rounded-xl bg-[#111111] border border-[#D4AF70] text-sm font-medium text-[#FFFFFF] hover:bg-[#090909]"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : tab === 'checkout' ? (
          items.length === 0 ? (
            <div className="bg-[#1B1B1B] border border-[#D4AF70]/45 rounded-3xl p-12 text-center space-y-4">
              <h2 className="font-display text-3xl font-semibold text-[#FFFFFF]">
                Your bag is currently empty
              </h2>
              <p className="text-sm text-[#F4C6D0]/75">
                Add creations to your bag before proceeding to checkout, or switch to Order History to track an existing order.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('shop')}
                className="px-6 py-3 rounded-xl bg-[#D4AF70] text-[#090909] text-sm font-semibold"
              >
                Explore Collection
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleCheckoutSubmit}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              {/* Shipping & COD Form */}
              <div className="lg:col-span-7 bg-[#1B1B1B] border border-[#D4AF70]/45 rounded-3xl p-6 sm:p-8 space-y-6">
                <h2 className="font-display text-2xl font-semibold text-[#D4AF70]">
                  Delivery &amp; Verification Details
                </h2>

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-[#111111] border border-[#E8A1B2] text-xs text-[#F4C6D0]">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#F4C6D0] mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ayesha Khan"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#111111] border border-[#D4AF70]/45 text-sm text-[#FFFFFF] placeholder:text-[#F4C6D0]/45 focus:outline-none focus:border-[#E8A1B2]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#F4C6D0] mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ayesha@example.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#111111] border border-[#D4AF70]/45 text-sm text-[#FFFFFF] placeholder:text-[#F4C6D0]/45 focus:outline-none focus:border-[#E8A1B2]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#F4C6D0] mb-1.5">
                      Mobile Number (For COD Verification) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+92 300 1234567"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#111111] border border-[#D4AF70]/45 text-sm text-[#FFFFFF] placeholder:text-[#F4C6D0]/45 focus:outline-none focus:border-[#E8A1B2]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#F4C6D0] mb-1.5">
                      City *
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#111111] border border-[#D4AF70]/45 text-sm text-[#FFFFFF] focus:outline-none focus:border-[#E8A1B2]"
                    >
                      {[
                        'Karachi',
                        'Lahore',
                        'Islamabad',
                        'Rawalpindi',
                        'Faisalabad',
                        'Multan',
                        'Peshawar',
                        'Quetta',
                        'Sialkot',
                        'Other City (Pakistan)',
                      ].map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[#F4C6D0] mb-1.5">
                      Complete Street Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House, Street, Sector / Phase"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#111111] border border-[#D4AF70]/45 text-sm text-[#FFFFFF] placeholder:text-[#F4C6D0]/45 focus:outline-none focus:border-[#E8A1B2]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#F4C6D0] mb-1.5">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="75500"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#111111] border border-[#D4AF70]/45 text-sm text-[#FFFFFF] placeholder:text-[#F4C6D0]/45 focus:outline-none focus:border-[#E8A1B2]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#F4C6D0] mb-1.5">
                    Complimentary Gift Message / Delivery Notes
                  </label>
                  <textarea
                    rows={2}
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Optional handwritten card message or preferred delivery window..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#111111] border border-[#D4AF70]/45 text-sm text-[#FFFFFF] placeholder:text-[#F4C6D0]/45 focus:outline-none focus:border-[#E8A1B2]"
                  />
                </div>

                {/* Payment Method */}
                <div className="space-y-3 pt-2">
                  <h3 className="font-display text-xl font-semibold text-[#D4AF70]">
                    Payment Method
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(['Cash on Delivery', 'Card on Delivery', 'Bank Transfer'] as PaymentMethod[]).map(
                      (method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition-colors ${
                            paymentMethod === method
                              ? 'bg-[#E8A1B2] text-[#090909] border-[#D4AF70]'
                              : 'bg-[#111111] text-[#F4C6D0] border-[#D4AF70]/40 hover:border-[#D4AF70]'
                          }`}
                        >
                          {method}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Checkout Summary Column */}
              <div className="lg:col-span-5 bg-[#111111] border border-[#D4AF70]/50 rounded-3xl p-6 sm:p-8 space-y-5">
                <h2 className="font-display text-2xl font-semibold text-[#D4AF70]">
                  Parcel Summary
                </h2>

                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.selectedVariant}`}
                      className="flex items-center gap-3 text-xs"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover border border-[#D4AF70]/40 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[#FFFFFF] truncate">{item.name}</div>
                        <div className="text-[#F4C6D0]/70">
                          {item.selectedVariant} × {item.quantity}
                        </div>
                      </div>
                      <div className="tabular-nums font-semibold text-[#D4AF70]">
                        {formatPkr(item.unitPricePkr * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 text-sm border-t border-[#D4AF70]/35 pt-4">
                  <div className="flex justify-between text-[#F4C6D0]/85">
                    <span>Subtotal</span>
                    <span className="tabular-nums text-[#FFFFFF]">{formatPkr(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[#E8A1B2]">
                      <span>Privilege ({promoCode})</span>
                      <span className="tabular-nums">-{formatPkr(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#F4C6D0]/85">
                    <span>Express Delivery</span>
                    <span className="tabular-nums text-[#FFFFFF]">
                      {shipping === 0 ? 'Complimentary' : formatPkr(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold text-[#D4AF70] border-t border-[#D4AF70]/40 pt-3">
                    <span>Total Payable</span>
                    <span className="tabular-nums">{formatPkr(total)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#D4AF70] text-[#090909] text-sm font-semibold hover:bg-[#C69B52] transition-colors disabled:opacity-60"
                >
                  {submitting
                    ? 'Confirming Your Order...'
                    : `Confirm Order · ${formatPkr(total)}`}
                </button>

                <div className="flex items-center justify-center gap-4 text-[11px] text-[#F4C6D0]/80 pt-1">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-[#D4AF70]" /> 2–3 Day Express
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF70]" /> Insured COD
                  </span>
                </div>
              </div>
            </form>
          )
        ) : (
          /* ORDER TRACKING & CUSTOMER HISTORY */
          <div className="space-y-6">
            <div className="bg-[#1B1B1B] border border-[#D4AF70]/45 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:max-w-md">
                <Search className="w-4 h-4 text-[#D4AF70] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  placeholder="Enter Tracking ID (MR-2026-...) or Email..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#111111] border border-[#D4AF70]/50 text-sm text-[#FFFFFF] placeholder:text-[#F4C6D0]/50 focus:outline-none focus:border-[#E8A1B2]"
                />
              </div>
              <span className="text-xs text-[#F4C6D0]/80 tabular-nums">
                {matchedHistory.length} order{matchedHistory.length === 1 ? '' : 's'} found
              </span>
            </div>

            {matchedHistory.length === 0 ? (
              <div className="bg-[#1B1B1B] border border-[#D4AF70]/40 rounded-3xl p-12 text-center space-y-3">
                <PackageCheck className="w-8 h-8 text-[#D4AF70] mx-auto" />
                <h2 className="font-display text-2xl font-semibold text-[#FFFFFF]">
                  No Orders Recorded Yet
                </h2>
                <p className="text-sm text-[#F4C6D0]/75">
                  Place an order at checkout to receive a unique tracking ID and live status updates.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {matchedHistory.map((order) => (
                  <div
                    key={order.id}
                    className="bg-[#1B1B1B] border border-[#D4AF70]/45 rounded-2xl p-6 space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#D4AF70]/25">
                      <div>
                        <div className="font-display text-xl font-semibold text-[#D4AF70] tabular-nums">
                          Tracking ID: {order.trackingId}
                        </div>
                        <div className="text-xs text-[#F4C6D0]/75">
                          {new Date(order.createdAt).toLocaleDateString('en-PK', {
                            dateStyle: 'medium',
                          })}{' '}
                          · {order.customerName} · {order.city} · {order.paymentMethod}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-[#111111] border border-[#D4AF70]/60 text-[#E8A1B2]">
                          Status: {order.status}
                        </span>
                        <div className="text-sm font-semibold tabular-nums text-[#D4AF70] mt-1">
                          {formatPkr(order.totalPkr)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 bg-[#111111] border border-[#D4AF70]/20 rounded-xl p-2.5 text-xs"
                        >
                          {item.productImage && (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-10 h-10 rounded-lg object-cover shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <div className="font-medium text-[#FFFFFF] truncate">
                              {item.productName}
                            </div>
                            <div className="text-[#F4C6D0]/75 tabular-nums">
                              Qty {item.quantity} · {formatPkr(item.lineTotalPkr)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
