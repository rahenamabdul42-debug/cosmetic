import React, { useState } from 'react';
import { ChevronDown, Mail, MapPin, Phone, Star } from 'lucide-react';
import { EDITORIAL_IMAGES } from '../data/productImages';
import { FAQ_ITEMS } from '../data/catalog';
import { PageRoute, ProductReview } from '../types/store';
import { submitInquiry } from '../services/storeService';
import { GoldDivider } from '../components/LuxuryDecor';

export function AboutPage({ onNavigate }: { onNavigate: (route: PageRoute) => void }) {
  return (
    <div className="bg-luxury-marble py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center space-y-5">
            <p className="text-xs tracking-[0.18em] uppercase text-[#D4AF70] font-semibold">
              Our Heritage · Est. 2024
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#FFFFFF] leading-tight">
              Where French Botanical Craft Meets South Asian Radiance
            </h1>
            <p className="text-sm sm:text-base text-[#F4C6D0]/85 leading-relaxed">
              Vespera Beauty was founded on a quiet conviction: luxury cosmetics should nourish the skin barrier as faithfully as they adorn it. Each formula pairs cold-pressed Damask rose otto, 24K cosmetic gold, and silk amino acids inside refillable obsidian glass and brushed champagne gold vessels.
            </p>
            <p className="text-sm sm:text-base text-[#F4C6D0]/85 leading-relaxed">
              From our Parisian scent collaborations in Grasse to our flagship beauty salons in Karachi, Lahore, and Islamabad, every creation is cruelty-free, paraben-free, and calibrated for warm, humid climates.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate('shop')}
                className="px-7 py-3 rounded-xl bg-[#D4AF70] text-[#090909] text-sm font-semibold hover:bg-[#C69B52] transition-colors"
              >
                Explore All Creations
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 rounded-3xl overflow-hidden border border-[#D4AF70]/50 shadow-2xl min-h-[340px] bg-[#111111]">
            <img
              src={EDITORIAL_IMAGES.atelierEditorialStudio}
              alt="Vespera Beauty obsidian marble beauty vanity atelier"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <GoldDivider />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {[
            {
              title: '01. Cold-Pressed Botanicals',
              body: 'Steam-distilled Moroccan & Pakistani Damask rose hydrosol forms the first ingredient across our skincare elixirs, soothing inflammation while locking in hydration.',
            },
            {
              title: '02. Couture Pigments',
              body: 'Triple-milled mineral pearls and velvet waxes deliver high-impact, crease-proof color designed to flatter ivory through deep caramel undertones.',
            },
            {
              title: '03. Heirloom Packaging',
              body: 'Heavy obsidian glass, sculptural champagne gold caps, and keepsake black velvet coffrets turn daily rituals into dressing-table art.',
            },
          ].map((pillar) => (
            <div
              key={pillar.title}
              className="bg-[#1B1B1B] border border-[#D4AF70]/40 rounded-2xl p-7 space-y-3"
            >
              <h2 className="font-display text-2xl font-semibold text-[#D4AF70]">{pillar.title}</h2>
              <p className="text-sm text-[#F4C6D0]/85 leading-relaxed">{pillar.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ContactPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Shade Consultation');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim() || submitting) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      await submitInquiry({
        name: name.trim(),
        phone: phone.trim(),
        subject,
        message: message.trim(),
      });
      setSent(true);
      setName('');
      setPhone('');
      setMessage('');
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Unable to send your inquiry right now. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-luxury-marble py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <p className="text-xs tracking-[0.18em] uppercase text-[#D4AF70] font-semibold">
            Private Concierge
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#FFFFFF]">
            Contact Vespera Beauty
          </h1>
          <p className="text-sm sm:text-base text-[#F4C6D0]/85">
            Consult with our beauty advisors for shade matching, bridal trousseau curation, or order assistance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-[#111111] border border-[#D4AF70]/45 rounded-3xl p-7 space-y-5">
              <h2 className="font-display text-2xl font-semibold text-[#D4AF70]">
                Flagship Salons &amp; Desk
              </h2>
              <div className="space-y-4 text-sm text-[#F4C6D0]/85">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#D4AF70] mt-1 shrink-0" />
                  <div>
                    <p className="font-semibold text-[#FFFFFF]">Karachi Flagship Atelier</p>
                    <p className="text-xs">Suite 12, Clifton Block 4, Boat Basin</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#D4AF70] mt-1 shrink-0" />
                  <div>
                    <p className="font-semibold text-[#FFFFFF]">Lahore Boutique</p>
                    <p className="text-xs">MM Alam Road, Gulberg III, Lahore</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#D4AF70] shrink-0" />
                  <span>+92 21 3583 4910 (Mon–Sat, 10 AM – 8 PM PKT)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#D4AF70] shrink-0" />
                  <span>concierge@vesperabeauty.com</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#1B1B1B] border border-[#D4AF70]/45 rounded-3xl p-7 sm:p-9">
            {sent ? (
              <div className="py-10 text-center space-y-3">
                <h2 className="font-display text-3xl font-semibold text-[#D4AF70]">
                  Inquiry Received
                </h2>
                <p className="text-sm text-[#F4C6D0]/85">
                  Our client concierge has saved your message and will contact you shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#D4AF70] text-[#090909] text-xs font-semibold"
                >
                  Send Another Note
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-[#111111] border border-[#E8A1B2] text-xs text-[#F4C6D0]">
                    {errorMsg}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Full Name"
                    className="px-4 py-3 rounded-xl bg-[#111111] border border-[#D4AF70]/45 text-sm text-[#FFFFFF] placeholder:text-[#F4C6D0]/50 focus:outline-none focus:border-[#E8A1B2]"
                  />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone Number (e.g. +92 300 1234567)"
                    className="px-4 py-3 rounded-xl bg-[#111111] border border-[#D4AF70]/45 text-sm text-[#FFFFFF] placeholder:text-[#F4C6D0]/50 focus:outline-none focus:border-[#E8A1B2]"
                  />
                </div>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#111111] border border-[#D4AF70]/45 text-sm text-[#FFFFFF]"
                >
                  <option>Shade Consultation</option>
                  <option>Bridal Trousseau &amp; Gifting</option>
                  <option>Order Status Inquiry</option>
                  <option>Boutique Appointment</option>
                </select>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How may our beauty advisors assist you?"
                  className="w-full px-4 py-3 rounded-xl bg-[#111111] border border-[#D4AF70]/45 text-sm text-[#FFFFFF] placeholder:text-[#F4C6D0]/50 focus:outline-none focus:border-[#E8A1B2]"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-7 py-3 rounded-xl bg-[#D4AF70] text-[#090909] text-sm font-semibold hover:bg-[#C69B52] transition-colors disabled:opacity-60"
                >
                  {submitting ? 'Sending Inquiry...' : 'Send to Concierge'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReviewsPage({
  reviews,
  onSubmitReview,
}: {
  reviews: ProductReview[];
  onSubmitReview: (review: {
    productName: string;
    customerName: string;
    customerCity: string;
    rating: number;
    title: string;
    comment: string;
  }) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('Karachi');
  const [productName, setProductName] = useState('Golden Botanical Glow Oil Elixir');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [done, setDone] = useState(false);

  const avg =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(2)
      : '4.95';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmitReview({
      productName,
      customerName: name,
      customerCity: city,
      rating,
      title,
      comment,
    });
    setName('');
    setTitle('');
    setComment('');
    setDone(true);
  };

  return (
    <div className="bg-luxury-marble py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <p className="text-xs tracking-[0.18em] uppercase text-[#D4AF70] font-semibold">
            Verified Client Journal
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#FFFFFF]">
            Customer Reviews
          </h1>
          <p className="text-sm text-[#F4C6D0]/85 tabular-nums">
            {avg} / 5.0 Average Rating across {reviews.length} verified client testimonials
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#1B1B1B] border border-[#D4AF70]/40 rounded-2xl p-6 flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: rev.rating }).map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-[#D4AF70] text-[#D4AF70]" />
                  ))}
                </div>
                <h2 className="font-display text-xl font-semibold text-[#FFFFFF]">"{rev.title}"</h2>
                <p className="text-sm text-[#F4C6D0]/85 leading-relaxed">{rev.comment}</p>
              </div>
              <div className="pt-3 border-t border-[#D4AF70]/25 text-xs text-[#F4C6D0]/75">
                <span className="font-semibold text-[#D4AF70]">{rev.customerName}</span> ·{' '}
                {rev.customerCity} · {rev.productName}
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto bg-[#111111] border border-[#D4AF70]/50 rounded-3xl p-7 sm:p-9 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-[#D4AF70]">
            Write a Verified Testimonial
          </h2>
          {done ? (
            <div className="p-4 rounded-xl bg-[#1B1B1B] border border-[#D4AF70] text-sm text-[#F4C6D0]">
              Thank you for sharing your Vespera Beauty experience.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="px-4 py-2.5 rounded-xl bg-[#1B1B1B] border border-[#D4AF70]/45 text-sm text-[#FFFFFF] placeholder:text-[#F4C6D0]/50"
                />
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="px-4 py-2.5 rounded-xl bg-[#1B1B1B] border border-[#D4AF70]/45 text-sm text-[#FFFFFF] placeholder:text-[#F4C6D0]/50"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Product Name"
                  className="px-4 py-2.5 rounded-xl bg-[#1B1B1B] border border-[#D4AF70]/45 text-sm text-[#FFFFFF] placeholder:text-[#F4C6D0]/50"
                />
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="px-4 py-2.5 rounded-xl bg-[#1B1B1B] border border-[#D4AF70]/45 text-sm text-[#FFFFFF]"
                >
                  <option value={5}>5 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={3}>3 Stars</option>
                </select>
              </div>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Review headline"
                className="w-full px-4 py-2.5 rounded-xl bg-[#1B1B1B] border border-[#D4AF70]/45 text-sm text-[#FFFFFF] placeholder:text-[#F4C6D0]/50"
              />
              <textarea
                required
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your impression..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#1B1B1B] border border-[#D4AF70]/45 text-sm text-[#FFFFFF] placeholder:text-[#F4C6D0]/50"
              />
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#D4AF70] text-[#090909] text-sm font-semibold hover:bg-[#C69B52]"
              >
                Submit Review
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export function FaqPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <div className="bg-luxury-marble py-14">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <p className="text-xs tracking-[0.18em] uppercase text-[#D4AF70] font-semibold">
            Client Assistance
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#FFFFFF]">
            Frequently Asked Questions
          </h1>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={item.q}
                className="bg-[#1B1B1B] border border-[#D4AF70]/45 rounded-2xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4"
                >
                  <span className="font-display text-xl font-semibold text-[#FFFFFF]">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#D4AF70] shrink-0 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-sm text-[#F4C6D0]/85 leading-relaxed border-t border-[#D4AF70]/25 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
