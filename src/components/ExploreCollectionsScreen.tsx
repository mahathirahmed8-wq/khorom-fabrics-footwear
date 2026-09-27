import React from 'react';
import { useStore } from '../context/StoreContext';
import { CategoryIcon } from './CategoryIcon';
import { ArrowLeft, Sparkles, ChevronRight, Layers, Tag } from 'lucide-react';

interface ExploreCollectionsScreenProps {
  onBack: () => void;
  onSelectCategory: (catId: string, subId?: string) => void;
}

export const ExploreCollectionsScreen: React.FC<ExploreCollectionsScreenProps> = ({
  onBack,
  onSelectCategory,
}) => {
  const { categories, products, language } = useStore();

  const getProductCount = (catId: string) => {
    if (catId === 'all') {
      return products.filter(
        (p) => p.published !== false && p.status !== 'draft' && p.status !== 'disabled'
      ).length;
    }
    return products.filter(
      (p) =>
        p.category === catId &&
        p.published !== false &&
        p.status !== 'draft' &&
        p.status !== 'disabled'
    ).length;
  };

  return (
    <div id="explore-collections-screen" className="min-h-[85vh] bg-[#060D17] text-[#FAF8F5] animate-in fade-in duration-200">
      {/* Top Sticky Navigation Bar with clear Back Button */}
      <div className="sticky top-0 z-30 bg-[#0B1F33]/95 backdrop-blur-md border-b border-[#1B2D42] px-4 py-3.5 sm:py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <button
            id="collections-back-btn"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#060D17] hover:bg-[#122B45] text-[#C6A15B] hover:text-white border border-[#C6A15B]/30 hover:border-[#C6A15B]/60 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'bn' ? 'হোমে ফিরে যান' : 'Back to Home'}</span>
          </button>

          <div className="text-right">
            <h1 className="text-sm sm:text-base font-bold text-[#FAF8F5] font-serif">
              {language === 'bn' ? 'খড়ম সিগনেচার কালেকশনস' : 'Khorom Signature Collections'}
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-300">
              {language === 'bn' ? 'সকল প্রিমিয়াম জেন্টস ক্যাটাগরি' : 'All Premium Gents Categories'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Collections Content */}
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[#1B2D42] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C6A15B]/15 border border-[#C6A15B]/30 text-[#C6A15B] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#FAF8F5] font-serif">
                {language === 'bn' ? 'এক্সক্লুসিভ জেন্টস ক্যাটাগরি ব্রাউজ করুন' : 'Browse Exclusive Collections'}
              </h2>
              <p className="text-xs text-slate-300">
                {language === 'bn'
                  ? 'নিচের যেকোনো ক্যাটাগরি সিলেক্ট করে সংশ্লিষ্ট পণ্য ও কালেকশন এক্সপ্লোর করুন'
                  : 'Select any category below to view matching handcrafted products'}
              </p>
            </div>
          </div>
        </div>

        {/* Categories Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {categories.map((cat) => {
            const count = getProductCount(cat.id);
            const subcats = cat.subcategories || [];

            return (
              <div
                key={cat.id}
                className="bg-[#0B1F33] hover:bg-[#0E263E] border border-[#1B2D42] hover:border-[#C6A15B]/50 rounded-2xl p-4 sm:p-5 transition-all shadow-md flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-11 h-11 rounded-xl bg-[#060D17] border border-[#C6A15B]/30 group-hover:border-[#C6A15B] text-[#C6A15B] flex items-center justify-center transition-colors">
                      <CategoryIcon iconName={cat.iconName} className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#060D17] border border-[#1B2D42] text-[#C6A15B]">
                      {count} {language === 'bn' ? 'টি পণ্য' : 'Items'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#FAF8F5] font-serif group-hover:text-[#C6A15B] transition-colors">
                    {language === 'bn' ? cat.nameBn : cat.nameEn}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {language === 'bn' ? cat.nameEn : cat.nameBn}
                  </p>

                  {/* Subcategories list */}
                  {subcats.length > 0 && (
                    <div className="mt-3.5 pt-3 border-t border-[#1B2D42] flex flex-wrap gap-1.5">
                      {subcats.map((sub) => (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => onSelectCategory(cat.id, sub.id)}
                          className="px-2 py-1 rounded-lg bg-[#060D17] hover:bg-[#122B45] text-[11px] text-slate-300 hover:text-white border border-[#1B2D42] hover:border-[#C6A15B]/40 transition cursor-pointer"
                        >
                          {language === 'bn' ? sub.nameBn : sub.nameEn}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#1B2D42]">
                  <button
                    type="button"
                    onClick={() => onSelectCategory(cat.id)}
                    className="w-full py-2 px-3 rounded-xl bg-[#060D17] hover:bg-[#C6A15B] text-[#C6A15B] hover:text-[#060D17] font-bold text-xs border border-[#C6A15B]/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>{language === 'bn' ? 'কালেকশন দেখুন' : 'Explore Products'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
