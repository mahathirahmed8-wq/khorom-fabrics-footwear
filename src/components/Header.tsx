import React, { useState, useRef, useEffect } from 'react';
import {
  ShoppingBag,
  Heart,
  Search,
  Truck,
  Globe,
  DollarSign,
  Package,
  Layers,
  Shirt,
  Footprints,
  Glasses,
  Watch,
  Wallet,
  LayoutGrid,
  X,
  Sparkles,
  ShieldCheck,
  User,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Coins,
  Tag,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CATEGORIES } from '../data/products';
import { KhoromLogo } from './KhoromLogo';
import { isAuthorizedAdmin } from '../types';
import { formatFacebookLink, formatWhatsAppLink } from '../utils/socialLinks';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onNavigateHome?: () => void;
  onNavigateAccount?: () => void;
  onNavigateCart?: () => void;
  onNavigateOffers?: () => void;
  onNavigateCollections?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onNavigateHome,
  onNavigateAccount,
  onNavigateCart,
  onNavigateOffers,
  onNavigateCollections,
}) => {
  const {
    language,
    toggleLanguage,
    currency,
    toggleCurrency,
    formatPrice,
    cartCount,
    cartSubtotal,
    openCartSecurely,
    wishlist,
    orders,
    setIsOrderTrackingOpen,
    setIsAdminPanelOpen,
    currentUser,
    setIsAuthModalOpen,
    requestLogout,
    customization,
    categories,
    products,
    offers,
    setIsOffersModalOpen,
    userCoins,
    coinSettings,
    setIsCoinHistoryModalOpen,
  } = useStore();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const activeOffersCount = offers.filter((o) => o.status === 'active').length;

  // Mobile Category Slidebar Ref & State
  const mobileCatScrollRef = useRef<HTMLDivElement>(null);
  const [catScrollProgress, setCatScrollProgress] = useState(0);

  const handleMobileCatScroll = () => {
    if (!mobileCatScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = mobileCatScrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      setCatScrollProgress(Math.min(100, Math.max(0, (scrollLeft / maxScroll) * 100)));
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const percent = Number(e.target.value);
    setCatScrollProgress(percent);
    if (mobileCatScrollRef.current) {
      const { scrollWidth, clientWidth } = mobileCatScrollRef.current;
      const maxScroll = scrollWidth - clientWidth;
      mobileCatScrollRef.current.scrollLeft = (percent / 100) * maxScroll;
    }
  };

  const slideCategories = (direction: 'left' | 'right') => {
    if (!mobileCatScrollRef.current) return;
    const offset = direction === 'left' ? -180 : 180;
    mobileCatScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  // Center selected category into view on mobile
  useEffect(() => {
    if (!mobileCatScrollRef.current) return;
    const selectedEl = mobileCatScrollRef.current.querySelector(`#mobile-cat-pill-${selectedCategory}`);
    if (selectedEl && typeof (selectedEl as HTMLElement).scrollIntoView === 'function') {
      (selectedEl as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedCategory]);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shirt':
        return <Shirt className="w-4 h-4 text-sky-400" />;
      case 'Footprints':
        return <Footprints className="w-4 h-4 text-amber-400" />;
      case 'Glasses':
        return <Glasses className="w-4 h-4 text-indigo-400" />;
      case 'Watch':
        return <Watch className="w-4 h-4 text-emerald-400" />;
      case 'Wallet':
        return <Wallet className="w-4 h-4 text-amber-500" />;
      default:
        return <LayoutGrid className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <header className="relative md:sticky md:top-0 z-40 bg-[#070b14]/95 backdrop-blur-md border-b border-slate-800/80 shadow-md text-slate-100">
      {/* Top Announcement Bar (Desktop Only) */}
      <div className="hidden md:block bg-[#050810] text-slate-400 text-xs py-1.5 px-4 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider bg-[#dfb76c]/10 text-[#dfb76c] border border-[#dfb76c]/30">
              {language === 'bn' ? 'খড়ম স্পেশাল' : 'KHOROM BESPOKE'}
            </span>
            <p className="font-normal text-slate-300 truncate text-[11px] sm:text-xs">
              {language === 'bn'
                ? customization.topAnnouncementBn
                : customization.topAnnouncementEn}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {/* Offers Center Trigger */}
            <button
              id="header-offers-btn"
              onClick={() => (onNavigateOffers ? onNavigateOffers() : setIsOffersModalOpen(true))}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#0a0f1d] hover:bg-[#0e1628] text-[#dfb76c] border border-[#dfb76c]/30 hover:border-[#dfb76c]/50 transition-all cursor-pointer font-medium text-[11px]"
              title="Offers Center"
            >
              <Sparkles className="w-3 h-3 text-[#dfb76c] animate-pulse" />
              <span>{language === 'bn' ? 'অফারসমূহ' : 'Offers'}</span>
              {activeOffersCount > 0 && (
                <span className="px-1.5 py-0.2 bg-[#dfb76c] text-slate-950 rounded-full text-[9px] font-black">
                  {activeOffersCount}
                </span>
              )}
            </button>

            {/* Coins Balance Pill (Logged in) */}
            {currentUser && coinSettings.enabled && (
              <button
                id="header-coins-pill-btn"
                onClick={() => setIsCoinHistoryModalOpen(true)}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#0a0f1d] hover:bg-[#0e1628] text-[#dfb76c] border border-[#dfb76c]/30 hover:border-[#dfb76c]/50 transition-all cursor-pointer font-semibold text-[11px]"
                title={language === 'bn' ? 'খড়ম কয়েন হিস্ট্রি দেখুন' : 'View Khorom Coins History'}
              >
                <Coins className="w-3 h-3 text-[#dfb76c]" />
                <span>{userCoins} {language === 'bn' ? 'কয়েন' : 'Coins'}</span>
              </button>
            )}

            {/* User Account / Google Sign-In in Top Bar */}
            {currentUser ? (
              <div className="relative">
                <button
                  id="header-user-badge-btn"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0a0f1d] hover:bg-[#0e1628] text-slate-200 border border-slate-700/70 hover:border-[#dfb76c]/40 transition-all cursor-pointer font-medium text-[11px]"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-4 h-4 rounded-full object-cover border border-[#dfb76c]/80"
                  />
                  <span className="truncate max-w-[110px]">{currentUser.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* Dropdown menu */}
                {isUserMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#0a0f1d] border border-slate-700/80 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                    onMouseLeave={() => setIsUserMenuOpen(false)}
                  >
                    <div className="px-2.5 py-2 border-b border-slate-800">
                      <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-semibold bg-[#dfb76c]/15 text-[#dfb76c] border border-[#dfb76c]/30">
                          {currentUser.role === 'admin' ? 'Store Admin' : 'VIP Member'}
                        </span>
                        {coinSettings.enabled && (
                          <span className="text-[10px] font-bold text-[#dfb76c]">
                            🪙 {userCoins}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsOrderTrackingOpen(true);
                      }}
                      className="w-full mt-1 px-2.5 py-1.5 text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Package className="w-3.5 h-3.5 text-[#dfb76c]" />
                      <span>{language === 'bn' ? 'আমার অর্ডারসমূহ' : 'My Orders'}</span>
                    </button>

                    {coinSettings.enabled && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsCoinHistoryModalOpen(true);
                        }}
                        className="w-full px-2.5 py-1.5 text-left text-xs text-[#dfb76c] hover:bg-[#dfb76c]/10 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Coins className="w-3.5 h-3.5 text-[#dfb76c]" />
                        <span>{language === 'bn' ? 'খড়ম কয়েন হিস্ট্রি' : 'Coins History'}</span>
                      </button>
                    )}

                    {isAuthorizedAdmin(currentUser.email) && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsAdminPanelOpen(true);
                        }}
                        className="w-full px-2.5 py-1.5 text-left text-xs text-[#dfb76c] hover:bg-[#dfb76c]/10 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-[#dfb76c]" />
                        <span>{language === 'bn' ? 'অ্যাডমিন প্যানেল' : 'Admin Panel'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        requestLogout();
                      }}
                      className="w-full mt-1 pt-1 border-t border-slate-800 px-2.5 py-1.5 text-left text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'লগআউট' : 'Sign Out'}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="header-top-login-btn"
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0a0f1d] hover:bg-[#0e1628] text-slate-200 hover:text-white border border-slate-700/80 hover:border-[#dfb76c]/50 text-xs font-semibold transition-all cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-[#dfb76c]" />
                <span>{language === 'bn' ? 'লগইন / সাইন ইন' : 'Sign In'}</span>
              </button>
            )}

            {/* Orders Tracking */}
            <button
              id="header-orders-btn"
              onClick={() => setIsOrderTrackingOpen(true)}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer text-[11px]"
            >
              <Package className="w-3.5 h-3.5 text-slate-400 hover:text-[#dfb76c]" />
              <span>
                {language === 'bn' ? 'আমার অর্ডার' : 'My Orders'}
                {orders.length > 0 && ` (${orders.length})`}
              </span>
            </button>

            {/* Admin Panel Button - Strictly visible ONLY if authorized admin */}
            {isAuthorizedAdmin(currentUser?.email) && (
              <button
                id="header-admin-panel-btn"
                onClick={() => setIsAdminPanelOpen(true)}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#0a0f1d] hover:bg-[#0e1628] text-[#dfb76c] hover:text-white border border-[#dfb76c]/30 hover:border-[#dfb76c]/60 transition-all cursor-pointer font-medium text-[11px]"
                title="Admin Panel"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#dfb76c]" />
                <span>{language === 'bn' ? 'অ্যাডমিন প্যানেল' : 'Admin Panel'}</span>
              </button>
            )}

            <span className="text-slate-800">|</span>

            {/* Currency Toggle */}
            <button
              id="currency-toggle-btn"
              onClick={toggleCurrency}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-800/60 text-slate-300 hover:text-white font-medium transition-colors cursor-pointer text-[11px]"
              title="Change Currency"
            >
              <DollarSign className="w-3 h-3 text-[#dfb76c]" />
              <span>{currency}</span>
            </button>

            <span className="text-slate-800">|</span>

            {/* Language Switcher */}
            <button
              id="lang-toggle-btn"
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-medium transition-colors cursor-pointer text-[11px]"
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>{language === 'bn' ? 'EN' : 'বাংলা'}</span>
            </button>

            <span className="text-slate-800">|</span>

            {/* Social Links */}
            <div className="flex items-center gap-1.5 ml-0.5">
              {(customization.enableFacebookIcon ?? true) && (
                <a
                  href={formatFacebookLink(customization.facebookUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-5 h-5 rounded-full bg-[#0B1F33] hover:bg-[#1877F2] border border-slate-700/70 hover:border-transparent text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
                  title="Facebook"
                >
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              )}

              {(customization.enableWhatsappIcon ?? true) && (
                <a
                  href={formatWhatsAppLink(customization.whatsappUrl || customization.whatsappNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-5 h-5 rounded-full bg-[#0B1F33] hover:bg-[#25D366] border border-slate-700/70 hover:border-transparent text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
                  title="WhatsApp"
                >
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar (Desktop Only) */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Khorom Brand Logo with light text */}
          <div
            id="brand-logo"
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              if (onNavigateHome) onNavigateHome();
            }}
            className="cursor-pointer transition-opacity hover:opacity-95"
          >
            <KhoromLogo size="md" textColor="light" />
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  language === 'bn'
                    ? 'জেন্টস আইটেম খুঁজুন (পাঞ্জাবি, শার্ট, লোফার, সানগ্লাস, ঘড়ি, মানিব্যাগ...)'
                    : 'Search gents collection (panjabi, dress shirt, loafers, sunglasses, watch...)'
                }
                className="w-full pl-10 pr-10 py-2 bg-[#0a0f1d] hover:bg-[#0e1628] focus:bg-[#0e1628] text-[#faf8f5] placeholder-slate-400 text-xs sm:text-sm rounded-xl border border-slate-700/70 focus:border-[#dfb76c] focus:outline-none focus:ring-1 focus:ring-[#dfb76c]/30 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  id="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Actions: Auth, Wishlist & Cart */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Google / Account Button in Main Nav */}
            <button
              id="main-nav-auth-btn"
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0a0f1d] hover:bg-[#0e1628] border border-slate-700/70 hover:border-[#dfb76c]/50 text-slate-200 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
              title={currentUser ? currentUser.name : 'Sign In'}
            >
              {currentUser ? (
                <>
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-5 h-5 rounded-full object-cover border border-[#dfb76c]"
                  />
                  <span className="truncate max-w-[90px]">
                    {currentUser.name.split(' ')[0]}
                  </span>
                </>
              ) : (
                <>
                  <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center p-0.5 shadow-xs">
                    <svg className="w-full h-full" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  </div>
                  <span>{language === 'bn' ? 'লগইন' : 'Sign In'}</span>
                </>
              )}
            </button>

            {/* Offers Center Quick Button */}
            <button
              id="main-nav-offers-btn"
              onClick={() => (onNavigateOffers ? onNavigateOffers() : setIsOffersModalOpen(true))}
              className="p-2 sm:p-2.5 rounded-xl border border-slate-700/70 hover:border-[#dfb76c]/50 bg-[#0a0f1d] hover:bg-[#0e1628] text-[#dfb76c] hover:text-[#ebd299] transition-colors relative cursor-pointer"
              title={language === 'bn' ? 'স্পেশাল অফারসমূহ' : 'Special Offers'}
            >
              <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-[#dfb76c]" />
              {activeOffersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-gradient-to-r from-[#dfb76c] to-[#c59e4b] text-slate-950 text-[9px] sm:text-[10px] font-black flex items-center justify-center shadow-xs">
                  {activeOffersCount}
                </span>
              )}
            </button>

            {/* Wishlist button */}
            <button
              id="wishlist-btn"
              onClick={() => {
                // Keep existing behavior
              }}
              className="p-2 sm:p-2.5 rounded-xl border border-slate-700/70 hover:border-slate-600 bg-[#0a0f1d] hover:bg-[#0e1628] text-slate-300 transition-colors relative cursor-pointer"
              title="Wishlist"
            >
              <Heart
                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  wishlist.length > 0 ? 'text-rose-500 fill-rose-500' : 'text-slate-400'
                }`}
              />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-rose-500 text-white text-[9px] sm:text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Trigger Button */}
            <button
              id="open-cart-btn"
              onClick={openCartSecurely}
              className="flex items-center gap-2 sm:gap-2.5 pl-3 sm:pl-3.5 pr-3.5 sm:pr-4 py-2 rounded-xl gold-gradient-btn font-black shadow-md cursor-pointer group border border-[#dfb76c]/40"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 transition-transform group-hover:scale-105" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-4.5 h-4.5 rounded-full bg-slate-950 text-[#dfb76c] text-[10px] font-black flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="text-left leading-tight">
                <div className="text-[9px] uppercase font-bold text-slate-900 tracking-wider">
                  {language === 'bn' ? 'আমার কার্ট' : 'My Cart'}
                </div>
                <div className="text-xs font-black text-slate-950">
                  {cartSubtotal > 0 ? formatPrice(cartSubtotal) : language === 'bn' ? '৳০' : '$0.00'}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Dynamic Category Navigation Bar (Desktop) */}
        <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center gap-1.5 sm:gap-2 overflow-x-auto slim-scrollbar scroll-smooth pb-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const dynamicCount =
              cat.id === 'all'
                ? products.length
                : products.filter((p) => p.category === cat.id).length;

            return (
              <button
                key={cat.id}
                id={`cat-btn-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#dfb76c] to-[#c59e4b] text-slate-950 shadow-sm border border-[#dfb76c] font-bold'
                    : 'bg-[#0a0f1d] hover:bg-[#0e1628] text-slate-300 border border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <span className="scale-90 sm:scale-95">{getCategoryIcon(cat.iconName)}</span>
                <span>{language === 'bn' ? cat.nameBn : cat.nameEn}</span>
                <span
                  className={`text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-slate-950 text-[#dfb76c]' : 'bg-slate-800/80 text-slate-400'
                  }`}
                >
                  {dynamicCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Simplified Mobile Header (Mobile Only - 3 Clean Rows) */}
      <div id="khorom-mobile-header" className="md:hidden">
        {/* Row 1: Logo & Brand on Left, Account & Cart on Right */}
        <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-800/60">
          <div
            id="mobile-header-brand"
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              if (onNavigateHome) onNavigateHome();
            }}
            className="cursor-pointer active:opacity-80 transition-opacity select-none"
          >
            <KhoromLogo size="sm" textColor="light" />
          </div>

          {/* Right Action Icons: Social, Account & Cart */}
          <div className="flex items-center gap-1.5">
            {/* Small Facebook Link */}
            {(customization.enableFacebookIcon ?? true) && (
              <a
                href={formatFacebookLink(customization.facebookUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-xl bg-[#0a0f1d] border border-slate-800 hover:border-blue-500/50 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Facebook"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            )}

            {/* Small WhatsApp Link */}
            {(customization.enableWhatsappIcon ?? true) && (
              <a
                href={formatWhatsAppLink(customization.whatsappUrl || customization.whatsappNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-xl bg-[#0a0f1d] border border-slate-800 hover:border-emerald-500/50 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="WhatsApp"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </a>
            )}
            {/* Account Icon */}
            <button
              id="mobile-header-account-btn"
              onClick={() => {
                if (onNavigateAccount) {
                  onNavigateAccount();
                } else {
                  setIsAuthModalOpen(true);
                }
              }}
              className="w-9 h-9 rounded-xl bg-[#0a0f1d] border border-slate-800 hover:border-[#dfb76c]/40 text-slate-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Account"
              title={currentUser ? currentUser.name : 'Account'}
            >
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover border border-[#dfb76c]/80"
                />
              ) : (
                <User className="w-4 h-4 text-slate-300" />
              )}
            </button>

            {/* Cart Icon with badge */}
            <button
              id="mobile-header-cart-btn"
              onClick={() => {
                if (onNavigateCart) {
                  onNavigateCart();
                } else {
                  openCartSecurely();
                }
              }}
              className="w-9 h-9 rounded-xl bg-[#0a0f1d] border border-slate-800 hover:border-[#dfb76c]/40 text-slate-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer relative"
              aria-label="Cart"
              title="Cart"
            >
              <ShoppingBag className="w-4 h-4 text-slate-300" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-gradient-to-r from-[#dfb76c] to-[#c59e4b] text-slate-950 text-[9px] font-black flex items-center justify-center shadow-xs">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Row 2: One Clean, Full-Width Search Bar */}
        <div className="px-3.5 pt-2 pb-1.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="mobile-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'bn'
                  ? 'জেন্টস পণ্য খুঁজুন (পাঞ্জাবি, শার্ট, লোফার...)'
                  : 'Search gents collection (panjabi, loafers...)'
              }
              className="w-full pl-9 pr-8 py-2 bg-[#0a0f1d] text-[#faf8f5] placeholder-slate-400 text-xs rounded-xl border border-slate-800/90 focus:outline-none focus:border-[#dfb76c] transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                id="mobile-search-clear-btn"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Row 3: Horizontal Category Strip with Interactive Slidebar */}
        <div className="relative border-b border-slate-800/60 pb-1.5 pt-0.5">
          <div className="relative flex items-center">
            {/* Scroll Left Button */}
            <button
              id="mobile-cat-scroll-left-btn"
              type="button"
              onClick={() => slideCategories('left')}
              className="absolute left-1 z-10 w-6 h-6 rounded-full bg-[#0a0f1d]/90 border border-slate-700/80 text-amber-400 flex items-center justify-center shadow-md active:scale-95 transition-transform"
              aria-label="Scroll categories left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Scrollable Category Pills */}
            <div
              ref={mobileCatScrollRef}
              onScroll={handleMobileCatScroll}
              className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth px-8 py-1 touch-pan-x select-none w-full"
            >
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    id={`mobile-cat-pill-${cat.id}`}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#dfb76c] to-[#c59e4b] text-slate-950 font-bold shadow-xs border border-[#dfb76c]'
                        : 'bg-[#0a0f1d] text-slate-300 border border-slate-800/90 hover:text-white hover:border-slate-700 font-medium'
                    }`}
                  >
                    <span className="scale-90">{getCategoryIcon(cat.iconName)}</span>
                    <span>{language === 'bn' ? cat.nameBn : cat.nameEn}</span>
                  </button>
                );
              })}
            </div>

            {/* Scroll Right Button */}
            <button
              id="mobile-cat-scroll-right-btn"
              type="button"
              onClick={() => slideCategories('right')}
              className="absolute right-1 z-10 w-6 h-6 rounded-full bg-[#0a0f1d]/90 border border-slate-700/80 text-amber-400 flex items-center justify-center shadow-md active:scale-95 transition-transform"
              aria-label="Scroll categories right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mini Interactive Slidebar (Slide to explore categories) */}
          <div className="flex items-center justify-between gap-2 px-6 pt-1">
            <span className="text-[9px] text-slate-500 font-medium shrink-0">
              {language === 'bn' ? 'স্লাইড করুন' : 'Slide'}
            </span>
            <div className="relative flex-1 flex items-center h-2">
              <input
                id="mobile-category-slider-input"
                type="range"
                min="0"
                max="100"
                value={Math.round(catScrollProgress)}
                onChange={handleSliderChange}
                className="w-full h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-[#dfb76c]"
                aria-label="Category scroll slider"
              />
            </div>
            <span className="text-[9px] text-[#dfb76c] font-medium shrink-0">
              {categories.length} {language === 'bn' ? 'টি ক্যাটাগরি' : 'items'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

