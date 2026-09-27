import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  ChevronRight,
  Sparkles,
  LayoutGrid,
} from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';

interface HomeCategoriesRailProps {
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
}

export const HomeCategoriesRail: React.FC<HomeCategoriesRailProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const { categories, products, language } = useStore();

  const getCategoryIcon = (iconName: string, isSelected: boolean) => {
    const iconClass = `w-5 h-5 ${isSelected ? 'text-slate-950' : 'text-[#dfb76c]'}`;
    return <CategoryIcon iconName={iconName} className={iconClass} />;
  };

  const allCount = products.filter(
    (p) => p.published !== false && p.status !== 'draft' && p.status !== 'disabled'
  ).length;

  return (
    <section id="home-categories-rail" className="py-4 sm:py-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-5 rounded-full bg-gradient-to-b from-[#dfb76c] to-[#a88235]" />
          <h3 className="text-sm sm:text-base font-bold text-white font-serif tracking-wide">
            {language === 'bn' ? 'ক্যাটাগরি ব্রাউজ করুন' : 'Explore Collections'}
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">
          {language === 'bn' ? '১০০% খাঁটি জেন্টস সিগনেচার ফ্যাশন' : 'Authentic Gents Craftsmanship'}
        </span>
      </div>

      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
        {/* All Products Card */}
        <button
          id="home-cat-card-all"
          type="button"
          onClick={() => onSelectCategory('all')}
          className={`p-3 sm:p-4 rounded-2xl text-left transition-all duration-200 border cursor-pointer flex flex-col justify-between ${
            selectedCategory === 'all'
              ? 'bg-gradient-to-br from-[#dfb76c] to-[#c59e4b] text-slate-950 border-[#dfb76c] shadow-lg shadow-[#dfb76c]/15 scale-[1.02]'
              : 'bg-[#0a0f1d] hover:bg-[#0f172a] text-slate-200 border-slate-800/80 hover:border-[#dfb76c]/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                selectedCategory === 'all' ? 'bg-slate-950/15' : 'bg-[#070b14] border border-slate-800'
              }`}
            >
              <LayoutGrid
                className={`w-5 h-5 ${selectedCategory === 'all' ? 'text-slate-950' : 'text-[#dfb76c]'}`}
              />
            </div>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                selectedCategory === 'all'
                  ? 'bg-slate-950/20 text-slate-950'
                  : 'bg-slate-800/80 text-slate-400'
              }`}
            >
              {allCount}
            </span>
          </div>
          <div>
            <div className="font-bold text-xs sm:text-sm truncate">
              {language === 'bn' ? 'সকল কালেকশন' : 'All Collections'}
            </div>
            <div
              className={`text-[10px] truncate mt-0.5 ${
                selectedCategory === 'all' ? 'text-slate-900/80' : 'text-slate-400'
              }`}
            >
              {language === 'bn' ? 'সব পণ্য একসাথে' : 'Full Catalog'}
            </div>
          </div>
        </button>

        {/* Dynamic Categories Cards */}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = products.filter(
            (p) =>
              p.category === cat.id &&
              p.published !== false &&
              p.status !== 'draft' &&
              p.status !== 'disabled'
          ).length;

          return (
            <button
              key={cat.id}
              id={`home-cat-card-${cat.id}`}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`p-3 sm:p-4 rounded-2xl text-left transition-all duration-200 border cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-br from-[#dfb76c] to-[#c59e4b] text-slate-950 border-[#dfb76c] shadow-lg shadow-[#dfb76c]/15 scale-[1.02]'
                  : 'bg-[#0a0f1d] hover:bg-[#0f172a] text-slate-200 border-slate-800/80 hover:border-[#dfb76c]/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-slate-950/15' : 'bg-[#070b14] border border-slate-800'
                  }`}
                >
                  {getCategoryIcon(cat.iconName || '', isSelected)}
                </div>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-slate-950/20 text-slate-950'
                      : 'bg-slate-800/80 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </div>
              <div>
                <div className="font-bold text-xs sm:text-sm truncate">
                  {language === 'bn' ? cat.nameBn : cat.nameEn}
                </div>
                <div
                  className={`text-[10px] truncate mt-0.5 ${
                    isSelected ? 'text-slate-900/80' : 'text-slate-400'
                  }`}
                >
                  {cat.subcategories?.length
                    ? `${cat.subcategories.length} ${language === 'bn' ? 'আইটেম টাইপ' : 'sub-types'}`
                    : language === 'bn'
                    ? 'প্রিমিয়াম কালেকশন'
                    : 'Refined pieces'}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
