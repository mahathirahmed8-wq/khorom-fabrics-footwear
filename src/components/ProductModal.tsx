import React, { useState, useEffect } from 'react';
import { Product, ProductReview } from '../types';
import { useStore } from '../context/StoreContext';
import {
  X,
  Star,
  ShoppingBag,
  Shield,
  Check,
  Heart,
  MessageCircle,
  Clock,
  Send,
  UserCheck,
  Sparkles,
  CreditCard,
  Coins,
} from 'lucide-react';
import { saveInquiryToFirestore } from '../lib/firebase';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const {
    language,
    formatPrice,
    addToCart,
    toggleWishlist,
    isWishlisted,
    currentUser,
    customization,
    showToast,
    orders,
    submitReview,
    fetchProductReviews,
    directBuyNow,
    placeWhatsAppOrder,
  } = useStore();

  const [selectedImg, setSelectedImg] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  // Review states
  const [productReviews, setProductReviews] = useState<ProductReview[]>([]);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    if (product?.id) {
      fetchProductReviews(product.id).then((revs) => {
        setProductReviews(revs || []);
      });
      setReviewComment('');
      setReviewRating(5);
      setReviewSuccess(false);
    }
  }, [product?.id, fetchProductReviews]);

  if (!product) return null;

  const currentImage = selectedImg || product.image;
  const wishlisted = isWishlisted(product.id);
  const title = language === 'bn' ? product.titleBn : product.titleEn;
  const description = language === 'bn' ? product.descriptionBn : product.descriptionEn;
  const isOutOfStock = !product.inStock || (product.stockCount ?? 0) <= 0;

  // Check if current logged-in user has an order containing this product that is in 'received' status and not yet reviewed
  const eligibleOrder = orders.find(
    (o) =>
      o.status === 'received' &&
      !o.reviewed &&
      o.items.some((i) => i.product.id === product.id)
  );

  // Check valid specifications (no hardcoded/empty fallback)
  const validSpecifications = product.specifications
    ? Object.entries(product.specifications).filter(
        ([key, val]) => key && key.trim() !== '' && val && String(val).trim() !== ''
      )
    : [];

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor || undefined, selectedSize || undefined);
  };

  const handlePreOrder = () => {
    directBuyNow(
      product,
      quantity,
      selectedColor || undefined,
      selectedSize || undefined,
      true
    );
    onClose();
  };

  const handleBuyNow = () => {
    directBuyNow(
      product,
      quantity,
      selectedColor || undefined,
      selectedSize || undefined,
      !product.inStock || (product.stockCount ?? 0) <= 0
    );
    onClose();
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eligibleOrder) return;
    if (!reviewComment.trim()) {
      showToast(language === 'bn' ? 'রিভিউতে কিছু লিখুন।' : 'Please write a review comment.');
      return;
    }

    setIsSubmittingReview(true);
    const res = await submitReview(
      eligibleOrder.id,
      product.id,
      reviewRating,
      reviewComment.trim()
    );
    setIsSubmittingReview(false);

    if (res.success) {
      setReviewSuccess(true);
      const updatedRevs = await fetchProductReviews(product.id);
      setProductReviews(updatedRevs || []);
    }
  };

  return (
    <div
      id="product-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="product-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FFFFFF] rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-[#E5DFD3] relative animate-in fade-in zoom-in-95 duration-200 text-[#1C1C1C]"
      >
        {/* Close button */}
        <button
          id="close-product-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-[#FFFFFF]/90 hover:bg-[#FFFFFF] text-[#1C1C1C] border border-[#E5DFD3] shadow-xs flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[90vh] overflow-y-auto">
          {/* Left Column: Image Gallery */}
          <div className="p-6 sm:p-8 bg-[#F7F4EE] flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#E5DFD3]">
            <div className="space-y-4">
              <div className="aspect-square rounded-xl overflow-hidden bg-[#FFFFFF] border border-[#E5DFD3] shadow-inner">
                <img
                  src={currentImage}
                  alt={title}
                  className="w-full h-full object-cover object-center"
                />
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1 slim-scrollbar">
                  {product.images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImg(imgUrl)}
                      className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        currentImage === imgUrl
                          ? 'border-[#C6A15B] ring-2 ring-[#C6A15B]/30'
                          : 'border-[#E5DFD3] hover:border-[#C6A15B]'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Thumb ${idx}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quality assurance guarantee badge */}
            <div className="mt-6 pt-4 border-t border-[#E5DFD3] flex items-center gap-2.5 text-[#6B655B] text-xs font-medium">
              <Shield className="w-4 h-4 text-[#C6A15B] shrink-0" />
              <span>
                {language === 'bn'
                  ? '১০০% খাঁটি ও গুণগত মানসম্পন্ন প্রিমিয়াম জেন্টস কালেকশন'
                  : '100% Authentic handcrafted gentlemen collection'}
              </span>
            </div>
          </div>

          {/* Right Column: Product Information & Purchase Controls */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-[#FFFFFF]">
            <div className="space-y-4">
              {/* Category & Rating */}
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-sm bg-[#0B1F33] text-[#C6A15B] border border-[#0B1F33] text-[10px] font-bold uppercase tracking-wider">
                  {product.category}
                </span>

                <div className="flex items-center gap-1.5">
                  <div className="flex items-center text-[#C6A15B]">
                    <Star className="w-3.5 h-3.5 fill-[#C6A15B] text-[#C6A15B]" />
                  </div>
                  <span className="text-xs font-bold text-[#1C1C1C]">{product.rating}</span>
                  <span className="text-xs text-[#6B655B]">
                    ({product.reviewCount} {language === 'bn' ? 'রিভিউ' : 'reviews'})
                  </span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-lg sm:text-xl font-bold text-[#0B1F33] leading-tight font-serif">
                {title}
              </h2>

              {/* Price & Stock */}
              <div className="flex items-baseline gap-3 pb-2 border-b border-[#E5DFD3]">
                <span className="text-2xl font-black text-[#0B1F33]">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-[#8C827A] line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                {product.originalPrice && (
                  <span className="px-1.5 py-0.5 rounded-xs bg-[#F7F4EE] text-[#0B1F33] border border-[#C6A15B]/50 text-xs font-bold">
                    {language === 'bn'
                      ? `৳${product.originalPrice - product.price} ছাড়`
                      : `Save ${formatPrice(product.originalPrice - product.price)}`}
                  </span>
                )}
              </div>

              {/* Bonus KHOROM Coins Callout */}
              {Boolean(product.bonusCoinsEnabled && (product.bonusCoins || 0) > 0) && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-amber-900">
                      {language === 'bn'
                        ? `এই পণ্যটি কিনে পান ${product.bonusCoins} বোনাস কয়েন`
                        : `Buy this product & get ${product.bonusCoins} Bonus Coins`}
                    </p>
                    <p className="text-[11px] text-[#6B655B]">
                      {language === 'bn'
                        ? 'পণ্যটি ডেলিভারি পাওয়ার পর সরাসরি আপনার কয়েন অ্যাকাউন্টে যুক্ত হবে।'
                        : 'Bonus coins are awarded permanently to your account on completed order.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#5A544C] leading-relaxed font-normal">
                {description}
              </p>

              {/* Color Selection if available */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1C1C1C] uppercase tracking-wider block">
                    {language === 'bn' ? 'রং নির্বাচন করুন:' : 'Select Color:'}{' '}
                    <span className="font-normal text-[#C6A15B]">
                      {selectedColor || product.colors[0].name}
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((c) => {
                      const isChosen = (selectedColor || product.colors![0].name) === c.name;
                      return (
                        <button
                          key={c.name}
                          onClick={() => setSelectedColor(c.name)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold cursor-pointer transition-all ${
                            isChosen
                              ? 'border-[#C6A15B] bg-[#F7F4EE] text-[#0B1F33]'
                              : 'border-[#E5DFD3] hover:border-[#DCD6C9] bg-[#FFFFFF] text-[#6B655B]'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-black/10 inline-block shrink-0"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span>{c.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selection if available */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1C1C1C] uppercase tracking-wider block">
                    {language === 'bn' ? 'সাইজ নির্বাচন করুন:' : 'Select Size:'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => {
                      const isChosen = (selectedSize || product.sizes![0]) === s;
                      return (
                        <button
                          key={s}
                          onClick={() => setSelectedSize(s)}
                          className={`w-10 h-8 rounded-md font-bold text-xs border transition-all cursor-pointer ${
                            isChosen
                              ? 'bg-[#0B1F33] text-[#C6A15B] border-[#0B1F33] shadow-xs'
                              : 'bg-[#F7F4EE] text-[#1C1C1C] border-[#E5DFD3] hover:border-[#C6A15B]'
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dynamic Specifications: Only shown if specifications exist */}
              {validSpecifications.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-[#1C1C1C] uppercase tracking-wider block">
                    {language === 'bn' ? 'স্পেসিফিকেশন ও বিবরণ:' : 'Specifications & Details:'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {validSpecifications.map(([key, val]) => (
                      <div key={key} className="bg-[#F7F4EE] p-2 rounded-md border border-[#E5DFD3]">
                        <span className="text-[#6B655B] block text-[11px] font-medium">{key}</span>
                        <span className="text-[#1C1C1C] font-semibold">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity & CTA Buttons */}
            <div className="space-y-3 pt-4 border-t border-[#E5DFD3]">
              {/* Quantity selector */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1C1C1C] uppercase tracking-wider">
                  {language === 'bn' ? 'পরিমাণ:' : 'Quantity:'}
                </span>
                <div className="flex items-center border border-[#E5DFD3] rounded-md overflow-hidden bg-[#F7F4EE]">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1 hover:bg-[#EBE5D8] text-[#1C1C1C] font-bold transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3.5 py-1 font-bold text-xs text-[#0B1F33] bg-[#FFFFFF]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stockCount, q + 1))}
                    className="px-3 py-1 hover:bg-[#EBE5D8] text-[#1C1C1C] font-bold transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Main Action Buttons: Small, Refined, Classy, Premium */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {isOutOfStock ? (
                  <button
                    id="modal-pre-order-btn"
                    onClick={handlePreOrder}
                    className="w-full py-2.5 px-4 rounded-md bg-[#C6A15B] hover:bg-[#B8924A] border border-[#C6A15B] text-[#0B1F33] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'প্রি-অর্ডার করুন' : 'Pre-order Now'}</span>
                  </button>
                ) : (
                  <button
                    id="modal-add-to-cart-btn"
                    onClick={handleAddToCart}
                    className="w-full py-2.5 px-4 rounded-md bg-[#C6A15B] hover:bg-[#B8924A] border border-[#C6A15B] text-[#0B1F33] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'কার্টে রাখুন' : 'Add to Cart'}</span>
                  </button>
                )}

                {/* Buy Now -> Full Checkout Button */}
                <button
                  id="modal-buy-now-btn"
                  onClick={handleBuyNow}
                  className="w-full py-2.5 px-4 rounded-md bg-[#C6A15B] hover:bg-[#B8924A] text-[#060D17] border border-[#C6A15B] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'সরাসরি অর্ডার (চেকআউট)' : 'Buy Now'}</span>
                </button>
              </div>

              {/* Wishlist toggle in modal */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className="w-full py-1.5 text-xs font-semibold text-[#6B655B] hover:text-[#0B1F33] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Heart
                  className={`w-3.5 h-3.5 ${
                    wishlisted ? 'fill-rose-600 text-rose-600' : 'text-[#6B655B]'
                  }`}
                />
                <span>
                  {wishlisted
                    ? language === 'bn'
                      ? 'উইশলিস্টে সেভ করা আছে'
                      : 'Saved in your wishlist'
                    : language === 'bn'
                    ? 'উইশলিস্টে সেভ করুন'
                    : 'Add to wishlist'}
                </span>
              </button>
            </div>

            {/* Verified Customer Reviews Section */}
            <div className="space-y-4 pt-6 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-[#dfb76c] fill-[#dfb76c]" />
                  <h4 className="text-sm font-bold text-white">
                    {language === 'bn' ? 'কাস্টমার রিভিউ ও রেটিং' : 'Customer Reviews & Ratings'}
                  </h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#070b14] border border-slate-800 text-[#dfb76c] font-bold">
                    {productReviews.length}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{language === 'bn' ? '১০০% ভেরিফাইড' : 'Verified Buyers Only'}</span>
                </div>
              </div>

              {/* Review Submission Form - ONLY for customers with a received order of this product */}
              {eligibleOrder && !reviewSuccess && (
                <form
                  onSubmit={handleReviewSubmit}
                  className="p-4 rounded-2xl bg-[#070b14] border border-slate-800/80 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#dfb76c] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#dfb76c]" />
                      {language === 'bn'
                        ? 'আপনি পণ্যটি ডেলিভারি পেয়েছেন! আপনার অভিজ্ঞতা জানান:'
                        : 'You received this order! Share your experience:'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Order #{eligibleOrder.id.slice(-6).toUpperCase()}
                    </span>
                  </div>

                  {/* Star rating selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-300 mr-1">
                      {language === 'bn' ? 'রেটিং:' : 'Rating:'}
                    </span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1 text-[#dfb76c] hover:scale-125 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= reviewRating ? 'fill-[#dfb76c] text-[#dfb76c]' : 'text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-[#dfb76c] ml-2">
                      {reviewRating} / 5
                    </span>
                  </div>

                  {/* Comment input */}
                  <textarea
                    rows={2}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder={
                      language === 'bn'
                        ? 'পণ্যটির মান, ফিটিং ও ফিনিশিং সম্পর্কে আপনার বাস্তব মতামত লিখুন...'
                        : 'Write your honest review about quality, fitting and finishing...'
                    }
                    className="w-full p-2.5 bg-[#050811] rounded-xl border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#dfb76c]/60"
                  />

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-4 py-2 rounded-xl gold-gradient-btn border border-[#dfb76c]/40 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {isSubmittingReview
                        ? language === 'bn'
                          ? 'সাবমিট হচ্ছে...'
                          : 'Submitting...'
                        : language === 'bn'
                        ? 'রিভিউ পোস্ট করুন'
                        : 'Submit Verified Review'}
                    </span>
                  </button>
                </form>
              )}

              {reviewSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    {language === 'bn'
                      ? 'ধন্যবাদ! আপনার মূল্যবান রিভিউটি সফলভাবে প্রকাশিত হয়েছে।'
                      : 'Thank you! Your verified review has been published.'}
                  </span>
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {productReviews.length === 0 ? (
                  <div className="p-4 rounded-xl bg-[#080d17] border border-slate-800 text-center">
                    <p className="text-xs text-slate-400">
                      {language === 'bn'
                        ? 'এই প্রোডাক্টে এখনো কোনো রিভিউ জমা পড়েনি। শুধুমাত্র পণ্যটি রিসিভ করা ভেরিফাইড ক্রেতারা রিভিউ প্রদান করতে পারেন।'
                        : 'No reviews yet for this product. Only verified customers who received this item can write reviews.'}
                    </p>
                  </div>
                ) : (
                  productReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-3 rounded-xl bg-[#080d17] border border-slate-800/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#dfb76c]/20 text-[#dfb76c] font-bold text-xs flex items-center justify-center border border-[#dfb76c]/30">
                            {rev.userName ? rev.userName[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-200 block leading-tight">
                              {rev.userName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(rev.createdAt).toLocaleDateString(
                                language === 'bn' ? 'bn-BD' : 'en-US'
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <Check className="w-2.5 h-2.5" />
                            {language === 'bn' ? 'ভেরিফাইড বায়ার' : 'Verified'}
                          </span>
                          <div className="flex text-[#dfb76c]">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${
                                  s <= rev.rating ? 'fill-[#dfb76c]' : 'text-slate-600'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed pl-8">
                        {rev.comment}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
