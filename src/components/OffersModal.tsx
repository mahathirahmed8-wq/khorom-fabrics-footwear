import React from 'react';
import { useStore } from '../context/StoreContext';
import { KhoromOffer } from '../types';
import {
  X,
  Sparkles,
  Tag,
  CheckCircle2,
  Clock,
  Coins,
  ArrowRight,
  ShoppingBag,
  Percent,
  Check,
} from 'lucide-react';

export const OffersModal: React.FC = () => {
  const {
    isOffersModalOpen,
    setIsOffersModalOpen,
    offers,
    appliedOffer,
    applyOffer,
    removeOffer,
    cartSubtotal,
    language,
    formatPrice,
    setIsCartOpen,
  } = useStore();

  if (!isOffersModalOpen) return null;

  const activeOffers = offers.filter((o) => o.status === 'active');

  return (
    <div
      id="offers-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      onClick={() => setIsOffersModalOpen(false)}
    >
      <div
        id="offers-modal-content"
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0b1220] border border-amber-500/30 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh] my-auto animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#070c16] border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20 font-black">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-serif text-white">
                {language === 'bn' ? 'খড়ম স্পেশাল অফার সেন্টার' : 'Khorom Offers Center'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'bn'
                  ? 'আপনার পছন্দের পোশাকে আকর্ষণীয় ছাড় ও কয়েন বোনাস অফার উপভোগ করুন'
                  : 'Exclusive seasonal discounts & bonus loyalty points on luxury wear'}
              </p>
            </div>
          </div>

          <button
            id="close-offers-modal-btn"
            onClick={() => setIsOffersModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 slim-scrollbar bg-[#090f1d]">
          {activeOffers.length === 0 ? (
            <div className="p-8 text-center text-slate-400 border border-dashed border-slate-800 rounded-3xl">
              <Tag className="w-10 h-10 mx-auto mb-2 text-slate-600" />
              <p className="text-sm font-medium">
                {language === 'bn'
                  ? 'বর্তমানে কোনো অফার চালু নেই। খুব শীঘ্রই নতুন কালেকশন অফার আসছে!'
                  : 'No active offers available right now. Stay tuned for new deals!'}
              </p>
            </div>
          ) : (
            activeOffers.map((offer) => {
              const isApplied = appliedOffer?.id === offer.id;
              const meetsMinPurchase = cartSubtotal >= (offer.minPurchase || 0);

              return (
                <div
                  key={offer.id}
                  id={`store-offer-${offer.id}`}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all relative overflow-hidden ${
                    isApplied
                      ? 'bg-amber-950/20 border-amber-400/80 shadow-lg shadow-amber-500/5'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2.5">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-sm">
                          {offer.badgeText || 'SPECIAL'}
                        </span>
                        {offer.freeShipping && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            🚚 {language === 'bn' ? 'ফ্রি ডেলিভারি' : 'Free Delivery'}
                          </span>
                        )}
                        {offer.allowCoins && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                            <Coins className="w-3 h-3" /> +Coins
                          </span>
                        )}
                        {offer.allowCoupon && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                            <Tag className="w-3 h-3" /> +Coupon
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-bold text-white mt-1">{offer.name}</h4>
                      {offer.description && (
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{offer.description}</p>
                      )}
                    </div>

                    {/* Benefit Highlight */}
                    <div className="sm:text-right shrink-0">
                      <div className="text-lg font-black text-amber-300">
                        {offer.discountType === 'percent'
                          ? `${offer.discountValue}% ${language === 'bn' ? 'ছাড়' : 'OFF'}`
                          : `৳${offer.discountValue} ${language === 'bn' ? 'ছাড়' : 'OFF'}`}
                      </div>
                      {offer.maxDiscount && (
                        <div className="text-[10px] text-slate-400">
                          {language === 'bn' ? `সর্বোচ্চ ৳${offer.maxDiscount}` : `Up to ৳${offer.maxDiscount}`}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Conditions Strip */}
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-850 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 my-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500">{language === 'bn' ? 'শর্ত:' : 'Condition:'}</span>
                      <span>
                        {language === 'bn'
                          ? `কমপক্ষে ৳${offer.minPurchase.toLocaleString()} টাকার অর্ডার`
                          : `Min order ৳${offer.minPurchase.toLocaleString()}`}
                      </span>
                    </div>

                    {offer.type === 'bonus_coins' && (
                      <div className="text-sky-400 font-semibold flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5" />
                        <span>
                          {offer.bonusCoinsMultiplier && offer.bonusCoinsMultiplier > 1
                            ? `${offer.bonusCoinsMultiplier}x খড়ম কয়েন`
                            : `+${offer.bonusCoinsFlat} বোনাস কয়েন`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Apply / Status Action */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="text-[11px] text-slate-400">
                      {meetsMinPurchase ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {language === 'bn' ? 'শর্ত পূরণ হয়েছে' : 'Eligible for your cart'}
                        </span>
                      ) : (
                        <span className="text-amber-400/90">
                          {language === 'bn'
                            ? `আর মাত্র ৳${Math.max(0, offer.minPurchase - cartSubtotal).toLocaleString()} টাকার কেনাকাটা প্রয়োজন`
                            : `Add ৳${Math.max(0, offer.minPurchase - cartSubtotal).toLocaleString()} more to qualify`}
                        </span>
                      )}
                    </div>

                    <div>
                      {isApplied ? (
                        <button
                          onClick={removeOffer}
                          className="px-4 py-1.5 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 transition cursor-pointer"
                        >
                          {language === 'bn' ? 'অফার সরান' : 'Remove'}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            const res = applyOffer(offer);
                            if (res.success) {
                              setIsOffersModalOpen(false);
                              setIsCartOpen(true);
                            }
                          }}
                          className={`px-4 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                            meetsMinPurchase
                              ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black shadow-md'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span>{language === 'bn' ? 'অফার প্রয়োগ করুন' : 'Apply Offer'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#070c16] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            {language === 'bn'
              ? 'অফার কার্টে স্বয়ংক্রিয়ভাবে ডিসকাউন্ট হিসেবে সমন্বয় হবে।'
              : 'Applied offer is seamlessly discounted at checkout.'}
          </span>
          <button
            onClick={() => setIsOffersModalOpen(false)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition cursor-pointer"
          >
            {language === 'bn' ? 'ঠিক আছে' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );
};
