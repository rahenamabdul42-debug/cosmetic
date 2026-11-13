import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Product } from '../types/store';
import { formatPkr } from '../services/storeService';

interface SearchModalProps {
  open: boolean;
  products: Product[];
  onClose: () => void;
  onSelectProduct: (slug: string) => void;
}

export function SearchModal({ open, products, onClose, onSelectProduct }: SearchModalProps) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products.slice(0, 6);
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.subcategory.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.ingredients.toLowerCase().includes(q)
      )
      .slice(0, 9);
  }, [query, products]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#090909]/80 backdrop-blur-sm flex items-start justify-center pt-16 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Search cosmetics catalog"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl bg-[#111111] border border-[#D4AF70]/60 rounded-2xl shadow-[0_24px_70px_rgba(0,0,0,0.85)] overflow-hidden"
      >
        <div className="p-4 sm:p-5 border-b border-[#D4AF70]/35 flex items-center gap-3 bg-[#090909]">
          <Search className="w-5 h-5 text-[#D4AF70] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lipsticks, 24K gold serum, perfumes, brushes..."
            className="flex-1 bg-transparent text-sm sm:text-base text-[#FFFFFF] placeholder:text-[#F4C6D0]/55 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="p-2 rounded-full hover:bg-[#1B1B1B] text-[#F4C6D0]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 max-h-[65vh] overflow-y-auto">
          <p className="text-xs text-[#F4C6D0]/75 mb-4">
            {query.trim()
              ? `${results.length} creation${results.length === 1 ? '' : 's'} matching "${query}"`
              : 'Curated Atelier Highlights'}
          </p>

          {results.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#F4C6D0]/75">
              No creations matched "{query}". Try searching "Rose", "Serum", "Perfume", or "Palette".
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {results.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => {
                    onSelectProduct(product.slug);
                    onClose();
                  }}
                  className="text-left group bg-[#1B1B1B] hover:bg-[#1B1B1B]/90 border border-[#D4AF70]/35 hover:border-[#D4AF70] rounded-xl p-2.5 transition-colors flex flex-col gap-2"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full aspect-[4/3] object-cover rounded-lg bg-[#090909]"
                  />
                  <div>
                    <div className="text-[11px] text-[#E8A1B2]">{product.category}</div>
                    <div className="font-display text-base font-semibold text-[#FFFFFF] line-clamp-1 group-hover:text-[#D4AF70]">
                      {product.name}
                    </div>
                    <div className="text-xs font-semibold tabular-nums text-[#D4AF70] mt-0.5">
                      {formatPkr(product.discountPricePkr ?? product.pricePkr)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
