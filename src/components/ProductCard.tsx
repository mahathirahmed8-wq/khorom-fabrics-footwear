import React, { memo } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { Star, Heart, ShoppingBag, Eye, Check, CreditCard, Coins } from 'lucide-react';
import { getOptimizedImageUrl } from '../lib/imageOptimizer';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

const ProductCardComponent: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const {
    language,
    formatPrice,
    addToCart,
    toggleWishlist,
    isWishlisted,
    cart,
    recordProductClick,
    directBuyNow,
    placeWhatsAppOrder,
  } = useStore();

  const title = language === 'bn' ? product.titleBn : product.titleEn;
  const wishlisted = isWishlisted(product.id);
  const isInCart = cart.some((item) => item.product.id === product.id);

  const handleProductOpen = () => {
    recordProductClick(product.id);
    onQuickView(product);
  };

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Direct Buy Now -> Full Checkout handler
  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    recordProductClick(product.id, 'click');
    directBuyNow(product, 1);
  };

  const isOutOfStock = !product.inStock || (product.stockCount ?? 0) <= 0;
  const optimizedImage = getOptimizedImageUrl(product.image, 450, 75);

  return (
    <div
      id={`product-card-${product.id}`}
      className="group bg-[#141820] rounded-xl border border-[#262C38] overflow-hidden shadow-xs hover:shadow-xl hover:shadow-black/30 hover:border-[#C6A15B]/50 transition-all duration-300 flex flex-col justify-between"
    >
      {/* Product Image Area */}
      <div className="relative aspect-square w-full bg-[#181D26] overflow-hidden cursor-pointer" onClick={handleProductOpen}>
        <img
          src={optimizedImage}
          alt={title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          decoding="async"
          width="400"
          height="400"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
          {discountPercent > 0 && (
            <span className="px-1.5 py-0.5 rounded-xs bg-[#0B1522]/95 text-[#F5EEDB] border border-[#263346] text-[9px] sm:text-[10px] font-bold shadow-xs">
              -{discountPercent}%
            </span>
          )}
          {product.isBestSeller && (
            <span className="px-1.5 py-0.5 rounded-xs bg-[#C6A15B] text-[#0A101A] text-[8px] sm:text-[9px] font-black uppercase tracking-wider shadow-xs">
              {language === 'bn' ? 'বেস্টসেলার' : 'Bestseller'}
            </span>
          )}
          {product.isNew && (
            <span className="px-1.5 py-0.5 rounded-xs bg-[#0B1522]/95 text-[#C6A15B] border border-[#C6A15B]/40 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider shadow-xs">
              {language === 'bn' ? 'নতুন' : 'New'}
            </span>
          )}
          {Boolean(product.bonusCoinsEnabled && (product.bonusCoins || 0) > 0) && (
            <span className="px-1.5 py-0.5 rounded-xs bg-amber-400 text-slate-950 text-[8px] sm:text-[9px] font-black uppercase tracking-wider shadow-xs flex items-center gap-0.5">
              +{product.bonusCoins} {language === 'bn' ? 'কয়েন' : 'Coins'}
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          id={`wishlist-btn-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className="absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#141820]/85 hover:bg-[#141820] shadow-xs flex items-center justify-center text-[#9E988E] hover:text-rose-500 transition-all cursor-pointer z-10 border border-[#2A3140]/80 backdrop-blur-xs"
          title="Save to wishlist"
          aria-label="Wishlist toggle"
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
              wishlisted ? 'fill-rose-500 text-rose-500' : 'text-[#9E988E]'
            }`}
          />
        </button>

        {/* Quick View Overlay Button (desktop) */}
        <div className="hidden sm:flex absolute inset-0 bg-[#0B121C]/40 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center p-4 pointer-events-none">
          <button
            id={`quick-view-btn-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              handleProductOpen();
            }}
            className="pointer-events-auto px-3 py-1.5 rounded-md bg-[#0B1522]/95 hover:bg-[#122033] border border-[#C6A15B]/60 text-[#FAF7F2] hover:text-[#C6A15B] text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all transform translate-y-1 group-hover:translate-y-0 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#C6A15B]" />
            <span>{language === 'bn' ? 'বিস্তারিত দেখুন' : 'Quick View'}</span>
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between bg-[#141820]">
        <div>
          {/* Rating & Stock row */}
          <div className="flex items-center justify-between gap-1 mb-1.5 text-[10px] sm:text-xs">
            <div className="flex items-center gap-1 text-[#C6A15B] min-w-0">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-[#C6A15B] text-[#C6A15B] shrink-0" />
              <span className="font-semibold text-[#EDE8DF]">{product.rating}</span>
              <span className="text-[10px] text-[#9E988E] truncate">({product.reviewCount})</span>
            </div>
            <span className="text-[9px] sm:text-[10px] font-medium shrink-0">
              {product.inStock ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  {language === 'bn' ? 'স্টকে আছে' : 'In Stock'}
                </span>
              ) : (
                <span className="text-[#9E988E] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#78726A]"></span>
                  {language === 'bn' ? 'স্টক আউট' : 'Out'}
                </span>
              )}
            </span>
          </div>

          {/* Title */}
          <h3
            onClick={handleProductOpen}
            className="text-xs sm:text-sm font-semibold text-[#FAF7F2] group-hover:text-[#D4AF67] transition-colors line-clamp-2 cursor-pointer leading-snug min-h-[2rem] sm:min-h-[2.5rem]"
            title={title}
          >
            {title}
          </h3>

          {/* Bonus KHOROM Coins Customer Badge */}
          {Boolean(product.bonusCoinsEnabled && (product.bonusCoins || 0) > 0) && (
            <div className="mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-[10px] sm:text-[11px] font-bold text-amber-300 w-full truncate">
              <Coins className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="truncate">
                {language === 'bn'
                  ? `এই পণ্যটি কিনলে পান ${product.bonusCoins} বোনাস কয়েন`
                  : `Buy this product & get ${product.bonusCoins} Bonus Coins`}
              </span>
            </div>
          )}
        </div>

        {/* Price & Actions (Buy Now + Add to Cart) */}
        <div className="mt-2 pt-2.5 sm:mt-3 sm:pt-3 border-t border-[#232936] flex flex-col xs:flex-row xs:items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-xs sm:text-base font-black text-[#F5EEDB] truncate">
              {formatPrice(product.price)}
            </div>
            {product.originalPrice && (
              <div className="text-[10px] sm:text-xs text-[#8E877C] line-through truncate">
                {formatPrice(product.originalPrice)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Buy Now Button (Small, Refined, Classy, Premium) */}
            <button
              id={`buy-now-btn-${product.id}`}
              onClick={handleBuyNow}
              className="flex-1 xs:flex-initial px-2.5 sm:px-3 py-1.5 rounded-md text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1 bg-[#0B1522] hover:bg-[#122033] text-[#EDE8DF] border border-[#2B384E] hover:border-[#C6A15B]/50 shadow-xs transition-all cursor-pointer whitespace-nowrap"
              title={language === 'bn' ? 'সরাসরি অর্ডার করুন' : 'Order instantly'}
            >
              <CreditCard className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#C6A15B]" />
              <span>{language === 'bn' ? 'বাই নাও' : 'Buy Now'}</span>
            </button>

            {/* Add to Cart or Pre-order Button (Small, Refined, Classy, Premium) */}
            {isOutOfStock ? (
              <button
                id={`pre-order-btn-${product.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  directBuyNow(product, 1, undefined, undefined, true);
                }}
                className="flex-1 xs:flex-initial px-2.5 sm:px-3 py-1.5 rounded-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 bg-[#C6A15B] hover:bg-[#B8924A] text-[#0A101A] border border-[#C6A15B] shadow-xs transition-all cursor-pointer whitespace-nowrap"
                title={language === 'bn' ? 'প্রি-অর্ডার করুন' : 'Pre-order now'}
              >
                <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>{language === 'bn' ? 'প্রি-অর্ডার' : 'Pre-order'}</span>
              </button>
            ) : (
              <button
                id={`add-to-cart-btn-${product.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(product, 1);
                }}
                className={`flex-1 xs:flex-initial px-2.5 sm:px-3 py-1.5 rounded-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs shrink-0 whitespace-nowrap ${
                  isInCart
                    ? 'bg-[#1C2331] text-[#EDE8DF] border border-[#C6A15B]/70'
                    : 'bg-[#C6A15B] hover:bg-[#B8924A] text-[#0A101A] border border-[#C6A15B]'
                }`}
                title={language === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart'}
              >
                {isInCart ? (
                  <>
                    <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#C6A15B]" />
                    <span className="hidden xs:inline">{language === 'bn' ? 'যুক্ত' : 'Added'}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>{language === 'bn' ? 'অ্যাড' : 'Add'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProductCard = memo(ProductCardComponent);
