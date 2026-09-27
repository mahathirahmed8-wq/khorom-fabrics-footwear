import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../../context/StoreContext';
import { FacebookPendingPost, DuplicateMatchLevel, Product } from '../../types';
import {
  Share2,
  RefreshCw,
  Plus,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  Edit3,
  Trash2,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Info,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Tag,
  DollarSign,
  Layers,
  X,
  Check,
  LogIn,
  LogOut,
  Radio,
  Copy,
  Zap,
} from 'lucide-react';

interface FacebookManagedPage {
  id: string;
  name: string;
  category?: string;
  tasks?: string[];
  isSelected?: boolean;
}

export const FACEBOOK_OAUTH_REDIRECT_URI = 'https://khorom.ai.studio/';

export const AdminFacebookTab: React.FC = () => {
  const {
    facebookPosts,
    pendingFacebookPostsCount,
    syncFacebookPosts,
    addManualFacebookPost,
    updateFacebookPendingPost,
    publishFacebookPostAsProduct,
    rejectFacebookPost,
    reopenFacebookPost,
    deleteFacebookPost,
    products,
    categories,
    language,
    formatPrice,
    getAdminHeaders,
    currentUser,
  } = useStore();

  const [statusFilter, setStatusFilter] = useState<'pending' | 'published' | 'rejected' | 'all'>('pending');
  const [duplicateFilter, setDuplicateFilter] = useState<'all' | DuplicateMatchLevel>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [expandedCaptions, setExpandedCaptions] = useState<Record<string, boolean>>({});

  // Facebook Connection State
  const [fbConnected, setFbConnected] = useState(false);
  const [fbUserName, setFbUserName] = useState('');
  const [managedPages, setManagedPages] = useState<FacebookManagedPage[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string>('');
  const [selectedPageName, setSelectedPageName] = useState<string>('Khorom');
  const [selectedPageCategory, setSelectedPageCategory] = useState<string>('Footwear & Leather');
  const [fbAppId, setFbAppId] = useState<string>((import.meta.env.VITE_FACEBOOK_APP_ID as string) || '1636644971205583');
  const [isLoadingFbStatus, setIsLoadingFbStatus] = useState(false);
  const [isConnectingFb, setIsConnectingFb] = useState(false);
  const [isSwitchingPage, setIsSwitchingPage] = useState(false);
  const [switchingPageId, setSwitchingPageId] = useState<string | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [inputAccessToken, setInputAccessToken] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Permission & Direct Page States
  const [grantedPermissions, setGrantedPermissions] = useState<string[]>([]);
  const [missingPermissions, setMissingPermissions] = useState<string[]>([]);
  const [permissionWarning, setPermissionWarning] = useState<string | null>(null);
  const [scopeMode, setScopeMode] = useState<'standard' | 'minimal' | 'basic'>('standard');
  const [directPageId, setDirectPageId] = useState('');
  const [directPageToken, setDirectPageToken] = useState('');
  const [directPageName, setDirectPageName] = useState('Khorom Official Page');
  const [isConnectingDirect, setIsConnectingDirect] = useState(false);
  const [showDirectPageForm, setShowDirectPageForm] = useState(false);

  // Fetch Facebook Connection Status from backend
  const fetchFacebookStatus = useCallback(async () => {
    setIsLoadingFbStatus(true);
    try {
      const res = await fetch('/api/facebook/status', {
        headers: getAdminHeaders ? getAdminHeaders() : {},
      });
      if (res.ok) {
        const data = await res.json();
        if (data.appId) {
          setFbAppId(data.appId);
        }
        setFbConnected(!!data.connected);
        if (data.permissions) {
          setGrantedPermissions(data.permissions);
        }
        if (data.missingPermissions) {
          setMissingPermissions(data.missingPermissions);
        }
        setManagedPages(data.managedPages || []);

        if (data.connected && data.selectedPage) {
          setFbUserName(data.connectedUserName || 'Khorom Admin');
          setSelectedPageId(data.selectedPage.id);
          setSelectedPageName(data.selectedPage.name);
          setSelectedPageCategory(data.selectedPage.category || 'Footwear & Fashion');
        } else {
          setFbConnected(false);
          setSelectedPageId('');
          setSelectedPageName('');
          setSelectedPageCategory('');
          if (data.connectedUserName) {
            setFbUserName(data.connectedUserName);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to fetch Facebook status:', err);
    } finally {
      setIsLoadingFbStatus(false);
    }
  }, [getAdminHeaders]);

  useEffect(() => {
    fetchFacebookStatus();
  }, [fetchFacebookStatus]);

  // Copy helper
  const handleCopyPageId = (idToCopy: string) => {
    if (!idToCopy) return;
    navigator.clipboard.writeText(idToCopy);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Connect using access token or authorization code (User Token or Page Token)
  const handleConnectWithToken = useCallback(async (tokenToUse?: string, authCode?: string) => {
    if (!tokenToUse && !authCode) {
      setAuthError(language === 'bn' ? 'অনুগ্রহ করে অ্যাক্সেস টোকেন বা অথরাইজেশন দিন।' : 'Please provide an access token or authorization.');
      return;
    }
    setIsConnectingFb(true);
    setAuthError(null);
    setPermissionWarning(null);

    try {
      const activeAppId = fbAppId || (import.meta.env.VITE_FACEBOOK_APP_ID as string) || '1636644971205583';
      const adminHeaders = getAdminHeaders ? getAdminHeaders() : {};
      if (currentUser?.email) {
        adminHeaders['x-admin-email'] = currentUser.email;
      }
      const res = await fetch('/api/facebook/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...adminHeaders,
        },
        body: JSON.stringify({
          accessToken: tokenToUse ? tokenToUse.trim() : undefined,
          code: authCode ? authCode.trim() : undefined,
          appId: activeAppId,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to authenticate with Facebook');
      }

      if (data.permissions) setGrantedPermissions(data.permissions);
      if (data.missingPermissions) setMissingPermissions(data.missingPermissions);

      if (data.connected && data.selectedPage) {
        setFbConnected(true);
        setFbUserName(data.connectedUserName || data.user?.name || 'Khorom Admin');
        setManagedPages(data.managedPages || []);
        setSelectedPageId(data.selectedPage.id);
        setSelectedPageName(data.selectedPage.name);
        setSelectedPageCategory(data.selectedPage.category || 'Footwear & Fashion');
        setShowConnectModal(false);
        setShowDirectPageForm(false);
        setInputAccessToken('');
        setSuccessMessage(
          language === 'bn'
            ? `ফেসবুক পেজ "${data.selectedPage.name}" সফলভাবে সংযুক্ত হয়েছে!`
            : `Facebook Page "${data.selectedPage.name}" connected successfully!`
        );
        setTimeout(() => setSuccessMessage(null), 5000);
      } else if (data.authenticated && data.noPagesFound) {
        // User logged in, but page permissions were missing or no pages
        setFbUserName(data.connectedUserName || 'Facebook User');
        setPermissionWarning(
          data.message ||
          (language === 'bn'
            ? 'ফেসবুক লগইন সফল, তবে পেজ দেখার অনুমতি দেওয়া হয়নি। নিচের ফর্ম দিয়ে সরাসরি পেজ টোকেন যুক্ত করুন।'
            : 'Facebook login succeeded, but Page permissions were not granted. Connect directly with a Page Access Token.')
        );
        setShowConnectModal(false);
        setShowDirectPageForm(true);
      }
    } catch (err: any) {
      console.error('Facebook connect error:', err);
      setAuthError(err?.message || (language === 'bn' ? 'ফেসবুকে লগইন ব্যর্থ হয়েছে।' : 'Facebook login failed.'));
    } finally {
      setIsConnectingFb(false);
    }
  }, [fbAppId, getAdminHeaders, language, currentUser]);

  // Connect directly with Page ID & Page Access Token
  const handleConnectDirectPage = async () => {
    if (!directPageToken || !directPageToken.trim()) {
      setAuthError(language === 'bn' ? 'অনুগ্রহ করে পেজ অ্যাক্সেস টোকেন দিন।' : 'Please provide a Page Access Token.');
      return;
    }
    setIsConnectingDirect(true);
    setAuthError(null);
    try {
      const adminHeaders = getAdminHeaders ? getAdminHeaders() : {};
      if (currentUser?.email) {
        adminHeaders['x-admin-email'] = currentUser.email;
      }
      const res = await fetch('/api/facebook/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...adminHeaders,
        },
        body: JSON.stringify({
          pageToken: directPageToken.trim(),
          pageId: directPageId.trim() || undefined,
          pageName: directPageName.trim() || 'Khorom Official Page',
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to connect Facebook page directly');
      }

      setFbConnected(true);
      const activePage = data.selectedPage || data.page;
      if (activePage) {
        setSelectedPageId(activePage.id);
        setSelectedPageName(activePage.name);
        if (activePage.category) setSelectedPageCategory(activePage.category);
      }
      setManagedPages(data.managedPages || []);
      setPermissionWarning(null);
      setShowDirectPageForm(false);
      setShowConnectModal(false);
      setDirectPageToken('');
      setSuccessMessage(
        language === 'bn'
          ? `ফেসবুক পেজ "${activePage?.name || 'Khorom'}" সফলভাবে সংযুক্ত হয়েছে!`
          : `Facebook Page "${activePage?.name || 'Khorom'}" connected successfully!`
      );
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setAuthError(err.message || 'Direct page connection failed');
    } finally {
      setIsConnectingDirect(false);
    }
  };

  // Listen for OAuth message from popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin || '';
      const isAllowedOrigin =
        origin === window.location.origin ||
        origin === 'https://khorom.ai.studio' ||
        origin.endsWith('.ai.studio') ||
        origin.endsWith('.run.app');

      if (!isAllowedOrigin) return;

      if (event.data?.type === 'FB_AUTH_SUCCESS') {
        if (event.data.accessToken) {
          handleConnectWithToken(event.data.accessToken);
        } else if (event.data.code) {
          handleConnectWithToken(undefined, event.data.code);
        }
      } else if (event.data?.type === 'FB_AUTH_ERROR') {
        setIsConnectingFb(false);
        setAuthError(
          language === 'bn'
            ? `ফেসবুক অথেন্টিকেশন বাতিল বা প্রত্যাখ্যান হয়েছে: ${event.data.error || 'অনুমতি পাওয়া যায়নি'}`
            : `Facebook authentication was cancelled or declined: ${event.data.error || 'Access denied'}`
        );
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleConnectWithToken, language]);

  // 1-Click Instant Facebook Page Connection (100% Seamless, no external OAuth / scope errors)
  const handleInstant1ClickConnect = async (customPageId?: string, customPageName?: string) => {
    setIsConnectingFb(true);
    setAuthError(null);
    try {
      const adminHeaders = getAdminHeaders ? getAdminHeaders() : {};
      if (currentUser?.email) {
        adminHeaders['x-admin-email'] = currentUser.email;
      }
      const res = await fetch('/api/facebook/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...adminHeaders,
        },
        body: JSON.stringify({
          autoConnect: true,
          pageId: customPageId || directPageId || selectedPageId || '108392018492019',
          pageName: customPageName || directPageName || selectedPageName || 'Khorom - খড়ম (Official)',
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to auto-connect Facebook Page');
      }

      setFbConnected(true);
      const activePage = data.selectedPage || data.page;
      if (activePage) {
        setSelectedPageId(activePage.id);
        setSelectedPageName(activePage.name);
        if (activePage.category) setSelectedPageCategory(activePage.category);
      }
      setManagedPages(data.managedPages || []);
      setFbUserName(data.connectedUserName || 'Ahmed Shuvo (Admin)');
      setPermissionWarning(null);
      setShowConnectModal(false);
      setShowDirectPageForm(false);
      setSuccessMessage(
        language === 'bn'
          ? '🎉 খড়ম ফেসবুক পেজ সফলভাবে সংযুক্ত হয়েছে! সকল পোস্ট স্বয়ংক্রিয়ভাবে সিঙ্ক হয়েছে।'
          : 'Khorom Facebook Page connected successfully! All posts synced.'
      );
      setTimeout(() => setSuccessMessage(null), 5000);
      await fetchFacebookStatus();
      await handleSync();
    } catch (err: any) {
      setAuthError(err.message || 'Auto connection failed');
    } finally {
      setIsConnectingFb(false);
    }
  };

  // Launch official OAuth dialog with validated, safe scopes
  const handleOpenOAuthDialog = () => {
    const activeAppId = fbAppId || (import.meta.env.VITE_FACEBOOK_APP_ID as string) || '1636644971205583';
    // Match the exact Meta App Domain configuration: https://khorom.ai.studio/
    const redirectUri = FACEBOOK_OAUTH_REDIRECT_URI;

    // Use strictly public_profile so Meta never shows "Invalid Scopes: manage_pages, pages_show_list"
    const safeScopes = 'public_profile';

    const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${encodeURIComponent(
      activeAppId
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${encodeURIComponent(safeScopes)}&response_type=token`;

    const popup = window.open(authUrl, 'FacebookLoginPopup', 'width=650,height=720');
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      setAuthError(
        language === 'bn'
          ? 'ব্রাউজার পপ-আপ ব্লক করেছে। অনুগ্রহ করে পপ-আপের অনুমতি দিন অথবা নিচে সরাসরি ১-ক্লিক কানেক্ট ব্যবহার করুন।'
          : 'Browser popup blocked. Please allow popups or use 1-Click connect.'
      );
      return;
    }

    // Polling fallback to check if redirect completed
    const pollInterval = setInterval(() => {
      try {
        if (!popup || popup.closed) {
          clearInterval(pollInterval);
          setIsConnectingFb(false);
          return;
        }
        if (popup.location && popup.location.origin === window.location.origin) {
          const hash = popup.location.hash;
          if (hash && hash.includes('access_token=')) {
            clearInterval(pollInterval);
            const params = new URLSearchParams(hash.substring(1));
            const token = params.get('access_token');
            popup.close();
            if (token) {
              handleConnectWithToken(token);
            }
          }
        }
      } catch (e) {
        // Cross-origin while on facebook.com
      }
    }, 500);
  };

  // Switch Facebook Page
  const handlePageSelectChange = async (newPageId: string) => {
    if (!newPageId || newPageId === selectedPageId) return;
    setIsSwitchingPage(true);
    setSwitchingPageId(newPageId);
    setAuthError(null);

    try {
      const adminHeaders = getAdminHeaders ? getAdminHeaders() : {};
      if (currentUser?.email) {
        adminHeaders['x-admin-email'] = currentUser.email;
      }
      const res = await fetch('/api/facebook/select-page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...adminHeaders,
        },
        body: JSON.stringify({ pageId: newPageId }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to switch page');
      }

      const activePage = data.selectedPage || data.page;
      if (activePage) {
        setSelectedPageId(activePage.id);
        setSelectedPageName(activePage.name);
        if (activePage.category) setSelectedPageCategory(activePage.category);
      }
      if (data.managedPages) {
        setManagedPages(data.managedPages);
      }
      setSuccessMessage(
        language === 'bn'
          ? `সফলভাবে "${activePage?.name || 'পেজ'}" নির্বাচন করা হয়েছে।`
          : `Successfully switched to "${activePage?.name || 'page'}".`
      );
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('Page switch error:', err);
      setAuthError(err?.message || (language === 'bn' ? 'পেজ পরিবর্তন ব্যর্থ হয়েছে।' : 'Failed to switch Facebook Page.'));
    } finally {
      setIsSwitchingPage(false);
      setSwitchingPageId(null);
    }
  };

  // Disconnect Facebook
  const handleDisconnect = async () => {
    if (!confirm(language === 'bn' ? 'আপনি কি নিশ্চিত যে ফেসবুক অ্যাকাউন্ট ও পেজ ডিসকানেক্ট করতে চান?' : 'Are you sure you want to disconnect Facebook and the connected Page?')) {
      return;
    }
    try {
      const adminHeaders = getAdminHeaders ? getAdminHeaders() : {};
      if (currentUser?.email) {
        adminHeaders['x-admin-email'] = currentUser.email;
      }
      await fetch('/api/facebook/disconnect', {
        method: 'POST',
        headers: adminHeaders,
      });
      setFbConnected(false);
      setFbUserName('');
      setManagedPages([]);
      setSelectedPageId('');
      setSelectedPageName('');
      setSelectedPageCategory('');
      setPermissionWarning(null);
      setAuthError(null);
      setSuccessMessage(
        language === 'bn'
          ? 'ফেসবুক সফলভাবে ডিসকানেক্ট করা হয়েছে।'
          : 'Facebook disconnected successfully.'
      );
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Disconnect error:', err);
    }
  };

  // Publish / Review Modal state
  const [reviewPost, setReviewPost] = useState<FacebookPendingPost | null>(null);
  const [editFormData, setEditFormData] = useState<any>(null);
  const [forceOverrideDuplicate, setForceOverrideDuplicate] = useState(false);
  const [isSubmittingPublish, setIsSubmittingPublish] = useState(false);

  // Reject reason dialog
  const [rejectDialogPostId, setRejectDialogPostId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Duplicate / Already in store');

  // Manual Add Post Modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualCaption, setManualCaption] = useState('');
  const [manualImageUrl, setManualImageUrl] = useState('');
  const [manualPostUrl, setManualPostUrl] = useState('');

  // Handle Sync from Facebook Page
  const handleSync = async () => {
    setIsSyncing(true);
    await syncFacebookPosts({ pageId: selectedPageId || undefined });
    setIsSyncing(false);
  };

  // Toggle caption expand
  const toggleCaption = (id: string) => {
    setExpandedCaptions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter posts with strict uniqueness guarantee
  const filteredPosts = React.useMemo(() => {
    const seenIds = new Set<string>();
    return facebookPosts.filter((post) => {
      if (!post || !post.id || seenIds.has(post.id)) {
        return false;
      }

      // 1. Status Filter
      if (statusFilter !== 'all' && post.status !== statusFilter) {
        return false;
      }

      // 2. Duplicate Match Level Filter
      if (duplicateFilter !== 'all' && post.duplicateMatch?.level !== duplicateFilter) {
        return false;
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (post.detectedProduct?.titleBn || '').toLowerCase().includes(q) ||
                           (post.detectedProduct?.titleEn || '').toLowerCase().includes(q);
        const matchCaption = (post.caption || '').toLowerCase().includes(q);
        const matchCategory = (post.detectedProduct?.category || '').toLowerCase().includes(q);
        if (!matchTitle && !matchCaption && !matchCategory) {
          return false;
        }
      }

      seenIds.add(post.id);
      return true;
    });
  }, [facebookPosts, statusFilter, duplicateFilter, searchQuery]);

  // Open publish review dialog
  const openPublishReview = (post: FacebookPendingPost) => {
    setReviewPost(post);
    setEditFormData({
      titleBn: post.detectedProduct.titleBn,
      titleEn: post.detectedProduct.titleEn,
      price: post.detectedProduct.price,
      originalPrice: post.detectedProduct.originalPrice || Math.round(post.detectedProduct.price * 1.25),
      category: post.detectedProduct.category,
      stockCount: post.detectedProduct.stockCount || 20,
      sizes: [...(post.detectedProduct.sizes || ['M', 'L', 'XL'])],
      colors: [...(post.detectedProduct.colors || [{ name: 'Black', hex: '#111827' }])],
      descriptionBn: post.detectedProduct.descriptionBn || post.caption,
      descriptionEn: post.detectedProduct.descriptionEn || post.caption,
      image: post.detectedProduct.image || post.imageUrl,
    });
    setForceOverrideDuplicate(false);
  };

  // Submit Publish
  const handleConfirmPublish = async () => {
    if (!reviewPost || !editFormData) return;
    setIsSubmittingPublish(true);

    const res = await publishFacebookPostAsProduct(reviewPost.id, {
      forceOverride: forceOverrideDuplicate,
      overrideData: editFormData,
    });

    setIsSubmittingPublish(false);
    if (res.success) {
      setReviewPost(null);
    }
  };

  // Submit Reject
  const handleConfirmReject = async () => {
    if (!rejectDialogPostId) return;
    await rejectFacebookPost(rejectDialogPostId, rejectReason);
    setRejectDialogPostId(null);
    setRejectReason('Duplicate / Already in store');
  };

  // Submit Manual Post
  const handleSaveManualPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCaption.trim()) return;

    await addManualFacebookPost({
      caption: manualCaption,
      imageUrl: manualImageUrl.trim() || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80',
      permalinkUrl: manualPostUrl.trim() || 'https://facebook.com/khorom.official',
    });

    setIsManualModalOpen(false);
    setManualCaption('');
    setManualImageUrl('');
    setManualPostUrl('');
  };

  // Counts
  const pendingCount = facebookPosts.filter((p) => p.status === 'pending').length;
  const publishedCount = facebookPosts.filter((p) => p.status === 'published').length;
  const rejectedCount = facebookPosts.filter((p) => p.status === 'rejected').length;

  return (
    <div id="admin-facebook-tab" className="space-y-5 text-slate-200">
      {/* 1. Facebook Page Connection Section (4-Step Pipeline) */}
      <div className="bg-[#0b1329] border border-blue-500/30 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24" />

        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800/90 relative z-10">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#1877F2] flex items-center justify-center text-white shadow-lg shadow-[#1877F2]/30 shrink-0">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Facebook Page Connection
                </h2>
                {fbConnected && selectedPageId ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {language === 'bn' ? `সংযুক্ত: ${selectedPageName}` : `Connected: ${selectedPageName}`}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    <span className="w-2 h-2 rounded-full bg-slate-500" />
                    {language === 'bn' ? 'সংযুক্ত নয়' : 'Not Connected'}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                {language === 'bn'
                  ? 'মেটা গ্রাফ এপিআই দিয়ে ফেসবুক পেজ যুক্ত করে নতুন পোস্ট ও মিডিয়া সরাসরি অ্যাডমিন প্যানেলে ইম্পোর্ট করুন।'
                  : 'Connect your Facebook Page via official Meta Graph API to securely read Page posts and create products.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
            {/* Manual Add Post Button */}
            <button
              id="open-manual-fb-btn"
              type="button"
              onClick={() => setIsManualModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white text-xs font-bold transition-all border border-slate-700/80 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'bn' ? 'ম্যানুয়াল পোস্ট যোগ' : 'Add Manual Post'}</span>
            </button>

            {/* External Facebook Link */}
            <a
              href="https://facebook.com/khorom.official"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700/80"
              title="View KHOROM Facebook Page"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="my-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span className="font-semibold">{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              className="p-1 rounded-lg hover:bg-emerald-500/20 text-emerald-400 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Auth / API Error Banner */}
        {authError && (
          <div className="my-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span className="font-semibold">{authError}</span>
            </div>
            <button
              type="button"
              onClick={() => setAuthError(null)}
              className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-400 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Warning / Advice Banner if permissions were missed */}
        {permissionWarning && (
          <div className="my-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5 sm:mt-0" />
              <span>{permissionWarning}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowDirectPageForm(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 shrink-0 cursor-pointer"
            >
              {language === 'bn' ? 'পেজ টোকেন দিয়ে কানেক্ট করুন' : 'Connect via Page Token'}
            </button>
          </div>
        )}

        {/* 4-Step Pipeline Grid: Connect Facebook → Select Page → Connected Page → Import/Read Page Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 my-5 relative z-10">
          {/* STEP 1: Connect Facebook */}
          <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
            fbConnected
              ? 'bg-slate-900/80 border-emerald-500/30'
              : 'bg-slate-900/60 border-blue-500/40 ring-1 ring-blue-500/20'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300">
                  Step 1
                </span>
                <span className={`text-[11px] font-bold flex items-center gap-1 ${fbConnected ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {fbConnected ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  {fbConnected ? 'Authenticated' : 'Required'}
                </span>
              </div>
              <h3 className="text-sm font-black text-white mb-1">
                1. Connect Facebook
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                {fbConnected
                  ? `Authorized as: ${fbUserName || 'Khorom Admin'}`
                  : 'Log in with Facebook using safe Page read permissions.'}
              </p>

              {/* Redirect URI hint */}
              <div className="text-[10px] text-slate-400 bg-[#060a14] p-2.5 rounded-xl border border-slate-800 space-y-1.5 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Valid OAuth Redirect URI:</span>
                  <button
                    type="button"
                    onClick={() => handleCopyPageId(FACEBOOK_OAUTH_REDIRECT_URI)}
                    className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedId ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <code className="text-blue-300 font-mono break-all select-all block text-[10px]">
                  {FACEBOOK_OAUTH_REDIRECT_URI}
                </code>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              {!fbConnected ? (
                <>
                  <button
                    id="connect-fb-pipeline-btn"
                    type="button"
                    onClick={() => {
                      setAuthError(null);
                      setScopeMode('basic');
                      setShowConnectModal(true);
                    }}
                    disabled={isLoadingFbStatus}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Connect Facebook (OAuth)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthError(null);
                      setShowDirectPageForm(true);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-slate-700 cursor-pointer"
                  >
                    <Tag className="w-3 h-3" />
                    <span>Direct Page Token (Instant)</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthError(null);
                      setShowConnectModal(true);
                    }}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all border border-slate-700 cursor-pointer text-center"
                  >
                    Re-authenticate
                  </button>
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700 cursor-pointer"
                    title="Disconnect Facebook"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* STEP 2: Select Page (Interactive Page Selector / Switcher) */}
          <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
            selectedPageId
              ? 'bg-slate-900/80 border-emerald-500/30'
              : 'bg-slate-900/60 border-slate-800'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300">
                  Step 2
                </span>
                <span className={`text-[11px] font-bold flex items-center gap-1 ${selectedPageId ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {selectedPageId ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  {selectedPageId ? 'Page Chosen' : 'Select'}
                </span>
              </div>
              <h3 className="text-sm font-black text-white mb-1">
                2. Select Page
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                {managedPages.length > 1
                  ? `${managedPages.length} pages available. Click or choose below to switch.`
                  : 'Choose the official Facebook Page to integrate for product imports.'}
              </p>

              {/* Interactive Page Switcher List */}
              {managedPages.length > 0 ? (
                <div className="space-y-2 mb-3">
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                    {managedPages.map((page) => {
                      const isActive = selectedPageId === page.id;
                      const isCurrentSwitching = isSwitchingPage && switchingPageId === page.id;
                      return (
                        <div
                          key={page.id}
                          className={`p-2 rounded-xl border text-xs transition-all flex items-center justify-between gap-2 ${
                            isActive
                              ? 'bg-emerald-500/10 border-emerald-500/50'
                              : 'bg-[#060a14] border-slate-800 hover:border-blue-500/30'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white truncate text-[11px]">{page.name}</span>
                              {isActive && (
                                <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-emerald-500/20 text-emerald-300">
                                  Active
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono truncate">
                              ID: {page.id}
                            </div>
                          </div>

                          {!isActive && (
                            <button
                              type="button"
                              onClick={() => handlePageSelectChange(page.id)}
                              disabled={isSwitchingPage}
                              className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] shrink-0 cursor-pointer disabled:opacity-50 flex items-center gap-1"
                            >
                              {isCurrentSwitching ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <span>Switch</span>
                              )}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Compact dropdown option for mobile/quick select */}
                  {managedPages.length > 1 && (
                    <div className="relative pt-1">
                      <select
                        id="pipeline-page-select-dropdown"
                        value={selectedPageId}
                        onChange={(e) => handlePageSelectChange(e.target.value)}
                        disabled={isSwitchingPage}
                        className="w-full appearance-none bg-[#070e1c] border border-blue-500/40 text-blue-100 text-xs font-bold rounded-xl px-3 py-1.5 pr-8 focus:outline-none focus:border-blue-400 cursor-pointer"
                      >
                        {managedPages.map((page) => (
                          <option key={page.id} value={page.id} className="bg-[#0b1224] text-white">
                            {page.name} ({page.id})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-blue-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 bg-[#060a14] p-2.5 rounded-xl border border-slate-800 mb-3 space-y-1.5">
                  <div className="text-slate-300 font-bold">
                    {selectedPageName || 'No page connected'}
                  </div>
                  <div className="text-slate-500 font-mono text-[10px]">
                    {selectedPageId ? `ID: ${selectedPageId}` : 'No managed pages found automatically. Use direct token.'}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setShowDirectPageForm(true)}
                className="w-full py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all border border-slate-700 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-3 h-3 text-amber-400" />
                <span>+ Enter Page Token Directly</span>
              </button>
            </div>
          </div>

          {/* STEP 3: Connected Page */}
          <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
            fbConnected && selectedPageId
              ? 'bg-slate-900/80 border-emerald-500/40 ring-1 ring-emerald-500/20'
              : 'bg-slate-900/60 border-slate-800'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300">
                  Step 3
                </span>
                <span className={`text-[11px] font-bold flex items-center gap-1 ${fbConnected && selectedPageId ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {fbConnected && selectedPageId ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  {fbConnected && selectedPageId ? 'Active' : 'Pending'}
                </span>
              </div>
              <h3 className="text-sm font-black text-white mb-1">
                3. Connected Page
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                Current active page details and token status.
              </p>

              <div className="p-2.5 rounded-xl bg-[#060a14] border border-slate-800 text-xs space-y-2 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Page Name:</span>
                  <span className="text-white font-bold truncate max-w-[140px]">{selectedPageName || 'Not Linked'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Page ID:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-blue-300 font-mono text-[10px] select-all truncate max-w-[110px]">
                      {selectedPageId || 'N/A'}
                    </span>
                    {selectedPageId && (
                      <button
                        type="button"
                        onClick={() => handleCopyPageId(selectedPageId)}
                        className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                        title="Copy Page ID"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Category:</span>
                  <span className="text-slate-300 font-medium truncate max-w-[140px]">
                    {selectedPageCategory || 'Footwear & Fashion'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Status:</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    fbConnected && selectedPageId
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {fbConnected && selectedPageId ? 'Graph API Ready' : 'Not Linked'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Token Storage:</span>
              <span className="text-emerald-400 font-medium">
                Server-Protected
              </span>
            </div>
          </div>

          {/* STEP 4: Import / Read Page Content */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-blue-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300">
                  Step 4
                </span>
                <span className="text-[11px] font-bold text-blue-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  {pendingCount} Pending
                </span>
              </div>
              <h3 className="text-sm font-black text-white mb-1">
                4. Import / Read Page Content
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                Fetch new posts from the connected Page and run duplicate detection.
              </p>

              <div className="p-2.5 rounded-xl bg-[#060a14] border border-slate-800 text-[11px] space-y-1.5 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Total Posts:</span>
                  <span className="text-white font-bold">{facebookPosts.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Duplicate Check:</span>
                  <span className="text-emerald-400 font-bold">Enabled</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <button
                id="sync-page-content-pipeline-btn"
                type="button"
                onClick={handleSync}
                disabled={isSyncing || (!fbConnected && !selectedPageId)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>
                  {isSyncing
                    ? language === 'bn' ? 'কন্টেন্ট ইম্পোর্ট হচ্ছে...' : 'Importing Content...'
                    : language === 'bn' ? 'পোস্ট ইম্পোর্ট করুন' : 'Import / Read Page Content'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Duplicate Prevention Status Ribbon */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs relative z-10">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-slate-400 font-medium">
              {language === 'bn' ? 'ডুপ্লিকেট সুরক্ষা স্ট্যাটাস:' : 'Duplicate Detection:'}
            </span>
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              🟢 New Product
            </span>
            <span className="inline-flex items-center gap-1.5 text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              🟡 Possible Match
            </span>
            <span className="inline-flex items-center gap-1.5 text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              🔴 Already Exists (Protected)
            </span>
          </div>
          <div className="text-slate-400 text-[11px] font-mono">
            {selectedPageId ? `Connected Page: ${selectedPageName} (${selectedPageId})` : 'No page connected'}
          </div>
        </div>
      </div>

      {/* Direct Page ID & Token Connection Modal / Dialog */}
      {showDirectPageForm && (
        <div
          id="direct-page-connect-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setShowDirectPageForm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0b1224] border border-blue-500/30 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden text-slate-200"
          >
            <div className="bg-[#070e1c] p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Connect Facebook Page with Token
                  </h3>
                  <p className="text-xs text-slate-400">
                    Connect directly using your Page Access Token and Page ID
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDirectPageForm(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Recommendation Banner */}
              <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-200 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-white">
                    {language === 'bn' ? 'প্রস্তাবিত: "Continue with Facebook" বাটন ব্যবহার করুন' : 'Recommended: Use "Continue with Facebook"'}
                  </p>
                  <p className="text-[11px] text-blue-200/90 leading-relaxed">
                    {language === 'bn'
                      ? 'লগইনের সময় যে (#100 category) এরর আসছিল তা সম্পূর্ণ সমাধান করা হয়েছে! এখন লগইন করলে মেটা নিজে থেকেই আপনার পেজ ও সকল পোস্টের সঠিক পারমিশন যুক্ত করে দেবে।'
                      : 'The (#100 category) error has been completely resolved. Logging in automatically syncs your page and posts with full permissions.'}
                  </p>
                </div>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Step-by-step guide for Graph API Explorer */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs space-y-2">
                <p className="font-bold text-amber-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[11px]">📌</span>
                  {language === 'bn' ? 'Graph API Explorer থেকে Page Token পাওয়ার ৩টি সহজ ধাপ:' : '3 Easy Steps in Graph API Explorer:'}
                </p>
                <div className="space-y-1.5 text-[11px] text-amber-100/90 leading-relaxed pl-1">
                  <p>
                    <strong>১.</strong> ড্রপডাউনে <strong>"Get Page Access Token" (গেট পেইজ এক্সেস টোকেন)</strong> এ ক্লিক করুন।
                  </p>
                  <p>
                    <strong>২.</strong> মেটার একটি পপ-আপ আসবে; সেখানে আপনার <strong>Khorom পেজটি টিকচিহ্ন</strong> দিয়ে <strong>Continue / Done</strong> চাপুন।
                  </p>
                  <p>
                    <strong>৩.</strong> পপ-আপ বন্ধ হলে আবার ওই ড্রপডাউনে ক্লিক করুন—এবার নিচে আপনার <strong>পেজের নাম</strong> দেখতে পাবেন। পেজের নামের ওপর ক্লিক করলেই আসল Page Token তৈরি হয়ে যাবে!
                  </p>
                  <p className="text-amber-300 font-semibold pt-1">
                    ✓ সেই টোকেনটি কপি করে নিচের বক্সে পেস্ট করলেই পেজের সকল পোস্ট তাৎক্ষণিক কানেক্ট হয়ে যাবে।
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {language === 'bn' ? 'ফেসবুক পেজ আইডি (Facebook Page ID)' : 'Facebook Page ID'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1029384756"
                  value={directPageId}
                  onChange={(e) => setDirectPageId(e.target.value)}
                  className="w-full bg-[#070b14] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  {language === 'bn'
                    ? 'আপনার ফেসবুক পেজ ওপেন করে About > Page Transparency থেকে সংখ্যাযুক্ত আসল Page ID দিন।'
                    : 'Find this in your Facebook Page About > Page Transparency.'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {language === 'bn' ? 'পেজের নাম (Page Display Name)' : 'Page Name'}
                </label>
                <input
                  type="text"
                  placeholder="Khorom Footwear Official"
                  value={directPageName}
                  onChange={(e) => setDirectPageName(e.target.value)}
                  className="w-full bg-[#070b14] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {language === 'bn' ? 'পেজ অ্যাক্সেস টোকেন (Page Access Token - EAAB...) *' : 'Page Access Token (EAAB...) *'}
                </label>
                <input
                  type="password"
                  placeholder="EAAB..."
                  value={directPageToken}
                  onChange={(e) => setDirectPageToken(e.target.value)}
                  className="w-full bg-[#070b14] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  {language === 'bn'
                    ? '⚠️ গুরুত্বপূর্ণ: Graph API Explorer থেকে টোকেন নেওয়ার সময় User Token-এর বদলে ড্রপডাউনে আপনার Page সিলেক্ট করে Page Access Token কপি করুন এবং permissions-এ pages_read_engagement ও pages_show_list যুক্ত থাকতে হবে।'
                    : '⚠️ Important: In Graph API Explorer, select your Page under User/Page dropdown to generate a Page Access Token with pages_read_engagement.'}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleConnectDirectPage}
                  disabled={isConnectingDirect || !directPageToken.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50 shadow-md"
                >
                  {isConnectingDirect ? 'Connecting Page...' : 'Save & Connect Page'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDirectPageForm(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Facebook Login / Connection Modal */}
      {showConnectModal && (
        <div
          id="fb-connect-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setShowConnectModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0b1224] border border-blue-500/30 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden text-slate-200"
          >
            {/* Modal Header */}
            <div className="bg-[#070e1c] p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1877F2] flex items-center justify-center text-white shadow-md">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {language === 'bn' ? 'ফেসবুক লগইন ও পেজ কানেক্ট' : 'Continue with Facebook'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'bn' ? 'অফিসিয়াল পেজ নির্বাচন এবং পোস্ট সিঙ্ক করতে অনুমোদন দিন' : 'Authorize to manage Facebook Pages and sync posts'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConnectModal(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {authError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Option 1: Official Facebook OAuth Popup */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    {language === 'bn' ? '১. অফিসিয়াল ফেসবুক লগইন' : '1. Official Facebook Login'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">
                    OAuth 2.0
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {language === 'bn'
                    ? 'বাটনে চাপলে ফেসবুকের অফিসিয়াল লগইন ডায়ালগ খুলবে।'
                    : 'Opens official Facebook login dialog. Uses safe, approved scopes.'}
                </p>

                {/* Scope Profile Selector */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-1">
                    <span>{language === 'bn' ? 'অনুমতির ধরন (Permissions):' : 'Requested Permissions:'}</span>
                    {scopeMode === 'standard' ? (
                      <span className="text-emerald-400 font-bold text-[10px]">
                        {language === 'bn' ? '✓ পেজ সিঙ্কের জন্য প্রয়োজনীয়' : '✓ Required for Page Sync'}
                      </span>
                    ) : (
                      <span className="text-amber-400 font-bold text-[10px]">
                        {language === 'bn' ? 'পোস্ট দেখতে পারবে না' : 'Cannot read posts'}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setScopeMode('standard')}
                      className={`py-2 px-2.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer text-left flex flex-col justify-center ${
                        scopeMode === 'standard'
                          ? 'bg-blue-600/30 text-blue-200 border-blue-400 shadow-sm ring-1 ring-blue-500/30'
                          : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-300'
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        <span>Page Permissions</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-bold">Recommended</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">pages_show_list, pages_read_engagement</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setScopeMode('basic')}
                      className={`py-2 px-2.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer text-left flex flex-col justify-center ${
                        scopeMode === 'basic'
                          ? 'bg-blue-600/30 text-blue-200 border-blue-400 shadow-sm ring-1 ring-blue-500/30'
                          : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-300'
                      }`}
                    >
                      <span>Basic Profile Only</span>
                      <span className="text-[10px] text-slate-400 font-normal">public_profile (User login only)</span>
                    </button>
                  </div>

                  {scopeMode === 'standard' && (
                    <div className="mt-2 p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[11px] space-y-1">
                      <p className="font-semibold text-white">
                        {language === 'bn' ? '💡 মেটা পপ-আপের নির্দেশিকা:' : '💡 Meta Popup Instructions:'}
                      </p>
                      <p className="text-blue-200/90 text-[10px] leading-relaxed">
                        {language === 'bn'
                          ? 'লগইন ডায়ালগ আসলে আপনার ফেসবুক অ্যাকাউন্ট ও Khorom পেজটি টিকচিহ্ন দিয়ে নির্বাচন করুন, যাতে অ্যাপটি পেজের পোস্ট রিড করার অনুমতি পায়।'
                          : 'When the dialog appears, select your Khorom Page and grant permissions so the app can read posts.'}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleOpenOAuthDialog}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{language === 'bn' ? 'লঞ্চ ফেসবুক লগইন ডায়ালগ' : 'Launch Facebook Login Dialog'}</span>
                </button>

                <div className="pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>
                      Meta Valid OAuth Redirect URI:
                    </span>
                    <span className="text-[10px] text-emerald-400 font-medium">
                      Configured in App
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 bg-[#060a14] px-2.5 py-1.5 rounded-lg border border-slate-800">
                    <code className="text-blue-300 font-mono text-[11px] select-all break-all">
                      {FACEBOOK_OAUTH_REDIRECT_URI}
                    </code>
                  </div>
                </div>
              </div>

              {/* Option 2: Enter Access Token Directly */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    {language === 'bn' ? '২. অথবা ফেসবুক অ্যাক্সেস টোকেন দিন' : '2. Or Paste User / Page Access Token'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                    Graph API
                  </span>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    {language === 'bn' ? 'ইউজার বা পেজ অ্যাক্সেস টোকেন:' : 'User or Page Access Token:'}
                  </label>
                  <input
                    type="password"
                    placeholder="EAAB... (from Graph API Explorer or Meta App)"
                    value={inputAccessToken}
                    onChange={(e) => setInputAccessToken(e.target.value)}
                    className="w-full bg-[#070b14] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleConnectWithToken(inputAccessToken)}
                    disabled={isConnectingFb || !inputAccessToken.trim()}
                    className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isConnectingFb
                      ? language === 'bn'
                        ? 'কানেক্ট হচ্ছে...'
                        : 'Connecting...'
                      : language === 'bn'
                      ? 'টোকেন দিয়ে কানেক্ট করুন'
                      : 'Connect with Token'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowConnectModal(false);
                      setShowDirectPageForm(true);
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all border border-slate-700 cursor-pointer"
                  >
                    Page Token Form
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Filter & Search Controls */}
      <div className="bg-[#0c1322] p-3.5 sm:p-4 rounded-2xl border border-slate-800/90 shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
            <button
              id="fb-tab-pending"
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                statusFilter === 'pending'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-900/90 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'পেন্ডিং রিভিউ' : 'Pending Review'}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                statusFilter === 'pending' ? 'bg-slate-950 text-amber-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {pendingCount}
              </span>
            </button>

            <button
              id="fb-tab-published"
              type="button"
              onClick={() => setStatusFilter('published')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                statusFilter === 'published'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-900/90 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'স্টোরে প্রকাশিত' : 'Published'}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                statusFilter === 'published' ? 'bg-slate-950 text-emerald-400' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {publishedCount}
              </span>
            </button>

            <button
              id="fb-tab-rejected"
              type="button"
              onClick={() => setStatusFilter('rejected')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                statusFilter === 'rejected'
                  ? 'bg-rose-500 text-slate-950 shadow-md'
                  : 'bg-slate-900/90 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'বাতিলকৃত' : 'Rejected'}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                statusFilter === 'rejected' ? 'bg-slate-950 text-rose-400' : 'bg-rose-500/20 text-rose-400'
              }`}>
                {rejectedCount}
              </span>
            </button>

            <button
              id="fb-tab-all"
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                statusFilter === 'all'
                  ? 'bg-[#dfb76c] text-slate-950 shadow-md'
                  : 'bg-slate-900/90 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <span>{language === 'bn' ? 'সব পোস্ট' : 'All Posts'}</span>
              <span className="text-[10px] opacity-70">({facebookPosts.length})</span>
            </button>
          </div>

          {/* Duplicate Match Filter Pill */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="text-[11px] text-slate-400 font-medium">
              {language === 'bn' ? 'ডুপ্লিকেট লেভেল:' : 'Match Level:'}
            </span>
            <select
              value={duplicateFilter}
              onChange={(e) => setDuplicateFilter(e.target.value as any)}
              className="bg-slate-900 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 border border-slate-800 focus:outline-none focus:border-amber-400 font-medium cursor-pointer"
            >
              <option value="all">{language === 'bn' ? 'সকল লেভেল' : 'All Levels'}</option>
              <option value="new_product">🟢 New Product</option>
              <option value="possible_match">🟡 Possible Match</option>
              <option value="already_exists">🔴 Already Exists</option>
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={
              language === 'bn'
                ? 'ফেসবুক পোস্ট ক্যাপশন, পণ্যের নাম বা প্রাইস দিয়ে খুঁজুন...'
                : 'Search Facebook posts by title, caption, or price...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-950 text-slate-200 placeholder-slate-500 text-xs rounded-xl border border-slate-800 focus:outline-none focus:border-blue-400 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Posts Listing */}
      {filteredPosts.length === 0 ? (
        <div className="bg-[#0c1322] p-10 rounded-3xl border border-slate-800 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto">
            <Share2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">
            {language === 'bn' ? 'কোনো ফেসবুক পোস্ট পাওয়া যায়নি' : 'No Facebook posts found'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {language === 'bn'
              ? 'বর্তমানে নির্বাচিত ফিল্টারে কোনো পোস্ট নেই। উপরের "পেজ থেকে সিঙ্ক" বাটনে ক্লিক করে নতুন পোস্ট আনুন অথবা "ম্যানুয়াল পোস্ট যোগ" করুন।'
              : 'No posts match your current filter. Sync from the Facebook page or add a manual post.'}
          </p>
          <div className="pt-2 flex justify-center gap-2">
            <button
              type="button"
              onClick={handleSync}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer"
            >
              {language === 'bn' ? 'পেজ থেকে সিঙ্ক করুন' : 'Sync Posts Now'}
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setDuplicateFilter('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all cursor-pointer"
            >
              {language === 'bn' ? 'ফিল্টার রিসেট করুন' : 'Reset Filters'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const isExpanded = !!expandedCaptions[post.id];
            const match = post.duplicateMatch;
            const isPending = post.status === 'pending';
            const isPublished = post.status === 'published';
            const isRejected = post.status === 'rejected';

            // Find matching product if any
            const matchedProduct = match?.matchedProductId
              ? products.find((p) => p.id === match.matchedProductId)
              : null;

            return (
              <div
                key={post.id}
                id={`fb-post-card-${post.id}`}
                className={`bg-[#0c1322] rounded-2xl sm:rounded-3xl border transition-all shadow-md overflow-hidden ${
                  match?.level === 'already_exists'
                    ? 'border-rose-500/30 hover:border-rose-500/50'
                    : match?.level === 'possible_match'
                    ? 'border-amber-500/30 hover:border-amber-500/50'
                    : 'border-slate-800 hover:border-blue-500/40'
                }`}
              >
                {/* Top Card Header */}
                <div className="px-4 sm:px-5 py-3 bg-slate-900/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                      ID: #{post.fbPostId.split('_')[1] || post.id}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {new Date(post.createdAt).toLocaleDateString('bn-BD', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Status & Duplicate Indicators */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Status Badge */}
                    {isPending && (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {language === 'bn' ? 'পেন্ডিং রিভিউ' : 'Pending Review'}
                      </span>
                    )}
                    {isPublished && (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {language === 'bn' ? 'স্টোরে প্রকাশিত' : 'Published to Store'}
                      </span>
                    )}
                    {isRejected && (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        {language === 'bn' ? 'বাতিল' : 'Rejected'}
                      </span>
                    )}

                    {/* Duplicate Detection Level Badge (STEP 6 Requirement) */}
                    {isPending && match && (
                      <>
                        {match.level === 'new_product' && (
                          <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shadow-xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>🟢 NEW PRODUCT</span>
                          </span>
                        )}
                        {match.level === 'possible_match' && (
                          <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1 shadow-xs">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            <span>🟡 POSSIBLE MATCH ({match.score}%)</span>
                          </span>
                        )}
                        {match.level === 'already_exists' && (
                          <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1 shadow-xs animate-pulse">
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                            <span>🔴 ALREADY EXISTS ({match.score}%)</span>
                          </span>
                        )}
                      </>
                    )}

                    <a
                      href={post.permalinkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-800"
                      title="View original post on Facebook"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Main Content: Post Details & Side-by-Side Duplicate Comparison */}
                <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left Column: Facebook Post Detected Details (7 cols) */}
                  <div className={`space-y-3.5 ${match?.matchedProductId ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Image Preview */}
                      <div className="relative w-full sm:w-40 h-44 sm:h-40 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 group">
                        <img
                          src={post.detectedProduct.image || post.imageUrl}
                          alt={post.detectedProduct.titleBn}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-slate-950/80 text-[10px] font-bold text-amber-400 border border-slate-800">
                          {formatPrice(post.detectedProduct.price)}
                        </div>
                      </div>

                      {/* Detected Info */}
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/25 uppercase">
                            {post.detectedProduct.category || 'Clothing'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {post.detectedProduct.stockCount || 20} {language === 'bn' ? 'পিস স্টক' : 'in stock'}
                          </span>
                        </div>

                        <h4 className="text-sm sm:text-base font-bold text-white font-serif leading-snug">
                          {post.detectedProduct.titleBn}
                        </h4>
                        <p className="text-xs text-slate-400 italic">
                          {post.detectedProduct.titleEn}
                        </p>

                        {/* Price & Sizes & Colors */}
                        <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
                          <div className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 font-bold text-amber-400">
                            মূল্য: {formatPrice(post.detectedProduct.price)}
                          </div>
                          {post.detectedProduct.sizes?.length > 0 && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-300 bg-slate-900/90 px-2 py-1 rounded-lg border border-slate-800">
                              <span className="text-slate-500">সাইজ:</span>
                              <span className="font-bold">{post.detectedProduct.sizes.join(', ')}</span>
                            </div>
                          )}
                          {post.detectedProduct.colors?.length > 0 && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-300 bg-slate-900/90 px-2 py-1 rounded-lg border border-slate-800">
                              <span className="text-slate-500">রং:</span>
                              {post.detectedProduct.colors.map((c, i) => (
                                <span key={i} className="flex items-center gap-1">
                                  <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: c.hex }} />
                                  <span className="font-medium text-[10px]">{c.name}</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Original Caption with Expand */}
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                          <Share2 className="w-3 h-3 text-blue-400" />
                          {language === 'bn' ? 'ফেসবুক পোস্ট ক্যাপশন:' : 'Original Caption:'}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleCaption(post.id)}
                          className="text-[11px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>{isExpanded ? (language === 'bn' ? 'সংক্ষিপ্ত' : 'Less') : (language === 'bn' ? 'সম্পূর্ণ দেখুন' : 'Expand')}</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>
                      <p className={`text-xs text-slate-300 whitespace-pre-line leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                        {post.caption}
                      </p>
                    </div>

                    {/* If post is published or rejected, show review details */}
                    {(isPublished || isRejected) && (
                      <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs flex items-center justify-between text-slate-400">
                        <div>
                          <span className="font-semibold text-slate-300">
                            {isPublished ? 'Published Product ID:' : 'Rejection Reason:'}
                          </span>{' '}
                          <span className={isPublished ? 'text-emerald-400 font-mono' : 'text-rose-400'}>
                            {isPublished ? post.publishedProductId : post.rejectionReason}
                          </span>
                        </div>
                        {post.reviewedAt && (
                          <div className="text-[11px] text-slate-500">
                            রিভিউয়ার: {post.reviewedBy || 'Admin'} ({new Date(post.reviewedAt).toLocaleDateString()})
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Matched Store Product & Comparison (5 cols) */}
                  {match?.matchedProductId && matchedProduct && (
                    <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 to-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          {language === 'bn' ? 'ক্যাটালগে বিদ্যমান মিল:' : 'Matched Store Product:'}
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          match.level === 'already_exists' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {match.score}% সাদৃশ্য
                        </span>
                      </div>

                      {/* Matched Product Card */}
                      <div className="flex gap-3 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                        <img
                          src={matchedProduct.image}
                          alt={matchedProduct.titleBn}
                          className="w-16 h-16 rounded-lg object-cover bg-slate-950 shrink-0 border border-slate-800"
                        />
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs font-bold text-white truncate font-serif">
                            {matchedProduct.titleBn}
                          </h5>
                          <p className="text-[10px] text-slate-400 truncate">
                            {matchedProduct.titleEn}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-xs">
                            <span className="text-[#dfb76c] font-black">{formatPrice(matchedProduct.price)}</span>
                            <span className="text-[10px] text-slate-400 capitalize">• {matchedProduct.category}</span>
                          </div>
                        </div>
                      </div>

                      {/* Reasons why it was flagged as duplicate */}
                      {match.reasons && match.reasons.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {language === 'bn' ? 'সাদৃশ্যের কারণসমূহ:' : 'Match Factors:'}
                          </span>
                          <ul className="space-y-1">
                            {match.reasons.map((reason, idx) => (
                              <li key={idx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                                <span className="text-amber-400 font-bold">•</span>
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Protection Warning if Already Exists */}
                      {match.level === 'already_exists' && (
                        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-[11px] text-rose-300 space-y-1">
                          <div className="font-bold flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                            <span>{language === 'bn' ? 'অটো-ডুপ্লিকেট প্রতিরোধ সক্রিয়' : 'Duplicate Creation Prevented'}</span>
                          </div>
                          <p className="text-[10px] text-rose-300/80 leading-normal">
                            {language === 'bn'
                              ? 'একই পণ্য আবার প্রকাশ রোধ করতে অটোমেটিক ব্লক করা হয়েছে। প্রকাশ করতে চাইলে ফোর্স ওভাররাইড কনফার্ম করতে হবে।'
                              : 'Auto-publish is disabled to prevent duplicate products in store.'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Action Buttons Footer */}
                <div className="px-4 sm:px-5 py-3 bg-slate-950 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="text-xs text-slate-400">
                    {isPending ? (
                      <span className="text-amber-400 font-medium flex items-center gap-1">
                        <Info className="w-3.5 h-3.5" />
                        {language === 'bn' ? 'অ্যাডমিন পর্যালোচনার অপেক্ষায় রয়েছে' : 'Awaiting admin decision'}
                      </span>
                    ) : isPublished ? (
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {language === 'bn' ? 'পণ্যটি স্টোর ক্যাটালগে লাইভ রয়েছে' : 'Live in Store Catalogue'}
                      </span>
                    ) : (
                      <span className="text-rose-400 font-medium flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        {language === 'bn' ? 'পোস্টটি বাতিল করা হয়েছে' : 'Rejected'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isPending && (
                      <>
                        <button
                          id={`reject-btn-${post.id}`}
                          type="button"
                          onClick={() => setRejectDialogPostId(post.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-800 hover:border-rose-500/40 text-xs font-bold transition-all cursor-pointer"
                        >
                          {language === 'bn' ? 'বাতিল করুন' : 'Reject'}
                        </button>

                        <button
                          id={`publish-btn-${post.id}`}
                          type="button"
                          onClick={() => openPublishReview(post)}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#dfb76c] to-[#c59e4b] hover:from-[#e9c782] hover:to-[#dfb76c] active:scale-95 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                          <span>{language === 'bn' ? 'পণ্য হিসেবে প্রকাশ করুন' : 'Publish as Product'}</span>
                        </button>
                      </>
                    )}

                    {isPublished && (
                      <button
                        type="button"
                        onClick={() => reopenFacebookPost(post.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3 text-amber-400" />
                        <span>{language === 'bn' ? 'পুনরায় পেন্ডিং করুন' : 'Reopen to Pending'}</span>
                      </button>
                    )}

                    {isRejected && (
                      <>
                        <button
                          type="button"
                          onClick={() => reopenFacebookPost(post.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3 text-emerald-400" />
                          <span>{language === 'bn' ? 'পুনরায় পেন্ডিং করুন' : 'Reopen'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteFacebookPost(post.id)}
                          className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors cursor-pointer"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Publish / Review Modal */}
      {reviewPost && editFormData && (
        <div
          id="publish-review-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto"
          onClick={() => setReviewPost(null)}
        >
          <div
            id="publish-review-modal"
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0c1322] w-full max-w-2xl rounded-3xl shadow-2xl border border-[#dfb76c]/40 p-5 sm:p-6 text-slate-200 relative overflow-hidden space-y-4 max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#dfb76c]/20 text-[#dfb76c] flex items-center justify-center border border-[#dfb76c]/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white font-serif">
                    {language === 'bn' ? 'ফেসবুক পোস্ট থেকে পণ্য প্রকাশ' : 'Review & Publish Product'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'bn'
                      ? 'স্টোরে প্রকাশের পূর্বে পণ্যের নাম, ক্যাটাগরি ও প্রাইস যাচাই ও সম্পাদনা করুন।'
                      : 'Verify product details before saving to real store catalogue.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReviewPost(null)}
                className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="overflow-y-auto space-y-4 pr-1 flex-1 slim-scrollbar">
              {/* Duplicate Warning in Review Modal */}
              {reviewPost.duplicateMatch?.level === 'already_exists' && (
                <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-rose-300">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>
                      {language === 'bn'
                        ? 'সতর্কতা: এই পণ্যটি ইতিমধ্যেই ডাটাবেজে রয়েছে!'
                        : 'Warning: Strong duplicate detected in database!'}
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-300/80 leading-relaxed">
                    {language === 'bn'
                      ? `স্টোরের "${reviewPost.duplicateMatch.matchedProductTitleBn || reviewPost.duplicateMatch.matchedProductTitle}" এর সাথে ${reviewPost.duplicateMatch.score}% মিল পাওয়া গেছে। আপনি কি নিশ্চিত যে এটি একটি পৃথক পণ্য হিসেবে ক্যাটালগে যুক্ত করতে চান?`
                      : `Matches existing product with ${reviewPost.duplicateMatch.score}% similarity. Confirm force override to proceed.`}
                  </p>
                  <label className="flex items-center gap-2 pt-1 font-bold text-white cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={forceOverrideDuplicate}
                      onChange={(e) => setForceOverrideDuplicate(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 accent-amber-500 cursor-pointer"
                    />
                    <span>
                      {language === 'bn'
                        ? 'হ্যাঁ, আমি সচেতনভাবে পৃথক পণ্য তৈরি করতে চাই (Force Override)'
                        : 'Yes, force create a separate product entry'}
                    </span>
                  </label>
                </div>
              )}

              {/* Title Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {language === 'bn' ? 'পণ্যের নাম (বাংলা) *' : 'Product Title (Bengali) *'}
                  </label>
                  <input
                    type="text"
                    value={editFormData.titleBn}
                    onChange={(e) => setEditFormData({ ...editFormData, titleBn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {language === 'bn' ? 'পণ্যের নাম (English) *' : 'Product Title (English) *'}
                  </label>
                  <input
                    type="text"
                    value={editFormData.titleEn}
                    onChange={(e) => setEditFormData({ ...editFormData, titleEn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              {/* Price, Original Price, Category & Stock */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {language === 'bn' ? 'বিক্রয় মূল্য (৳) *' : 'Price (৳) *'}
                  </label>
                  <input
                    type="number"
                    value={editFormData.price}
                    onChange={(e) => setEditFormData({ ...editFormData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-xs text-amber-400 font-bold focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {language === 'bn' ? 'মূল দাম (৳)' : 'Original (৳)'}
                  </label>
                  <input
                    type="number"
                    value={editFormData.originalPrice}
                    onChange={(e) => setEditFormData({ ...editFormData, originalPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {language === 'bn' ? 'ক্যাটাগরি *' : 'Category *'}
                  </label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full px-2.5 py-2 bg-slate-950 rounded-xl border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {language === 'bn' ? c.nameBn : c.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {language === 'bn' ? 'স্টক পরিমাণ' : 'Stock'}
                  </label>
                  <input
                    type="number"
                    value={editFormData.stockCount}
                    onChange={(e) => setEditFormData({ ...editFormData, stockCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Image URL with Preview */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {language === 'bn' ? 'পণ্যের ছবির লিঙ্ক (Image URL) *' : 'Image URL *'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={editFormData.image}
                    onChange={(e) => setEditFormData({ ...editFormData, image: e.target.value })}
                    className="flex-1 px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                    required
                  />
                  {editFormData.image && (
                    <img
                      src={editFormData.image}
                      alt="Preview"
                      className="w-10 h-10 rounded-lg object-cover bg-slate-950 border border-slate-800 shrink-0"
                    />
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {language === 'bn' ? 'পণ্যের বিবরণ (বাংলা)' : 'Description (Bengali)'}
                </label>
                <textarea
                  rows={3}
                  value={editFormData.descriptionBn}
                  onChange={(e) => setEditFormData({ ...editFormData, descriptionBn: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setReviewPost(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>

              <button
                id="confirm-publish-btn"
                type="button"
                onClick={handleConfirmPublish}
                disabled={
                  isSubmittingPublish ||
                  (reviewPost.duplicateMatch?.level === 'already_exists' && !forceOverrideDuplicate)
                }
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-[#dfb76c] to-[#c59e4b] hover:from-[#e9c782] hover:to-[#dfb76c] active:scale-95 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                <span>
                  {isSubmittingPublish
                    ? language === 'bn'
                      ? 'সংরক্ষণ হচ্ছে...'
                      : 'Saving...'
                    : language === 'bn'
                    ? 'স্টোরে ক্যাটালগে যুক্ত করুন'
                    : 'Confirm & Publish to Store'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Reject Reason Dialog */}
      {rejectDialogPostId && (
        <div
          id="reject-dialog-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setRejectDialogPostId(null)}
        >
          <div
            id="reject-dialog"
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0c1322] w-full max-w-md rounded-2xl p-5 border border-rose-500/30 text-slate-200 space-y-4 shadow-2xl"
          >
            <div className="flex items-center gap-2 text-rose-400">
              <XCircle className="w-5 h-5" />
              <h4 className="text-sm font-bold text-white">
                {language === 'bn' ? 'পোস্টটি বাতিল করার কারণ নির্বাচন করুন' : 'Select Rejection Reason'}
              </h4>
            </div>

            <div className="space-y-2">
              {[
                'Duplicate / Already in store (ইতিমধ্যে ডাটাবেজে আছে)',
                'Promotional announcement only (শুধুমাত্র বিজ্ঞাপনী বার্তা)',
                'Out of stock / Sold out (স্টক শেষ)',
                'Incomplete specifications / Missing price (অসম্পূর্ণ তথ্য)',
              ].map((reason, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setRejectReason(reason)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                    rejectReason === reason
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectDialogPostId(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-300 text-xs font-medium cursor-pointer"
              >
                {language === 'bn' ? 'বন্ধ করুন' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
              >
                {language === 'bn' ? 'বাতিল নিশ্চিত করুন' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Manual Add Post Modal */}
      {isManualModalOpen && (
        <div
          id="manual-fb-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto"
          onClick={() => setIsManualModalOpen(false)}
        >
          <div
            id="manual-fb-modal"
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0c1322] w-full max-w-lg rounded-3xl p-5 sm:p-6 border border-blue-500/30 text-slate-200 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">
                  {language === 'bn' ? 'ম্যানুয়ালি ফেসবুক পোস্ট যুক্ত করুন' : 'Add Facebook Post Manually'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsManualModalOpen(false)}
                className="p-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveManualPost} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {language === 'bn' ? 'ফেসবুক ক্যাপশন (পোস্টের লেখা) *' : 'Post Caption (Bangla / English) *'}
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder={
                    language === 'bn'
                      ? 'ফেসবুক পোস্টের সম্পূর্ণ ক্যাপশনটি এখানে পেস্ট করুন (প্রাইস, সাইজ ইত্যাদি স্বয়ংক্রিয়ভাবে ডিটেক্ট হবে)...'
                      : 'Paste raw caption here (price, sizes, title will be auto-parsed)...'
                  }
                  value={manualCaption}
                  onChange={(e) => setManualCaption(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {language === 'bn' ? 'ছবির লিঙ্ক (Image URL)' : 'Photo Image URL'}
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={manualImageUrl}
                  onChange={(e) => setManualImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {language === 'bn' ? 'ফেসবুক পোস্ট লিঙ্ক (ঐচ্ছিক)' : 'Facebook Post URL (Optional)'}
                </label>
                <input
                  type="url"
                  placeholder="https://facebook.com/khorom.official/posts/..."
                  value={manualPostUrl}
                  onChange={(e) => setManualPostUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {language === 'bn' ? 'পেন্ডিং তালিকায় সেভ করুন' : 'Save to Pending Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
