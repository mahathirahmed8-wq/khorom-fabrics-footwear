import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { isAuthorizedAdmin } from '../types';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Sparkles,
  Award,
  Flame,
  Gift,
  Coins,
  Package,
  CheckCircle2,
} from 'lucide-react';

interface BannerProps {
  onExploreClick: () => void;
  onSelectHotDeals?: () => void;
}

export const Banner: React.FC<BannerProps> = ({ onExploreClick, onSelectHotDeals }) => {
  const {
    language,
    formatPrice,
    customization,
    products,
    offers,
    userCoins,
    coinSettings,
    orders,
    currentUser,
    appliedOffer,
    setIsOffersModalOpen,
    setIsCoinHistoryModalOpen,
    setIsOrderTrackingOpen,
    setIsAuthModalOpen,
    claimDailyCoins,
    isDailyClaimedToday,
  } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  const handleDailyClaim = async () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    if (isDailyClaimedToday) return;
    setIsClaiming(true);
    try {
      await claimDailyCoins();
    } finally {
      setIsClaiming(false);
    }
  };

  // Real Dynamic Counts for Mobile Action Cards
  const hotDealsCount = products.filter(
    (p) =>
      (p.isHotDeal || p.hotDeal) &&
      p.published !== false &&
      p.status !== 'draft' &&
      p.status !== 'disabled'
  ).length;

  const activeOffersCount = offers.filter((o) => o.status === 'active').length;

  const userOrders = currentUser
    ? isAuthorizedAdmin(currentUser.email)
      ? orders
      : orders.filter(
          (o) =>
            o.userId === currentUser.id ||
            o.userEmail?.toLowerCase() === currentUser.email?.toLowerCase() ||
            o.customer?.email?.toLowerCase() === currentUser.email?.toLowerCase()
        )
    : [];

  const activeOrdersCount = userOrders.filter((o) =>
    ['processing', 'confirmed', 'shipped'].includes(o.status)
  ).length;

  const coinValueBdt = (userCoins * (coinSettings.valuePerCoin || 0.01)).toFixed(0);

  const slides = [
    {
      id: 1,
      badgeBn: customization.heroBadgeBn,
      badgeEn: customization.heroBadgeEn,
      titleBn: customization.heroTitleBn,
      titleEn: customization.heroTitleEn,
      subtitleBn: customization.heroSubtitleBn,
      subtitleEn: customization.heroSubtitleEn,
      highlightPrice: customization.heroHighlightPrice,
      originalPrice: customization.heroOriginalPrice,
      image: customization.heroImage,
      tagBn: customization.heroTagBn,
      tagEn: customization.heroTagEn,
      bgGradient: 'from-[#0d1b2a] via-[#1b263b] to-[#0f172a]',
    },
    {
      id: 2,
      badgeBn: 'জেন্টস ফ্যাব্রিক ও ক্লথিং',
      badgeEn: 'EXCLUSIVE GENTS APPAREL',
      titleBn: 'রয়্যাল কটন পাঞ্জাবি ও ফর্মাল ড্রেস শার্ট',
      titleEn: 'Royal Cotton Panjabi & Tailored Formal Shirts',
      subtitleBn: '১০০% আরামদায়ক সুতি কাপড়, মার্জিত কলার কাজ ও নিখুঁত ফিটিংয়ে পুরুষদের আভিজাত্য।',
      subtitleEn: 'Finest combed cotton panjabis, luxury dress shirts, and stretch comfort chino trousers.',
      highlightPrice: 2650,
      originalPrice: 3200,
      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80',
      tagBn: '১০০% কটন ফ্যাব্রিক',
      tagEn: '100% Pure Cotton',
      bgGradient: 'from-[#1c1917] via-[#292524] to-[#0c0a09]',
    },
    {
      id: 3,
      badgeBn: 'জেন্টস সিগনেচার এক্সেসরিজ',
      badgeEn: 'MENS REFINED ACCESSORIES',
      titleBn: 'লাক্সারি ক্রনোগ্রাফ ঘড়ি, সানগ্লাস ও মানিব্যাগ',
      titleEn: 'Chronograph Watches, Polarized Shades & Wallets',
      subtitleBn: 'আপনার আউটফিটে যোগ করুন পূর্ণাঙ্গ আভিজাত্য—আরএফআইডি লেদার ওয়ালেট ও ইউভি৪০০ সানগ্লাস।',
      subtitleEn: 'Precision Japanese movement watches, UV400 aviator sunglasses, and RFID-blocking leather wallets.',
      highlightPrice: 1450,
      originalPrice: 1950,
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
      tagBn: 'প্রিমিয়াম কোয়ালিটি',
      tagEn: 'Premium Quality',
      bgGradient: 'from-[#0b132b] via-[#1c2541] to-[#0f172a]',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // swipe left -> next slide
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      } else {
        // swipe right -> previous slide
        setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
      }
    }
    setTouchStartX(null);
  };

  const slide = slides[currentSlide];

  return (
    <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-1.5 sm:py-4">
      {/* Hero Slider Box - Compact on mobile */}
      <div
        id="hero-banner-container"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`relative overflow-hidden rounded-xl sm:rounded-3xl bg-gradient-to-r ${slide.bgGradient} text-white shadow-lg transition-all duration-700 border border-slate-800/80`}
      >
        <div className="flex items-center justify-between gap-2 sm:gap-3 p-2.5 sm:p-6 md:p-8 min-h-[110px] sm:min-h-[220px] md:min-h-[280px] relative z-10">
          {/* Left Text Column */}
          <div className="flex-1 space-y-1 sm:space-y-3 min-w-0 pr-1">
            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#dfb76c]/10 backdrop-blur-md border border-[#dfb76c]/30 text-[9px] sm:text-xs font-semibold text-[#dfb76c]">
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#dfb76c] shrink-0" />
              <span className="truncate">{language === 'bn' ? slide.badgeBn : slide.badgeEn}</span>
            </div>

            <h1 className="text-[13px] sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-tight font-serif text-[#faf8f5] line-clamp-2">
              {language === 'bn' ? slide.titleBn : slide.titleEn}
            </h1>

            <p className="hidden sm:block text-xs sm:text-sm text-slate-300 max-w-xl font-normal leading-relaxed line-clamp-2">
              {language === 'bn' ? slide.subtitleBn : slide.subtitleEn}
            </p>

            <div className="pt-0.5 sm:pt-1.5 flex flex-wrap items-center gap-1.5 sm:gap-3">
              <button
                id="hero-cta-btn"
                onClick={onExploreClick}
                className="px-2 py-1 sm:px-3.5 sm:py-2 rounded-md bg-[#C6A15B] hover:bg-[#B8924A] text-[#0B1F33] font-bold text-[9px] sm:text-xs uppercase tracking-wider shadow-xs flex items-center gap-1 cursor-pointer group border border-[#C6A15B] transition-all"
              >
                <span>
                  {language === 'bn'
                    ? (customization.heroCtaBn || 'কালেকশন দেখুন')
                    : (customization.heroCtaEn || 'Explore')}
                </span>
                <ArrowRight className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>

              <div className="flex items-baseline gap-1 sm:gap-2 bg-black/40 px-1.5 py-0.5 sm:px-3 sm:py-1.5 rounded-md sm:rounded-xl backdrop-blur-xs border border-white/10">
                <span className="hidden sm:inline text-[11px] text-slate-300 font-medium">
                  {language === 'bn' ? 'অফার:' : 'Offer:'}
                </span>
                <span className="text-[11px] sm:text-base font-black text-[#dfb76c]">
                  {formatPrice(slide.highlightPrice)}
                </span>
                <span className="text-[9px] sm:text-xs text-slate-400 line-through">
                  {formatPrice(slide.originalPrice)}
                </span>
              </div>
            </div>
          </div>

          {/* Right Product Spotlight Image */}
          <div className="shrink-0 flex items-center justify-center">
            <div className="relative w-16 h-16 sm:w-36 sm:h-36 md:w-52 md:h-52 rounded-lg sm:rounded-2xl overflow-hidden shadow-md border border-[#dfb76c]/30 bg-slate-900 group">
              <img
                src={slide.image}
                alt="Khorom Gents Collection"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="eager"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="hidden sm:flex absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-medium text-white justify-between items-center border border-white/10">
                <div className="flex items-center gap-1 text-[#dfb76c] truncate">
                  <Award className="w-3 h-3 text-[#dfb76c] shrink-0" />
                  <span className="truncate">{language === 'bn' ? slide.tagBn : slide.tagEn}</span>
                </div>
                <span className="text-[#dfb76c] font-bold shrink-0">
                  {language === 'bn' ? 'অরিজিনাল' : '100% Original'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel controls */}
        <div className="absolute bottom-1.5 sm:bottom-3 right-2 sm:right-5 flex items-center gap-1 sm:gap-2 z-20">
          <button
            id="prev-slide-btn"
            onClick={() => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
            className="w-4 h-4 sm:w-7 sm:h-7 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-colors cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
          </button>
          <div className="flex gap-1 px-0.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1 rounded-full transition-all cursor-pointer ${
                  i === currentSlide ? 'w-3 sm:w-6 bg-[#dfb76c]' : 'w-1 sm:w-2 bg-white/40'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
          <button
            id="next-slide-btn"
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="w-4 h-4 sm:w-7 sm:h-7 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-colors cursor-pointer"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>
      </div>

      {/* 🎁 Daily Claim Reward Banner - Clean, High Engagement, Compact */}
      <div className="mt-2 bg-gradient-to-r from-amber-500/10 via-yellow-500/15 to-amber-500/10 border border-amber-500/30 rounded-xl sm:rounded-2xl px-2.5 py-1.5 sm:p-3 flex items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-400">
            <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] sm:text-sm font-bold text-[#faf8f5] truncate">
              {language === 'bn' ? 'দৈনিক ১০০ খড়ম কয়েন ফ্রি রিওয়ার্ড' : 'Daily 100 KHOROM Coins Free Reward'}
            </p>
            <p className="hidden sm:block text-[11px] text-amber-300/80 truncate">
              {language === 'bn' ? 'প্রতিদিন ফ্রি ক্লেইম করুন এবং কেনাকাটায় ছাড় পান' : 'Claim free coins once every 24 hours'}
            </p>
          </div>
        </div>
        <button
          onClick={handleDailyClaim}
          disabled={isClaiming || isDailyClaimedToday}
          className={`shrink-0 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
            isDailyClaimedToday
              ? 'bg-[#0B1F33]/20 text-[#6B655B] border border-[#DCD6C9] cursor-not-allowed'
              : 'bg-[#C6A15B] hover:bg-[#B8924A] text-[#0B1F33] border border-[#C6A15B] shadow-xs'
          }`}
        >
          {isDailyClaimedToday ? (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>{language === 'bn' ? 'আজকের ক্লেইমড' : 'Claimed'}</span>
            </>
          ) : (
            <>
              <Gift className="w-3 h-3" />
              <span>{isClaiming ? (language === 'bn' ? '...' : '...') : (language === 'bn' ? '১০০ কয়েন নিন' : 'Claim 100')}</span>
            </>
          )}
        </button>
      </div>

      {/* Real Functional Quick Action Cards (4-Column compact on mobile, rich on desktop) */}
      <div id="quick-action-cards" className="grid grid-cols-4 gap-1.5 sm:gap-3.5 mt-2 sm:mt-3">
        {/* 1. 🔥 HOT DEALS */}
        <button
          id="quick-card-hotdeals"
          type="button"
          onClick={() => (onSelectHotDeals ? onSelectHotDeals() : onExploreClick())}
          className="bg-[#0a0f1d] hover:bg-[#0e162a] p-1.5 sm:p-3.5 rounded-lg sm:rounded-2xl border border-amber-500/25 hover:border-amber-500/50 active:scale-[0.98] transition-all text-left shadow-xs flex flex-col justify-between cursor-pointer group"
        >
          <div className="flex items-center justify-between w-full mb-1 sm:mb-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 fill-amber-400/20" />
            </div>
            <span className="text-[8px] sm:text-[10px] font-black px-1 sm:px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 whitespace-nowrap">
              {hotDealsCount > 0 ? (language === 'bn' ? `${hotDealsCount} ডিল` : `${hotDealsCount}`) : 'Hot'}
            </span>
          </div>
          <div className="min-w-0">
            <h4 className="text-[10px] sm:text-xs md:text-sm font-bold text-[#faf8f5] truncate flex items-center gap-0.5 sm:gap-1 font-serif">
              <span>{language === 'bn' ? 'হট ডিল' : 'Hot Deals'}</span>
              <ChevronRight className="w-3 h-3 text-amber-400 shrink-0 opacity-70 group-hover:translate-x-1 transition-transform hidden sm:inline" />
            </h4>
            <p className="hidden sm:block text-[9px] sm:text-[11px] text-slate-400 font-medium truncate mt-0.5">
              {language === 'bn' ? 'সেরা অফারের পণ্য সমূহ' : 'Special discounts'}
            </p>
          </div>
        </button>

        {/* 2. 🎁 MY OFFERS */}
        <button
          id="quick-card-offers"
          type="button"
          onClick={() => setIsOffersModalOpen(true)}
          className="bg-[#0a0f1d] hover:bg-[#0e162a] p-1.5 sm:p-3.5 rounded-lg sm:rounded-2xl border border-rose-500/25 hover:border-rose-500/50 active:scale-[0.98] transition-all text-left shadow-xs flex flex-col justify-between cursor-pointer group"
        >
          <div className="flex items-center justify-between w-full mb-1 sm:mb-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-xl bg-gradient-to-br from-rose-500/20 to-amber-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />
            </div>
            <span className="text-[8px] sm:text-[10px] font-black px-1 sm:px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 whitespace-nowrap">
              {appliedOffer
                ? (language === 'bn' ? 'অ্যাক্টিভ' : 'Active')
                : activeOffersCount > 0
                ? (language === 'bn' ? `${activeOffersCount}টি` : `${activeOffersCount}`)
                : (language === 'bn' ? 'অফার' : 'Offers')}
            </span>
          </div>
          <div className="min-w-0">
            <h4 className="text-[10px] sm:text-xs md:text-sm font-bold text-[#faf8f5] truncate flex items-center gap-0.5 sm:gap-1 font-serif">
              <span>{language === 'bn' ? 'অফার' : 'Offers'}</span>
              <ChevronRight className="w-3 h-3 text-rose-400 shrink-0 opacity-70 group-hover:translate-x-1 transition-transform hidden sm:inline" />
            </h4>
            <p className="hidden sm:block text-[9px] sm:text-[11px] text-slate-400 font-medium truncate mt-0.5">
              {appliedOffer ? (language === 'bn' ? 'অফার অ্যাপ্লাইড' : 'Offer applied') : (language === 'bn' ? 'কুপন ও ডিসকাউন্ট' : 'Discount deals')}
            </p>
          </div>
        </button>

        {/* 3. 🪙 KHOROM COINS */}
        <button
          id="quick-card-coins"
          type="button"
          onClick={() => (currentUser ? setIsCoinHistoryModalOpen(true) : setIsAuthModalOpen(true))}
          className="bg-[#0a0f1d] hover:bg-[#0e162a] p-1.5 sm:p-3.5 rounded-lg sm:rounded-2xl border border-yellow-500/25 hover:border-yellow-500/50 active:scale-[0.98] transition-all text-left shadow-xs flex flex-col justify-between cursor-pointer group"
        >
          <div className="flex items-center justify-between w-full mb-1 sm:mb-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 text-yellow-400 border border-yellow-500/30 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
            </div>
            <span className="text-[8px] sm:text-[10px] font-black px-1 sm:px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 whitespace-nowrap">
              {currentUser ? `${userCoins}` : (language === 'bn' ? 'লগইন' : 'Login')}
            </span>
          </div>
          <div className="min-w-0">
            <h4 className="text-[10px] sm:text-xs md:text-sm font-bold text-[#faf8f5] truncate flex items-center gap-0.5 sm:gap-1 font-serif">
              <span>{language === 'bn' ? 'খড়ম কয়েন' : 'Khorom Coins'}</span>
              <ChevronRight className="w-3 h-3 text-yellow-400 shrink-0 opacity-70 group-hover:translate-x-1 transition-transform hidden sm:inline" />
            </h4>
            <p className="hidden sm:block text-[9px] sm:text-[11px] text-slate-400 font-medium truncate mt-0.5">
              {currentUser ? `${userCoins} ${language === 'bn' ? 'কয়েন সংগ্রহ' : 'Coins'}` : (language === 'bn' ? 'লগইন করুন' : 'Sign in')}
            </p>
          </div>
        </button>

        {/* 4. 📦 MY ORDERS */}
        <button
          id="quick-card-orders"
          type="button"
          onClick={() => (currentUser ? setIsOrderTrackingOpen(true) : setIsAuthModalOpen(true))}
          className="bg-[#0a0f1d] hover:bg-[#0e162a] p-1.5 sm:p-3.5 rounded-lg sm:rounded-2xl border border-sky-500/25 hover:border-sky-500/50 active:scale-[0.98] transition-all text-left shadow-xs flex flex-col justify-between cursor-pointer group"
        >
          <div className="flex items-center justify-between w-full mb-1 sm:mb-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" />
            </div>
            <span className="text-[8px] sm:text-[10px] font-black px-1 sm:px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 whitespace-nowrap">
              {currentUser
                ? activeOrdersCount > 0
                  ? `${activeOrdersCount}`
                  : `${userOrders.length}`
                : (language === 'bn' ? 'লগইন' : 'Login')}
            </span>
          </div>
          <div className="min-w-0">
            <h4 className="text-[10px] sm:text-xs md:text-sm font-bold text-[#faf8f5] truncate flex items-center gap-0.5 sm:gap-1 font-serif">
              <span>{language === 'bn' ? 'অর্ডার' : 'Orders'}</span>
              <ChevronRight className="w-3 h-3 text-sky-400 shrink-0 opacity-70 group-hover:translate-x-1 transition-transform hidden sm:inline" />
            </h4>
            <p className="hidden sm:block text-[9px] sm:text-[11px] text-slate-400 font-medium truncate mt-0.5">
              {currentUser ? (language === 'bn' ? 'ট্র্যাক করুন' : 'Track orders') : (language === 'bn' ? 'লগইন করুন' : 'Sign in')}
            </p>
          </div>
        </button>
      </div>

      {/* Subtle Trust Ribbon for Desktop */}
      <div className="hidden md:flex items-center justify-between px-3 py-2 mt-2 bg-[#0a0f1d]/60 border border-slate-800/60 rounded-xl text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-[#dfb76c]" />
          <span>{language === 'bn' ? 'দ্রুত ডেলিভারি: দেশজুড়ে ৪৮-৭২ ঘণ্টায়' : 'Fast Delivery: 48-72h across Bangladesh'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#dfb76c]" />
          <span>{language === 'bn' ? '১০০% অরিজিনাল খাঁটি লেদার ও কটন' : '100% Original Handcrafted Goods'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
          <span>{language === 'bn' ? 'সাইজ এক্সচেঞ্জ: ৭ দিনে সহজ পরিবর্তন' : 'Easy 7-Day Size Exchange'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CreditCard className="w-3.5 h-3.5 text-[#dfb76c]" />
          <span>{language === 'bn' ? 'ক্যাশ অন ডেলিভারি সুবিধা' : 'Cash On Delivery Available'}</span>
        </div>
      </div>
    </div>
  );
};


