import React from 'react';
import { useStore } from '../context/StoreContext';
import { KhoromOffer } from '../types';
import {
  Sparkles,
  Flame,
  Clock,
  Tag,
  Package,
  ArrowRight,
  CheckCircle2,
  Coins,
  Truck,
} from 'lucide-react';

interface SmartOffersSpotlightProps {
  onSelectHotDeals?: () => void;
  onExploreProducts?: () => void;
}

export const SmartOffersSpotlight: React.FC<SmartOffersSpotlightProps> = ({
  onSelectHotDeals,
  onExploreProducts,
}) => {
  const {
    offers,
    appliedOffer,
    applyOffer,
    removeOffer,
    setIsOffersModalOpen,
    language,
    formatPrice,
  } = useStore();

  const activeOffers = offers.filter((o) => o.status === 'active');
  if (activeOffers.length === 0) return null;

  const getOfferIcon = (type: string) => {
    switch (type) {
      case 'hot_deal':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'limited_time':
        return <Clock className="w-4 h-4 text-rose-400" />;
      case 'best_discount':
        return <Tag className="w-4 h-4 text-emerald-400" />;
      case 'buy_more_save_more':
        return <Package className="w-4 h-4 text-sky-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <section id="smart-offers-spotlight" className="py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5 sm:mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-5 rounded-full bg-gradient-to-b from-amber-400 to-amber-600" />
          <h3 className="text-sm sm:text-base font-bold text-white font-serif tracking-wide flex items-center gap-1.5">
            <span>{language === 'bn' ? 'স্মার্ট অফার ও সিজনাল ডিলস' : 'Smart Offers & Seasonal Specials'}</span>
            <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {activeOffers.length} {language === 'bn' ? 'টি সক্রিয়' : 'Active'}
            </span>
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setIsOffersModalOpen(true)}
          className="text-xs text-[#dfb76c] hover:text-[#f3d99e] font-semibold flex items-center gap-1 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <span>{language === 'bn' ? 'সব অফার কেন্দ্র' : 'View Offers Center'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {activeOffers.slice(0, 4).map((offer) => {
          const isApplied = appliedOffer?.id === offer.id;

          return (
            <div
              key={offer.id}
              id={`spotlight-offer-${offer.id}`}
              className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between relative overflow-hidden ${
                isApplied
                  ? 'bg-gradient-to-b from-[#141b2c] to-[#0c1322] border-amber-400/80 shadow-lg shadow-amber-500/10'
                  : 'bg-[#0a0f1d] hover:bg-[#0e162a] border-slate-800/80 hover:border-amber-500/40'
              }`}
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                      {getOfferIcon(offer.type)}
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 uppercase tracking-wide">
                      {offer.badgeText || 'OFFER'}
                    </span>
                  </div>
                  {offer.freeShipping && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-0.5">
                      <Truck className="w-2.5 h-2.5" /> {language === 'bn' ? 'ফ্রি ডেলিভারি' : 'Free Ship'}
                    </span>
                  )}
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1 mt-1 font-serif">
                  {offer.name}
                </h4>

                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                  {offer.description || (language === 'bn' ? 'খড়ম এক্সক্লুসিভ অফার' : 'Khorom Exclusive Deal')}
                </p>
              </div>

              {/* Value & Actions */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm sm:text-base font-black text-amber-300">
                    {offer.discountType === 'percent'
                      ? `${offer.discountValue}% ${language === 'bn' ? 'ছাড়' : 'OFF'}`
                      : `৳${offer.discountValue} ${language === 'bn' ? 'ছাড়' : 'OFF'}`}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {language === 'bn'
                      ? `নূন্যতম ৳${(offer.minPurchase || 0).toLocaleString()}`
                      : `Min ৳${(offer.minPurchase || 0).toLocaleString()}`}
                  </div>
                </div>

                <div>
                  {isApplied ? (
                    <button
                      type="button"
                      onClick={removeOffer}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-800 text-rose-300 hover:bg-slate-700 transition cursor-pointer"
                    >
                      {language === 'bn' ? 'সরান' : 'Remove'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (offer.type === 'hot_deal' && onSelectHotDeals) {
                          onSelectHotDeals();
                        } else {
                          applyOffer(offer);
                        }
                      }}
                      className="px-3 py-1.5 text-[11px] font-bold rounded-xl gold-gradient-btn text-slate-950 flex items-center gap-1 shadow-sm transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
                    >
                      <span>
                        {offer.type === 'hot_deal'
                          ? language === 'bn'
                            ? 'ডিল দেখুন'
                            : 'View Deals'
                          : language === 'bn'
                          ? 'ক্লেম করুন'
                          : 'Claim Deal'}
                      </span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
