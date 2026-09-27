import React, { useState, useMemo, useRef } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { PRODUCTS, CATEGORIES } from './data/products';
import { Product } from './types';
import { Header } from './components/Header';
import { Banner } from './components/Banner';
import { FilterSidebar } from './components/FilterSidebar';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { AuthModal } from './components/AuthModal';
import { ResetPasswordModal } from './components/ResetPasswordModal';
import { LogoutConfirmModal } from './components/LogoutConfirmModal';
import { Toast } from './components/Toast';
import { Footer } from './components/Footer';
import { OffersModal } from './components/OffersModal';
import { CoinHistoryModal } from './components/CoinHistoryModal';
import { HomeCategoriesRail } from './components/HomeCategoriesRail';
import { SmartOffersSpotlight } from './components/SmartOffersSpotlight';
import { HomeReviewsSection } from './components/HomeReviewsSection';
import { ExploreCollectionsScreen } from './components/ExploreCollectionsScreen';
import { SmartOffersScreen } from './components/SmartOffersScreen';
import { CategoryIcon } from './components/CategoryIcon';
import { MobileBottomNav, MobileTab } from './components/MobileBottomNav';
import { MobileCategoriesScreen } from './components/MobileCategoriesScreen';
import { MobileWishlistScreen } from './components/MobileWishlistScreen';
import { MobileCartScreen } from './components/MobileCartScreen';
import { MobileAccountScreen } from './components/MobileAccountScreen';
import {
  SlidersHorizontal,
  Grid,
  List,
  Sparkles,
  ArrowUpDown,
  SearchX,
  Footprints,
  Heart,
  X,
  ArrowLeft,
  ChevronRight,
  Layers
} from 'lucide-react';

const StoreContent: React.FC = () => {
  const {
    language,
    selectedProduct,
    setSelectedProduct,
    wishlist,
    products,
    categories,
    customization,
    showToast,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [maxPrice, setMaxPrice] = useState(6000);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [wishlistOnly, setWishlistOnly] = useState(false);
  const [hotDealsOnly, setHotDealsOnly] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('home');
  const [visibleCount, setVisibleCount] = useState(16);
  const [activeScreen, setActiveScreen] = useState<'home' | 'collections' | 'offers'>('home');

  const navigateToScreen = (screen: 'home' | 'collections' | 'offers') => {
    setActiveScreen(screen);
    if (typeof window !== 'undefined' && window.history && window.history.pushState) {
      window.history.pushState({ khoromScreen: screen }, '');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Browser back button support for screens
  React.useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state?.khoromScreen) {
        setActiveScreen(e.state.khoromScreen);
      } else {
        setActiveScreen('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Reset pagination when any filter changes
  React.useEffect(() => {
    setVisibleCount(16);
  }, [selectedCategory, selectedSubcategory, searchQuery, sortBy, hotDealsOnly, wishlistOnly]);

  const productSectionRef = useRef<HTMLDivElement>(null);

  const scrollToProducts = () => {
    productSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectHotDeals = () => {
    setHotDealsOnly(true);
    setWishlistOnly(false);
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setMobileTab('home');
    if (typeof window !== 'undefined' && window.history && window.history.pushState) {
      window.history.pushState({ khoromView: 'hot-deals' }, '');
    }
    scrollToProducts();
  };

  const handleExitHotDeals = () => {
    setHotDealsOnly(false);
    if (typeof window !== 'undefined' && window.history.state?.khoromView === 'hot-deals') {
      window.history.back();
    }
    scrollToProducts();
  };

  // Browser back button support for Hot Deals
  React.useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (hotDealsOnly && e.state?.khoromView !== 'hot-deals') {
        setHotDealsOnly(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [hotDealsOnly]);

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    setSelectedSubcategory('all');
    if (hotDealsOnly) {
      setHotDealsOnly(false);
    }
  };

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setMaxPrice(6000);
    setMinRating(0);
    setInStockOnly(false);
    setOnSaleOnly(false);
    setSearchQuery('');
    setWishlistOnly(false);
    setHotDealsOnly(false);
  };

  // Mobile Bottom Navigation Tab Switcher
  const handleTabChange = (tab: MobileTab) => {
    setMobileTab(tab);
    if (tab === 'home') {
      setIsMobileFilterOpen(false);
      if (hotDealsOnly) {
        setHotDealsOnly(false);
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Find category title from dynamic categories
  const currentCategoryObj = useMemo(() => {
    return categories.find((c) => c.id === selectedCategory);
  }, [categories, selectedCategory]);

  // Filter & Sort Products (Strictly Gents)
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // Visibility: Hide unpublished/draft/disabled products from public storefront
      if (item.published === false || item.status === 'draft' || item.status === 'disabled') {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Subcategory filter
      if (selectedSubcategory !== 'all' && item.subcategory !== selectedSubcategory && item.subcategoryId !== selectedSubcategory) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchBn = item.titleBn.toLowerCase().includes(q) || item.descriptionBn.toLowerCase().includes(q);
        const matchEn = item.titleEn.toLowerCase().includes(q) || item.descriptionEn.toLowerCase().includes(q);
        const matchTag = item.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchBn && !matchEn && !matchTag) return false;
      }

      // Price filter
      if (item.price > maxPrice) {
        return false;
      }

      // Rating filter
      if (minRating > 0 && item.rating < minRating) {
        return false;
      }

      // Stock status
      if (inStockOnly && !item.inStock) {
        return false;
      }

      // Sale status
      if (onSaleOnly && !item.originalPrice) {
        return false;
      }

      // Wishlist filter
      if (wishlistOnly && !wishlist.includes(item.id)) {
        return false;
      }

      // Hot Deals filter
      if (hotDealsOnly && !(item.isHotDeal || item.hotDeal)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      // Default order: strictly respect saved position from database!
      const posA = a.position ?? 9999;
      const posB = b.position ?? 9999;
      if (posA !== posB) return posA - posB;
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [products, selectedCategory, selectedSubcategory, searchQuery, maxPrice, minRating, inStockOnly, onSaleOnly, sortBy, wishlistOnly, wishlist, hotDealsOnly]);

  // Progressive rendering for high-performance DOM and image loading
  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  return (
    <div className="min-h-screen flex flex-col bg-[#050811] text-slate-100 pb-16 md:pb-0">
      {/* Header with Search and Navigation */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={(cat) => {
          handleCategoryChange(cat);
          if (activeScreen !== 'home') setActiveScreen('home');
        }}
        onNavigateHome={() => {
          setHotDealsOnly(false);
          setSelectedCategory('all');
          setSelectedSubcategory('all');
          setActiveScreen('home');
          handleTabChange('home');
        }}
        onNavigateAccount={() => handleTabChange('account')}
        onNavigateCart={() => handleTabChange('cart')}
        onNavigateOffers={() => navigateToScreen('offers')}
        onNavigateCollections={() => navigateToScreen('collections')}
      />

      {/* Screen Routing: Separate Screens for Collections and Smart Offers */}
      {activeScreen === 'collections' ? (
        <ExploreCollectionsScreen
          onBack={() => {
            navigateToScreen('home');
          }}
          onSelectCategory={(catId, subId) => {
            handleCategoryChange(catId);
            if (subId) setSelectedSubcategory(subId);
            navigateToScreen('home');
            setTimeout(scrollToProducts, 100);
          }}
        />
      ) : activeScreen === 'offers' ? (
        <SmartOffersScreen
          onBack={() => {
            navigateToScreen('home');
          }}
          onExploreProducts={() => {
            navigateToScreen('home');
            setTimeout(scrollToProducts, 100);
          }}
          onSelectHotDeals={() => {
            handleSelectHotDeals();
            navigateToScreen('home');
            setTimeout(scrollToProducts, 100);
          }}
        />
      ) : (
        /* Primary Storefront: always visible on desktop; on mobile visible only when mobileTab === 'home' */
        <div className={mobileTab === 'home' ? 'flex flex-col flex-1' : 'hidden md:flex md:flex-col md:flex-1'}>
          {/* Hero Banner Section */}
          <Banner onExploreClick={scrollToProducts} onSelectHotDeals={handleSelectHotDeals} />

          {/* Main Content Area */}
          <main
            ref={productSectionRef}
            id="products-main-section"
            className="flex-1 max-w-7xl w-full mx-auto px-2.5 sm:px-6 lg:px-8 py-3 sm:py-6"
          >
            {/* Compact Categories & Explore Collections (shown when on main all-products view) */}
            {!hotDealsOnly && !wishlistOnly && selectedCategory === 'all' && !searchQuery.trim() && (
              <div className="mb-4 space-y-2.5">
                {/* Compact Categories Row */}
                <div className="flex items-center gap-2 overflow-x-auto slim-scrollbar pb-1.5 pt-0.5">
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    const count = products.filter(
                      (p) =>
                        (cat.id === 'all' ? true : p.category === cat.id) &&
                        p.published !== false &&
                        p.status !== 'draft' &&
                        p.status !== 'disabled'
                    ).length;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          handleCategoryChange(cat.id);
                          scrollToProducts();
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap flex items-center gap-1.5 border transition-all cursor-pointer shrink-0 ${
                          isSelected
                            ? 'bg-[#C6A15B] text-[#060D17] border-[#C6A15B] font-bold shadow-xs'
                            : 'bg-[#0B1F33] hover:bg-[#122B45] text-slate-300 hover:text-white border-[#1B2D42]'
                        }`}
                      >
                        <CategoryIcon iconName={cat.iconName} className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? cat.nameBn : cat.nameEn}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                            isSelected ? 'bg-[#060D17] text-[#C6A15B]' : 'bg-[#060D17] text-slate-400'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Compact Explore Collections Card */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-[#0B1F33] via-[#0E263E] to-[#0B1F33] border border-[#1B2D42] hover:border-[#C6A15B]/50 flex items-center justify-between transition-all shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#C6A15B]/15 border border-[#C6A15B]/30 text-[#C6A15B] flex items-center justify-center">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#FAF8F5] font-serif">
                        {language === 'bn' ? 'এক্সপ্লোর কালেকশনস' : 'Explore Collections'}
                      </h3>
                      <p className="text-[10px] text-slate-400">
                        {language === 'bn'
                          ? `সকল ${categories.length}টি জেন্টস কালেকশন ও সাবক্যাটাগরি দেখুন`
                          : `Browse all ${categories.length} signature categories`}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateToScreen('collections')}
                    className="px-3 py-1.5 rounded-lg bg-[#060D17] hover:bg-[#C6A15B] text-[#C6A15B] hover:text-[#060D17] text-xs font-bold border border-[#C6A15B]/40 transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <span>{language === 'bn' ? 'কালেকশন দেখুন' : 'Explore'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

          {/* Section Heading & Sort/Layout Bar */}
        <div className="mb-3.5 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 bg-[#0a0f1d] p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-800/80 shadow-md">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-xl font-bold text-[#faf8f5] flex items-center gap-1.5 sm:gap-2 font-serif">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#dfb76c]" />
                <span>
                  {hotDealsOnly
                    ? language === 'bn'
                      ? '🔥 এক্সক্লুসিভ হট ডিলস'
                      : '🔥 Exclusive Hot Deals'
                    : wishlistOnly
                    ? language === 'bn'
                      ? 'সংরক্ষিত উইশলিস্ট'
                      : 'Saved Wishlist'
                    : selectedCategory === 'all'
                    ? language === 'bn'
                      ? (customization.sectionTitleBn || 'খড়ম এক্সক্লুসিভ জেন্টস কালেকশন')
                      : (customization.sectionTitleEn || 'Khorom Exclusive Gents Collection')
                    : language === 'bn'
                    ? `নির্বাচিত: ${currentCategoryObj?.nameBn || 'ক্যাটাগরি'}`
                    : `Selected: ${currentCategoryObj?.nameEn || 'Category'}`}
                </span>
              </h2>
              {hotDealsOnly && (
                <button
                  id="exit-hotdeals-btn"
                  onClick={handleExitHotDeals}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all cursor-pointer"
                  title="Exit Hot Deals"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'সব পণ্য' : 'Back'}</span>
                </button>
              )}
              {wishlistOnly && (
                <button
                  id="clear-wishlist-filter-btn"
                  onClick={() => setWishlistOnly(false)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition cursor-pointer"
                  title="Clear wishlist filter"
                >
                  <span>{language === 'bn' ? 'মুছে ফেলুন' : 'Clear'}</span>
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 font-medium">
              {hotDealsOnly
                ? language === 'bn'
                  ? `হট ডিলে মোট ${filteredProducts.length}টি স্পেশাল অফার পাওয়া গেছে`
                  : `Showing ${filteredProducts.length} exclusive hot deal specials`
                : wishlistOnly
                ? language === 'bn'
                  ? `আপনার উইশলিস্টে মোট ${filteredProducts.length}টি পণ্য রয়েছে`
                  : `Showing ${filteredProducts.length} wishlisted items`
                : selectedCategory === 'all' && (customization.sectionSubtitleBn || customization.sectionSubtitleEn)
                ? (language === 'bn' ? customization.sectionSubtitleBn : customization.sectionSubtitleEn)
                : language === 'bn'
                ? `মোট ${filteredProducts.length} টি জেন্টস পণ্য প্রদর্শিত হচ্ছে`
                : `Showing ${filteredProducts.length} premium gents items`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Mobile Filter Toggle Button */}
            <button
              id="mobile-filter-toggle-btn"
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="lg:hidden px-2.5 py-1.5 rounded-lg border border-slate-800 bg-[#070b14] hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#dfb76c]" />
              <span>{language === 'bn' ? 'ফিল্টার' : 'Filter'}</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1 bg-[#070b14] border border-slate-800/80 rounded-lg sm:rounded-xl px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#dfb76c] shrink-0" />
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-none text-slate-200 font-medium focus:outline-none cursor-pointer pr-1 text-xs [&>option]:bg-[#0c1322] [&>option]:text-slate-200"
              >
                <option value="featured">
                  {language === 'bn' ? 'ফিচার্ড (জনপ্রিয়)' : 'Featured First'}
                </option>
                <option value="price-asc">
                  {language === 'bn' ? 'দাম: কম থেকে বেশি' : 'Price: Low to High'}
                </option>
                <option value="price-desc">
                  {language === 'bn' ? 'দাম: বেশি থেকে কম' : 'Price: High to Low'}
                </option>
                <option value="rating">
                  {language === 'bn' ? 'সর্বোচ্চ রেটিং' : 'Customer Rating'}
                </option>
              </select>
            </div>

            {/* View Mode Grid/List toggle */}
            <div className="hidden sm:flex items-center bg-[#070b14] p-0.5 rounded-xl border border-slate-800/80">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'gold-gradient-btn text-slate-950 font-bold shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'gold-gradient-btn text-slate-950 font-bold shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Subcategories Horizontal Bar (When a specific category with subcategories is selected) */}
        {!hotDealsOnly && !wishlistOnly && selectedCategory !== 'all' && currentCategoryObj?.subcategories && currentCategoryObj.subcategories.length > 0 && (
          <div className="mb-4 bg-[#0a0f1d] p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-800/80 shadow-sm">
            <div className="flex items-center gap-2 overflow-x-auto slim-scrollbar py-0.5">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1 pr-2 shrink-0 border-r border-slate-800">
                <Layers className="w-3.5 h-3.5 text-[#dfb76c]" />
                <span>{language === 'bn' ? 'সাব-ক্যাটাগরি:' : 'Subcategories:'}</span>
              </div>
              <button
                onClick={() => setSelectedSubcategory('all')}
                className={`px-3 py-1 rounded-lg sm:rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  selectedSubcategory === 'all'
                    ? 'bg-[#dfb76c] text-slate-950 font-bold shadow-xs'
                    : 'bg-[#0e1628] text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {language === 'bn' ? 'সব দেখুন' : 'All Items'}
                <span className="ml-1.5 opacity-75 text-[10px]">
                  ({products.filter((p) => p.category === selectedCategory).length})
                </span>
              </button>
              {currentCategoryObj.subcategories.map((sub) => {
                const isSubSelected = selectedSubcategory === sub.id;
                const count = products.filter(
                  (p) => p.category === selectedCategory && (p.subcategory === sub.id || p.subcategoryId === sub.id)
                ).length;

                return (
                  <button
                    key={sub.id}
                    id={`subcat-pill-${sub.id}`}
                    onClick={() => setSelectedSubcategory(sub.id)}
                    className={`px-3 py-1 rounded-lg sm:rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                      isSubSelected
                        ? 'bg-[#dfb76c] text-slate-950 font-bold shadow-xs'
                        : 'bg-[#0e1628] text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {language === 'bn' ? sub.nameBn : sub.nameEn}
                    <span className="ml-1.5 opacity-75 text-[10px]">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Layout Grid: Sidebar + Products */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <FilterSidebar
              selectedCategory={selectedCategory}
              setSelectedCategory={handleCategoryChange}
              selectedSubcategory={selectedSubcategory}
              setSelectedSubcategory={setSelectedSubcategory}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              minRating={minRating}
              setMinRating={setMinRating}
              inStockOnly={inStockOnly}
              setInStockOnly={setInStockOnly}
              onSaleOnly={onSaleOnly}
              setOnSaleOnly={setOnSaleOnly}
              resetFilters={resetFilters}
            />
          </div>

          {/* Mobile Filter Collapsible Area */}
          {isMobileFilterOpen && (
            <div className="lg:hidden col-span-1 mb-3">
              <FilterSidebar
                selectedCategory={selectedCategory}
                setSelectedCategory={handleCategoryChange}
                selectedSubcategory={selectedSubcategory}
                setSelectedSubcategory={setSelectedSubcategory}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                minRating={minRating}
                setMinRating={setMinRating}
                inStockOnly={inStockOnly}
                setInStockOnly={setInStockOnly}
                onSaleOnly={onSaleOnly}
                setOnSaleOnly={setOnSaleOnly}
                resetFilters={resetFilters}
              />
            </div>
          )}

          {/* Product Items Area */}
          <div className="col-span-1 lg:col-span-9">
            {filteredProducts.length === 0 ? (
              <div className="bg-[#0a0f1d] rounded-2xl sm:rounded-3xl border border-slate-800/80 p-8 sm:p-12 text-center space-y-3 sm:space-y-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-[#dfb76c]/10 text-[#dfb76c] border border-[#dfb76c]/20 flex items-center justify-center mx-auto">
                  <SearchX className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#faf8f5]">
                    {language === 'bn' ? 'কোনো পণ্য পাওয়া যায়নি' : 'No products found'}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    {language === 'bn'
                      ? 'আপনার সার্চ ফিল্টার বা ক্যাটাগরি পরিবর্তন করে আবার চেষ্টা করুন।'
                      : 'Try modifying your search criteria or resetting filters to see more results.'}
                  </p>
                </div>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl gold-gradient-btn border border-[#dfb76c]/40 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  {language === 'bn' ? 'সকল ফিল্টার রিসেট করুন' : 'Reset All Filters'}
                </button>
              </div>
            ) : (
              <div>
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5'
                      : 'space-y-3 sm:space-y-4'
                  }
                >
                  {displayedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onQuickView={(p) => setSelectedProduct(p)}
                    />
                  ))}
                </div>

                {/* Progressive Loading: Load More button & product counter */}
                {filteredProducts.length > visibleCount && (
                  <div className="mt-8 pt-4 border-t border-slate-800/60 text-center space-y-2">
                    <button
                      id="load-more-products-btn"
                      onClick={() => setVisibleCount((prev) => prev + 16)}
                      className="px-6 py-2.5 rounded-xl bg-[#0d1527] hover:bg-[#152038] border border-[#dfb76c]/40 text-[#dfb76c] hover:text-[#fff] text-xs font-bold transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
                    >
                      <span>{language === 'bn' ? 'আরও পণ্য দেখুন' : 'Load More Products'}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#dfb76c]/20 text-[#dfb76c] font-mono">
                        +{Math.min(16, filteredProducts.length - visibleCount)}
                      </span>
                    </button>
                    <p className="text-[11px] text-slate-400">
                      {language === 'bn'
                        ? `${filteredProducts.length} টির মধ্যে ${displayedProducts.length} টি পণ্য প্রদর্শিত হচ্ছে`
                        : `Showing ${displayedProducts.length} of ${filteredProducts.length} products`}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

            {/* Compact Offers Bar */}
            {!hotDealsOnly && !wishlistOnly && selectedCategory === 'all' && !searchQuery.trim() && (
              <div className="mt-8 mb-4 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#0B1F33] via-[#0E263E] to-[#0B1F33] border border-[#1B2D42] hover:border-[#C6A15B]/50 flex items-center justify-between shadow-md transition-all">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#FAF8F5] font-serif">
                      {language === 'bn' ? 'স্মার্ট অফার ও সিজনাল স্পেশালস' : 'Smart Offers & Seasonal Specials'}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-300">
                      {language === 'bn'
                        ? 'এক্সক্লুসিভ ডিসকাউন্ট ভাউচার ও লিমিটেড হট ডিলস দেখুন'
                        : 'Exclusive vouchers & seasonal special savings'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigateToScreen('offers')}
                  className="px-3.5 py-1.5 rounded-lg gold-gradient-btn text-[#060D17] text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1 transition-all shrink-0"
                >
                  <span>{language === 'bn' ? 'অফার দেখুন' : 'View Offers'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Customer Trust & Verified Reviews Section */}
            {!hotDealsOnly && !wishlistOnly && selectedCategory === 'all' && !searchQuery.trim() && (
              <HomeReviewsSection />
            )}
          </main>

          {/* Footer */}
          <Footer />
        </div>
      )}

      {/* Unique Dedicated Mobile Screens (Strictly hidden on desktop) */}
      <div className="md:hidden flex-1 flex flex-col">
        {mobileTab === 'categories' && (
          <MobileCategoriesScreen
            onSelectCategory={(catId) => {
              setSelectedCategory(catId);
              setMobileTab('home');
              setTimeout(scrollToProducts, 60);
            }}
            onBackToHome={() => handleTabChange('home')}
          />
        )}

        {mobileTab === 'wishlist' && (
          <MobileWishlistScreen
            onBackToHome={() => handleTabChange('home')}
            onExploreProducts={() => handleTabChange('home')}
          />
        )}

        {mobileTab === 'cart' && (
          <MobileCartScreen
            onBackToHome={() => handleTabChange('home')}
            onExploreProducts={() => handleTabChange('home')}
          />
        )}

        {mobileTab === 'account' && (
          <MobileAccountScreen
            onBackToHome={() => handleTabChange('home')}
          />
        )}
      </div>

      {/* Modals & Overlays */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
      <CartDrawer />
      <CheckoutModal />
      <OrderConfirmationModal />
      <OrderTrackingModal />
      <AdminPanelModal />
      <OffersModal />
      <CoinHistoryModal />
      <AuthModal />
      <ResetPasswordModal />
      <LogoutConfirmModal />
      <Toast />

      {/* Safe bottom spacing for mobile content */}
      <div className="h-6 md:hidden pointer-events-none" aria-hidden="true" />

      {/* Mobile Fixed Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={mobileTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <StoreContent />
    </StoreProvider>
  );
}
