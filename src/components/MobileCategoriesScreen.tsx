import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  ArrowLeft,
  LayoutGrid,
  Footprints,
  Shirt,
  Glasses,
  Watch,
  Wallet,
  Sparkles,
  ChevronRight,
  Search,
  Tag,
  Percent,
  TrendingUp,
} from 'lucide-react';

interface MobileCategoriesScreenProps {
  onSelectCategory: (categoryId: string) => void;
  onBackToHome: () => void;
}

export const MobileCategoriesScreen: React.FC<MobileCategoriesScreenProps> = ({
  onSelectCategory,
  onBackToHome,
}) => {
  const { language, categories, products, setIsOffersModalOpen } = useStore();
  const [search, setSearch] = useState('');

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shirt':
        return <Shirt className="w-5 h-5 text-sky-400" />;
      case 'Footprints':
        return <Footprints className="w-5 h-5 text-[#dfb76c]" />;
      case 'Glasses':
        return <Glasses className="w-5 h-5 text-indigo-400" />;
      case 'Watch':
        return <Watch className="w-5 h-5 text-emerald-400" />;
      case 'Wallet':
        return <Wallet className="w-5 h-5 text-amber-500" />;
      default:
        return <LayoutGrid className="w-5 h-5 text-[#dfb76c]" />;
    }
  };

  const filteredCategories = categories.filter((cat) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      cat.nameBn.toLowerCase().includes(q) ||
      cat.nameEn.toLowerCase().includes(q) ||
      cat.id.toLowerCase().includes(q)
    );
  });

  const totalPublishedProducts = products.filter(
    (p) => p.published !== false && p.status !== 'draft' && p.status !== 'disabled'
  ).length;

  return (
    <div
      id="khorom-mobile-categories-screen"
      className="min-h-screen bg-[#050811] text-slate-100 px-3.5 pt-3 pb-24 animate-in fade-in duration-200"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-3 mb-3.5 pb-2.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <button
            id="categories-back-to-home-btn"
            onClick={onBackToHome}
            className="p-2 rounded-xl bg-[#0a0f1d] border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base font-bold text-[#faf8f5] font-serif">
              {language === 'bn' ? 'ক্যাটাগরি সমূহ' : 'All Categories'}
            </h1>
            <p className="text-[11px] text-slate-400">
              {language === 'bn'
                ? `${categories.length}টি কালেকশন এবং ${totalPublishedProducts}টি পণ্য`
                : `${categories.length} collections • ${totalPublishedProducts} products`}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOffersModalOpen(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#dfb76c]/10 border border-[#dfb76c]/30 text-[#dfb76c] text-[11px] font-bold transition cursor-pointer"
        >
          <Percent className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'অফার' : 'Offers'}</span>
        </button>
      </div>

      {/* Category Search Input */}
      <div className="relative mb-3.5">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          id="mobile-category-search-input"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={
            language === 'bn'
              ? 'ক্যাটাগরি খুঁজুন (যেমন: জুতো, স্যান্ডেল)...'
              : 'Search category (e.g. shoes, sandals)...'
          }
          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#0a0f1d] border border-slate-800/90 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-[#dfb76c]/50 transition"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
          >
            ✕
          </button>
        )}
      </div>

      {/* Master "All Products" Card */}
      {!search && (
        <div
          onClick={() => onSelectCategory('all')}
          className="mb-3.5 p-3.5 rounded-2xl bg-gradient-to-r from-[#0d172e] to-[#0a0f1d] border border-[#dfb76c]/30 hover:border-[#dfb76c]/60 shadow-lg flex items-center justify-between cursor-pointer group transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#dfb76c]/15 border border-[#dfb76c]/30 flex items-center justify-center text-[#dfb76c] shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#faf8f5] group-hover:text-[#dfb76c] transition-colors">
                  {language === 'bn' ? 'সকল জেন্টস কালেকশন' : 'All Gents Collection'}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#dfb76c]/20 text-[#dfb76c] border border-[#dfb76c]/30">
                  {language === 'bn' ? 'সব দেখুন' : 'Explore All'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {language === 'bn'
                  ? `খড়মের সম্পূর্ণ কালেকশন (${totalPublishedProducts}টি আইটেম)`
                  : `Browse complete catalog (${totalPublishedProducts} items)`}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#dfb76c] group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>
      )}

      {/* Category List / Grid */}
      <div className="space-y-2">
        {filteredCategories.map((category) => {
          const categoryProductCount = products.filter(
            (p) =>
              p.category === category.id &&
              p.published !== false &&
              p.status !== 'draft' &&
              p.status !== 'disabled'
          ).length;

          return (
            <div
              key={category.id}
              id={`mobile-category-card-${category.id}`}
              onClick={() => onSelectCategory(category.id)}
              className="p-3 rounded-xl bg-[#0a0f1d] border border-slate-800/80 hover:border-[#dfb76c]/40 hover:bg-[#0c1322] flex items-center justify-between cursor-pointer group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#070b14] border border-slate-800 flex items-center justify-center shrink-0 group-hover:border-[#dfb76c]/30 group-hover:scale-105 transition-all">
                  {getCategoryIcon(category.icon)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-[#faf8f5] group-hover:text-[#dfb76c] transition-colors">
                      {language === 'bn' ? category.nameBn : category.nameEn}
                    </h3>
                    <span className="text-[10px] text-slate-500 font-normal">
                      ({language === 'bn' ? category.nameEn : category.nameBn})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                    <span>
                      {categoryProductCount}{' '}
                      {language === 'bn' ? 'টি পণ্য উপলব্ধ' : 'products available'}
                    </span>
                    {Array.isArray(category.subcategories) && category.subcategories.length > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-[#dfb76c]">
                          {category.subcategories.length}{' '}
                          {language === 'bn' ? 'টি সাব-ক্যাটাগরি' : 'subcategories'}
                        </span>
                      </>
                    )}
                  </p>
                  {Array.isArray(category.subcategories) && category.subcategories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {category.subcategories.slice(0, 3).map((sub) => (
                        <span
                          key={sub.id}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400"
                        >
                          {language === 'bn' ? sub.nameBn : sub.nameEn}
                        </span>
                      ))}
                      {category.subcategories.length > 3 && (
                        <span className="text-[9px] px-1 py-0.5 text-slate-500">
                          +{category.subcategories.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-[#dfb76c] group-hover:border-[#dfb76c]/30 transition-colors">
                  {language === 'bn' ? 'দেখুন' : 'View'}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-[#dfb76c] group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          );
        })}

        {filteredCategories.length === 0 && (
          <div className="p-8 text-center bg-[#0a0f1d] rounded-2xl border border-slate-800 mt-4">
            <p className="text-xs text-slate-400">
              {language === 'bn'
                ? 'এই নামে কোনো ক্যাটাগরি পাওয়া যায়নি।'
                : 'No category found matching your search.'}
            </p>
            <button
              onClick={() => setSearch('')}
              className="mt-3 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-bold cursor-pointer"
            >
              {language === 'bn' ? 'রিসেট করুন' : 'Clear Search'}
            </button>
          </div>
        )}
      </div>

      {/* Quick Shortcuts */}
      <div className="mt-5 p-3.5 rounded-2xl bg-[#070b14] border border-slate-800/80">
        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-[#dfb76c]" />
          <span>{language === 'bn' ? 'জনপ্রিয় কালেকশন শর্টকাট' : 'Trending Shortcuts'}</span>
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {categories.slice(0, 4).map((c) => (
            <button
              key={c.id}
              onClick={() => onSelectCategory(c.id)}
              className="px-2.5 py-1 rounded-lg bg-[#0a0f1d] hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-[#dfb76c] transition-colors cursor-pointer flex items-center gap-1"
            >
              <Tag className="w-3 h-3 text-[#dfb76c]" />
              <span>{language === 'bn' ? c.nameBn : c.nameEn}</span>
            </button>
          ))}
          <button
            onClick={() => setIsOffersModalOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-[#dfb76c]/10 hover:bg-[#dfb76c]/20 border border-[#dfb76c]/30 text-[11px] text-[#dfb76c] font-bold transition-colors cursor-pointer flex items-center gap-1"
          >
            <Percent className="w-3 h-3" />
            <span>{language === 'bn' ? 'স্পেশাল ডিসকাউন্ট' : 'Hot Deals'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
