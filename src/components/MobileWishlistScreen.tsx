import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  ArrowLeft,
  Heart,
  ShoppingBag,
  Trash2,
  Star,
  Sparkles,
  ChevronRight,
  PackageCheck,
  PackageX,
} from 'lucide-react';

interface MobileWishlistScreenProps {
  onBackToHome: () => void;
  onExploreProducts: () => void;
}

export const MobileWishlistScreen: React.FC<MobileWishlistScreenProps> = ({
  onBackToHome,
  onExploreProducts,
}) => {
  const {
    language,
    wishlist,
    products,
    toggleWishlist,
    addToCart,
    formatPrice,
    setSelectedProduct,
    showToast,
  } = useStore();

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    addToCart(product, 1);
    showToast(
      language === 'bn'
        ? `"${product.titleBn}" কার্টে যোগ করা হয়েছে!`
        : `Added "${product.titleEn}" to your cart!`
    );
  };

  const handleRemove = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    toggleWishlist(productId);
  };

  const handleMoveAllToCart = () => {
    wishlistedProducts.forEach((p) => {
      if (p.inStock) {
        addToCart(p, 1);
      }
    });
    showToast(
      language === 'bn'
        ? 'সকল ইন-স্টক পণ্য কার্টে যোগ করা হয়েছে!'
        : 'All available items moved to cart!'
    );
  };

  return (
    <div
      id="khorom-mobile-wishlist-screen"
      className="min-h-screen bg-[#050811] text-slate-100 px-3.5 pt-3 pb-24 animate-in fade-in duration-200"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-2.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <button
            id="wishlist-back-to-home-btn"
            onClick={onBackToHome}
            className="p-2 rounded-xl bg-[#0a0f1d] border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#faf8f5] font-serif">
                {language === 'bn' ? 'আমার উইশলিস্ট' : 'My Wishlist'}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                {wishlist.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {language === 'bn'
                ? 'আপনার সংরক্ষিত পছন্দের জেন্টস আইটেমসমূহ'
                : 'Your handpicked favorite gentlemen essentials'}
            </p>
          </div>
        </div>

        {wishlistedProducts.length > 1 && (
          <button
            onClick={handleMoveAllToCart}
            className="px-2.5 py-1.5 rounded-lg bg-[#dfb76c]/10 border border-[#dfb76c]/30 text-[#dfb76c] hover:bg-[#dfb76c]/20 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'সব কার্টে নিন' : 'Move All'}</span>
          </button>
        )}
      </div>

      {/* Empty State */}
      {wishlistedProducts.length === 0 ? (
        <div className="mt-8 p-8 rounded-3xl bg-[#0a0f1d] border border-slate-800/80 text-center space-y-4 max-w-sm mx-auto shadow-xl">
          <div className="relative w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8 fill-rose-500/20" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 animate-ping opacity-75" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#faf8f5] font-serif">
              {language === 'bn' ? 'আপনার উইশলিস্ট খালি' : 'Your Wishlist is Empty'}
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1.5 leading-relaxed">
              {language === 'bn'
                ? 'পণ্য ব্রাউজ করার সময় হার্ট আইকনে ট্যাপ করে আপনার পছন্দের জুতো ও স্যান্ডেল এখানে সংরক্ষণ করুন।'
                : 'Explore our footwear collection and tap the heart icon on any pair to save it here for later.'}
            </p>
          </div>
          <button
            id="wishlist-empty-explore-btn"
            onClick={onExploreProducts}
            className="w-full py-3 px-4 rounded-xl gold-gradient-btn border border-[#dfb76c]/40 text-slate-950 text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{language === 'bn' ? 'জেন্টস কালেকশন দেখুন' : 'Explore Gents Collection'}</span>
          </button>
        </div>
      ) : (
        /* Wishlist Items List */
        <div className="space-y-3">
          {wishlistedProducts.map((product) => {
            const title = language === 'bn' ? product.titleBn : product.titleEn;

            return (
              <div
                key={product.id}
                id={`wishlist-item-${product.id}`}
                onClick={() => setSelectedProduct(product)}
                className="p-3 rounded-2xl bg-[#0a0f1d] border border-slate-800/80 hover:border-[#dfb76c]/40 flex gap-3 cursor-pointer group transition-all"
              >
                {/* Product Image */}
                <div className="relative w-20 h-20 rounded-xl bg-[#070b14] border border-slate-800 shrink-0 overflow-hidden">
                  <img
                    src={product.image}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="absolute top-1 left-1 px-1 py-0.5 rounded text-[9px] font-black bg-rose-500 text-white">
                      -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="text-xs font-bold text-[#faf8f5] group-hover:text-[#dfb76c] transition-colors line-clamp-1">
                        {title}
                      </h3>
                      <button
                        onClick={(e) => handleRemove(e, product.id)}
                        className="p-1 text-rose-400 hover:text-rose-300 transition cursor-pointer shrink-0"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-black text-[#dfb76c]">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-[10px] text-slate-500 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-800/60">
                    <div className="flex items-center gap-1.5 text-[10px]">
                      {product.inStock ? (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <PackageCheck className="w-3 h-3" />
                          <span>{language === 'bn' ? 'স্টকে আছে' : 'In Stock'}</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-400">
                          <PackageX className="w-3 h-3" />
                          <span>{language === 'bn' ? 'স্টক শেষ' : 'Out of Stock'}</span>
                        </span>
                      )}
                      <span className="text-slate-600">•</span>
                      <span className="flex items-center text-amber-400 font-semibold">
                        <Star className="w-2.5 h-2.5 fill-amber-400 inline mr-0.5" />
                        {product.rating}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={!product.inStock}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        product.inStock
                          ? 'gold-gradient-btn border border-[#dfb76c]/40 text-slate-950 shadow-xs'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>{language === 'bn' ? 'কার্টে নিন' : 'Add to Cart'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
