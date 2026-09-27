import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  ArrowLeft,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Sparkles,
  ShieldCheck,
  Coins,
  Percent,
  CheckCircle,
  Truck,
  ArrowRight,
} from 'lucide-react';

interface MobileCartScreenProps {
  onBackToHome: () => void;
  onExploreProducts: () => void;
}

export const MobileCartScreen: React.FC<MobileCartScreenProps> = ({
  onBackToHome,
  onExploreProducts,
}) => {
  const {
    language,
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartSubtotal,
    cartTotal,
    shippingFee,
    discountAmount,
    coinsDiscountAmount,
    offerDiscountAmount,
    appliedPromo,
    appliedOffer,
    appliedCoins,
    userCoins,
    coinSettings,
    applyCoins,
    removeCoins,
    formatPrice,
    openCheckoutSecurely,
    setIsOffersModalOpen,
    setSelectedProduct,
  } = useStore();

  const FREE_SHIPPING_THRESHOLD = 3000;
  const progressPercent = Math.min(100, Math.round((cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartSubtotal);

  return (
    <div
      id="khorom-mobile-cart-screen"
      className="min-h-screen bg-[#050811] text-slate-100 px-3.5 pt-3 pb-32 animate-in fade-in duration-200"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-3 mb-3.5 pb-2.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <button
            id="cart-back-to-home-btn"
            onClick={onBackToHome}
            className="p-2 rounded-xl bg-[#0a0f1d] border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#faf8f5] font-serif">
                {language === 'bn' ? 'শপিং ব্যাগ' : 'Shopping Bag'}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#dfb76c]/15 text-[#dfb76c] border border-[#dfb76c]/30">
                {cart.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {language === 'bn'
                ? 'আপনার নির্বাচিত জেন্টস পণ্যের বিবরণ'
                : 'Review your selected bespoke footwear & items'}
            </p>
          </div>
        </div>

        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold px-2 py-1 rounded-lg border border-rose-500/20 hover:bg-rose-500/10 transition cursor-pointer"
          >
            {language === 'bn' ? 'খালি করুন' : 'Clear All'}
          </button>
        )}
      </div>

      {/* Free Delivery Goal Tracker */}
      {cart.length > 0 && (
        <div className="mb-4 p-3 rounded-2xl bg-[#0a0f1d] border border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Truck className="w-4 h-4 text-[#dfb76c]" />
              <span>
                {cartSubtotal >= FREE_SHIPPING_THRESHOLD
                  ? language === 'bn'
                    ? 'অভিনন্দন! আপনি ফ্রি হোম ডেলিভারি পাচ্ছেন'
                    : 'Congratulations! Free Shipping Unlocked'
                  : language === 'bn'
                  ? `আর ${formatPrice(remainingForFreeShipping)} কিনলেই পাচ্ছেন ফ্রি ডেলিভারি!`
                  : `Add ${formatPrice(remainingForFreeShipping)} more for FREE Delivery!`}
              </span>
            </span>
            <span className="text-[11px] font-bold text-[#dfb76c]">{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-[#dfb76c] to-[#ebd299] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Empty State */}
      {cart.length === 0 ? (
        <div className="mt-8 p-8 rounded-3xl bg-[#0a0f1d] border border-slate-800/80 text-center space-y-4 max-w-sm mx-auto shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-[#dfb76c]/10 border border-[#dfb76c]/20 text-[#dfb76c] flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#faf8f5] font-serif">
              {language === 'bn' ? 'আপনার শপিং ব্যাগ খালি' : 'Your Shopping Bag is Empty'}
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1.5 leading-relaxed">
              {language === 'bn'
                ? 'আপনার পছন্দের প্রিমিয়াম জুতো ও স্যান্ডেল কার্টে যোগ করে অর্ডার সম্পন্ন করুন।'
                : 'Explore our handmade collection and add items to your cart to begin your order.'}
            </p>
          </div>
          <button
            id="cart-empty-explore-btn"
            onClick={onExploreProducts}
            className="w-full py-3 px-4 rounded-xl gold-gradient-btn border border-[#dfb76c]/40 text-slate-950 text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{language === 'bn' ? 'কেনাকাটা শুরু করুন' : 'Start Shopping'}</span>
          </button>
        </div>
      ) : (
        /* Cart Items */
        <div className="space-y-4">
          <div className="space-y-2.5">
            {cart.map((item) => {
              const product = item.product;
              const title = language === 'bn' ? product.titleBn : product.titleEn;
              const lineTotal = product.price * item.quantity;

              return (
                <div
                  key={`${product.id}-${item.color || 'def'}-${item.size || 'def'}`}
                  id={`mobile-cart-item-${product.id}`}
                  className="p-3 rounded-2xl bg-[#0a0f1d] border border-slate-800/80 flex gap-3"
                >
                  {/* Image */}
                  <div
                    onClick={() => setSelectedProduct(product)}
                    className="relative w-20 h-20 rounded-xl bg-[#070b14] border border-slate-800 shrink-0 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={product.image}
                      alt={title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h3
                          onClick={() => setSelectedProduct(product)}
                          className="text-xs font-bold text-[#faf8f5] hover:text-[#dfb76c] transition-colors line-clamp-1 cursor-pointer"
                        >
                          {title}
                        </h3>
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition cursor-pointer shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Selected Attributes */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {item.size && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800 text-slate-300">
                            {language === 'bn' ? 'সাইজ' : 'Size'}: {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800 text-slate-300">
                            {item.color}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity & Price */}
                    <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-800/60">
                      <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5">
                        <button
                          onClick={() => updateQuantity(product.id, -1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-slate-100">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, 1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-[#dfb76c]">
                          {formatPrice(lineTotal)}
                        </span>
                        {item.quantity > 1 && (
                          <span className="block text-[10px] text-slate-500">
                            {formatPrice(product.price)} / unit
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Offers & Loyalty Coins Bar */}
          <div className="space-y-2">
            <button
              onClick={() => setIsOffersModalOpen(true)}
              className="w-full p-2.5 rounded-xl bg-[#0a0f1d] border border-slate-800 hover:border-[#dfb76c]/40 flex items-center justify-between transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-[#dfb76c]" />
                <span className="text-xs font-medium text-slate-300">
                  {appliedOffer
                    ? appliedOffer.titleBn || appliedOffer.titleEn
                    : language === 'bn'
                    ? 'কুপন বা অফার প্রয়োগ করুন'
                    : 'Apply Promo Code or Offer'}
                </span>
              </div>
              <span className="text-[11px] font-bold text-[#dfb76c]">
                {appliedOffer ? 'Applied' : language === 'bn' ? 'অফার দেখুন' : 'View'}
              </span>
            </button>

            {/* Coins Redemption Widget */}
            {coinSettings.enabled && userCoins > 0 && (
              <div className="p-3 rounded-xl bg-[#0a0f1d] border border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                    <Coins className="w-4 h-4" />
                    <span>
                      {language === 'bn'
                        ? `আপনার ${userCoins}টি খড়ম কয়েন আছে`
                        : `You have ${userCoins} Khorom Coins`}
                    </span>
                  </div>
                  {appliedCoins > 0 && (
                    <button
                      onClick={removeCoins}
                      className="text-[10px] text-rose-400 hover:text-rose-300 cursor-pointer font-bold"
                    >
                      {language === 'bn' ? 'বাতিল' : 'Remove'}
                    </button>
                  )}
                </div>

                {appliedCoins === 0 ? (
                  <button
                    onClick={() => applyCoins(userCoins)}
                    className="w-full py-1.5 px-3 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[11px] font-bold transition cursor-pointer"
                  >
                    {language === 'bn'
                      ? `কয়েন ব্যবহার করে ছাড় নিন (মূল্য: ${formatPrice(userCoins * coinSettings.coinValueBdt)})`
                      : `Redeem coins for discount (Value: ${formatPrice(userCoins * coinSettings.coinValueBdt)})`}
                  </button>
                ) : (
                  <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>
                      {language === 'bn'
                        ? `${appliedCoins}টি কয়েন প্রয়োগ করা হয়েছে (-${formatPrice(coinsDiscountAmount)})`
                        : `${appliedCoins} coins applied (-${formatPrice(coinsDiscountAmount)})`}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Order Summary Card */}
          <div className="p-3.5 rounded-2xl bg-[#0a0f1d] border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {language === 'bn' ? 'অর্ডার সামারি' : 'Order Summary'}
            </h4>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>{language === 'bn' ? 'সাবটোটাল' : 'Subtotal'}</span>
                <span className="font-semibold text-slate-200">{formatPrice(cartSubtotal)}</span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>{language === 'bn' ? 'ডেলিভারি চার্জ' : 'Delivery Fee'}</span>
                <span className="font-semibold text-slate-200">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-400 font-bold">
                      {language === 'bn' ? 'ফ্রি' : 'FREE'}
                    </span>
                  ) : (
                    formatPrice(shippingFee)
                  )}
                </span>
              </div>

              {(discountAmount > 0 || offerDiscountAmount > 0) && (
                <div className="flex justify-between text-emerald-400">
                  <span>{language === 'bn' ? 'অফার ছাড়' : 'Promo Discount'}</span>
                  <span className="font-bold">
                    -{formatPrice(discountAmount + offerDiscountAmount)}
                  </span>
                </div>
              )}

              {coinsDiscountAmount > 0 && (
                <div className="flex justify-between text-amber-400">
                  <span>{language === 'bn' ? 'কয়েন ছাড়' : 'Coins Discount'}</span>
                  <span className="font-bold">-{formatPrice(coinsDiscountAmount)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-bold">
                <span className="text-[#faf8f5]">{language === 'bn' ? 'মোট দেয়' : 'Total Amount'}</span>
                <span className="text-base font-black text-[#dfb76c]">
                  {formatPrice(cartTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Guarantee Badge */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 py-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'bn' ? '১০০% অরিজিনাল লেদার গ্যারান্টি ও ক্যাশ অন ডেলিভারি' : '100% Genuine Leather & Cash on Delivery'}</span>
          </div>
        </div>
      )}

      {/* Floating Checkout Bottom Action Bar (Fixed above MobileBottomNav) */}
      {cart.length > 0 && (
        <div
          id="mobile-cart-floating-checkout-bar"
          className="fixed bottom-14 sm:bottom-15 inset-x-0 z-40 bg-[#070b14]/95 backdrop-blur-md border-t border-slate-800 px-3.5 py-2.5 shadow-2xl flex items-center justify-between gap-3 max-w-lg mx-auto"
        >
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">
              {language === 'bn' ? 'সর্বমোট প্রদেয়' : 'Total Payable'}
            </span>
            <span className="text-sm font-black text-[#dfb76c]">
              {formatPrice(cartTotal)}
            </span>
          </div>

          <button
            id="mobile-cart-proceed-checkout-btn"
            onClick={openCheckoutSecurely}
            className="flex-1 py-2.5 px-4 rounded-xl gold-gradient-btn border border-[#dfb76c]/40 text-slate-950 font-black text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>{language === 'bn' ? 'চেকআউট করুন' : 'Proceed to Checkout'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
