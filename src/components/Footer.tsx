import React, { useState } from 'react';
import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react';
import { PageRoute } from '../types/store';
import { GoldDivider } from './LuxuryDecor';

interface FooterProps {
  onNavigate: (route: PageRoute) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="bg-[#090909] border-t border-[#D4AF70]/40 text-[#FFFFFF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Maison Identity */}
          <div className="space-y-4">
            <h2 className="font-display text-3xl font-semibold text-[#D4AF70]">
              Maison Roseraie
            </h2>
            <p className="text-sm leading-relaxed text-[#F4C6D0]/85">
              An international luxury beauty house crafting Damask rosewater skincare, velvet color couture, and Grasse fine fragrances.
            </p>
            <div className="space-y-2 text-xs text-[#F4C6D0]/80 pt-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF70] shrink-0" />
                <span>Clifton Block 4, Karachi · Gulberg III, Lahore</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#D4AF70] shrink-0" />
                <span>+92 21 3583 4910</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#D4AF70] shrink-0" />
                <span>concierge@maisonroseraie.com</span>
              </div>
            </div>
          </div>

          {/* Collections */}
          <div>
            <h3 className="font-display text-xl font-semibold text-[#D4AF70] mb-4">
              Collections
            </h3>
            <ul className="space-y-2.5 text-sm text-[#F4C6D0]/90">
              {(
                [
                  ['Shop All', 'shop'],
                  ['Makeup Couture', 'makeup'],
                  ['Skincare Rituals', 'skincare'],
                  ['Haircare Elixirs', 'haircare'],
                  ['Fine Perfumes', 'perfumes'],
                  ['Body Care', 'body-care'],
                  ['Beauty Accessories', 'accessories'],
                ] as [string, PageRoute][]
              ).map(([label, route]) => (
                <li key={route}>
                  <button
                    type="button"
                    onClick={() => onNavigate(route)}
                    className="hover:text-[#D4AF70] transition-colors"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Client Services */}
          <div>
            <h3 className="font-display text-xl font-semibold text-[#D4AF70] mb-4">
              Client Concierge
            </h3>
            <ul className="space-y-2.5 text-sm text-[#F4C6D0]/90">
              {(
                [
                  ['Best Sellers', 'best-sellers'],
                  ['New Arrivals', 'new-arrivals'],
                  ['About the Maison', 'about'],
                  ['Customer Reviews', 'reviews'],
                  ['Shipping & FAQ', 'faq'],
                  ['Contact Boutique', 'contact'],
                  ['Shopping Bag', 'cart'],
                  ['Track Order / Checkout', 'checkout'],
                  ['Admin Dashboard', 'admin'],
                ] as [string, PageRoute][]
              ).map(([label, route]) => (
                <li key={route}>
                  <button
                    type="button"
                    onClick={() => onNavigate(route)}
                    className="hover:text-[#D4AF70] transition-colors"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-display text-xl font-semibold text-[#D4AF70]">
              The Atelier Letter
            </h3>
            <p className="text-sm text-[#F4C6D0]/85 leading-relaxed">
              Receive private invitations to seasonal releases, bridal coffrets, and use code{' '}
              <span className="font-semibold text-[#D4AF70]">ROSERAIE10</span> for 10% off.
            </p>
            {subscribed ? (
              <div className="p-3.5 rounded-xl bg-[#1B1B1B] border border-[#D4AF70] text-sm text-[#F4C6D0]">
                Welcome to Maison Roseraie. Your invitation is confirmed.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2.5">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1B1B1B] border border-[#D4AF70]/45 text-sm text-[#FFFFFF] placeholder:text-[#F4C6D0]/50 focus:outline-none focus:border-[#E8A1B2]"
                />
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4AF70] text-[#090909] text-sm font-semibold hover:bg-[#C69B52] transition-colors"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-4 h-4 text-[#090909]" />
                </button>
              </form>
            )}
          </div>
        </div>

        <GoldDivider className="my-10" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F4C6D0]/75">
          <p>© {new Date().getFullYear()} Maison Roseraie. All rights reserved.</p>
          <p className="text-[#D4AF70]/90">
            Cash on Delivery Nationwide · Cruelty-Free Botanical Formulations
          </p>
        </div>
      </div>
    </footer>
  );
}
