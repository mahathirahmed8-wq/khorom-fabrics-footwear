import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowLeft, Sparkles, Tag, Check, Copy, Flame, Clock, Gift, Percent } from 'lucide-react';

interface SmartOffersScreenProps {
  onBack: () => void;
  onExploreProducts: () => void;
  onSelectHotDeals: () => void;
}

export const SmartOffersScreen: React.FC<SmartOffersScreenProps> = ({
  onBack,
  onExploreProducts,
  onSelectHotDeals,
}) => {
  const { offers, language, showToast, formatPrice, applyOffer, appliedOffer } = useStore();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const activeOffers = offers.filter((o) => o.status === 'active');

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(language === 'bn' ? `কুপন কোড "${code}" কপি হয়েছে!` : `Promo code "${code}" copied!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleApplyOffer = (offer: any) => {
    applyOffer(offer);
    showToast(language === 'bn' ? `"${offer.titleBn}" অফার যুক্ত করা হয়েছে!` : `Offer "${offer.titleEn}" applied!`);
  };

  return (
    <div id="smart-offers-screen" className="min-h-[85vh] bg-[#060D17] text-[#FAF8F5] animate-in fade-in duration-200">
      {/* Top Sticky Navigation Bar with clear Back Button */}
      <div className="sticky top-0 z-30 bg-[#0B1F33]/95 backdrop-blur-md border-b border-[#1B2D42] px-4 py-3.5 sm:py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <button
            id="offers-back-btn"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#060D17] hover:bg-[#122B45] text-[#C6A15B] hover:text-white border border-[#C6A15B]/30 hover:border-[#C6A15B]/60 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'bn' ? 'হোমে ফিরে যান' : 'Back to Home'}</span>
          </button>

          <div className="text-right">
            <h1 className="text-sm sm:text-base font-bold text-[#FAF8F5] font-serif">
              {language === 'bn' ? 'স্মার্ট অফার ও সিজনাল স্পেশালস' : 'Smart Offers & Seasonal Specials'}
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-300">
              {language === 'bn' ? 'এক্সক্লুসিভ রিওয়ার্ড ও ডিসকাউন্ট ভাউচার' : 'Exclusive Rewards & Discount Vouchers'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Quick Action Strip for Hot Deals */}
        <div className="bg-gradient-to-r from-[#0B1F33] to-[#0E263E] border border-[#C6A15B]/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 text-white flex items-center justify-center shadow-md shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#FAF8F5] font-serif">
                {language === 'bn' ? 'খড়ম এক্সক্লুসিভ হট ডিলস' : 'Khorom Exclusive Hot Deals'}
              </h3>
              <p className="text-xs text-slate-300">
                {language === 'bn' ? 'নির্দিষ্ট সময়ের জন্য সীমিত স্টক ডিসকাউন্ট পণ্য' : 'Limited time special discounts on selected products'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onSelectHotDeals();
              onBack();
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-xl gold-gradient-btn text-[#060D17] font-bold text-xs shadow-md cursor-pointer transition-all shrink-0"
          >
            {language === 'bn' ? 'হট ডিলস দেখুন' : 'Explore Hot Deals'}
          </button>
        </div>

        {/* Active Offers Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-[#1B2D42] pb-2.5">
            <Sparkles className="w-4 h-4 text-[#C6A15B]" />
            <h2 className="text-base font-bold text-[#FAF8F5] font-serif">
              {language === 'bn' ? 'চলমান বিশেষ ভাউচার ও ডিসকাউন্ট' : 'Active Vouchers & Specials'}
            </h2>
          </div>

          {activeOffers.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#0B1F33] border border-[#1B2D42] text-center space-y-2">
              <p className="text-sm text-slate-300">
                {language === 'bn' ? 'বর্তমানে কোনো সক্রিয় অফার নেই।' : 'No active offers available right now.'}
              </p>
              <button
                type="button"
                onClick={onBack}
                className="px-4 py-2 rounded-xl bg-[#060D17] text-[#C6A15B] border border-[#C6A15B]/30 text-xs font-bold"
              >
                {language === 'bn' ? 'পণ্য ব্রাউজ করুন' : 'Browse Products'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeOffers.map((offer) => {
                const isCurrent = appliedOffer?.id === offer.id;

                return (
                  <div
                    key={offer.id}
                    className="bg-[#0B1F33] rounded-2xl border border-[#1B2D42] hover:border-[#C6A15B]/50 p-4 sm:p-5 flex flex-col justify-between shadow-md space-y-4 transition-all group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-[#C6A15B]/15 border border-[#C6A15B]/30 text-[#C6A15B] flex items-center justify-center">
                            <Tag className="w-3.5 h-3.5" />
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#C6A15B] bg-[#060D17] px-2 py-0.5 rounded-full border border-[#1B2D42]">
                            {offer.discountType === 'percent'
                              ? `${offer.discountValue}% ${language === 'bn' ? 'ছাড়' : 'OFF'}`
                              : `৳${offer.discountValue} ${language === 'bn' ? 'ছাড়' : 'OFF'}`}
                          </span>
                        </div>

                        {offer.code && (
                          <div className="flex items-center gap-1.5 bg-[#060D17] px-2.5 py-1 rounded-lg border border-[#C6A15B]/30">
                            <span className="font-mono text-xs font-bold text-[#C6A15B] tracking-wider">
                              {offer.code}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyCode(offer.code!)}
                              className="text-slate-400 hover:text-white cursor-pointer"
                              title="Copy Code"
                            >
                              {copiedCode === offer.code ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-[#FAF8F5] font-serif">
                        {language === 'bn' ? offer.titleBn : offer.titleEn}
                      </h3>
                      <p className="text-xs text-slate-300 mt-1">
                        {language === 'bn' ? offer.descriptionBn : offer.descriptionEn}
                      </p>

                      {offer.minSpend && (
                        <div className="mt-2.5 text-[11px] text-slate-400 flex items-center gap-1">
                          <span>{language === 'bn' ? 'সর্বনিম্ন অর্ডার:' : 'Min Order:'}</span>
                          <span className="font-semibold text-white">{formatPrice(offer.minSpend)}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#1B2D42] flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleApplyOffer(offer)}
                        className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex-1 ${
                          isCurrent
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-[#060D17] hover:bg-[#122B45] text-[#C6A15B] border border-[#C6A15B]/40'
                        }`}
                      >
                        {isCurrent
                          ? (language === 'bn' ? '✓ অফারটি কার্টে সক্রিয়' : '✓ Applied to Cart')
                          : (language === 'bn' ? 'অফারটি ব্যবহার করুন' : 'Apply to Cart')}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onExploreProducts();
                          onBack();
                        }}
                        className="py-2 px-3 rounded-xl bg-[#C6A15B] hover:bg-[#B8924A] text-[#060D17] text-xs font-bold transition-all cursor-pointer shrink-0"
                      >
                        {language === 'bn' ? 'কেনাকাটা করুন' : 'Shop Now'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
