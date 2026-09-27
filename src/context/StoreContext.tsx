import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CartItem,
  Category,
  Currency,
  CustomerInfo,
  Language,
  Order,
  PaymentMethod,
  Product,
  ProductReview,
  PromoCode,
  UserProfile,
  UserLoginLog,
  ProductClickStats,
  WebsiteCustomization,
  AdminOverviewStats,
  isAuthorizedAdmin,
  KhoromCoinSettings,
  CoinTransaction,
  CoinStats,
  KhoromOffer,
  OfferStatus,
  FacebookPendingPost,
  DuplicateMatchDetail,
  FacebookPostStatus,
  PathaoCourierSettings,
  UserAddress,
} from '../types';
import { PRODUCTS as INITIAL_PRODUCTS, PROMO_CODES as INITIAL_PROMOS, CATEGORIES as INITIAL_CATEGORIES } from '../data/products';
import { CATEGORIES_DATA } from '../data/categories';
import { DEFAULT_WEBSITE_CUSTOMIZATION } from '../data/settings';
import { INITIAL_FACEBOOK_POSTS } from '../data/initialFacebookPosts';
import { detectDuplicate, parseFacebookCaption } from '../utils/facebookDuplicateDetector';
import { doc, getDoc } from 'firebase/firestore';
import {
  saveOrderToFirestore,
  saveProductToFirestore,
  deleteProductFromFirestore,
  subscribeToProductsFromFirestore,
  fetchProductsFromFirestore,
  seedProductsToFirestore,
  saveUserToFirestore,
  saveSettingsToFirestore,
  fetchSettingsFromFirestore,
  subscribeSettingsFromFirestore,
  savePromoToFirestore,
  deleteCouponFromFirestore,
  saveReviewToFirestore,
  testFirestoreConnection,
  registerWithEmailPassword,
  loginWithEmailPassword,
  resetPasswordEmail,
  logoutFirebaseUser,
  onAuthStateChangedListener,
  db,
  saveCategoryToFirestore,
  deleteCategoryFromFirestore,
  fetchCategoriesFromFirestore,
  subscribeCategoriesFromFirestore,
  subscribeUserOrders,
  subscribeAllOrders,
  saveOfferToFirestore,
  deleteOfferFromFirestore,
  subscribeOffers,
  saveCoinTransactionToFirestore,
  subscribeUserCoinTransactions,
  saveCoinSettingsToFirestore,
  subscribeCoinSettings,
  getAuthHeadersSync,
  getAuthHeaders,
  updateProductPositionsInFirestore,
  saveFacebookPostToFirestore,
  subscribeFacebookPosts,
  updateFacebookPostInFirestore,
  deleteFacebookPostFromFirestore,
} from '../lib/firebase';

export { DEFAULT_WEBSITE_CUSTOMIZATION };

interface StoreContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  toggleCurrency: () => void;
  formatPrice: (priceBdt: number) => string;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, color?: string, size?: string) => void;
  removeFromCart: (productId: string, color?: string, size?: string) => void;
  updateQuantity: (productId: string, deltaOrValue: number, isAbsolute?: boolean, color?: string, size?: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number, color?: string, size?: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  appliedPromo: PromoCode | null;
  applyPromo: (code: string) => Promise<{ success: boolean; message: string }>;
  removePromo: () => void;
  discountAmount: number;
  promoDiscount: number;
  shippingFee: number;
  cartTotal: number;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  orders: Order[];
  placeOrder: (customer: CustomerInfo, paymentMethod: PaymentMethod) => Promise<Order | null>;
  updateOrderStatus: (
    orderId: string,
    status: string,
    paymentStatus?: string,
    cancellationReason?: string,
    note?: string
  ) => Promise<boolean>;
  userAddresses: UserAddress[];
  fetchUserAddresses: () => Promise<void>;
  addUserAddress: (address: Omit<UserAddress, 'id' | 'createdAt'>) => Promise<boolean>;
  setDefaultAddress: (addressId: string) => Promise<boolean>;
  deleteUserAddress: (addressId: string) => Promise<boolean>;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isOrderTrackingOpen: boolean;
  setIsOrderTrackingOpen: (open: boolean) => void;
  isProductModalOpen: boolean;
  setIsProductModalOpen: (open: boolean) => void;
  isAdminPanelOpen: boolean;
  setIsAdminPanelOpen: (open: boolean) => void;
  isResetPasswordOpen: boolean;
  setIsResetPasswordOpen: (open: boolean) => void;
  // Auth state
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  loginWithGoogle: (customAccount?: { name: string; email: string; avatar?: string; role?: 'admin' | 'customer' }) => Promise<{ success: boolean; message?: string }>;
  loginWithEmail: (email: string, name?: string, role?: 'admin' | 'customer') => Promise<void>;
  registerWithPassword: (name: string, email: string, password: string, role?: 'admin' | 'customer') => Promise<{ success: boolean; message?: string }>;
  loginWithPassword: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isLogoutConfirmOpen: boolean;
  setIsLogoutConfirmOpen: (open: boolean) => void;
  requestLogout: () => void;
  confirmLogout: () => Promise<void>;
  cancelLogout: () => void;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  lastCompletedOrder: Order | null;
  setLastCompletedOrder: (order: Order | null) => void;
  toastMessage: string | null;
  showToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning' | string) => void;
  hideToast: () => void;

  // Dynamic Category Management
  categories: Category[];
  addCategory: (newCategory: Omit<Category, 'id'> | Category) => Promise<boolean>;
  updateCategory: (categoryId: string, updated: Partial<Category>) => Promise<boolean>;
  deleteCategory: (categoryId: string) => Promise<boolean>;
  reorderCategories: (orderedCategories: Category[]) => Promise<boolean>;

  // Dynamic Product Management
  products: Product[];
  addProduct: (newProduct: Omit<Product, 'id'> | Product) => Promise<boolean>;
  updateProduct: (productId: string, updated: Partial<Product>) => Promise<boolean>;
  deleteProduct: (productId: string) => Promise<void>;
  toggleProductPublished: (productId: string) => Promise<boolean>;
  saveProductPositions: (positions: { id: string; position: number }[]) => Promise<boolean>;
  resetProductsToDefault: () => Promise<void>;
  toggleHotDeal: (productId: string) => Promise<boolean>;

  // Customer Reviews & Ratings
  reviews: ProductReview[];
  allStoreReviews: any[];
  fetchAllStoreReviews: () => Promise<any[]>;
  submitReview: (orderId: string, productId: string, rating: number, comment: string) => Promise<{ success: boolean; message: string }>;
  fetchProductReviews: (productId: string) => Promise<ProductReview[]>;

  // Direct actions & Auth Guard
  openCartSecurely: () => void;
  openCheckoutSecurely: () => void;
  directBuyNow: (product: Product, quantity?: number, color?: string, size?: string, isPreOrder?: boolean) => void;
  placeWhatsAppOrder: (product: Product, quantity?: number, color?: string, size?: string) => Promise<void>;

  // Best Selling Analytics
  topSellingProducts: { product: Product; soldCount: number; revenue: number }[];
  fetchTopSellingProducts: () => Promise<any[]>;

  // Dynamic Promo Code Management
  promoCodes: PromoCode[];
  addPromoCode: (promo: PromoCode) => Promise<void>;
  deletePromoCode: (code: string) => Promise<void>;

  // Analytics & Real Overview Stats
  userLoginLogs: UserLoginLog[];
  productClickStats: Record<string, ProductClickStats>;
  recordProductClick: (productId: string, type?: 'view' | 'click' | 'like') => void;
  overviewStats: AdminOverviewStats | null;
  refreshOverviewStats: () => Promise<void>;

  // Website Customization & Positions Control
  customization: WebsiteCustomization;
  updateCustomization: (updates: Partial<WebsiteCustomization>) => Promise<void>;
  resetCustomization: () => Promise<void>;

  // KHOROM Coins Loyalty System
  userCoins: number;
  coinTransactions: CoinTransaction[];
  coinSettings: KhoromCoinSettings;
  updateCoinSettings: (settings: Partial<KhoromCoinSettings>) => Promise<boolean>;
  appliedCoins: number;
  applyCoins: (coins: number) => { success: boolean; message: string };
  removeCoins: () => void;
  coinsDiscountAmount: number;
  potentialCoinsToEarn: number;
  coinStats: CoinStats | null;
  fetchCoinStats: () => Promise<void>;
  markOrderReceived: (orderId: string) => Promise<{ success: boolean; message: string }>;
  isCoinHistoryModalOpen: boolean;
  setIsCoinHistoryModalOpen: (open: boolean) => void;
  claimDailyCoins: () => Promise<{ success: boolean; message: string; coins?: number }>;
  isDailyClaimedToday: boolean;
  adjustUserCoins: (userId: string, amount: number, reason: string) => Promise<{ success: boolean; message: string; newBalance?: number }>;
  getAdminHeaders: () => Record<string, string>;
  fetchCoinCustomers: () => Promise<any[]>;
  fetchCoinTransactions: () => Promise<CoinTransaction[]>;

  // Pathao Courier Integration
  courierSettings: PathaoCourierSettings | null;
  fetchCourierSettings: () => Promise<PathaoCourierSettings | null>;
  updateCourierSettings: (settings: Partial<PathaoCourierSettings>) => Promise<boolean>;
  testCourierConnection: (settings?: Partial<PathaoCourierSettings>) => Promise<{ success: boolean; message: string }>;
  dispatchPathaoOrder: (orderId: string, options?: { specialInstruction?: string; weight?: number; storeId?: string }) => Promise<{ success: boolean; message: string; consignmentId?: string }>;
  trackPathaoOrder: (orderId: string) => Promise<any>;

  // Offers Center
  offers: KhoromOffer[];
  appliedOffer: KhoromOffer | null;
  applyOffer: (offer: KhoromOffer) => { success: boolean; message: string };
  removeOffer: () => void;
  offerDiscountAmount: number;
  createOffer: (offer: Partial<KhoromOffer>) => Promise<boolean>;
  updateOffer: (id: string, updates: Partial<KhoromOffer>) => Promise<boolean>;
  deleteOffer: (id: string) => Promise<boolean>;
  duplicateOffer: (id: string) => Promise<boolean>;
  toggleOfferStatus: (id: string, newStatus: OfferStatus) => Promise<boolean>;
  offersStats: any;
  fetchOffersStats: () => Promise<void>;
  isOffersModalOpen: boolean;
  setIsOffersModalOpen: (open: boolean) => void;
  // Facebook Page Integration & Duplicate Detection (STEP 5 & 6)
  facebookPosts: FacebookPendingPost[];
  pendingFacebookPostsCount: number;
  syncFacebookPosts: (options?: { pageId?: string; accessToken?: string }) => Promise<{ count: number; message: string }>;
  addManualFacebookPost: (post: Partial<FacebookPendingPost>) => Promise<{ success: boolean; id?: string; error?: string }>;
  updateFacebookPendingPost: (id: string, updates: Partial<FacebookPendingPost>) => Promise<boolean>;
  publishFacebookPostAsProduct: (postId: string, options?: { forceOverride?: boolean; overrideData?: Partial<Product> }) => Promise<{ success: boolean; product?: Product; error?: string }>;
  rejectFacebookPost: (postId: string, reason?: string) => Promise<boolean>;
  reopenFacebookPost: (postId: string) => Promise<boolean>;
  deleteFacebookPost: (postId: string) => Promise<boolean>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const BDT_TO_USD_RATE = 1 / 120;

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('dokan_lang') as Language) || 'bn';
  });

  const [currency, setCurrency] = useState<Currency>(() => {
    return (localStorage.getItem('dokan_currency') as Currency) || 'BDT';
  });

  // Dynamic Products state with database sync & position preservation
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('khorom_products');
      if (saved) {
        const parsed: Product[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Reject stale localStorage cache if it contains products that have been deleted from INITIAL_PRODUCTS
          const activeIds = new Set(INITIAL_PRODUCTS.map((p) => p.id));
          const hasStale = parsed.some((p) => !activeIds.has(p.id));
          if (!hasStale) {
            return parsed.sort((a, b) => (a.position ?? 9999) - (b.position ?? 9999));
          } else {
            // Clean up stale cache immediately
            localStorage.removeItem('khorom_products');
          }
        }
      }
      return INITIAL_PRODUCTS.map((p, idx) => ({ ...p, position: idx + 1 }));
    } catch {
      return INITIAL_PRODUCTS.map((p, idx) => ({ ...p, position: idx + 1 }));
    }
  });

  // Dynamic Promo Codes state
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(() => {
    try {
      const saved = localStorage.getItem('khorom_promos');
      return saved ? JSON.parse(saved) : INITIAL_PROMOS;
    } catch {
      return INITIAL_PROMOS;
    }
  });

  // Website Customization state
  const [customization, setCustomization] = useState<WebsiteCustomization>(() => {
    try {
      const saved = localStorage.getItem('khorom_site_customization');
      return saved ? { ...DEFAULT_WEBSITE_CUSTOMIZATION, ...JSON.parse(saved) } : DEFAULT_WEBSITE_CUSTOMIZATION;
    } catch {
      return DEFAULT_WEBSITE_CUSTOMIZATION;
    }
  });

  // User Login Logs: Real database session logs (EMPTY initial, NO fake logs!)
  const [userLoginLogs, setUserLoginLogs] = useState<UserLoginLog[]>(() => {
    try {
      const saved = localStorage.getItem('khorom_login_logs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Product Click and View Stats (Real DB tracking)
  const [productClickStats, setProductClickStats] = useState<Record<string, ProductClickStats>>(() => {
    try {
      const saved = localStorage.getItem('khorom_product_clicks');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Real Database Overview Stats
  const [overviewStats, setOverviewStats] = useState<AdminOverviewStats | null>(null);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('dokan_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dokan_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Dynamic Categories state with backend and Firestore sync
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('khorom_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((cat: Category) => {
            const fallback = CATEGORIES_DATA.find((c) => c.id === cat.id);
            const subcategories = Array.isArray(cat.subcategories)
              ? cat.subcategories
              : (fallback?.subcategories || []);
            return {
              ...cat,
              subcategories,
            };
          });
        }
      }
      return CATEGORIES_DATA;
    } catch {
      return CATEGORIES_DATA;
    }
  });

  const [orders, setOrders] = useState<Order[]>([]);

  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [serverDiscountAmount, setServerDiscountAmount] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);

  const isProductModalOpen = !!selectedProduct;
  const setIsProductModalOpen = useCallback((open: boolean) => {
    if (!open) setSelectedProduct(null);
  }, []);

  // Offers Center state
  const [offers, setOffers] = useState<KhoromOffer[]>([]);
  const [appliedOffer, setAppliedOffer] = useState<KhoromOffer | null>(null);
  const [isOffersModalOpen, setIsOffersModalOpen] = useState(false);
  const [offersStats, setOffersStats] = useState<any>(null);

  // KHOROM Coins Loyalty System state
  const [coinSettings, setCoinSettings] = useState<KhoromCoinSettings>({
    enabled: true,
    coinsPer100Bdt: 1,
    valuePerCoin: 0.01,
    minRedeemCoins: 100,
    maxRedeemCoinsPerOrder: 10000,
    maxDiscountPercent: 20,
    awardOnStatus: 'received',
    expiryEnabled: false,
    expiryMonths: 12,
  });
  const [userCoins, setUserCoins] = useState<number>(0);
  const [coinTransactions, setCoinTransactions] = useState<CoinTransaction[]>([]);
  const [appliedCoins, setAppliedCoins] = useState<number>(0);
  const [isCoinHistoryModalOpen, setIsCoinHistoryModalOpen] = useState(false);
  const [coinStats, setCoinStats] = useState<CoinStats | null>(null);

  // Facebook Page Integration (STEP 5 & 6)
  const [facebookPostsRaw, setFacebookPostsRaw] = useState<FacebookPendingPost[]>(() => {
    try {
      const saved = localStorage.getItem('khorom_fb_posts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const map = new Map<string, FacebookPendingPost>();
          for (const item of parsed) {
            if (item && item.id) {
              map.set(item.id, item);
            }
          }
          if (map.size > 0) {
            return Array.from(map.values());
          }
        }
      }
    } catch {}
    return INITIAL_FACEBOOK_POSTS;
  });

  // Calculate duplicate match for all pending Facebook posts against current live store products
  const facebookPosts = React.useMemo(() => {
    const map = new Map<string, FacebookPendingPost>();
    facebookPostsRaw.forEach((post) => {
      if (post && post.id && !map.has(post.id)) {
        map.set(post.id, post);
      }
    });
    const uniquePosts = Array.from(map.values());

    return uniquePosts.map((post) => {
      if (post.status === 'pending') {
        const match = detectDuplicate(post, products);
        return { ...post, duplicateMatch: match };
      }
      return post;
    });
  }, [facebookPostsRaw, products]);

  const pendingFacebookPostsCount = React.useMemo(() => {
    return facebookPosts.filter((p) => p.status === 'pending').length;
  }, [facebookPosts]);

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('khorom_user');
      if (saved) {
        const parsed: UserProfile = JSON.parse(saved);
        const isAdmin = isAuthorizedAdmin(parsed.email);
        return {
          ...parsed,
          role: isAdmin ? 'admin' : 'customer',
          membershipTier: isAdmin ? 'Royal Admin' : (parsed.membershipTier || 'VIP Member'),
        };
      }
      return null;
    } catch {
      return null;
    }
  });

  const hideToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  const showToast = useCallback((msg: string, _type?: string) => {
    setToastMessage(msg);
  }, []);

  // -------------------------------------------------------------
  // DATABASE API FETCHERS
  // -------------------------------------------------------------

  const fetchProducts = useCallback(async () => {
    try {
      // 1. Primary Source of Truth: Firestore
      const firestoreProds = await fetchProductsFromFirestore();
      if (firestoreProds && firestoreProds.length > 0) {
        setProducts(firestoreProds);
        try {
          localStorage.setItem('khorom_products', JSON.stringify(firestoreProds));
        } catch {}
        return;
      }
    } catch (fsErr) {
      console.warn('Firestore fetchProducts notice, trying API:', fsErr);
    }

    // 2. Secondary Backend API Fallback
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data: Product[] = await res.json();
        const sorted = data.sort((a, b) => (a.position ?? 9999) - (b.position ?? 9999));
        setProducts(sorted);
        try {
          localStorage.setItem('khorom_products', JSON.stringify(sorted));
        } catch {}
      }
    } catch (err) {
      console.warn('API /api/products fetch error, keeping current state:', err);
    }
  }, []);

  const fetchPromoCodes = useCallback(async () => {
    try {
      const res = await fetch('/api/coupons');
      if (res.ok) {
        const data: PromoCode[] = await res.json();
        setPromoCodes(data);
        localStorage.setItem('khorom_promos', JSON.stringify(data));
      }
    } catch (err) {
      console.warn('API /api/coupons fetch error:', err);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    // 1. Primary Source of Truth: Firestore
    try {
      const firestoreCats = await fetchCategoriesFromFirestore();
      if (Array.isArray(firestoreCats) && firestoreCats.length > 0) {
        const enriched = firestoreCats.map((cat) => {
          const fallback = CATEGORIES_DATA.find((c) => c.id === cat.id);
          const subcategories = Array.isArray(cat.subcategories)
            ? cat.subcategories
            : (fallback?.subcategories || []);
          return {
            ...cat,
            subcategories,
          };
        });
        setCategories(enriched);
        try {
          localStorage.setItem('khorom_categories', JSON.stringify(enriched));
        } catch {}
        return;
      }
    } catch (fsErr) {
      console.warn('Firestore fetchCategories notice, trying API:', fsErr);
    }

    // 2. Secondary Backend API Fallback
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data: Category[] = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const enriched = data.map((cat) => {
            const fallback = CATEGORIES_DATA.find((c) => c.id === cat.id);
            const subcategories = Array.isArray(cat.subcategories)
              ? cat.subcategories
              : (fallback?.subcategories || []);
            return {
              ...cat,
              subcategories,
            };
          });
          setCategories(enriched);
          try {
            localStorage.setItem('khorom_categories', JSON.stringify(enriched));
          } catch {}
        }
      }
    } catch (err) {
      console.warn('API /api/categories fetch error:', err);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!currentUser) {
      setOrders([]);
      return;
    }
    try {
      const headers = getAuthHeadersSync();
      headers['x-user-id'] = currentUser.id;
      if (currentUser.email) {
        headers['x-user-email'] = currentUser.email;
        if (isAuthorizedAdmin(currentUser.email)) {
          headers['x-admin-email'] = currentUser.email;
        }
      }
      const res = await fetch('/api/orders', { headers });
      if (res.ok) {
        const data: Order[] = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.warn('API /api/orders fetch error:', err);
    }
  }, [currentUser]);

  // Real-time Firestore orders synchronization with role-based access
  useEffect(() => {
    if (!currentUser) {
      setOrders([]);
      return;
    }

    const isAdmin = isAuthorizedAdmin(currentUser.email);
    let unsubscribe: (() => void) | undefined;

    if (isAdmin) {
      unsubscribe = subscribeAllOrders((liveOrders) => {
        if (Array.isArray(liveOrders)) {
          setOrders(liveOrders);
        }
      });
    } else {
      unsubscribe = subscribeUserOrders(currentUser.id, currentUser.email, (userOrders) => {
        if (Array.isArray(userOrders)) {
          setOrders(userOrders);
        }
      });
    }

    fetchOrders();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser, fetchOrders]);

  const fetchCustomization = useCallback(async () => {
    try {
      const [apiRes, firestoreData] = await Promise.allSettled([
        fetch('/api/settings'),
        fetchSettingsFromFirestore(),
      ]);

      let loadedSettings: any = null;

      if (firestoreData.status === 'fulfilled' && firestoreData.value) {
        loadedSettings = firestoreData.value;
      } else if (apiRes.status === 'fulfilled' && apiRes.value.ok) {
        loadedSettings = await apiRes.value.json();
      }

      if (loadedSettings) {
        setCustomization((prev) => {
          const merged: WebsiteCustomization = {
            ...DEFAULT_WEBSITE_CUSTOMIZATION,
            ...prev,
            ...loadedSettings,
            logoSettings: {
              ...DEFAULT_WEBSITE_CUSTOMIZATION.logoSettings,
              ...(prev.logoSettings || {}),
              ...(loadedSettings.logoSettings || {}),
            },
          };
          try {
            localStorage.setItem('khorom_site_customization', JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    } catch (err) {
      console.warn('API /api/settings fetch error:', err);
    }
  }, []);

  const getAdminHeaders = useCallback((): Record<string, string> => {
    const headers = getAuthHeadersSync();
    let email = currentUser?.email;
    if (!email && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('khorom_user');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.email) email = parsed.email;
        }
      } catch {}
    }
    if (email) {
      headers['x-admin-email'] = email;
    }
    return headers;
  }, [currentUser]);

  const fetchOverviewStats = useCallback(async () => {
    try {
      const headers = getAuthHeadersSync();
      if (currentUser?.email) {
        headers['x-admin-email'] = currentUser.email;
      }
      const res = await fetch('/api/stats', { headers });
      if (res.ok) {
        const data: AdminOverviewStats = await res.json();
        setOverviewStats(data);
        if (data.recentLogins) {
          setUserLoginLogs(data.recentLogins);
          localStorage.setItem('khorom_login_logs', JSON.stringify(data.recentLogins));
        }
      }
    } catch (err) {
      console.warn('API /api/stats fetch error:', err);
    }
  }, [currentUser]);

  const fetchOffers = useCallback(async () => {
    try {
      const res = await fetch('/api/offers');
      if (res.ok) {
        const data: KhoromOffer[] = await res.json();
        setOffers(data);
      }
    } catch (err) {
      console.warn('fetchOffers error:', err);
    }
  }, []);

  const fetchOffersStats = useCallback(async () => {
    try {
      const res = await fetch('/api/offers/stats', {
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setOffersStats(data);
      }
    } catch (err) {
      console.warn('fetchOffersStats error:', err);
    }
  }, [getAdminHeaders]);

  const fetchCoinSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/coins/settings');
      if (res.ok) {
        const data: KhoromCoinSettings = await res.json();
        setCoinSettings(data);
      }
    } catch (err) {
      console.warn('fetchCoinSettings error:', err);
    }
  }, []);

  const fetchUserCoins = useCallback(async () => {
    if (!currentUser) {
      setUserCoins(0);
      setCoinTransactions([]);
      return;
    }
    try {
      const res = await fetch('/api/coins/my', {
        headers: {
          'x-user-id': currentUser.id,
          'x-user-email': currentUser.email,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setUserCoins(data.coins ?? 0);
        setCoinTransactions(data.transactions || []);
      }
    } catch (err) {
      console.warn('fetchUserCoins error:', err);
    }
  }, [currentUser]);

  const fetchCoinStats = useCallback(async () => {
    try {
      const res = await fetch('/api/coins/stats', {
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        const data: CoinStats = await res.json();
        setCoinStats(data);
      }
    } catch (err) {
      console.warn('fetchCoinStats error:', err);
    }
  }, [getAdminHeaders]);

  const refreshOverviewStats = useCallback(async () => {
    await Promise.all([
      fetchOverviewStats(),
      fetchOrders(),
      fetchProducts(),
      fetchPromoCodes(),
      fetchCategories(),
      fetchOffers(),
      fetchCoinSettings(),
    ]);
  }, [fetchOverviewStats, fetchOrders, fetchProducts, fetchPromoCodes, fetchCategories, fetchOffers, fetchCoinSettings]);

  // Initial Load from real backend (optimized, non-blocking startup)
  useEffect(() => {
    // Non-blocking background verification of Firestore connection
    setTimeout(() => {
      testFirestoreConnection().catch(() => {});
    }, 1000);

    fetchCategories();
    fetchProducts();
    fetchPromoCodes();
    fetchCustomization();
    fetchOffers();
    fetchCoinSettings();
    fetchAllStoreReviews();

    // Only load orders and admin stats if user is authenticated
    if (currentUser) {
      fetchOrders();
      if (currentUser.email && isAuthorizedAdmin(currentUser.email)) {
        fetchOverviewStats();
      }
    }
  }, [fetchCategories, fetchProducts, fetchPromoCodes, fetchOrders, fetchCustomization, fetchOverviewStats, fetchOffers, fetchCoinSettings, currentUser]);

  // Subscribe to real-time categories, offers, coin settings, and website customization
  useEffect(() => {
    const unsubCategories = subscribeCategoriesFromFirestore((liveCats) => {
      if (Array.isArray(liveCats) && liveCats.length > 0) {
        setCategories(liveCats);
        try {
          localStorage.setItem('khorom_categories', JSON.stringify(liveCats));
        } catch {}
      }
    });

    const unsubOffers = subscribeOffers((liveOffers) => {
      if (Array.isArray(liveOffers) && liveOffers.length > 0) {
        setOffers(liveOffers);
      }
    });

    const unsubCoins = subscribeCoinSettings((liveSettings) => {
      if (liveSettings) {
        setCoinSettings(liveSettings);
      }
    });

    const unsubSettings = subscribeSettingsFromFirestore((liveSettings) => {
      if (liveSettings) {
        setCustomization((prev) => {
          const merged: WebsiteCustomization = {
            ...DEFAULT_WEBSITE_CUSTOMIZATION,
            ...prev,
            ...liveSettings,
            logoSettings: {
              ...DEFAULT_WEBSITE_CUSTOMIZATION.logoSettings,
              ...(prev.logoSettings || {}),
              ...(liveSettings.logoSettings || {}),
            },
          };
          try {
            localStorage.setItem('khorom_site_customization', JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    });

    return () => {
      if (unsubCategories) unsubCategories();
      if (unsubOffers) unsubOffers();
      if (unsubCoins) unsubCoins();
      if (unsubSettings) unsubSettings();
    };
  }, []);

  // Subscribe to real-time Facebook posts from Firestore ONLY for authorized admins
  useEffect(() => {
    if (!currentUser || !currentUser.email || !isAuthorizedAdmin(currentUser.email)) {
      return;
    }

    let isSubscribed = true;
    const unsubFB = subscribeFacebookPosts((livePosts) => {
      if (!isSubscribed) return;
      if (Array.isArray(livePosts) && livePosts.length > 0) {
        const map = new Map<string, FacebookPendingPost>();
        livePosts.forEach((p) => {
          if (p && p.id && !map.has(p.id)) {
            map.set(p.id, p);
          }
        });
        const cleanPosts = Array.from(map.values());
        setFacebookPostsRaw(cleanPosts);
        try {
          localStorage.setItem('khorom_fb_posts', JSON.stringify(cleanPosts));
        } catch {}
      } else if (Array.isArray(livePosts) && livePosts.length === 0) {
        // Seed initial posts to Firestore only if admin
        INITIAL_FACEBOOK_POSTS.forEach((p) => saveFacebookPostToFirestore(p));
        setFacebookPostsRaw(INITIAL_FACEBOOK_POSTS);
      }
    });

    return () => {
      isSubscribed = false;
      if (unsubFB) unsubFB();
    };
  }, [currentUser]);

  // Real-time Centralized Products Synchronization via Firestore (Single Source of Truth)
  useEffect(() => {
    let isSubscribed = true;
    const unsubProducts = subscribeToProductsFromFirestore(async (liveProducts) => {
      if (!isSubscribed) return;
      if (Array.isArray(liveProducts) && liveProducts.length > 0) {
        setProducts(liveProducts);
        try {
          localStorage.setItem('khorom_products', JSON.stringify(liveProducts));
        } catch {}
      } else if (liveProducts.length === 0) {
        // If Firestore has 0 documents (e.g. freshly connected project), seed initial catalogue
        try {
          const res = await fetch('/api/products');
          if (res.ok) {
            const data: Product[] = await res.json();
            if (data.length > 0) {
              setProducts(data);
              seedProductsToFirestore(data);
            }
          }
        } catch (e) {
          console.warn('Initial product fallback notice:', e);
        }
      }
    });

    return () => {
      isSubscribed = false;
      if (unsubProducts) unsubProducts();
    };
  }, []);

  // Subscribe to user coin transactions
  useEffect(() => {
    if (!currentUser) return;
    const unsubUserCoins = subscribeUserCoinTransactions(currentUser.id, (txs) => {
      if (Array.isArray(txs)) {
        setCoinTransactions(txs);
      }
    });
    return () => {
      if (unsubUserCoins) unsubUserCoins();
    };
  }, [currentUser]);

  // Sync user coins when user changes
  useEffect(() => {
    fetchUserCoins();
  }, [currentUser, fetchUserCoins]);

  // Auto-refresh stats when Admin Panel opens
  useEffect(() => {
    if (isAdminPanelOpen) {
      refreshOverviewStats();
      fetchOffersStats();
      fetchCoinStats();
    }
  }, [isAdminPanelOpen, refreshOverviewStats, fetchOffersStats, fetchCoinStats]);

  // Firebase Auth State Listener (Session persistence across refresh)
  useEffect(() => {
    const unsubAuth = onAuthStateChangedListener(async (fbUser) => {
      if (fbUser) {
        const cleanEmail = (fbUser.email || '').toLowerCase().trim();
        const isAdmin = isAuthorizedAdmin(cleanEmail);

        // Fetch Firestore profile
        let userData: any = null;
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            userData = snap.data();
          }
        } catch (err) {
          console.warn('Could not fetch Firestore user:', err);
        }

        const activeUser: UserProfile = {
          id: fbUser.uid,
          name: userData?.name || fbUser.displayName || cleanEmail.split('@')[0] || 'Customer',
          email: cleanEmail,
          avatar:
            userData?.avatar ||
            fbUser.photoURL ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData?.name || cleanEmail)}`,
          role: isAdmin ? 'admin' : (userData?.role || 'customer'),
          membershipTier: isAdmin ? 'Royal Admin' : (userData?.membershipTier || 'VIP Member'),
          points: userData?.points ?? 50,
          totalOrders: userData?.totalOrders ?? 0,
          totalSpent: userData?.totalSpent ?? 0,
          joinedDate: userData?.joinedDate || new Date().toISOString(),
          provider: 'email',
        };

        setCurrentUser(activeUser);
        localStorage.setItem('khorom_user', JSON.stringify(activeUser));
      } else {
        // Firebase confirmed user is signed out
        setCurrentUser(null);
        localStorage.removeItem('khorom_user');
      }
    });

    return () => {
      if (unsubAuth) unsubAuth();
    };
  }, []);

  // Local storage backups
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('khorom_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('khorom_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('dokan_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('dokan_currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('dokan_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('dokan_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Pricing & Currency helper
  const formatPrice = (priceBdt: number): string => {
    if (currency === 'USD') {
      const priceUsd = priceBdt * BDT_TO_USD_RATE;
      return `$${priceUsd.toFixed(2)}`;
    }
    return `৳${priceBdt.toLocaleString('en-US')}`;
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'bn' ? 'en' : 'bn'));
  };

  const toggleCurrency = () => {
    setCurrency((prev) => (prev === 'BDT' ? 'USD' : 'BDT'));
  };

  // Cart Management
  const addToCart = (product: Product, quantity = 1, color?: string, size?: string) => {
    if (!currentUser) {
      showToast(
        language === 'bn'
          ? 'কার্টে পণ্য যোগ করতে অনুগ্রহ করে প্রথমে অ্যাকাউন্টে লগইন করুন।'
          : 'Please log in to add items to your cart.'
      );
      setIsAuthModalOpen(true);
      return;
    }

    recordProductClick(product.id, 'click');
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedColor === color &&
          item.selectedSize === size
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prev, { product, quantity, selectedColor: color, selectedSize: size }];
      }
    });

    showToast(
      language === 'bn'
        ? `"${product.titleBn}" কার্টে যুক্ত হয়েছে!`
        : `"${product.titleEn}" added to cart!`
    );
  };

  const removeFromCart = (productId: string, color?: string, size?: string) => {
    setCart((prev) =>
      prev.filter((item) => {
        if (item.product.id !== productId) return true;
        if (color !== undefined && (item.selectedColor || item.color) !== color) return true;
        if (size !== undefined && (item.selectedSize || item.size) !== size) return true;
        return false;
      })
    );
  };

  const updateQuantity = (
    productId: string,
    deltaOrValue: number,
    isAbsolute = false,
    color?: string,
    size?: string
  ) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          const matchProduct = item.product.id === productId;
          const matchColor = color === undefined || (item.selectedColor || item.color) === color;
          const matchSize = size === undefined || (item.selectedSize || item.size) === size;
          if (matchProduct && matchColor && matchSize) {
            const newQty = isAbsolute ? deltaOrValue : item.quantity + deltaOrValue;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const updateCartItemQuantity = (
    productId: string,
    quantity: number,
    color?: string,
    size?: string
  ) => {
    updateQuantity(productId, quantity, true, color, size);
  };

  const clearCart = () => {
    setCart([]);
    setAppliedPromo(null);
    setServerDiscountAmount(null);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

  // -------------------------------------------------------------
  // SERVER-SIDE VALIDATED COUPON SYSTEM
  // -------------------------------------------------------------

  const applyPromo = async (code: string): Promise<{ success: boolean; message: string }> => {
    if (!code || !code.trim()) {
      return {
        success: false,
        message: language === 'bn' ? 'কুপন কোড লিখুন!' : 'Please enter coupon code!',
      };
    }

    if (appliedOffer && appliedOffer.allowCoupon === false) {
      return {
        success: false,
        message: language === 'bn' ? 'বর্তমান অফারে কুপন কোড ব্যবহারের সুবিধা নেই।' : 'Coupon code cannot be used with this active offer.',
      };
    }

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          cartSubtotal,
        }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setAppliedPromo(data.promo);
        setServerDiscountAmount(data.discountAmount);
        return {
          success: true,
          message:
            language === 'bn'
              ? data.message || `কুপন "${data.promo.code}" সফলভাবে প্রয়োগ করা হয়েছে!`
              : `Coupon "${data.promo.code}" applied successfully!`,
        };
      } else {
        setAppliedPromo(null);
        setServerDiscountAmount(null);
        return {
          success: false,
          message:
            data.message ||
            (language === 'bn'
              ? 'অকার্যকর বা মেয়াদোত্তীর্ণ কুপন কোড!'
              : 'Invalid or expired coupon code!'),
        };
      }
    } catch (error) {
      console.error('Coupon validation network error:', error);
      return {
        success: false,
        message:
          language === 'bn'
            ? 'সার্ভারে কুপন যাচাই করা সম্ভব হয়নি। পুনরায় চেষ্টা করুন।'
            : 'Server validation error. Please try again.',
      };
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setServerDiscountAmount(null);
  };

  // 1. Promo Discount
  let promoDiscount = 0;
  if (serverDiscountAmount !== null) {
    promoDiscount = serverDiscountAmount;
  } else if (appliedPromo) {
    if (appliedPromo.discountPercent) {
      promoDiscount = Math.round((cartSubtotal * appliedPromo.discountPercent) / 100);
    } else if (appliedPromo.discountAmount) {
      promoDiscount = appliedPromo.discountAmount;
    }
  }

  // 2. Offer Discount
  let offerDiscountAmount = 0;
  if (appliedOffer && cartSubtotal >= (appliedOffer.minPurchase || 0)) {
    if (appliedOffer.discountType === 'percent') {
      const raw = Math.round((cartSubtotal * (appliedOffer.discountValue || 0)) / 100);
      offerDiscountAmount = appliedOffer.maxDiscount ? Math.min(raw, appliedOffer.maxDiscount) : raw;
    } else if (appliedOffer.discountType === 'fixed') {
      offerDiscountAmount = Math.min(appliedOffer.discountValue || 0, cartSubtotal);
    }
  }

  // 3. Coins Discount (100 coins = 1 BDT)
  let coinsDiscountAmount = 0;
  if (appliedCoins > 0 && coinSettings.enabled) {
    const rawCoinDiscount = Math.floor(appliedCoins * (coinSettings.valuePerCoin || 0.01));
    const maxCoinDiscount = Math.floor((cartSubtotal * (coinSettings.maxDiscountPercent || 20)) / 100);
    coinsDiscountAmount = Math.min(rawCoinDiscount, maxCoinDiscount);
  }

  const discountAmount = promoDiscount + offerDiscountAmount + coinsDiscountAmount;
  const standardShipping = customization.deliveryInsideDhaka || 70;
  const isFreeShippingOffer = appliedOffer?.freeShipping || appliedOffer?.type === 'free_shipping';
  const shippingFee = cartSubtotal > 2000 || cartSubtotal === 0 || isFreeShippingOffer ? 0 : standardShipping;
  const cartTotal = Math.max(0, cartSubtotal - discountAmount + shippingFee);

  // Potential coins calculation
  const eligibleSubtotal = Math.max(0, cartSubtotal - promoDiscount - offerDiscountAmount);
  const baseRate = coinSettings.coinsPer100Bdt || 1;
  const bonusMultiplier = (appliedOffer?.type === 'bonus_coins' && appliedOffer.bonusCoinsMultiplier) ? appliedOffer.bonusCoinsMultiplier : 1;
  const bonusFlat = (appliedOffer?.type === 'bonus_coins' && appliedOffer.bonusCoinsFlat) ? appliedOffer.bonusCoinsFlat : 0;
  const potentialCoinsToEarn = coinSettings.enabled
    ? Math.floor((eligibleSubtotal / 100) * baseRate * bonusMultiplier) + bonusFlat
    : 0;

  // -------------------------------------------------------------
  // OFFERS CENTER ACTIONS
  // -------------------------------------------------------------

  const applyOffer = (offer: KhoromOffer): { success: boolean; message: string } => {
    if (offer.status !== 'active') {
      return {
        success: false,
        message: language === 'bn' ? 'এই অফারটি বর্তমানে সক্রিয় নয়।' : 'This offer is not active.',
      };
    }
    if (offer.startDate && new Date(offer.startDate).getTime() > Date.now()) {
      return {
        success: false,
        message: language === 'bn' ? 'অফারটি এখনও শুরু হয়নি।' : 'Offer has not started yet.',
      };
    }
    if (offer.endDate && new Date(offer.endDate).getTime() < Date.now()) {
      return {
        success: false,
        message: language === 'bn' ? 'অফারটির মেয়াদ শেষ হয়ে গেছে।' : 'Offer has expired.',
      };
    }
    if (cartSubtotal < offer.minPurchase) {
      const msg = language === 'bn'
        ? `এই অফারটি পেতে কমপক্ষে ৳${offer.minPurchase.toLocaleString('bn-BD')} টাকার কেনাকাটা প্রয়োজন।`
        : `Minimum order of ৳${offer.minPurchase} required for this offer.`;
      showToast(msg);
      return { success: false, message: msg };
    }
    if (!offer.allowCoupon && appliedPromo) {
      setAppliedPromo(null);
      setServerDiscountAmount(null);
      showToast(language === 'bn' ? 'অফারের সাথে কুপন কোড ব্যবহার প্রযোজ্য নয়, কুপন সরানো হলো।' : 'Coupon removed as offer does not allow stacking.');
    }
    if (!offer.allowCoins && appliedCoins > 0) {
      setAppliedCoins(0);
      showToast(language === 'bn' ? 'অফারের সাথে কয়েন ব্যবহার প্রযোজ্য নয়, কয়েন সরানো হলো।' : 'Coins removed as offer does not allow stacking.');
    }
    setAppliedOffer(offer);
    const msg = language === 'bn' ? `"${offer.name}" অফার যুক্ত হয়েছে!` : `Offer "${offer.name}" applied!`;
    showToast(msg);
    return { success: true, message: msg };
  };

  const removeOffer = () => {
    setAppliedOffer(null);
    showToast(language === 'bn' ? 'অফার সরানো হয়েছে' : 'Offer removed');
  };

  const createOffer = async (offerData: Partial<KhoromOffer>): Promise<boolean> => {
    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify(offerData),
      });
      if (res.ok) {
        const saved: KhoromOffer = await res.json();
        setOffers((prev) => [saved, ...prev]);
        saveOfferToFirestore(saved);
        showToast(language === 'bn' ? 'নতুন অফার সফলভাবে তৈরি হয়েছে!' : 'New offer created successfully!');
        fetchOffersStats();
        return true;
      }
      const err = await res.json();
      showToast(err.error || 'অফার তৈরিতে সমস্যা হয়েছে');
      return false;
    } catch (err) {
      console.error('createOffer error:', err);
      return false;
    }
  };

  const updateOffer = async (id: string, updates: Partial<KhoromOffer>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/offers/${id}`, {
        method: 'PUT',
        headers: getAdminHeaders(),
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated: KhoromOffer = await res.json();
        setOffers((prev) => prev.map((o) => (o.id === id ? updated : o)));
        saveOfferToFirestore(updated);
        showToast(language === 'bn' ? 'অফার সফলভাবে আপডেট হয়েছে!' : 'Offer updated successfully!');
        fetchOffersStats();
        return true;
      }
      return false;
    } catch (err) {
      console.error('updateOffer error:', err);
      return false;
    }
  };

  const deleteOffer = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/offers/${id}`, {
        method: 'DELETE',
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        setOffers((prev) => prev.filter((o) => o.id !== id));
        deleteOfferFromFirestore(id);
        showToast(language === 'bn' ? 'অফার ডিলিট করা হয়েছে' : 'Offer deleted');
        fetchOffersStats();
        return true;
      }
      return false;
    } catch (err) {
      console.error('deleteOffer error:', err);
      return false;
    }
  };

  const duplicateOffer = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/offers/${id}/duplicate`, {
        method: 'POST',
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        const cloned: KhoromOffer = await res.json();
        setOffers((prev) => [cloned, ...prev]);
        saveOfferToFirestore(cloned);
        showToast(language === 'bn' ? 'অফার কপি করা হয়েছে!' : 'Offer duplicated successfully!');
        fetchOffersStats();
        return true;
      }
      return false;
    } catch (err) {
      console.error('duplicateOffer error:', err);
      return false;
    }
  };

  const toggleOfferStatus = async (id: string, newStatus: OfferStatus): Promise<boolean> => {
    try {
      const res = await fetch(`/api/offers/${id}/status`, {
        method: 'PATCH',
        headers: getAdminHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated: KhoromOffer = await res.json();
        setOffers((prev) => prev.map((o) => (o.id === id ? updated : o)));
        saveOfferToFirestore(updated);
        showToast(language === 'bn' ? `অফার স্ট্যাটাস: ${newStatus}` : `Offer status: ${newStatus}`);
        fetchOffersStats();
        return true;
      }
      return false;
    } catch (err) {
      console.error('toggleOfferStatus error:', err);
      return false;
    }
  };

  // -------------------------------------------------------------
  // KHOROM COINS ACTIONS
  // -------------------------------------------------------------

  const updateCoinSettings = async (settingsUpdates: Partial<KhoromCoinSettings>): Promise<boolean> => {
    try {
      const res = await fetch('/api/coins/settings', {
        method: 'PUT',
        headers: getAdminHeaders(),
        body: JSON.stringify(settingsUpdates),
      });
      if (res.ok) {
        const saved: KhoromCoinSettings = await res.json();
        setCoinSettings(saved);
        saveCoinSettingsToFirestore(saved);
        showToast(language === 'bn' ? 'কয়েন সেটিংস আপডেট সম্পন্ন!' : 'Coin settings updated successfully!');
        fetchCoinStats();
        return true;
      }
      return false;
    } catch (err) {
      console.error('updateCoinSettings error:', err);
      return false;
    }
  };

  const applyCoins = (coinsToUse: number): { success: boolean; message: string } => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return { success: false, message: language === 'bn' ? 'লগইন প্রয়োজন' : 'Login required' };
    }
    if (!coinSettings.enabled) {
      return { success: false, message: language === 'bn' ? 'কয়েন সিস্টেম বর্তমানে সক্রিয় নয়।' : 'Coin system currently disabled.' };
    }
    if (appliedOffer && appliedOffer.allowCoins === false) {
      return { success: false, message: language === 'bn' ? 'বর্তমান অফারে কয়েন ব্যবহারের সুবিধা নেই।' : 'Coins cannot be combined with this offer.' };
    }
    if (coinsToUse <= 0) {
      setAppliedCoins(0);
      return { success: true, message: language === 'bn' ? 'কয়েন সরানো হয়েছে' : 'Coins removed' };
    }
    if (coinsToUse > userCoins) {
      return { success: false, message: language === 'bn' ? `আপনার পর্যাপ্ত কয়েন নেই। বর্তমান কয়েন: ${userCoins}` : `Insufficient coins. Available: ${userCoins}` };
    }
    if (coinsToUse < (coinSettings.minRedeemCoins || 0)) {
      return { success: false, message: language === 'bn' ? `সর্বনিম্ন ${coinSettings.minRedeemCoins}টি কয়েন ব্যবহার করতে হবে।` : `Minimum ${coinSettings.minRedeemCoins} coins required.` };
    }
    const maxAllowed = Math.min(coinSettings.maxRedeemCoinsPerOrder || 10000, userCoins);
    const finalCoins = Math.min(coinsToUse, maxAllowed);
    setAppliedCoins(finalCoins);
    const discountVal = Math.floor(finalCoins * (coinSettings.valuePerCoin || 0.01));
    const msg = language === 'bn'
      ? `${finalCoins}টি খড়ম কয়েন প্রয়োগ করা হয়েছে (৳${discountVal} ছাড়)!`
      : `${finalCoins} KHOROM coins applied (৳${discountVal} off)!`;
    showToast(msg);
    return { success: true, message: msg };
  };

  const removeCoins = () => {
    setAppliedCoins(0);
    showToast(language === 'bn' ? 'কয়েন ব্যবহার বাতিল করা হয়েছে' : 'Coins removed');
  };

  const markOrderReceived = async (orderId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`/api/orders/${orderId}/receive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || '',
          'x-user-email': currentUser?.email || '',
        },
        body: JSON.stringify({
          userId: currentUser?.id,
          userEmail: currentUser?.email,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
        saveOrderToFirestore(data.order);
        await fetchUserCoins();
        const msg = language === 'bn'
          ? (data.messageBn || 'পণ্য হাতে পাওয়ার তথ্য নিশ্চিত হয়েছে! খড়ম কয়েন আপনার অ্যাকাউন্টে জমা হয়েছে।')
          : (data.message || 'Order delivery confirmed! Loyalty coins added.');
        showToast(msg);
        return { success: true, message: msg };
      } else {
        const errData = await res.json();
        const err = errData.error || 'অর্ডার রিসিভ মার্ক করতে সমস্যা হয়েছে';
        showToast(err);
        return { success: false, message: err };
      }
    } catch (err) {
      console.error('markOrderReceived error:', err);
      return { success: false, message: 'নেটওয়ার্ক সমস্যা হয়েছে' };
    }
  };

  // Check if current user has claimed daily coins today (Dhaka time)
  const currentDhakaDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka' }).format(new Date());
  const isDailyClaimedToday = Boolean(currentUser?.lastDailyClaimDate === currentDhakaDate);

  const claimDailyCoins = async (): Promise<{ success: boolean; message: string; coins?: number }> => {
    if (!currentUser) {
      showToast(language === 'bn' ? 'কয়েন ক্লেইম করতে অনুগ্রহ করে প্রথমে লগইন করুন।' : 'Please log in to claim your daily coins.');
      setIsAuthModalOpen(true);
      return { success: false, message: 'Login required' };
    }

    try {
      const res = await fetch('/api/coins/daily-claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id || '',
          'x-user-email': currentUser.email || '',
        },
        body: JSON.stringify({ userId: currentUser.id, userEmail: currentUser.email }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUserCoins(data.coins);
        setCurrentUser((prev) => (prev ? { ...prev, coins: data.coins, lastDailyClaimDate: data.lastDailyClaimDate } : null));
        showToast(data.message || (language === 'bn' ? 'অভিনন্দন! ১০০ খড়ম কয়েন ক্লেইম সম্পন্ন হয়েছে!' : 'Congratulations! 100 KHOROM coins claimed!'));
        await fetchUserCoins();
        return { success: true, message: data.message, coins: data.coins };
      } else {
        const msg = data.message || data.error || (language === 'bn' ? 'আজকের কয়েন ইতিমধ্যে ক্লেইম করা হয়েছে।' : 'Already claimed today');
        showToast(msg);
        return { success: false, message: msg };
      }
    } catch (err: any) {
      showToast(language === 'bn' ? 'কানেকশন সমস্যা হয়েছে।' : 'Network error');
      return { success: false, message: err.message || 'Network error' };
    }
  };

  const adjustUserCoins = async (userId: string, amount: number, reason: string): Promise<{ success: boolean; message: string; newBalance?: number }> => {
    try {
      const res = await fetch('/api/admin/coins/adjust', {
        method: 'POST',
        headers: {
          ...getAdminHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, amount, reason }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(language === 'bn' ? 'কয়েন ব্যালেন্স সফলভাবে সমন্বয় করা হয়েছে' : data.message);
        fetchCoinStats();
        return { success: true, message: data.message, newBalance: data.newBalance };
      }
      showToast(data.error || 'Failed to adjust coins');
      return { success: false, message: data.error || 'Failed' };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const fetchCoinCustomers = async (): Promise<any[]> => {
    try {
      const res = await fetch('/api/admin/coins/customers', {
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('fetchCoinCustomers error:', err);
    }
    return [];
  };

  const fetchCoinTransactions = async (): Promise<CoinTransaction[]> => {
    try {
      const res = await fetch('/api/admin/coins/transactions', {
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('fetchCoinTransactions error:', err);
    }
    return [];
  };

  // Courier state & actions
  const [courierSettings, setCourierSettings] = useState<PathaoCourierSettings | null>(null);

  const fetchCourierSettings = async (): Promise<PathaoCourierSettings | null> => {
    try {
      const res = await fetch('/api/admin/courier/settings', {
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setCourierSettings(data.pathao || null);
        return data.pathao || null;
      }
    } catch (err) {
      console.warn('fetchCourierSettings error:', err);
    }
    return null;
  };

  const updateCourierSettings = async (settings: Partial<PathaoCourierSettings>): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/courier/settings', {
        method: 'POST',
        headers: {
          ...getAdminHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pathao: settings }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCourierSettings(data.settings?.pathao || null);
        showToast(language === 'bn' ? 'পাঠাও কুরিয়ার সেটিংস সেভ সম্পন্ন হয়েছে।' : 'Courier settings saved successfully.');
        return true;
      }
      showToast(data.error || 'Failed to save courier settings');
      return false;
    } catch (err: any) {
      showToast(err.message || 'Error saving courier settings');
      return false;
    }
  };

  const testCourierConnection = async (settings?: Partial<PathaoCourierSettings>): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/admin/courier/test-connection', {
        method: 'POST',
        headers: {
          ...getAdminHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pathao: settings }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(language === 'bn' ? 'পাঠাও কুরিয়ার কানেকশন সফল হয়েছে!' : 'Pathao connection successful!');
      } else {
        showToast(data.message || 'Connection test failed');
      }
      return data;
    } catch (err: any) {
      return { success: false, message: err.message || 'Connection test failed' };
    }
  };

  const dispatchPathaoOrder = async (
    orderId: string,
    options?: { specialInstruction?: string; weight?: number; storeId?: string }
  ): Promise<{ success: boolean; message: string; consignmentId?: string }> => {
    try {
      const res = await fetch('/api/admin/courier/pathao/dispatch', {
        method: 'POST',
        headers: {
          ...getAdminHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, ...options }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, ...data.order } : o))
        );
        showToast(
          language === 'bn'
            ? `অর্ডার #${orderId} সফলভাবে পাঠাও কুরিয়ারে পাঠানো হয়েছে! (Consignment ID: ${data.consignmentId})`
            : `Order #${orderId} sent to Pathao! Consignment ID: ${data.consignmentId}`
        );
        return { success: true, message: data.message, consignmentId: data.consignmentId };
      }
      const errMsg = data.error || 'Failed to dispatch order to Pathao';
      showToast(errMsg);
      return { success: false, message: errMsg };
    } catch (err: any) {
      showToast(err.message || 'Network error');
      return { success: false, message: err.message || 'Network error' };
    }
  };

  const trackPathaoOrder = async (orderId: string): Promise<any> => {
    try {
      const res = await fetch(`/api/admin/courier/pathao/track/${orderId}`, {
        headers: getAdminHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success && data.orderStatus) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, pathaoCourierStatus: data.orderStatus } : o))
        );
      }
      return data;
    } catch (err) {
      console.warn('trackPathaoOrder error:', err);
      return { success: false, message: 'Tracking failed' };
    }
  };

  const toggleWishlist = (productId: string) => {
    recordProductClick(productId, 'like');
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      showToast(
        exists
          ? language === 'bn'
            ? 'পণ্যটি উইশলিস্ট থেকে সরানো হয়েছে'
            : 'Removed from wishlist'
          : language === 'bn'
          ? 'উইশলিস্টে যুক্ত হয়েছে'
          : 'Added to wishlist'
      );
      return updated;
    });
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  // -------------------------------------------------------------
  // ORDER MANAGEMENT (CONNECTED TO DATABASE)
  // -------------------------------------------------------------

  const placeOrder = async (customer: CustomerInfo, paymentMethod: PaymentMethod): Promise<Order | null> => {
    if (!currentUser) {
      showToast(
        language === 'bn'
          ? 'অর্ডার সম্পন্ন করতে অনুগ্রহ করে প্রথমে আপনার অ্যাকাউন্টে লগইন করুন।'
          : 'Please log in to place your order.'
      );
      setIsAuthModalOpen(true);
      return null;
    }

    try {
      const isPreOrder = cart.some(
        (item) => !item.product.inStock || (item.product.stockCount ?? 0) <= 0
      );

      const payload = {
        userId: currentUser.id,
        userEmail: currentUser.email,
        customer: {
          ...customer,
          email: customer.email || currentUser.email,
        },
        items: cart,
        subtotal: cartSubtotal,
        discount: discountAmount,
        appliedCouponCode: appliedPromo?.code,
        appliedOfferId: appliedOffer?.id,
        appliedOffer: appliedOffer ? {
          offerId: appliedOffer.id,
          offerName: appliedOffer.name,
          discountType: appliedOffer.discountType,
          discountAmount: offerDiscountAmount,
          appliedAt: new Date().toISOString(),
        } : undefined,
        coinsUsed: appliedCoins,
        coinsDiscount: coinsDiscountAmount,
        shipping: shippingFee,
        total: cartTotal,
        paymentMethod,
        isPreOrder,
        source: 'website',
      };

      const authHeaders = await getAuthHeaders();
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-email': currentUser.email,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const savedOrder: Order = await res.json();
        setOrders((prev) => [savedOrder, ...prev]);
        setLastCompletedOrder(savedOrder);
        clearCart();
        setAppliedCoins(0);
        setAppliedOffer(null);
        setIsCheckoutOpen(false);

        // Sync order to Firebase Firestore
        saveOrderToFirestore(savedOrder);

        showToast(
          language === 'bn'
            ? isPreOrder
              ? `প্রি-অর্ডার #${savedOrder.id} সফলভাবে সম্পন্ন হয়েছে!`
              : `অর্ডার #${savedOrder.id} সফলভাবে সম্পন্ন হয়েছে!`
            : `Order #${savedOrder.id} confirmed successfully!`
        );

        // Refresh inventory, stats & coins
        fetchProducts();
        fetchOverviewStats();
        fetchUserCoins();
        return savedOrder;
      } else {
        const errData = await res.json();
        showToast(errData.error || 'অর্ডার প্রক্রিয়া করতে ত্রুটি হয়েছে');
        return null;
      }
    } catch (err) {
      console.error('Order network error:', err);
      showToast('অর্ডার সম্পন্ন করতে সমস্যা হয়েছে');
      return null;
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    status: string,
    paymentStatus?: string,
    cancellationReason?: string,
    note?: string
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: getAdminHeaders(),
        body: JSON.stringify({ status, paymentStatus, cancellationReason, note }),
      });

      if (res.ok) {
        const updated: Order = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
        saveOrderToFirestore(updated);
        fetchOverviewStats();
        fetchUserCoins();
        fetchProducts();
        showToast(language === 'bn' ? 'অর্ডার স্ট্যাটাস সফলভাবে আপডেট হয়েছে!' : 'Order status updated successfully!');
        return true;
      } else if (res.status === 403) {
        showToast(language === 'bn' ? 'অননুমোদিত: শুধুমাত্র অনুমোদিত ৩টি অ্যাডমিন ইমেইল অর্ডার পরিবর্তন করতে পারে।' : 'Access Denied: Only authorized admin emails can modify orders.');
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to update order status');
      }
      return false;
    } catch (err) {
      console.error('Update order status error:', err);
      return false;
    }
  };

  // -------------------------------------------------------------
  // CUSTOMER ADDRESS BOOK (PRD SECTION 01 & 09)
  // -------------------------------------------------------------
  const [userAddresses, setUserAddresses] = useState<UserAddress[]>([]);

  const fetchUserAddresses = useCallback(async () => {
    if (!currentUser) {
      setUserAddresses([]);
      return;
    }
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch('/api/user/addresses', {
        headers: {
          ...authHeaders,
          'x-user-id': currentUser.id,
          'x-user-email': currentUser.email,
        },
      });
      if (res.ok) {
        const addrs: UserAddress[] = await res.json();
        setUserAddresses(addrs);
      }
    } catch (err) {
      console.warn('fetchUserAddresses error:', err);
    }
  }, [currentUser, getAuthHeaders]);

  useEffect(() => {
    if (currentUser) {
      fetchUserAddresses();
    } else {
      setUserAddresses([]);
    }
  }, [currentUser, fetchUserAddresses]);

  const addUserAddress = async (addrData: Omit<UserAddress, 'id' | 'createdAt'>): Promise<boolean> => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return false;
    }
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-email': currentUser.email,
        },
        body: JSON.stringify(addrData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUserAddresses(data.addresses);
        showToast(language === 'bn' ? 'ঠিকানা সফলভাবে সংরক্ষণ করা হয়েছে!' : 'Address saved successfully!');
        return true;
      }
      showToast(data.error || 'Failed to save address');
      return false;
    } catch (err) {
      console.error('addUserAddress error:', err);
      return false;
    }
  };

  const setDefaultAddress = async (addressId: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`/api/user/addresses/${addressId}/default`, {
        method: 'PUT',
        headers: {
          ...authHeaders,
          'x-user-id': currentUser.id,
          'x-user-email': currentUser.email,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUserAddresses(data.addresses);
        showToast(language === 'bn' ? 'ডিফল্ট ঠিকানা নির্ধারিত হয়েছে' : 'Default address set');
        return true;
      }
      return false;
    } catch (err) {
      console.error('setDefaultAddress error:', err);
      return false;
    }
  };

  const deleteUserAddress = async (addressId: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(`/api/user/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          ...authHeaders,
          'x-user-id': currentUser.id,
          'x-user-email': currentUser.email,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUserAddresses(data.addresses);
        showToast(language === 'bn' ? 'ঠিকানা মুছে ফেলা হয়েছে' : 'Address deleted');
        return true;
      }
      return false;
    } catch (err) {
      console.error('deleteUserAddress error:', err);
      return false;
    }
  };

  // -------------------------------------------------------------
  // AUTH & REAL USER LOGIN LOGS (NO FAKE DATA)
  // -------------------------------------------------------------

  const loginWithGoogle = async (): Promise<{ success: boolean; message?: string }> => {
    return {
      success: false,
      message: language === 'bn'
        ? 'গুগল লগইন বন্ধ রয়েছে। অনুগ্রহ করে ইমেইল ও পাসওয়ার্ড ব্যবহার করুন।'
        : 'Google Sign In is disabled. Please use Email and Password.',
    };
  };

  const registerWithPassword = async (
    name: string,
    email: string,
    password: string,
    role: 'admin' | 'customer' = 'customer'
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = name.trim();

      if (!cleanEmail || !password) {
        return {
          success: false,
          message: language === 'bn' ? 'ইমেইল এবং পাসওয়ার্ড আবশ্যক।' : 'Email and password are required.',
        };
      }

      if (password.length < 6) {
        return {
          success: false,
          message: language === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters.',
        };
      }

      // 1. Pure Firebase Authentication
      const fbResult = await registerWithEmailPassword(cleanName, cleanEmail, password);
      if (!fbResult.success || !fbResult.user) {
        return {
          success: false,
          message: fbResult.error || (language === 'bn' ? 'রেজিস্ট্রেশন সম্পন্ন করা সম্ভব হয়নি।' : 'Registration failed.'),
        };
      }

      const activeUser: UserProfile = {
        ...fbResult.user,
        role: isAuthorizedAdmin(cleanEmail) ? 'admin' : role,
        membershipTier: isAuthorizedAdmin(cleanEmail) ? 'Royal Admin' : 'VIP Member',
      };

      // 2. Persist profile document in Firestore (strictly NO password stored)
      await saveUserToFirestore(activeUser);

      setCurrentUser(activeUser);
      localStorage.setItem('khorom_user', JSON.stringify(activeUser));
      setIsAuthModalOpen(false);
      fetchOverviewStats();
      showToast(
        language === 'bn'
          ? `স্বাগতম ${activeUser.name}! সফলভাবে রেজিস্টার করা হয়েছে।`
          : `Welcome ${activeUser.name}! Registered successfully.`
      );
      return { success: true };
    } catch (err: any) {
      console.error('Registration error:', err);
      return { success: false, message: err?.message || 'অ্যাকাউন্ট তৈরি করা যায়নি।' };
    }
  };

  const loginWithPassword = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();

      if (!cleanEmail || !password) {
        return {
          success: false,
          message: language === 'bn' ? 'অনুগ্রহ করে ইমেইল এবং পাসওয়ার্ড উভয়ই পূরণ করুন।' : 'Please enter both email and password.',
        };
      }

      // 1. Pure Firebase Authentication credential verification
      const fbResult = await loginWithEmailPassword(cleanEmail, password);
      if (!fbResult.success || !fbResult.user) {
        return {
          success: false,
          message: fbResult.error || (language === 'bn' ? 'ইমেইল বা পাসওয়ার্ড ভুল হয়েছে।' : 'Invalid email or password.'),
        };
      }

      const fbUser = fbResult.user;
      const isAdmin = isAuthorizedAdmin(cleanEmail);

      // 2. Fetch or update Firestore user profile
      let finalUser: UserProfile = {
        ...fbUser,
        role: isAdmin ? 'admin' : (fbUser.role || 'customer'),
        membershipTier: isAdmin ? 'Royal Admin' : (fbUser.membershipTier || 'VIP Member'),
      };

      try {
        const userDocRef = doc(db, 'users', fbUser.id);
        const snap = await getDoc(userDocRef);
        if (snap.exists()) {
          const data = snap.data();
          finalUser = {
            ...finalUser,
            name: data.name || finalUser.name,
            points: data.points ?? finalUser.points ?? 50,
            totalOrders: data.totalOrders ?? finalUser.totalOrders ?? 0,
            totalSpent: data.totalSpent ?? finalUser.totalSpent ?? 0,
            membershipTier: isAdmin ? 'Royal Admin' : (data.membershipTier || finalUser.membershipTier),
            role: isAdmin ? 'admin' : (data.role || finalUser.role),
          };
        } else {
          await saveUserToFirestore(finalUser);
        }
      } catch (err) {
        console.warn('Could not sync Firestore user doc on login:', err);
      }

      // Log login event for admin auditing without password
      const newLog: UserLoginLog = {
        id: `log-${Date.now()}`,
        name: finalUser.name,
        email: finalUser.email,
        avatar: finalUser.avatar,
        provider: 'email',
        userId: finalUser.id,
        userName: finalUser.name,
        userEmail: finalUser.email,
        role: finalUser.role,
        loginTime: new Date().toISOString(),
        device: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Browser',
        status: 'success',
      };
      setUserLoginLogs((prev) => [newLog, ...prev]);

      setCurrentUser(finalUser);
      localStorage.setItem('khorom_user', JSON.stringify(finalUser));
      setIsAuthModalOpen(false);
      fetchOverviewStats();
      showToast(
        language === 'bn'
          ? `স্বাগতম ${finalUser.name}! আপনি সফলভাবে প্রবেশ করেছেন।`
          : `Welcome back, ${finalUser.name}!`
      );
      return { success: true };
    } catch (err: any) {
      console.error('Login error:', err);
      return { success: false, message: err?.message || 'সার্ভারের সাথে সংযোগ স্থাপন করা সম্ভব হয়নি।' };
    }
  };

  const sendPasswordReset = async (email: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    return await resetPasswordEmail(email);
  };

  const loginWithEmail = async (email: string, name?: string, role: 'admin' | 'customer' = 'customer') => {
    // Deprecated shortcut - redirect to login
    setIsAuthModalOpen(true);
  };

  const requestLogout = () => {
    setIsLogoutConfirmOpen(true);
  };

  const cancelLogout = () => {
    setIsLogoutConfirmOpen(false);
  };

  const confirmLogout = async () => {
    try {
      await logoutFirebaseUser();
    } catch (e) {
      console.warn('Firebase signout warning:', e);
    }
    setCurrentUser(null);
    setOrders([]);
    localStorage.removeItem('khorom_user');
    setIsLogoutConfirmOpen(false);
    setIsAdminPanelOpen(false);
    showToast(language === 'bn' ? 'সফলভাবে লগআউট করা হয়েছে।' : 'Signed out successfully.');
  };

  const logout = () => {
    requestLogout();
  };

  // -------------------------------------------------------------
  // DYNAMIC CATEGORY MANAGEMENT
  // -------------------------------------------------------------

  const addCategory = async (newCat: Omit<Category, 'id'> | Category): Promise<boolean> => {
    try {
      const catId = (newCat as any).id || (newCat as any).nameEn.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
      const rawSubs = Array.isArray(newCat.subcategories) ? newCat.subcategories : [];
      const cleanSubcategories = rawSubs
        .filter((s: any) => s && (s.id || s.nameBn || s.nameEn))
        .map((s: any) => ({
          id: String(s.id || '').trim(),
          nameBn: String(s.nameBn || '').trim(),
          nameEn: String(s.nameEn || '').trim(),
          parentId: catId,
          ...(typeof s.itemCount === 'number' ? { itemCount: s.itemCount } : {}),
          ...(Array.isArray(s.types) ? { types: s.types } : {}),
        }));

      const fullCat: Category = {
        id: catId,
        nameBn: newCat.nameBn.trim(),
        nameEn: newCat.nameEn.trim(),
        iconName: newCat.iconName || 'LayoutGrid',
        itemCount: 0,
        order: typeof newCat.order === 'number' ? newCat.order : categories.length,
        orderIndex: typeof newCat.orderIndex === 'number' ? newCat.orderIndex : (typeof newCat.order === 'number' ? newCat.order : categories.length),
        subcategories: cleanSubcategories,
      };

      // 1. OPTIMISTIC INSTANT UPDATE
      setCategories((prev) => {
        const next = [...prev, fullCat];
        try {
          localStorage.setItem('khorom_categories', JSON.stringify(next));
        } catch {}
        return next;
      });

      // 2. CONCURRENT DUAL-WRITE: Firestore + Express Backend in parallel
      const [firestoreRes, apiRes] = await Promise.allSettled([
        saveCategoryToFirestore(fullCat),
        fetch('/api/categories', {
          method: 'POST',
          headers: getAdminHeaders(),
          body: JSON.stringify(fullCat),
        }),
      ]);

      const firestoreSuccess = firestoreRes.status === 'fulfilled' && firestoreRes.value === true;
      const apiSuccess = apiRes.status === 'fulfilled' && apiRes.value.ok;

      if (!firestoreSuccess && !apiSuccess) {
        console.error('Both Firestore and API category creation failed. Reverting.', { firestoreRes, apiRes });
        setCategories((prev) => prev.filter((c) => c.id !== catId));
        try {
          const revertList = categories.filter((c) => c.id !== catId);
          localStorage.setItem('khorom_categories', JSON.stringify(revertList));
        } catch {}
        showToast(
          language === 'bn'
            ? 'নতুন ক্যাটাগরি তৈরি করতে ব্যর্থ হয়েছে।'
            : 'Failed to create new category in database.'
        );
        return false;
      }

      showToast(language === 'bn' ? `"${fullCat.nameBn}" ক্যাটাগরি যুক্ত হয়েছে!` : `Category "${fullCat.nameEn}" added!`);
      return true;
    } catch (err: any) {
      console.error('addCategory error:', err);
      showToast(
        language === 'bn'
          ? `ক্যাটাগরি তৈরি ব্যর্থ: ${err?.message || 'অজানা ত্রুটি'}`
          : `Category creation failed: ${err?.message || 'Unknown error'}`
      );
      return false;
    }
  };

  const updateCategory = async (categoryId: string, updated: Partial<Category>): Promise<boolean> => {
    try {
      const existing = categories.find((c) => c.id === categoryId);
      if (!existing) return false;

      // Clean and sanitize subcategories
      const rawSubs = Array.isArray(updated.subcategories) ? updated.subcategories : (existing.subcategories || []);
      const cleanSubcategories = rawSubs
        .filter((s: any) => s && (s.id || s.nameBn || s.nameEn))
        .map((s: any) => ({
          id: String(s.id || '').trim(),
          nameBn: String(s.nameBn || '').trim(),
          nameEn: String(s.nameEn || '').trim(),
          parentId: categoryId,
          ...(typeof s.itemCount === 'number' ? { itemCount: s.itemCount } : {}),
          ...(Array.isArray(s.types) ? { types: s.types } : {}),
        }));

      const mergedCategory: Category = {
        ...existing,
        ...updated,
        id: categoryId,
        subcategories: cleanSubcategories,
      };

      // 1. OPTIMISTIC INSTANT UPDATE (0ms delay)
      setCategories((prev) => {
        const next = prev.map((c) => (c.id === categoryId ? mergedCategory : c));
        try {
          localStorage.setItem('khorom_categories', JSON.stringify(next));
        } catch {}
        return next;
      });

      // 2. CONCURRENT DUAL-WRITE: Firestore + Express Backend in parallel
      const [firestoreRes, apiRes] = await Promise.allSettled([
        saveCategoryToFirestore(mergedCategory),
        fetch(`/api/categories/${categoryId}`, {
          method: 'PUT',
          headers: getAdminHeaders(),
          body: JSON.stringify({
            nameBn: mergedCategory.nameBn,
            nameEn: mergedCategory.nameEn,
            iconName: mergedCategory.iconName,
            orderIndex: mergedCategory.orderIndex,
            order: mergedCategory.order,
            subcategories: cleanSubcategories,
          }),
        }),
      ]);

      const firestoreSuccess = firestoreRes.status === 'fulfilled' && firestoreRes.value === true;
      const apiSuccess = apiRes.status === 'fulfilled' && apiRes.value.ok;

      if (!firestoreSuccess && !apiSuccess) {
        console.error('Both Firestore and API category update failed. Reverting.', { firestoreRes, apiRes });
        setCategories((prev) => prev.map((c) => (c.id === categoryId ? existing : c)));
        try {
          const revertList = categories.map((c) => (c.id === categoryId ? existing : c));
          localStorage.setItem('khorom_categories', JSON.stringify(revertList));
        } catch {}
        showToast(
          language === 'bn'
            ? 'ক্যাটাগরি ক্লাউড ডাটাবেজে সংরক্ষণ করা যায়নি।'
            : 'Failed to persist category to database.'
        );
        return false;
      }

      showToast(language === 'bn' ? 'ক্যাটাগরি ও সাবক্যাটাগরি সফলভাবে সংরক্ষিত হয়েছে!' : 'Category & subcategories saved successfully!');
      return true;
    } catch (err: any) {
      console.error('updateCategory error:', err);
      showToast(
        language === 'bn'
          ? `ক্যাটাগরি আপডেট ব্যর্থ: ${err?.message || 'অজানা ত্রুটি'}`
          : `Category update failed: ${err?.message || 'Unknown error'}`
      );
      return false;
    }
  };

  const deleteCategory = async (categoryId: string): Promise<boolean> => {
    try {
      const existing = categories.find((c) => c.id === categoryId);
      // Optimistic delete
      setCategories((prev) => {
        const next = prev.filter((c) => c.id !== categoryId);
        try {
          localStorage.setItem('khorom_categories', JSON.stringify(next));
        } catch {}
        return next;
      });

      const [firestoreRes, apiRes] = await Promise.allSettled([
        deleteCategoryFromFirestore(categoryId),
        fetch(`/api/categories/${categoryId}`, {
          method: 'DELETE',
          headers: getAdminHeaders(),
        }),
      ]);

      const firestoreSuccess = firestoreRes.status === 'fulfilled' && firestoreRes.value === true;
      const apiSuccess = apiRes.status === 'fulfilled' && apiRes.value.ok;

      if (!firestoreSuccess && !apiSuccess) {
        console.error('Both Firestore and API category deletion failed. Reverting.', { firestoreRes, apiRes });
        if (existing) {
          setCategories((prev) => [...prev, existing]);
        }
        showToast(
          language === 'bn'
            ? 'ক্যাটাগরি ডিলিট ব্যর্থ হয়েছে।'
            : 'Failed to delete category.'
        );
        return false;
      }

      showToast(language === 'bn' ? 'ক্যাটাগরি ডিলিট করা হয়েছে।' : 'Category deleted.');
      return true;
    } catch (err) {
      console.error('deleteCategory error:', err);
      return false;
    }
  };

  const reorderCategories = async (orderedCategories: Category[]): Promise<boolean> => {
    try {
      setCategories(orderedCategories);
      localStorage.setItem('khorom_categories', JSON.stringify(orderedCategories));

      const res = await fetch('/api/categories/reorder', {
        method: 'PUT',
        headers: getAdminHeaders(),
        body: JSON.stringify({ categories: orderedCategories }),
      });

      if (res.ok) {
        orderedCategories.forEach((c) => saveCategoryToFirestore(c));
        showToast(language === 'bn' ? 'ক্যাটাগরি ক্রম বিন্যাস সংরক্ষিত হয়েছে!' : 'Category order saved!');
        return true;
      }
      return false;
    } catch (err) {
      console.error('reorderCategories error:', err);
      return false;
    }
  };

  // -------------------------------------------------------------
  // REAL PRODUCT MANAGEMENT & EDIT POSITION (OPTIMISTIC & ULTRA-FAST)
  // -------------------------------------------------------------

  const addProduct = async (newProd: Omit<Product, 'id'> | Product): Promise<boolean> => {
    try {
      const prodId = (newProd as any).id || (newProd as any).productId || `khorom-${Date.now()}`;
      const productWithId: Product = {
        ...(newProd as any),
        id: prodId,
        productId: prodId,
        position: (newProd as any).position ?? products.length + 1,
        inStock: (newProd as any).inStock ?? true,
        stockCount: (newProd as any).stockCount ?? 20,
        rating: typeof (newProd as any).rating === 'number' ? (newProd as any).rating : 5.0,
        reviewCount: typeof (newProd as any).reviewCount === 'number' ? (newProd as any).reviewCount : 0,
        published: (newProd as any).published !== false,
        status: (newProd as any).status || ((newProd as any).published === false ? 'draft' : 'published'),
      };

      // 1. Optimistic instant UI update (0ms delay)
      setProducts((prev) => {
        const next = [...prev.filter((p) => p.id !== prodId), productWithId].sort(
          (a, b) => (a.position ?? 9999) - (b.position ?? 9999)
        );
        try {
          localStorage.setItem('khorom_products', JSON.stringify(next));
        } catch {}
        return next;
      });

      showToast(
        language === 'bn'
          ? `"${productWithId.titleBn || productWithId.titleEn}" সফলভাবে ডাটাবেজে যুক্ত হয়েছে!`
          : `"${productWithId.titleEn || productWithId.titleBn}" saved to database successfully!`
      );

      // 2. Concurrent persistence to Firestore & Express API
      Promise.allSettled([
        saveProductToFirestore(productWithId),
        fetch('/api/products', {
          method: 'POST',
          headers: getAdminHeaders(),
          body: JSON.stringify(productWithId),
        }),
      ]).then(([fsRes, apiRes]) => {
        const fsOk = fsRes.status === 'fulfilled' && fsRes.value.success;
        const apiOk = apiRes.status === 'fulfilled' && apiRes.value.ok;
        if (!fsOk && !apiOk) {
          console.warn('Failed to persist new product to Firestore/backend');
        } else if (currentUser?.email && isAuthorizedAdmin(currentUser.email)) {
          fetchOverviewStats();
        }
      });

      return true;
    } catch (err: any) {
      console.error('Failed to add product to database:', err);
      showToast(
        language === 'bn'
          ? `ত্রুটি: ${err?.message || 'পণ্য সংরক্ষণ ব্যর্থ হয়েছে'}`
          : `Error: ${err?.message || 'Failed to add product'}`
      );
      return false;
    }
  };

  const updateProduct = async (productId: string, updated: Partial<Product>): Promise<boolean> => {
    try {
      const existing = products.find((p) => p.id === productId);
      if (!existing) return false;

      const mergedProduct: Product = {
        ...existing,
        ...updated,
        id: productId,
        productId: productId,
      } as Product;

      // 1. OPTIMISTIC INSTANT UPDATE (0ms delay)
      // When Admin changes price (e.g. ৳2500 -> ৳2200), UI updates immediately!
      setProducts((prev) => {
        const next = prev.map((p) => (p.id === productId ? mergedProduct : p)).sort(
          (a, b) => (a.position ?? 9999) - (b.position ?? 9999)
        );
        try {
          localStorage.setItem('khorom_products', JSON.stringify(next));
        } catch {}
        return next;
      });

      setCart((prev) =>
        prev.map((item) => (item.product.id === productId ? { ...item, product: mergedProduct } : item))
      );

      if (selectedProduct && selectedProduct.id === productId) {
        setSelectedProduct(mergedProduct);
      }

      showToast(
        language === 'bn'
          ? `"${mergedProduct.titleBn || mergedProduct.titleEn}" সফলভাবে আপডেট করা হয়েছে!`
          : `"${mergedProduct.titleEn || mergedProduct.titleBn}" updated successfully!`
      );

      // 2. CONCURRENT DUAL-WRITE: Firestore + Express Backend in parallel
      const [firestoreRes, apiRes] = await Promise.allSettled([
        saveProductToFirestore(mergedProduct),
        fetch(`/api/products/${productId}`, {
          method: 'PUT',
          headers: getAdminHeaders(),
          body: JSON.stringify(updated),
        }),
      ]);

      const firestoreSuccess = firestoreRes.status === 'fulfilled' && firestoreRes.value.success;
      const apiSuccess = apiRes.status === 'fulfilled' && apiRes.value.ok;

      if (!firestoreSuccess && !apiSuccess) {
        console.warn('Both Firestore and API product update failed. Reverting.');
        setProducts((prev) => prev.map((p) => (p.id === productId ? existing : p)));
        showToast(
          language === 'bn'
            ? 'পণ্য আপডেট ক্লাউডে সংরক্ষণ করা যায়নি।'
            : 'Product update failed to persist to cloud.'
        );
        return false;
      }

      if (currentUser?.email && isAuthorizedAdmin(currentUser.email)) {
        fetchOverviewStats();
      }

      return true;
    } catch (err: any) {
      console.error('Failed to update product:', err);
      showToast(language === 'bn' ? 'পণ্য আপডেট করতে সমস্যা হয়েছে।' : 'Failed to update product.');
      return false;
    }
  };

  const deleteProduct = async (productId: string) => {
    const target = products.find((p) => p.id === productId);
    try {
      // 1. Optimistic removal (instant UI response)
      setProducts((prev) => {
        const next = prev.filter((p) => p.id !== productId);
        try {
          localStorage.setItem('khorom_products', JSON.stringify(next));
        } catch {}
        return next;
      });
      setCart((prev) => prev.filter((item) => item.product.id !== productId));

      showToast(
        language === 'bn'
          ? `"${target?.titleBn || target?.titleEn || 'পণ্য'}" ডাটাবেজ থেকে মুছে ফেলা হয়েছে।`
          : `Product removed from database.`
      );

      // 2. Concurrently delete
      Promise.allSettled([
        deleteProductFromFirestore(productId),
        fetch(`/api/products/${productId}`, {
          method: 'DELETE',
          headers: getAdminHeaders(),
        }),
      ]).then(() => {
        if (currentUser?.email && isAuthorizedAdmin(currentUser.email)) {
          fetchOverviewStats();
        }
      });
    } catch (err) {
      console.error('Failed to delete product:', err);
      showToast(language === 'bn' ? 'পণ্য মুছতে সমস্যা হয়েছে।' : 'Failed to delete product.');
    }
  };

  const toggleProductPublished = async (productId: string): Promise<boolean> => {
    const target = products.find((p) => p.id === productId);
    if (!target) return false;
    const newPublished = target.published === false;
    const newStatus: 'published' | 'draft' = newPublished ? 'published' : 'draft';
    return await updateProduct(productId, {
      published: newPublished,
      status: newStatus,
    });
  };

  // EDIT POSITION: fully functional drag & drop or position number reordering saved to database!
  const saveProductPositions = async (positions: { id: string; position: number }[]): Promise<boolean> => {
    try {
      // 1. Optimistically update local state immediately
      const posMap = new Map(positions.map((p) => [p.id, p.position]));
      setProducts((prev) => {
        const next = prev.map((prod) => ({
          ...prod,
          position: posMap.get(prod.id) ?? prod.position,
        }));
        const sorted = next.sort((a, b) => (a.position ?? 9999) - (b.position ?? 9999));
        try {
          localStorage.setItem('khorom_products', JSON.stringify(sorted));
        } catch {}
        return sorted;
      });

      // 2. Centralized Firestore batch update (Authoritative Source of Truth)
      let firestoreOk = false;
      try {
        await updateProductPositionsInFirestore(positions);
        firestoreOk = true;
      } catch (fErr) {
        console.warn('Firestore position batch write warning:', fErr);
      }

      // 3. Synchronize Express backend
      let apiOk = false;
      try {
        const res = await fetch('/api/products-positions', {
          method: 'PUT',
          headers: getAdminHeaders(),
          body: JSON.stringify({ positions }),
        });
        if (res.ok) {
          apiOk = true;
          const data = await res.json();
          if (data.products && Array.isArray(data.products)) {
            setProducts(data.products);
          }
        } else if (res.status === 403) {
          showToast(language === 'bn' ? 'অননুমোদিত: শুধুমাত্র অনুমোদিত অ্যাডমিন পজিশন পরিবর্তন করতে পারবে।' : 'Access Denied: Only authorized admins can change product positions.');
          return false;
        }
      } catch (apiErr) {
        console.warn('Backend API position update warning:', apiErr);
      }

      if (firestoreOk || apiOk) {
        fetchOverviewStats();
        showToast(
          language === 'bn'
            ? 'পণ্যসমূহের নতুন পজিশন সফলভাবে ডাটাবেজে সংরক্ষিত হয়েছে!'
            : 'Product positions saved to database successfully!'
        );
        return true;
      } else {
        showToast(
          language === 'bn'
            ? 'পজিশন সংরক্ষণ করতে ব্যর্থ হয়েছে।'
            : 'Failed to save product positions.'
        );
        return false;
      }
    } catch (err) {
      console.error('Failed to save product positions:', err);
      showToast(
        language === 'bn'
          ? 'পজিশন সংরক্ষণ করতে ব্যর্থ হয়েছে।'
          : 'Failed to save product positions.'
      );
      return false;
    }
  };

  const resetProductsToDefault = async () => {
    try {
      const res = await fetch('/api/products/reset', {
        method: 'POST',
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
        fetchOverviewStats();
        showToast(
          language === 'bn'
            ? 'সকল পণ্য মূল ডিফল্ট তালিকায় রিসেট করা হয়েছে।'
            : 'Products reset to default inventory.'
        );
      } else if (res.status === 403) {
        showToast(language === 'bn' ? 'অননুমোদিত: রিসেট করার অনুমতি নেই।' : 'Access Denied.');
      }
    } catch (err) {
      console.error('Failed to reset products:', err);
    }
  };

  // -------------------------------------------------------------
  // PROMO CODES / COUPONS MANAGEMENT
  // -------------------------------------------------------------

  const addPromoCode = async (promo: PromoCode) => {
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify(promo),
      });

      if (res.ok) {
        const savedCoupon: PromoCode = await res.json();
        setPromoCodes((prev) => {
          const exists = prev.some((p) => p.code.toUpperCase() === savedCoupon.code.toUpperCase());
          if (exists) {
            return prev.map((p) => (p.code.toUpperCase() === savedCoupon.code.toUpperCase() ? savedCoupon : p));
          }
          return [savedCoupon, ...prev];
        });
        savePromoToFirestore(savedCoupon);
        fetchOverviewStats();
        showToast(
          language === 'bn'
            ? `কুপন কোড "${savedCoupon.code}" ডাটাবেজে তৈরি হয়েছে!`
            : `Coupon "${savedCoupon.code}" created and validated in database!`
        );
      } else if (res.status === 403) {
        showToast(language === 'bn' ? 'অননুমোদিত: কুপন তৈরির অনুমতি নেই।' : 'Access Denied: Cannot create coupon.');
      }
    } catch (err) {
      console.error('Failed to add coupon:', err);
    }
  };

  const deletePromoCode = async (code: string) => {
    try {
      const res = await fetch(`/api/coupons/${encodeURIComponent(code)}`, {
        method: 'DELETE',
        headers: getAdminHeaders(),
      });
      if (res.ok) {
        setPromoCodes((prev) => prev.filter((p) => p.code.toUpperCase() !== code.toUpperCase()));
        deleteCouponFromFirestore(code);
        if (appliedPromo?.code.toUpperCase() === code.toUpperCase()) {
          setAppliedPromo(null);
          setServerDiscountAmount(null);
        }
        fetchOverviewStats();
        showToast(
          language === 'bn'
            ? `কুপন কোড "${code}" ডাটাবেজ থেকে মুছে ফেলা হয়েছে।`
            : `Coupon "${code}" deleted from database.`
        );
      } else if (res.status === 403) {
        showToast(language === 'bn' ? 'অননুমোদিত: কুপন মোছার অনুমতি নেই।' : 'Access Denied.');
      }
    } catch (err) {
      console.error('Failed to delete coupon:', err);
    }
  };

  // -------------------------------------------------------------
  // CENTRALIZED WEBSITE CUSTOMIZATION & CONTENT
  // -------------------------------------------------------------

  const updateCustomization = async (updates: Partial<WebsiteCustomization>) => {
    // 1. Calculate merged state with deep logoSettings preservation
    const merged: WebsiteCustomization = {
      ...DEFAULT_WEBSITE_CUSTOMIZATION,
      ...customization,
      ...updates,
      logoSettings: {
        ...DEFAULT_WEBSITE_CUSTOMIZATION.logoSettings,
        ...(customization.logoSettings || {}),
        ...(updates.logoSettings || {}),
      },
    };

    // 2. Optimistic instant update (0ms delay)
    setCustomization(merged);
    try {
      localStorage.setItem('khorom_site_customization', JSON.stringify(merged));
    } catch {}

    showToast(
      language === 'bn'
        ? 'ওয়েবসাইটের টেক্সট ও সেটিংস সফলভাবে আপডেট হয়েছে!'
        : 'Website content and settings updated successfully!'
    );

    // 3. Concurrent Dual-Write to Firestore + Express Backend in parallel
    try {
      const [firestoreRes, apiRes] = await Promise.allSettled([
        saveSettingsToFirestore(merged),
        fetch('/api/settings', {
          method: 'PUT',
          headers: getAdminHeaders(),
          body: JSON.stringify(merged),
        }),
      ]);

      const firestoreSuccess = firestoreRes.status === 'fulfilled' && firestoreRes.value === true;
      const apiSuccess = apiRes.status === 'fulfilled' && apiRes.value.ok;

      if (apiSuccess && apiRes.status === 'fulfilled') {
        const data = await apiRes.value.json();
        if (data.settings) {
          const finalSettings: WebsiteCustomization = {
            ...merged,
            ...data.settings,
            logoSettings: {
              ...merged.logoSettings,
              ...(data.settings.logoSettings || {}),
            },
          };
          setCustomization(finalSettings);
          try {
            localStorage.setItem('khorom_site_customization', JSON.stringify(finalSettings));
          } catch {}
        }
      }

      if (!firestoreSuccess && !apiSuccess) {
        console.warn('Settings dual-persistence warning: neither Firestore nor backend confirmed, using local state.');
      }
    } catch (err) {
      console.error('Failed to update customization:', err);
    }
  };

  const resetCustomization = async () => {
    const defaultSettings = { ...DEFAULT_WEBSITE_CUSTOMIZATION };
    // Optimistic reset
    setCustomization(defaultSettings);
    try {
      localStorage.setItem('khorom_site_customization', JSON.stringify(defaultSettings));
    } catch {}

    showToast(
      language === 'bn'
        ? 'ওয়েবসাইট কনটেন্ট ডিফল্ট মানে রিসেট করা হয়েছে।'
        : 'Website content restored to default.'
    );

    try {
      await Promise.allSettled([
        saveSettingsToFirestore(defaultSettings),
        fetch('/api/settings/reset', {
          method: 'POST',
          headers: getAdminHeaders(),
        }),
      ]);
    } catch (err) {
      console.error('Failed to reset customization:', err);
    }
  };

  // Real product interaction analytics tracking
  const recordProductClick = (productId: string, type: 'view' | 'click' | 'like' = 'click') => {
    // Update local state immediately for snappy UI
    setProductClickStats((prev) => {
      const current = prev[productId] || { productId, clicks: 0, views: 0, likes: 0 };
      return {
        ...prev,
        [productId]: {
          ...current,
          clicks: type === 'click' ? current.clicks + 1 : current.clicks,
          views: type === 'view' ? current.views + 1 : current.views,
          likes: type === 'like' ? (current.likes || 0) + 1 : current.likes,
        },
      };
    });

    // Send real tracking event to database
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, type }),
    }).catch(() => {});
  };

  // Hot Deals toggle
  const toggleHotDeal = async (productId: string): Promise<boolean> => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return false;
    const newVal = !prod.isHotDeal;
    return await updateProduct(productId, { isHotDeal: newVal });
  };

  // Reviews and Rating Management
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [allStoreReviews, setAllStoreReviews] = useState<any[]>([]);

  const fetchProductReviews = useCallback(async (productId: string): Promise<ProductReview[]> => {
    try {
      const res = await fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`);
      if (res.ok) {
        const data: ProductReview[] = await res.json();
        setReviews(data);
        return data;
      }
    } catch (err) {
      console.warn('Fetch reviews error:', err);
    }
    return [];
  }, []);

  const fetchAllStoreReviews = useCallback(async (): Promise<any[]> => {
    try {
      const res = await fetch('/api/reviews');
      if (res.ok) {
        const data = await res.json();
        setAllStoreReviews(data);
        return data;
      }
    } catch (err) {
      console.warn('Fetch all store reviews error:', err);
    }
    return [];
  }, []);

  const submitReview = async (
    orderId: string,
    productId: string,
    rating: number,
    comment: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser?.email) {
      showToast(
        language === 'bn'
          ? 'রিভিউ দিতে অনুগ্রহ করে প্রথমে লগইন করুন।'
          : 'Please log in to submit a review.'
      );
      setIsAuthModalOpen(true);
      return { success: false, message: 'Authentication required' };
    }

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          productId,
          rating,
          comment,
          userId: currentUser.id || currentUser.email,
          userName: currentUser.name,
          userEmail: currentUser.email,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        // Save review to Firebase Firestore
        saveReviewToFirestore({
          productId,
          userName: currentUser.name || 'Verified Customer',
          rating,
          comment,
          userEmail: currentUser.email,
        });

        showToast(
          language === 'bn'
            ? 'আপনার মূল্যবান রিভিউ সফলভাবে জমা দেওয়া হয়েছে!'
            : 'Your review has been submitted successfully!'
        );
        // Mark local order as reviewed
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, reviewed: true } : o))
        );
        // Refresh products to update average rating and reviewCount
        fetchProducts();
        fetchProductReviews(productId);
        return { success: true, message: data.message || 'Success' };
      } else {
        showToast(data.error || 'রিভিউ জমা দিতে ব্যর্থ হয়েছে');
        return { success: false, message: data.error || 'Failed' };
      }
    } catch (err) {
      console.error('Submit review error:', err);
      showToast('নেটওয়ার্ক সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।');
      return { success: false, message: 'Network error' };
    }
  };

  // Top Selling Products Analytics
  const [topSellingProducts, setTopSellingProducts] = useState<
    { product: Product; soldCount: number; revenue: number }[]
  >([]);

  const fetchTopSellingProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products/top-selling');
      if (res.ok) {
        const data = await res.json();
        setTopSellingProducts(data);
        return data;
      }
    } catch (err) {
      console.warn('Fetch top selling error:', err);
    }
    return [];
  }, []);

  // Secure Auth-Guarded Actions
  const openCartSecurely = () => {
    if (!currentUser) {
      showToast(
        language === 'bn'
          ? 'কার্ট দেখতে অনুগ্রহ করে প্রথমে আপনার অ্যাকাউন্টে লগইন করুন।'
          : 'Please log in to view your cart.'
      );
      setIsAuthModalOpen(true);
      return;
    }
    setIsCartOpen(true);
  };

  const openCheckoutSecurely = () => {
    if (!currentUser) {
      showToast(
        language === 'bn'
          ? 'চেকআউট করতে অনুগ্রহ করে প্রথমে আপনার অ্যাকাউন্টে লগইন করুন।'
          : 'Please log in to proceed to checkout.'
      );
      setIsAuthModalOpen(true);
      return;
    }
    setIsCheckoutOpen(true);
  };

  const directBuyNow = (
    product: Product,
    quantity = 1,
    color?: string,
    size?: string,
    isPreOrder = false
  ) => {
    if (!currentUser) {
      showToast(
        language === 'bn'
          ? isPreOrder
            ? 'প্রি-অর্ডার করতে অনুগ্রহ করে প্রথমে অ্যাকাউন্টে লগইন করুন।'
            : 'অর্ডার করতে অনুগ্রহ করে প্রথমে অ্যাকাউন্টে লগইন করুন।'
          : 'Please log in to proceed with your order.'
      );
      setIsAuthModalOpen(true);
      return;
    }

    const chosenColor = color || (product.colors && product.colors.length > 0 ? product.colors[0].name : undefined);
    const chosenSize = size || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined);
    setCart([{ product, quantity, selectedColor: chosenColor, selectedSize: chosenSize }]);
    setIsCheckoutOpen(true);
  };

  const placeWhatsAppOrder = async (
    product: Product,
    quantity = 1,
    color?: string,
    size?: string
  ) => {
    directBuyNow(product, quantity, color, size);
  };

  // -------------------------------------------------------------
  // FACEBOOK INTEGRATION & DUPLICATE RESOLUTION (STEP 5 & 6)
  // -------------------------------------------------------------

  const syncFacebookPosts = async (options?: { pageId?: string; accessToken?: string }) => {
    try {
      showToast(language === 'bn' ? 'ফেসবুক পেজ থেকে পোস্ট সিঙ্ক করা হচ্ছে...' : 'Syncing posts from Facebook Page...');

      const adminHeaders = getAdminHeaders();
      const res = await fetch('/api/facebook/sync', {
        method: 'POST',
        headers: {
          ...adminHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pageId: options?.pageId }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Facebook sync failed');
      }

      const rawPosts = data.posts || [];
      const pageName = data.pageName || 'Khorom';
      const addedPosts: FacebookPendingPost[] = [];

      for (const post of rawPosts) {
        const postId = `fb_post_${post.id}`;
        // Skip if already in local state
        const exists = facebookPostsRaw.some((p) => p.id === postId || p.fbPostId === post.id);
        if (exists) continue;

        const caption =
          post.message ||
          post.story ||
          post.attachments?.data?.[0]?.description ||
          post.attachments?.data?.[0]?.title ||
          '';
        const parsed = parseFacebookCaption(caption, categories);

        const subImages: string[] = [];
        if (post.attachments?.data?.[0]?.subattachments?.data) {
          for (const sub of post.attachments.data[0].subattachments.data) {
            if (sub.media?.image?.src) {
              subImages.push(sub.media.image.src);
            }
          }
        }

        const imageUrl =
          post.full_picture ||
          post.attachments?.data?.[0]?.media?.image?.src ||
          (subImages.length > 0 ? subImages[0] : '') ||
          'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80';

        const allImages = [imageUrl, ...subImages.filter((img) => img !== imageUrl)];

        const newPendingPost: FacebookPendingPost = {
          id: postId,
          fbPostId: post.id,
          permalinkUrl: post.permalink_url || `https://facebook.com/${data.pageId || 'khorom'}/posts/${post.id}`,
          caption,
          imageUrl,
          additionalImages: subImages.filter((img) => img !== imageUrl),
          createdAt: post.created_time || new Date().toISOString(),
          status: 'pending',
          detectedProduct: {
            titleBn: parsed.titleBn || `খড়ম পোস্ট আইটেম`,
            titleEn: parsed.titleEn || `Khorom Post Item`,
            price: parsed.price || 1250,
            originalPrice: parsed.originalPrice || 1650,
            category: parsed.category || 'shoes',
            colors: parsed.colors && parsed.colors.length > 0 ? parsed.colors : [{ name: 'Black', hex: '#111827' }],
            sizes: parsed.sizes && parsed.sizes.length > 0 ? parsed.sizes : ['39', '40', '41', '42', '43'],
            stockCount: 15,
            descriptionBn: caption || 'খড়ম প্রিমিয়াম হ্যান্ডমেড প্রোডাক্ট।',
            descriptionEn: 'Khorom signature handcrafted item.',
            image: imageUrl,
            images: allImages,
            tags: ['Facebook', pageName],
          },
        };

        await saveFacebookPostToFirestore(newPendingPost);
        addedPosts.push(newPendingPost);
      }

      if (addedPosts.length > 0) {
        setFacebookPostsRaw((prev) => {
          const combined = [...addedPosts, ...prev];
          try {
            localStorage.setItem('khorom_fb_posts', JSON.stringify(combined));
          } catch {}
          return combined;
        });

        showToast(
          language === 'bn'
            ? `ফেসবুক পেজ "${pageName}" থেকে ${addedPosts.length}টি নতুন পোস্ট পেন্ডিং তালিকায় যুক্ত হয়েছে!`
            : `${addedPosts.length} new posts synced from Facebook Page "${pageName}"!`
        );
      } else {
        const diag = data.diagnostics;
        let msg = language === 'bn'
          ? `পেজ "${pageName}" আপ-টু-ডেট আছে! নতুন কোনো পোস্ট নেই।`
          : `Page "${pageName}" is up-to-date! No new posts.`;

        if (rawPosts.length === 0 && diag && !diag.hasPagePermissions) {
          msg = language === 'bn'
            ? `পেজ থেকে কোনো পোস্ট পাওয়া যায়নি। আপনার টোকেনে pages_read_engagement অনুমতি নাও থাকতে পারে। "Continue with Facebook" দিয়ে লগইন করলে সব অনুমতি স্বয়ংক্রিয়ভাবে পাওয়া যাবে।`
            : `No posts found. Token might be missing pages_read_engagement permission. Login via "Continue with Facebook" for full permissions.`;
        }
        showToast(msg);
      }

      return { count: addedPosts.length, message: 'Synced successfully' };
    } catch (err: any) {
      console.error('Facebook sync error:', err);
      showToast(err?.message || (language === 'bn' ? 'ফেসবুক সিঙ্ক করতে সমস্যা হয়েছে।' : 'Facebook sync failed.'));
      return { count: 0, message: err?.message || 'Sync failed' };
    }
  };

  const addManualFacebookPost = async (partial: Partial<FacebookPendingPost>) => {
    try {
      const caption = partial.caption || '';
      const parsed = parseFacebookCaption(caption, categories);

      const newPostId = `fb_post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newPost: FacebookPendingPost = {
        id: newPostId,
        fbPostId: partial.fbPostId || `manual_${Date.now()}`,
        permalinkUrl: partial.permalinkUrl || 'https://facebook.com/khorom.official',
        caption: caption,
        imageUrl: partial.imageUrl || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80',
        additionalImages: partial.additionalImages || [],
        createdAt: new Date().toISOString(),
        status: 'pending',
        detectedProduct: {
          titleBn: partial.detectedProduct?.titleBn || parsed.titleBn || 'খড়ম নতুন কালেকশন',
          titleEn: partial.detectedProduct?.titleEn || parsed.titleEn || 'Khorom New Collection',
          price: partial.detectedProduct?.price || parsed.price || 2200,
          originalPrice: partial.detectedProduct?.originalPrice || (parsed.price ? Math.round(parsed.price * 1.25) : 2600),
          category: partial.detectedProduct?.category || parsed.category || 'clothing',
          colors: partial.detectedProduct?.colors?.length ? partial.detectedProduct.colors : (parsed.colors || [{ name: 'Classic Black', hex: '#111827' }]),
          sizes: partial.detectedProduct?.sizes?.length ? partial.detectedProduct.sizes : (parsed.sizes || ['M', 'L', 'XL']),
          stockCount: partial.detectedProduct?.stockCount || 15,
          descriptionBn: partial.detectedProduct?.descriptionBn || caption || '১০০% অরিজিনাল খড়ম পণ্য।',
          descriptionEn: partial.detectedProduct?.descriptionEn || caption || '100% authentic Khorom product.',
          image: partial.imageUrl || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80',
          images: partial.imageUrl ? [partial.imageUrl] : [],
          tags: ['Facebook', 'Arrival'],
        },
      };

      await saveFacebookPostToFirestore(newPost);

      setFacebookPostsRaw((prev) => {
        const filtered = prev.filter((p) => p.id !== newPost.id);
        const updated = [newPost, ...filtered];
        try {
          localStorage.setItem('khorom_fb_posts', JSON.stringify(updated));
        } catch {}
        return updated;
      });

      showToast(
        language === 'bn'
          ? 'নতুন ফেসবুক পোস্ট পেন্ডিং তালিকায় যোগ করা হয়েছে!'
          : 'New Facebook post added to Pending list!'
      );
      return { success: true, id: newPost.id };
    } catch (err: any) {
      console.error('addManualFacebookPost error:', err);
      return { success: false, error: err?.message || 'Failed to add Facebook post' };
    }
  };

  const updateFacebookPendingPost = async (id: string, updates: Partial<FacebookPendingPost>): Promise<boolean> => {
    try {
      const existing = facebookPostsRaw.find((p) => p.id === id);
      if (!existing) return false;

      const merged: FacebookPendingPost = {
        ...existing,
        ...updates,
        detectedProduct: {
          ...existing.detectedProduct,
          ...(updates.detectedProduct || {}),
        },
      };

      await updateFacebookPostInFirestore(id, merged);

      setFacebookPostsRaw((prev) => {
        const updated = prev.map((p) => (p.id === id ? merged : p));
        try {
          localStorage.setItem('khorom_fb_posts', JSON.stringify(updated));
        } catch {}
        return updated;
      });

      showToast(language === 'bn' ? 'পোস্টের তথ্য সফলভাবে আপডেট হয়েছে।' : 'Post details updated successfully.');
      return true;
    } catch (err) {
      console.error('updateFacebookPendingPost error:', err);
      return false;
    }
  };

  const publishFacebookPostAsProduct = async (
    postId: string,
    options?: { forceOverride?: boolean; overrideData?: Partial<Product> }
  ): Promise<{ success: boolean; product?: Product; error?: string }> => {
    try {
      const post = facebookPosts.find((p) => p.id === postId);
      if (!post) {
        return { success: false, error: 'Post not found' };
      }

      if (post.duplicateMatch?.level === 'already_exists' && !options?.forceOverride) {
        return {
          success: false,
          error:
            language === 'bn'
              ? 'সতর্কতা: ডাটাবেজে এই পণ্যটি ইতিমধ্যে রয়েছে (Already Exists)। প্রকাশ করতে কনফার্মেশন দিন।'
              : 'Warning: Product already exists in catalogue. Confirmation required to override.',
        };
      }

      const prodId = `prod-fb-${Date.now()}`;
      const detected = post.detectedProduct;

      const newProduct: Product = {
        id: prodId,
        productId: prodId,
        titleBn: options?.overrideData?.titleBn || detected.titleBn || 'খড়ম নতুন পণ্য',
        titleEn: options?.overrideData?.titleEn || detected.titleEn || 'Khorom New Product',
        price: options?.overrideData?.price || detected.price || 1990,
        originalPrice: options?.overrideData?.originalPrice || detected.originalPrice || Math.round((detected.price || 1990) * 1.25),
        category: options?.overrideData?.category || detected.category || 'clothing',
        colors: options?.overrideData?.colors || (detected.colors?.length ? detected.colors : [{ name: 'Classic Black', hex: '#111827' }]),
        sizes: options?.overrideData?.sizes || (detected.sizes?.length ? detected.sizes : ['M', 'L', 'XL']),
        inStock: true,
        stockCount: options?.overrideData?.stockCount || detected.stockCount || 20,
        descriptionBn: options?.overrideData?.descriptionBn || detected.descriptionBn || post.caption,
        descriptionEn: options?.overrideData?.descriptionEn || detected.descriptionEn || post.caption,
        image: options?.overrideData?.image || detected.image || post.imageUrl,
        images: options?.overrideData?.images || (detected.images?.length ? detected.images : [post.imageUrl]),
        rating: 5.0,
        reviewCount: 1,
        isHotDeal: false,
        isNew: true,
        specifications: {
          'Origin': 'Authentic KHOROM',
          'Source': 'Official Facebook Post',
        },
        tags: options?.overrideData?.tags || detected.tags || ['Facebook', 'New'],
        position: products.length + 1,
      };

      // 1. Create normal product using existing Firestore/Firebase product system
      const productAdded = await addProduct(newProduct);
      if (!productAdded) {
        return { success: false, error: 'Failed to create product in store catalogue' };
      }

      // 2. Mark Facebook post as published
      const updatedPost: FacebookPendingPost = {
        ...post,
        status: 'published',
        publishedProductId: newProduct.id,
        reviewedAt: new Date().toISOString(),
        reviewedBy: currentUser?.email || 'Admin',
      };

      await updateFacebookPostInFirestore(postId, updatedPost);

      setFacebookPostsRaw((prev) => {
        const updated = prev.map((p) => (p.id === postId ? updatedPost : p));
        try {
          localStorage.setItem('khorom_fb_posts', JSON.stringify(updated));
        } catch {}
        return updated;
      });

      showToast(
        language === 'bn'
          ? `"${newProduct.titleBn}" সফলভাবে স্টোর ক্যাটালগে যুক্ত হয়েছে!`
          : `"${newProduct.titleEn}" published to store catalogue successfully!`
      );
      return { success: true, product: newProduct };
    } catch (err: any) {
      console.error('publishFacebookPostAsProduct error:', err);
      return { success: false, error: err?.message || 'Publishing failed' };
    }
  };

  const rejectFacebookPost = async (postId: string, reason?: string): Promise<boolean> => {
    try {
      const post = facebookPostsRaw.find((p) => p.id === postId);
      if (!post) return false;

      const updated: FacebookPendingPost = {
        ...post,
        status: 'rejected',
        rejectionReason: reason || (language === 'bn' ? 'অ্যাডমিন কর্তৃক বাতিল' : 'Rejected by admin'),
        reviewedAt: new Date().toISOString(),
        reviewedBy: currentUser?.email || 'Admin',
      };

      await updateFacebookPostInFirestore(postId, updated);

      setFacebookPostsRaw((prev) => {
        const list = prev.map((p) => (p.id === postId ? updated : p));
        try {
          localStorage.setItem('khorom_fb_posts', JSON.stringify(list));
        } catch {}
        return list;
      });

      showToast(language === 'bn' ? 'পোস্টটি বাতিল তালিকায় রাখা হয়েছে।' : 'Post marked as rejected.');
      return true;
    } catch (err) {
      console.error('rejectFacebookPost error:', err);
      return false;
    }
  };

  const reopenFacebookPost = async (postId: string): Promise<boolean> => {
    try {
      const post = facebookPostsRaw.find((p) => p.id === postId);
      if (!post) return false;

      const updated: FacebookPendingPost = {
        ...post,
        status: 'pending',
        rejectionReason: undefined,
        reviewedAt: undefined,
        reviewedBy: undefined,
      };

      await updateFacebookPostInFirestore(postId, updated);

      setFacebookPostsRaw((prev) => {
        const list = prev.map((p) => (p.id === postId ? updated : p));
        try {
          localStorage.setItem('khorom_fb_posts', JSON.stringify(list));
        } catch {}
        return list;
      });

      showToast(language === 'bn' ? 'পোস্টটি পুনরায় পেন্ডিং তালিকায় সরানো হয়েছে।' : 'Post moved back to Pending.');
      return true;
    } catch (err) {
      console.error('reopenFacebookPost error:', err);
      return false;
    }
  };

  const deleteFacebookPost = async (postId: string): Promise<boolean> => {
    try {
      await deleteFacebookPostFromFirestore(postId);

      setFacebookPostsRaw((prev) => {
        const list = prev.filter((p) => p.id !== postId);
        try {
          localStorage.setItem('khorom_fb_posts', JSON.stringify(list));
        } catch {}
        return list;
      });

      showToast(language === 'bn' ? 'ফেসবুক পোস্টটি ডিলিট করা হয়েছে।' : 'Facebook post deleted.');
      return true;
    } catch (err) {
      console.error('deleteFacebookPost error:', err);
      return false;
    }
  };

  return (
    <StoreContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        currency,
        setCurrency,
        toggleCurrency,
        formatPrice,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateCartItemQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        appliedPromo,
        applyPromo,
        removePromo,
        discountAmount,
        promoDiscount: discountAmount,
        shippingFee,
        cartTotal,
        wishlist,
        toggleWishlist,
        isWishlisted,
        orders,
        placeOrder,
        updateOrderStatus,
        selectedProduct,
        setSelectedProduct,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isOrderTrackingOpen,
        setIsOrderTrackingOpen,
        isProductModalOpen,
        setIsProductModalOpen,
        isAdminPanelOpen,
        setIsAdminPanelOpen,
        isResetPasswordOpen,
        setIsResetPasswordOpen,
        currentUser,
        setCurrentUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        loginWithGoogle,
        loginWithEmail,
        registerWithPassword,
        loginWithPassword,
        logout,
        isLogoutConfirmOpen,
        setIsLogoutConfirmOpen,
        requestLogout,
        confirmLogout,
        cancelLogout,
        sendPasswordReset,
        lastCompletedOrder,
        setLastCompletedOrder,
        toastMessage,
        showToast,
        hideToast,
        // Categories Management
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        reorderCategories,
        // Product Management & Edit Position
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductPublished,
        saveProductPositions,
        resetProductsToDefault,
        toggleHotDeal,
        // Customer Reviews & Ratings
        reviews,
        allStoreReviews,
        fetchAllStoreReviews,
        submitReview,
        fetchProductReviews,
        // Direct actions & Auth Guard
        openCartSecurely,
        openCheckoutSecurely,
        directBuyNow,
        placeWhatsAppOrder,
        // Best Selling Analytics
        topSellingProducts,
        fetchTopSellingProducts,
        // Promo Code Management
        promoCodes,
        addPromoCode,
        deletePromoCode,
        // Real Analytics & Overview Stats
        userLoginLogs,
        productClickStats,
        recordProductClick,
        overviewStats,
        refreshOverviewStats,
        // Centralized Customization
        customization,
        updateCustomization,
        resetCustomization,
        // KHOROM Coins Loyalty System
        userCoins,
        coinTransactions,
        coinSettings,
        updateCoinSettings,
        appliedCoins,
        applyCoins,
        removeCoins,
        coinsDiscountAmount,
        potentialCoinsToEarn,
        coinStats,
        fetchCoinStats,
        markOrderReceived,
        isCoinHistoryModalOpen,
        setIsCoinHistoryModalOpen,
        claimDailyCoins,
        isDailyClaimedToday,
        adjustUserCoins,
        getAdminHeaders,
        fetchCoinCustomers,
        fetchCoinTransactions,
        // Pathao Courier Integration
        courierSettings,
        fetchCourierSettings,
        updateCourierSettings,
        testCourierConnection,
        dispatchPathaoOrder,
        trackPathaoOrder,
        // Offers Center
        offers,
        appliedOffer,
        applyOffer,
        removeOffer,
        offerDiscountAmount,
        createOffer,
        updateOffer,
        deleteOffer,
        duplicateOffer,
        toggleOfferStatus,
        offersStats,
        fetchOffersStats,
        isOffersModalOpen,
        setIsOffersModalOpen,
        // Facebook Page Integration & Duplicate Detection (STEP 5 & 6)
        facebookPosts,
        pendingFacebookPostsCount,
        syncFacebookPosts,
        addManualFacebookPost,
        updateFacebookPendingPost,
        publishFacebookPostAsProduct,
        rejectFacebookPost,
        reopenFacebookPost,
        deleteFacebookPost,
        // Customer Address Book
        userAddresses,
        fetchUserAddresses,
        addUserAddress,
        setDefaultAddress,
        deleteUserAddress,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
