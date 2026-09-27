import React from 'react';
import { useStore } from '../context/StoreContext';
import { SlidersHorizontal, RotateCcw, Star, Check } from 'lucide-react';

interface FilterSidebarProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedSubcategory?: string;
  setSelectedSubcategory?: (sub: string) => void;
  maxPrice: number;
  setMaxPrice: (price: number) => void;
  minRating: number;
  setMinRating: (rating: number) => void;
  inStockOnly: boolean;
  setInStockOnly: (val: boolean) => void;
  onSaleOnly: boolean;
  setOnSaleOnly: (val: boolean) => void;
  resetFilters: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  selectedCategory,
  setSelectedCategory,
  selectedSubcategory = 'all',
  setSelectedSubcategory,
  maxPrice,
  setMaxPrice,
  minRating,
  setMinRating,
  inStockOnly,
  setInStockOnly,
  onSaleOnly,
  setOnSaleOnly,
  resetFilters,
}) => {
  const { language, formatPrice, categories, products } = useStore();

  return (
    <aside className="bg-[#0a0f1d] rounded-2xl border border-slate-800/80 p-4 sm:p-5 space-y-5 shadow-xl sticky top-28 text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#dfb76c]" />
          <h3 className="text-xs font-bold text-[#faf8f5] uppercase tracking-wider">
            {language === 'bn' ? 'ফিল্টার করুন' : 'Filter Products'}
          </h3>
        </div>
        <button
          onClick={resetFilters}
          className="text-[11px] text-slate-400 hover:text-[#dfb76c] font-medium flex items-center gap-1 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>{language === 'bn' ? 'রিসেট' : 'Reset'}</span>
        </button>
      </div>

      {/* Category List */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          {language === 'bn' ? 'ক্যাটাগরি ও সাব-ক্যাটাগরি' : 'Categories & Subcategories'}
        </label>
        <div className="space-y-1 max-h-72 overflow-y-auto pr-1 slim-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const hasSubcategories = isSelected && Array.isArray(cat.subcategories) && cat.subcategories.length > 0;

            return (
              <div key={cat.id} className="space-y-1">
                <button
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    if (setSelectedSubcategory) {
                      setSelectedSubcategory('all');
                    }
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#dfb76c]/15 text-[#dfb76c] border border-[#dfb76c]/30 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white border border-transparent'
                  }`}
                >
                  <span>{language === 'bn' ? cat.nameBn : cat.nameEn}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#dfb76c]" />}
                </button>

                {/* Indented Subcategories when parent category is active */}
                {hasSubcategories && (
                  <div className="pl-3.5 pr-1 py-1 space-y-1 border-l-2 border-[#dfb76c]/30 ml-2 animate-in fade-in slide-in-from-top-1 duration-150">
                    <button
                      onClick={() => setSelectedSubcategory && setSelectedSubcategory('all')}
                      className={`w-full text-left px-2 py-1 rounded-lg text-[11px] font-medium flex items-center justify-between transition-all cursor-pointer ${
                        selectedSubcategory === 'all'
                          ? 'bg-slate-800 text-[#dfb76c] font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>{language === 'bn' ? 'সব সাব-ক্যাটাগরি' : 'All Subcategories'}</span>
                      {selectedSubcategory === 'all' && <span className="w-1.5 h-1.5 rounded-full bg-[#dfb76c]" />}
                    </button>

                    {cat.subcategories!.map((sub) => {
                      const isSubSelected = selectedSubcategory === sub.id;
                      const subProductCount = products.filter(
                        (p) => p.category === cat.id && (p.subcategory === sub.id || p.subcategoryId === sub.id)
                      ).length;

                      return (
                        <button
                          key={sub.id}
                          onClick={() => setSelectedSubcategory && setSelectedSubcategory(sub.id)}
                          className={`w-full text-left px-2 py-1 rounded-lg text-[11px] font-medium flex items-center justify-between transition-all cursor-pointer ${
                            isSubSelected
                              ? 'bg-slate-800 text-[#dfb76c] font-bold'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span>{language === 'bn' ? sub.nameBn : sub.nameEn}</span>
                          <span className="text-[10px] text-slate-500 font-normal">({subProductCount})</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Price Range Slider */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        <div className="flex justify-between items-center text-xs">
          <label className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
            {language === 'bn' ? 'সর্বোচ্চ দাম' : 'Max Price'}
          </label>
          <span className="font-black text-[#dfb76c]">{formatPrice(maxPrice)}</span>
        </div>
        <input
          type="range"
          min={500}
          max={6000}
          step={100}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[#dfb76c] cursor-pointer h-1.5 bg-slate-800 rounded-lg"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-medium">
          <span>{formatPrice(500)}</span>
          <span>{formatPrice(6000)}</span>
        </div>
      </div>

      {/* Minimum Rating Filter */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          {language === 'bn' ? 'রেটিং' : 'Rating'}
        </label>
        <div className="flex gap-1.5">
          {[0, 4.5, 4.8].map((rating) => {
            const isChosen = minRating === rating;
            return (
              <button
                key={rating}
                onClick={() => setMinRating(rating)}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  isChosen
                    ? 'bg-gradient-to-r from-[#dfb76c] to-[#c59e4b] text-slate-950 border-[#dfb76c] shadow-xs'
                    : 'bg-[#070b14] text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                {rating === 0 ? (
                  <span>{language === 'bn' ? 'সব' : 'All'}</span>
                ) : (
                  <>
                    <span>{rating}</span>
                    <Star className={`w-3 h-3 ${isChosen ? 'fill-slate-950 text-slate-950' : 'fill-[#dfb76c] text-[#dfb76c]'}`} />
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stock & Discount Toggles */}
      <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
        <label className="flex items-center justify-between text-xs text-slate-300 font-medium cursor-pointer hover:text-white transition-colors">
          <span>{language === 'bn' ? 'শুধুমাত্র স্টকযুক্ত পণ্য' : 'In Stock Only'}</span>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 bg-slate-900 accent-[#dfb76c] cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between text-xs text-slate-300 font-medium cursor-pointer hover:text-white transition-colors">
          <span>{language === 'bn' ? 'ডিসকাউন্ট / অফারযুক্ত' : 'On Sale / Discounted'}</span>
          <input
            type="checkbox"
            checked={onSaleOnly}
            onChange={(e) => setOnSaleOnly(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 bg-slate-900 accent-[#dfb76c] cursor-pointer"
          />
        </label>
      </div>
    </aside>
  );
};
