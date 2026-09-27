import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Tag,
  Truck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Coins,
  Gift,
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartSubtotal,
    appliedPromo,
    applyPromo,
    removePromo,
    discountAmount,
    promoDiscount,
    shippingFee,
    cartTotal,
    formatPrice,
    language,
    openCheckoutSecurely,
    currentUser,
    setIsAuthModalOpen,
    // Offers Center
    offers,
    appliedOffer,
    applyOffer,
    removeOffer,
    offerDiscountAmount,
    setIsOffersModalOpen,
    // Coins
    userCoins,
    coinSettings,
    appliedCoins,
    applyCoins,
    removeCoins,
    coinsDiscountAmount,
    potentialCoinsToEarn,
  } = useStore();

  const [promoInput, setPromoInput] = useState('');
  const [promoFeedback, setPromoFeedback] = useState<{ isError: boolean; message: string } | null>(null);
  const [coinInput, setCoinInput] = useState<string>('');

  if (!isCartOpen) return null;

  const freeDeliveryThreshold = 2000;
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - cartSubtotal);
  const deliveryProgress = Math.min(100, Math.round((cartSubtotal / freeDeliveryThreshold) * 100));

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const result = await applyPromo(promoInput);
    setPromoFeedback({
      isError: !result.success,
      message: result.message,
    });
    if (result.success) {
      setPromoInput('');
    }
  };

  const handleApplyMaxCoins = () => {
    // calculate maximum redeemable coins for this cart
    const maxDiscountAllowed = (cartSubtotal * coinSettings.maxDiscountPercent) / 100;
    const maxCoinsByDiscount = Math.floor(maxDiscountAllowed / coinSettings.valuePerCoin);
    const maxRedeemable = Math.min(
      userCoins,
      coinSettings.maxRedeemCoinsPerOrder,
      maxCoinsByDiscount
    );
    if (maxRedeemable >= coinSettings.minRedeemCoins) {
      applyCoins(maxRedeemable);
    }
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    openCheckoutSecurely();
  };

  const activeOffersCount = offers.filter((o) => o.status === 'active').length;

  return (
    <div
      id="cart-drawer-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-end"
      onClick={() => setIsCartOpen(false)}
    >
      <div
        id="cart-drawer-panel"
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0a0f1d] w-full max-w-md h-full shadow-2xl flex flex-col justify-between border-l border-slate-800 text-slate-100 animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-[#070b14]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#dfb76c]" />
            <h2 className="text-base font-bold text-[#faf8f5] font-serif">
              {language === 'bn' ? 'শপিং ব্যাগ' : 'Shopping Cart'}
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#dfb76c]/15 text-[#dfb76c] border border-[#dfb76c]/25">
              {cart.reduce((a, b) => a + b.quantity, 0)}
            </span>
          </div>

          <button
            id="close-cart-btn"
            onClick={() => setIsCartOpen(false)}
            className="w-8 h-8 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="p-3.5 bg-[#dfb76c]/10 border-b border-[#dfb76c]/20 text-xs">
          <div className="flex items-center justify-between text-[#dfb76c] font-semibold mb-1.5">
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#dfb76c]" />
              {remainingForFreeDelivery === 0
                ? language === 'bn'
                  ? 'অভিনন্দন! আপনি ফ্রি ডেলিভারি পাচ্ছেন!'
                  : 'Congratulations! You unlocked FREE Delivery!'
                : language === 'bn'
                ? `আর মাত্র ${formatPrice(remainingForFreeDelivery)} এর কেনাকাটায় ফ্রি ডেলিভারি!`
                : `Add ${formatPrice(remainingForFreeDelivery)} more to get FREE Delivery!`}
            </span>
            <span className="font-bold">{deliveryProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#070b14] rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-[#dfb76c] rounded-full transition-all duration-500"
              style={{ width: `${deliveryProgress}%` }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#080d19] text-amber-400/60 border border-slate-800 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {language === 'bn' ? 'আপনার কার্ট খালি' : 'Your cart is empty'}
                </h3>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  {language === 'bn'
                    ? 'আমাদের দারুণ সব কালেকশন ও এক্সক্লুসিভ পণ্যগুলো দেখতে শপিং শুরু করুন!'
                    : 'Explore our quality catalog and discover great gents items!'}
                </p>
              </div>
              <button
                id="cart-start-shopping-btn"
                onClick={() => setIsCartOpen(false)}
                className="px-5 py-2.5 rounded-xl gold-gradient-btn border border-[#dfb76c]/40 text-slate-950 text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                {language === 'bn' ? 'কেনাকাটা শুরু করুন' : 'Start Shopping'}
              </button>
            </div>
          ) : (
            cart.map((item, idx) => {
              const title = language === 'bn' ? item.product.titleBn : item.product.titleEn;
              return (
                <div
                  key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}-${idx}`}
                  className="p-3 rounded-xl bg-[#070b14] border border-slate-800/80 flex gap-3 group"
                >
                  <div className="w-16 h-16 rounded-xl bg-[#050811] overflow-hidden border border-slate-800 shrink-0">
                    <img
                      src={item.product.image}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-white truncate" title={title}>
                          {title}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-slate-500 hover:text-rose-400 transition-colors p-1 cursor-pointer shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Variant metadata */}
                      {(item.selectedColor || item.selectedSize) && (
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          {item.selectedColor && (
                            <span className="bg-[#0c1322] border border-slate-800 px-1.5 py-0.5 rounded text-[10px] text-[#dfb76c]">
                              {item.selectedColor}
                            </span>
                          )}
                          {item.selectedSize && (
                            <span className="bg-[#0c1322] border border-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-300">
                              Size: {item.selectedSize}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-black text-[#dfb76c]">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>

                      {/* Quantity Modifier */}
                      <div className="flex items-center border border-slate-800 rounded-lg overflow-hidden bg-[#0c1322]">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="p-1 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="p-1 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary & Checkout Trigger */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-slate-800/80 bg-[#070b14] space-y-4">
            {/* Active Offers Section */}
            {appliedOffer ? (
              <div className="flex items-center justify-between bg-[#dfb76c]/10 border border-[#dfb76c]/30 p-2.5 rounded-xl text-xs">
                <div className="flex items-center gap-1.5 text-[#dfb76c] font-semibold truncate max-w-[260px]">
                  <Sparkles className="w-4 h-4 text-[#dfb76c] shrink-0" />
                  <span className="truncate">
                    {appliedOffer.name} (-{formatPrice(offerDiscountAmount)})
                  </span>
                </div>
                <button
                  onClick={removeOffer}
                  className="text-rose-400 hover:text-rose-300 text-[11px] font-bold cursor-pointer shrink-0 ml-2"
                >
                  {language === 'bn' ? 'মুছুন' : 'Remove'}
                </button>
              </div>
            ) : activeOffersCount > 0 ? (
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setIsOffersModalOpen(true);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-[#dfb76c]/10 via-[#dfb76c]/5 to-transparent border border-[#dfb76c]/30 text-xs text-[#dfb76c] hover:border-[#dfb76c]/60 transition cursor-pointer font-bold"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#dfb76c]" />
                  <span>
                    {language === 'bn'
                      ? `উপলব্ধ স্পেশাল অফারসমূহ (${activeOffersCount}টি)`
                      : `Special Offers Available (${activeOffersCount})`}
                  </span>
                </div>
                <span className="text-[11px] text-[#dfb76c] underline">
                  {language === 'bn' ? 'দেখুন' : 'View'}
                </span>
              </button>
            ) : null}

            {/* KHOROM Coins Redemption */}
            {coinSettings.enabled && (
              <div className="p-3 bg-[#0a0f1d] rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#dfb76c]">
                    <Coins className="w-4 h-4 text-[#dfb76c]" />
                    <span>{language === 'bn' ? 'খড়ম কয়েন লয়্যালটি' : 'Khorom Coins'}</span>
                  </div>
                  {currentUser ? (
                    <span className="text-[11px] text-slate-300 font-medium">
                      {language === 'bn' ? 'ব্যালেন্স: ' : 'Balance: '}
                      <strong className="text-[#dfb76c] font-black">{userCoins}</strong>{' '}
                      {language === 'bn' ? 'কয়েন' : 'coins'}
                    </span>
                  ) : (
                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className="text-[11px] text-[#dfb76c] font-bold underline cursor-pointer"
                    >
                      {language === 'bn' ? 'লগইন করে কয়েন পান' : 'Login to earn'}
                    </button>
                  )}
                </div>

                {currentUser && (
                  <>
                    {appliedCoins > 0 ? (
                      <div className="flex items-center justify-between bg-sky-500/10 border border-sky-500/30 p-2 rounded-xl text-xs">
                        <span className="text-sky-300 font-semibold">
                          🪙 {appliedCoins} কয়েন ব্যবহার হয়েছে (-{formatPrice(coinsDiscountAmount)})
                        </span>
                        <button
                          onClick={removeCoins}
                          className="text-rose-400 hover:text-rose-300 text-[11px] font-bold cursor-pointer"
                        >
                          {language === 'bn' ? 'মুছুন' : 'Remove'}
                        </button>
                      </div>
                    ) : userCoins >= coinSettings.minRedeemCoins ? (
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <span className="text-[11px] text-slate-400 leading-tight">
                          {language === 'bn'
                            ? `কয়েন দিয়ে সর্বোচ্চ ${coinSettings.maxDiscountPercent}% পর্যন্ত ছাড় নিন`
                            : `Redeem coins for instant order discounts`}
                        </span>
                        <button
                          onClick={handleApplyMaxCoins}
                          className="px-3 py-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 text-xs font-bold rounded-lg transition cursor-pointer shrink-0"
                        >
                          {language === 'bn' ? 'কয়েন ব্যবহার করুন' : 'Redeem Coins'}
                        </button>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-500">
                        {language === 'bn'
                          ? `রিডিম করতে ন্যূনতম ${coinSettings.minRedeemCoins} কয়েন প্রয়োজন (আপনার আছে: ${userCoins})`
                          : `Minimum ${coinSettings.minRedeemCoins} coins needed to redeem (You have: ${userCoins})`}
                      </p>
                    )}
                  </>
                )}

                {/* Potential Coins to Earn On This Order */}
                {potentialCoinsToEarn > 0 && (
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold pt-1 border-t border-slate-800/80">
                    <Gift className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {language === 'bn'
                        ? `এই অর্ডারে আপনি নিশ্চিত পাবেন +${potentialCoinsToEarn} খড়ম কয়েন`
                        : `You will earn +${potentialCoinsToEarn} Khorom Coins on this order`}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Promo Code Input */}
            <div>
              {appliedPromo ? (
                <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 p-2 rounded-xl text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>
                      {appliedPromo.code} (-
                      {appliedPromo.discountPercent
                        ? `${appliedPromo.discountPercent}%`
                        : formatPrice(appliedPromo.discountAmount || 0)}
                      )
                    </span>
                  </div>
                  <button
                    onClick={removePromo}
                    className="text-rose-400 hover:text-rose-300 text-[11px] font-bold cursor-pointer"
                  >
                    {language === 'bn' ? 'মুছুন' : 'Remove'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => {
                        setPromoInput(e.target.value);
                        setPromoFeedback(null);
                      }}
                      placeholder={language === 'bn' ? 'কুপন কোড (যেমন: KHOROM10)' : 'Promo code (e.g. KHOROM10)'}
                      className="w-full pl-8 pr-3 py-2 text-xs uppercase bg-[#0c1322] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer"
                  >
                    {language === 'bn' ? 'প্রয়োগ' : 'Apply'}
                  </button>
                </form>
              )}

              {promoFeedback && (
                <p
                  className={`text-[11px] mt-1 font-medium flex items-center gap-1 ${
                    promoFeedback.isError ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  <AlertCircle className="w-3 h-3" />
                  {promoFeedback.message}
                </p>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>{language === 'bn' ? 'সাবটোটাল' : 'Subtotal'}</span>
                <span className="font-semibold text-white">{formatPrice(cartSubtotal)}</span>
              </div>

              {offerDiscountAmount > 0 && (
                <div className="flex justify-between text-amber-400 font-medium">
                  <span>{language === 'bn' ? 'অফার ছাড়' : 'Offer Discount'}</span>
                  <span>-{formatPrice(offerDiscountAmount)}</span>
                </div>
              )}

              {promoDiscount > 0 && (
                <div className="flex justify-between text-purple-400 font-medium">
                  <span>{language === 'bn' ? 'কুপন কোড ছাড়' : 'Coupon Discount'}</span>
                  <span>-{formatPrice(promoDiscount)}</span>
                </div>
              )}

              {coinsDiscountAmount > 0 && (
                <div className="flex justify-between text-sky-400 font-medium">
                  <span>{language === 'bn' ? 'খড়ম কয়েন ছাড়' : 'Coins Discount'}</span>
                  <span>-{formatPrice(coinsDiscountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-400">
                <span>{language === 'bn' ? 'ডেলিভারি চার্জ' : 'Shipping Fee'}</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-400 font-bold uppercase">
                      {language === 'bn' ? 'ফ্রি' : 'FREE'}
                    </span>
                  ) : (
                    formatPrice(shippingFee)
                  )}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex justify-between text-sm font-bold text-white">
                <span>{language === 'bn' ? 'সর্বমোট' : 'Total Amount'}</span>
                <span className="text-base text-[#dfb76c] font-black">{formatPrice(cartTotal)}</span>
              </div>
            </div>

            {/* Checkout Action Button: Refined, Classy, Premium */}
            <button
              id="proceed-checkout-btn"
              onClick={handleProceedToCheckout}
              className="w-full py-2.5 px-4 rounded-md bg-[#C6A15B] hover:bg-[#B8924A] border border-[#C6A15B] text-[#0B1F33] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <span>{language === 'bn' ? 'অর্ডার করুন (চেকআউট)' : 'Proceed to Checkout'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Clear Cart Button */}
            <div className="text-center">
              <button
                onClick={clearCart}
                className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
              >
                {language === 'bn' ? 'কার্ট খালি করুন' : 'Clear shopping cart'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
