export type Language = 'bn' | 'en';
export type Currency = 'BDT' | 'USD';

export const AUTHORIZED_ADMIN_EMAILS: string[] = [
  'amranizaz97@gmail.com',
  'khoromstore.info@gmail.com',
  'mahinurislam580@gmail.com',
  'hajiganjbashi@gmail.com',
].map((e) => e.toLowerCase().trim());

export function isAuthorizedAdmin(email?: string | null): boolean {
  if (!email) return false;
  return AUTHORIZED_ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

export interface SubCategory {
  id: string;
  nameBn: string;
  nameEn: string;
  parentId: string;
  itemCount?: number;
  types?: { id: string; nameBn: string; nameEn: string }[];
}

export interface Product {
  id: string;
  productId?: string;
  name?: string;
  savedToFirebase?: boolean;
  position?: number;
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  descriptionEn: string;
  price: number; // base selling price in BDT
  originalPrice?: number; // crossed out regular price if discount active
  realPrice?: number; // regular/original price
  discountPrice?: number | null; // active discount price if any
  category: string;
  categoryId?: string;
  subcategory?: string;
  subcategoryId?: string;
  itemType?: string;
  image: string;
  images: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  stock?: number;
  isFeatured?: boolean;
  featured?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  isHotDeal?: boolean;
  hotDeal?: boolean;
  isPreOrder?: boolean;
  published?: boolean;
  bonusCoinsEnabled?: boolean;
  bonusCoins?: number;
  status?: 'published' | 'draft' | 'disabled';
  specifications: { [key: string]: string };
  colors?: { name: string; hex: string }[];
  sizes?: string[];
  tags: string[];
  createdAt?: any;
  updatedAt?: any;
}

export interface Category {
  id: string;
  nameBn: string;
  nameEn: string;
  iconName: string;
  icon?: string;
  itemCount: number;
  order?: number;
  orderIndex?: number;
  subcategories?: SubCategory[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  color?: string;
  size?: string;
  bonusCoins?: number;
}

export interface CustomerInfo {
  fullName: string;
  phone: string;
  email: string;
  division?: string;
  district?: string;
  upazila?: string;
  thana?: string;
  area?: string;
  address: string;
  city: string;
  notes?: string;
  bkashNumber?: string;
  bkashTrxId?: string;
}

export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'card';

export type OrderStatus =
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'received'
  | 'cancelled'
  | 'returned';

export interface OrderHistoryEntry {
  id: string;
  fromStatus: string;
  toStatus: string;
  timestamp: string;
  changedBy: string;
  note?: string;
}

export interface UserAddress {
  id: string;
  fullName: string;
  phone: string;
  district: string;
  upazila: string;
  city: string;
  address: string;
  isDefault?: boolean;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  userEmail?: string;
  createdAt: string;
  updatedAt?: string;
  items: CartItem[];
  customer: CustomerInfo;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid' | 'pending_verification';
  bkashNumber?: string;
  bkashTrxId?: string;
  status: OrderStatus;
  estimatedDelivery: string;
  source?: 'website' | 'whatsapp';
  isPreOrder?: boolean;
  reviewed?: boolean;
  orderType?: 'standard' | 'pre-order';
  // Audit Trail & Events Log
  history?: OrderHistoryEntry[];
  // KHOROM Coins Integration
  coinsUsed?: number;
  coinsDiscount?: number;
  coinsEarned?: number;
  coinsAwarded?: boolean;
  coinRewardGranted?: boolean;
  coinRewardAmount?: number;
  // Offers Center Integration
  appliedOffer?: {
    offerId: string;
    offerName: string;
    discountType: 'percent' | 'fixed';
    discountAmount: number;
    appliedAt: string;
  };
  cancellationReason?: string;
  cancelledAt?: string;
  returnReason?: string;
  returnedAt?: string;
  // Pathao Courier Integration
  pathaoConsignmentId?: string;
  pathaoTrackingId?: string;
  pathaoCourierStatus?: string;
  pathaoSentAt?: string;
  pathaoDeliveryFee?: number;
  pathaoResponse?: any;
  pathaoLastSyncAt?: string;
  pathaoHistory?: Array<{ status: string; timestamp: string; note?: string }>;
}

export interface ProductReview {
  id: string;
  orderId: string;
  productId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
  status?: 'approved' | 'hidden' | 'pending';
  adminNotes?: string;
}

export interface PromoCode {
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  minSpend: number;
  descriptionBn: string;
  descriptionEn: string;
  expiryDate?: string;
  usageLimit?: number;
  timesUsed?: number;
  isActive?: boolean;
  createdAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  provider: 'email' | 'google';
  role: 'admin' | 'customer';
  phone?: string;
  membershipTier?: string;
  joinedDate: string;
  googleLinked?: boolean;
  coins?: number;
  points?: number;
  totalOrders?: number;
  totalSpent?: number;
  lastDailyClaimDate?: string;
  addresses?: UserAddress[];
}

// KHOROM Coins Loyalty System Types
export interface KhoromCoinSettings {
  enabled: boolean;
  coinsPer100Bdt: number; // Default 1 coin per 100 BDT
  coinsPer1000Bdt?: number; // Admin control: Coins per ৳1,000 Purchase (e.g. 50)
  valuePerCoin: number; // Default 0.50 BDT (10 coins = 5 BDT)
  coinValueBdt?: number; // Alias for valuePerCoin
  minRedeemCoins: number; // Minimum coins required before redeeming (e.g. 20)
  maxRedeemCoinsPerOrder: number; // Max coins allowed in a single order (e.g. 200)
  maxDiscountPercent: number; // Max % of subtotal that can be discounted via coins (e.g. 20%)
  awardOnStatus: 'confirmed' | 'delivered' | 'received'; // When coins are awarded (default: 'received')
  expiryEnabled: boolean;
  expiryMonths: number; // e.g. 12 months
  dailyClaimCoins?: number;
}

export type CoinTransactionType =
  | 'reward'
  | 'earned'
  | 'redeem'
  | 'refund_reversal'
  | 'bonus'
  | 'daily_claim'
  | 'admin_adjustment';

export type CoinSourceCategory =
  | 'Daily Claim'
  | 'Shopping Reward'
  | 'Coin Usage'
  | 'Admin Adjustment';

export interface CoinTransaction {
  id: string;
  userId: string;
  userEmail?: string;
  orderId?: string;
  type: CoinTransactionType;
  sourceCategory?: CoinSourceCategory;
  amount: number; // positive for earn/bonus/daily, negative for redeem/reversal
  balanceAfter: number;
  descriptionBn: string;
  descriptionEn: string;
  reason?: string;
  adminEmail?: string;
  createdAt: string;
}

export interface CoinStats {
  totalCoinsIssued: number;
  totalCoinsRedeemed: number;
  activeCustomerCoins: number;
  totalCoinsExpired: number;
  coinsUsedThisMonth: number;
  coinsAwardedThisMonth: number;
  totalCoinsInCirculation?: number;
  totalCoinsEarned?: number;
  activeUsersWithCoins?: number;
}

// Pathao Courier Settings
export interface PathaoCourierSettings {
  environment: 'sandbox' | 'production';
  clientId: string;
  clientSecret: string;
  username: string;
  password?: string;
  storeId?: string | number;
  webhookSecret: string;
  callbackUrl?: string;
  baseUrl?: string;
  enabled: boolean;
  autoDispatchOnConfirm?: boolean;
}

// Offers Center Types
export type OfferType =
  | 'hot_deal'
  | 'limited_time'
  | 'best_discount'
  | 'buy_more_save_more'
  | 'flash'
  | 'min_purchase'
  | 'category'
  | 'new_customer'
  | 'bonus_coins'
  | 'discount'
  | 'free_shipping';

export type OfferStatus = 'active' | 'scheduled' | 'expired' | 'disabled' | 'paused';

export interface KhoromOffer {
  id: string;
  name: string;
  code?: string;
  titleBn?: string;
  titleEn?: string;
  type: OfferType;
  badgeText?: string;
  badgeTextBn?: string;
  badgeTextEn?: string;
  description?: string;
  descriptionBn?: string;
  descriptionEn?: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  maxDiscount?: number; // Profit protection cap
  minPurchase: number; // Min order subtotal required
  minSpend?: number;
  applicableCategoryIds?: string[]; // Empty or undefined means all categories
  applicableProductIds?: string[]; // Empty or undefined means all products
  startDate?: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endDate?: string; // YYYY-MM-DD
  endTime?: string; // HH:mm
  usageLimit?: number; // Total redemptions limit
  usageCount?: number;
  perCustomerLimit?: number; // Limit per customer
  allowCoins?: boolean; // Can customer also use KHOROM coins?
  allowCoupon?: boolean; // Can customer also use coupon code?
  freeShipping?: boolean; // Waives shipping fee
  bonusCoinsMultiplier?: number; // For bonus_coins type (e.g. 2 for 2x coins)
  bonusCoinsFlat?: number; // For bonus_coins type (e.g. +15 flat coins)
  status: OfferStatus;
  priority?: number;
  timesUsed?: number;
  totalDiscountGiven?: number;
  totalRevenue?: number;
  createdAt?: string;
}

export interface OfferUsage {
  id: string;
  offerId: string;
  userId: string;
  userEmail?: string;
  orderId: string;
  discountAmount: number;
  orderTotal: number;
  createdAt: string;
}

export interface UserLoginLog {
  id: string;
  name: string;
  email: string;
  avatar: string;
  provider: 'email' | 'google';
  loginTime: string;
  device?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  role?: string;
  status?: string;
}

export interface ProductClickStats {
  productId: string;
  clicks: number;
  views: number;
  likes?: number;
}

export interface LogoSettings {
  imageUrl?: string;
  width?: number; // width in px (32 - 300)
  height?: number; // height in px (32 - 140)
  scale?: number; // scale multiplier (0.5 - 2.0)
  alignment?: 'left' | 'center' | 'right';
  offsetX?: number; // horizontal offset in px (-50 to 50)
  offsetY?: number; // vertical offset in px (-30 to 30)
  showText?: boolean;
  textBn?: string;
  textEn?: string;
  subtextBn?: string;
  subtextEn?: string;
}

export interface WebsiteCustomization {
  // Theme & Colors
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  themeStyle?: 'luxury' | 'navy' | 'classic' | 'dark' | 'midnight' | 'emerald';
  buttonRadius?: 'rounded-none' | 'rounded-sm' | 'rounded-md' | 'rounded-lg' | 'rounded-xl' | 'rounded-2xl' | 'rounded-full';

  // Header & Logo
  logoText?: string;
  logoImageUrl?: string;
  logoSettings?: LogoSettings;
  searchPlaceholderBn?: string;
  searchPlaceholderEn?: string;
  showTopAnnouncement?: boolean;
  topAnnouncementBn: string;
  topAnnouncementEn: string;

  // Hero Section
  heroBadgeBn: string;
  heroBadgeEn: string;
  heroTitleBn: string;
  heroTitleEn: string;
  heroSubtitleBn: string;
  heroSubtitleEn: string;
  heroCtaBn?: string;
  heroCtaEn?: string;
  heroHighlightPrice: number;
  heroOriginalPrice: number;
  heroImage: string;
  heroTagBn: string;
  heroTagEn: string;

  // Store Brand & Sections
  storeNameBn: string;
  storeNameEn: string;
  showTop5Section?: boolean;
  top5TitleBn?: string;
  top5TitleEn?: string;
  showHotDealsSection?: boolean;
  hotDealsTitleBn?: string;
  hotDealsTitleEn?: string;
  sectionTitleBn?: string;
  sectionTitleEn?: string;
  sectionSubtitleBn?: string;
  sectionSubtitleEn?: string;

  // Contact & Delivery
  helpline: string;
  whatsappNumber?: string;
  whatsappUrl?: string;
  enableWhatsappIcon?: boolean;
  bkashNumber?: string;
  whatsappOrderEnabled?: boolean;
  deliveryInsideDhaka: number;
  deliveryOutsideDhaka: number;
  deliveryPolicyBn?: string;
  deliveryPolicyEn?: string;
  returnPolicyBn?: string;
  returnPolicyEn?: string;

  // Social Links
  facebookUrl?: string;
  enableFacebookIcon?: boolean;
  instagramUrl?: string;
  youtubeUrl?: string;

  categoryLabels?: Record<string, { nameBn: string; nameEn: string }>;

  // Footer Management Settings
  footerBrandDescriptionBn?: string;
  footerBrandDescriptionEn?: string;
  footerShowNewsletter?: boolean;
  footerNewsletterTitleBn?: string;
  footerNewsletterTitleEn?: string;
  footerNewsletterSubtitleBn?: string;
  footerNewsletterSubtitleEn?: string;
  footerNewsletterButtonTextBn?: string;
  footerNewsletterButtonTextEn?: string;
  footerShowCustomerCare?: boolean;
  footerCustomerCareTitleBn?: string;
  footerCustomerCareTitleEn?: string;
  footerCustomerCareLinks?: { id: string; labelBn: string; labelEn: string; url?: string }[];
  footerShowCategories?: boolean;
  footerCategoriesTitleBn?: string;
  footerCategoriesTitleEn?: string;
  footerShowShowroom?: boolean;
  footerShowroomTitleBn?: string;
  footerShowroomTitleEn?: string;
  footerAddressBn?: string;
  footerAddressEn?: string;
  footerPhone?: string;
  footerEmail?: string;
  footerOpeningHoursBn?: string;
  footerOpeningHoursEn?: string;
  footerCopyrightBn?: string;
  footerCopyrightEn?: string;
  footerShowPaymentBadges?: boolean;
  footerPaymentTitleBn?: string;
  footerPaymentTitleEn?: string;
}

export interface AdminOverviewStats {
  totalRegisteredUsers: number;
  recentLoginsCount: number;
  recentLogins: UserLoginLog[];
  totalProducts: number;
  inStockProducts: number;
  outOfStockProducts: number;
  totalProductClicks: number;
  totalProductViews: number;
  mostViewedProducts: {
    productId: string;
    productTitleBn: string;
    productTitleEn: string;
    image: string;
    views: number;
    clicks: number;
    likes?: number;
    price: number;
  }[];
  totalCouponsCreated: number;
  totalCouponsRedeemed: number;
  couponRedemptions: {
    code: string;
    timesUsed: number;
    usageLimit?: number;
    isActive: boolean;
  }[];
  totalOrders: number;
  totalRevenue: number;
  ordersByStatus: {
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
}

// -------------------------------------------------------------
// FACEBOOK PAGE INTEGRATION & DUPLICATE DETECTION (STEP 5 & 6)
// -------------------------------------------------------------

export type FacebookPostStatus = 'pending' | 'published' | 'rejected';
export type DuplicateMatchLevel = 'new_product' | 'possible_match' | 'already_exists';

export interface DetectedProductInfo {
  titleBn: string;
  titleEn: string;
  price: number;
  originalPrice?: number;
  category: string;
  colors: { name: string; hex: string }[];
  sizes: string[];
  stockCount: number;
  descriptionBn: string;
  descriptionEn: string;
  image: string;
  images: string[];
  tags: string[];
}

export interface DuplicateMatchDetail {
  level: DuplicateMatchLevel; // 'new_product' (🟢) | 'possible_match' (🟡) | 'already_exists' (🔴)
  score: number; // 0 to 100 percentage match
  reasons: string[];
  matchedProductId?: string;
  matchedProductTitle?: string;
  matchedProductTitleBn?: string;
  matchedProductImage?: string;
  matchedProductPrice?: number;
  matchedProductCategory?: string;
}

export interface FacebookPendingPost {
  id: string; // unique post identifier (e.g. fb_post_...)
  fbPostId: string; // Facebook original post id
  permalinkUrl: string; // link to view post on facebook
  caption: string; // original facebook post text
  imageUrl: string; // primary product image from post
  additionalImages?: string[];
  createdAt: string; // post timestamp ISO
  status: FacebookPostStatus; // 'pending' | 'published' | 'rejected'
  detectedProduct: DetectedProductInfo;
  duplicateMatch?: DuplicateMatchDetail;
  publishedProductId?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface FacebookPageConfig {
  pageId: string;
  pageName: string;
  pageUrl: string;
  accessToken?: string;
  autoDetectDuplicates: boolean;
  syncIntervalMinutes: number;
  lastSyncedAt?: string;
}

export interface FacebookManagedPage {
  id: string;
  name: string;
  category?: string;
  tasks?: string[];
  pictureUrl?: string;
}

export interface FacebookConnectionState {
  isConnected: boolean;
  selectedPage: FacebookManagedPage | null;
  managedPages: FacebookManagedPage[];
  lastSyncedAt?: string;
  connectedUserName?: string;
  appId?: string;
}

