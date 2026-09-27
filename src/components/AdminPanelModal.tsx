import React, { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { AdminOverviewTab } from './admin/AdminOverviewTab';
import { AdminProductsTab } from './admin/AdminProductsTab';
import { AdminCategoriesTab } from './admin/AdminCategoriesTab';
import { AdminOrdersTab } from './admin/AdminOrdersTab';
import { AdminCouponsTab } from './admin/AdminCouponsTab';
import { AdminSettingsTab } from './admin/AdminSettingsTab';
import { AdminChatsTab } from './admin/AdminChatsTab';
import { AdminOffersTab } from './admin/AdminOffersTab';
import { AdminCoinsTab } from './admin/AdminCoinsTab';
import { AdminFacebookTab } from './admin/AdminFacebookTab';
import { AdminCourierTab } from './admin/AdminCourierTab';
import { AdminPositionEditorModal } from './admin/AdminPositionEditorModal';
import { AdminLogoTab } from './admin/AdminLogoTab';
import { AUTHORIZED_ADMIN_EMAILS, isAuthorizedAdmin } from '../types';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Package,
  ShoppingBag,
  Tag,
  BarChart3,
  Settings,
  MessageSquare,
  FolderTree,
  Sparkles,
  Coins,
  Share2,
  ChevronDown,
  LayoutGrid,
  PanelLeftClose,
  PanelLeft,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Layers,
  Truck,
  Image as ImageIcon,
} from 'lucide-react';

export const AdminPanelModal: React.FC = () => {
  const {
    isAdminPanelOpen,
    setIsAdminPanelOpen,
    language,
    setLanguage,
    products,
    categories,
    promoCodes,
    orders,
    offers,
    currentUser,
    setIsAuthModalOpen,
    pendingFacebookPostsCount,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'facebook' | 'orders' | 'courier' | 'coupons' | 'offers' | 'coins' | 'settings' | 'chats' | 'logo'>('overview');
  const [showMobileTabMenu, setShowMobileTabMenu] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isPositionModalOpen, setIsPositionModalOpen] = useState(false);

  const tabStripRef = useRef<HTMLDivElement>(null);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabStripRef.current) {
      const scrollAmount = direction === 'left' ? -240 : 240;
      tabStripRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!isAdminPanelOpen) return null;

  // Strict Gmail Allowlist Authorization Check
  const isAuthorized = currentUser && isAuthorizedAdmin(currentUser.email);

  if (!isAuthorized) {
    return (
      <div
        id="admin-panel-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto"
        onClick={() => setIsAdminPanelOpen(false)}
      >
        <div
          id="admin-access-denied-card"
          onClick={(e) => e.stopPropagation()}
          className="bg-[#0c1322] w-full max-w-md rounded-3xl shadow-2xl border border-rose-500/40 p-6 sm:p-7 text-center relative overflow-hidden text-slate-200 animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Top glow */}
          <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-rose-500/20 to-transparent pointer-events-none" />

          {/* Close button */}
          <button
            id="close-access-denied-btn"
            onClick={() => setIsAdminPanelOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-500/10">
            <ShieldAlert className="w-9 h-9" />
          </div>

          <h3 className="text-lg sm:text-xl font-black text-white">
            {language === 'bn' ? 'অ্যাক্সেস অনুমোদিত নয় (Access Denied)' : 'Admin Access Denied'}
          </h3>

          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            {language === 'bn'
              ? `নিরাপত্তার স্বার্থে খড়ম অ্যাডমিন কন্ট্রোল প্যানেল শুধুমাত্র নিচের ${AUTHORIZED_ADMIN_EMAILS.length}টি অনুমোদিত Gmail অ্যাকাউন্ট দ্বারা অ্যাক্সেসযোগ্য:`
              : `For store security, the Khorom Admin Panel is strictly restricted to the following ${AUTHORIZED_ADMIN_EMAILS.length} authorized Gmail accounts:`}
          </p>

          <div className="my-4 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-left space-y-2">
            {AUTHORIZED_ADMIN_EMAILS.map((adminEmail) => (
              <div key={adminEmail} className="flex items-center gap-2 text-xs text-amber-300 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{adminEmail}</span>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-slate-400 mb-5 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span>{language === 'bn' ? 'বর্তমান ব্যবহারকারী: ' : 'Current User: '}</span>
            <span className="text-rose-300 font-bold">
              {currentUser?.email ? `${currentUser.email} (অননুমোদিত / Unauthorized)` : language === 'bn' ? 'লগইন করা নেই (Guest)' : 'Not logged in (Guest)'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              id="admin-login-switch-btn"
              onClick={() => {
                setIsAdminPanelOpen(false);
                setIsAuthModalOpen(true);
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
            >
              {language === 'bn' ? 'অনুমোদিত অ্যাডমিন দিয়ে লগইন' : 'Sign in as Admin'}
            </button>
            <button
              id="admin-deny-close-btn"
              onClick={() => setIsAdminPanelOpen(false)}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer"
            >
              {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabsConfig = [
    {
      id: 'overview' as const,
      icon: BarChart3,
      labelBn: 'ওভারভিউ',
      labelEn: 'Overview',
      fullLabelBn: 'ওভারভিউ ও রিয়েল ডাটা',
      fullLabelEn: 'Overview & Real Data',
      count: null,
      color: 'text-amber-400',
    },
    {
      id: 'products' as const,
      icon: Package,
      labelBn: 'পণ্য ও স্টক',
      labelEn: 'Products',
      fullLabelBn: 'প্রোডাক্টস ও পজিশন',
      fullLabelEn: 'Products & Positions',
      count: products.length,
      color: 'text-amber-400',
    },
    {
      id: 'categories' as const,
      icon: FolderTree,
      labelBn: 'ক্যাটাগরি',
      labelEn: 'Categories',
      fullLabelBn: 'ক্যাটাগরি ম্যানেজমেন্ট',
      fullLabelEn: 'Categories',
      count: categories.length,
      color: 'text-amber-400',
    },
    {
      id: 'facebook' as const,
      icon: Share2,
      labelBn: 'ফেসবুক',
      labelEn: 'FB Posts',
      fullLabelBn: 'ফেসবুক পেজ পোস্ট',
      fullLabelEn: 'Facebook Page Posts',
      count: pendingFacebookPostsCount > 0 ? pendingFacebookPostsCount : null,
      color: 'text-blue-400',
    },
    {
      id: 'orders' as const,
      icon: ShoppingBag,
      labelBn: 'অর্ডার',
      labelEn: 'Orders',
      fullLabelBn: 'অর্ডার তালিকা',
      fullLabelEn: 'Orders',
      count: orders.length > 0 ? orders.length : null,
      color: 'text-sky-400',
    },
    {
      id: 'courier' as const,
      icon: Truck,
      labelBn: 'পাঠাও কুরিয়ার',
      labelEn: 'Courier',
      fullLabelBn: 'পাঠাও কুরিয়ার ম্যানেজমেন্ট',
      fullLabelEn: 'Pathao Courier Management',
      count: null,
      color: 'text-rose-400',
    },
    {
      id: 'coupons' as const,
      icon: Tag,
      labelBn: 'কুপন',
      labelEn: 'Coupons',
      fullLabelBn: 'কুপন সিস্টেম',
      fullLabelEn: 'Coupons',
      count: promoCodes.length,
      color: 'text-emerald-400',
    },
    {
      id: 'offers' as const,
      icon: Sparkles,
      labelBn: 'অফার',
      labelEn: 'Offers',
      fullLabelBn: 'অফার সেন্টার',
      fullLabelEn: 'Offers Center',
      count: offers.length,
      color: 'text-amber-400',
    },
    {
      id: 'coins' as const,
      icon: Coins,
      labelBn: 'খড়ম কয়েন',
      labelEn: 'Coins',
      fullLabelBn: 'খড়ম কয়েন লয়্যালটি',
      fullLabelEn: 'Khorom Coins',
      count: null,
      color: 'text-amber-400',
    },
    {
      id: 'settings' as const,
      icon: Settings,
      labelBn: 'কনটেন্ট',
      labelEn: 'Content',
      fullLabelBn: 'ওয়েবসাইট কনটেন্ট কন্ট্রোল',
      fullLabelEn: 'Website Content',
      count: null,
      color: 'text-indigo-400',
    },
    {
      id: 'logo' as const,
      icon: ImageIcon,
      labelBn: 'লোগো',
      labelEn: 'Logo',
      fullLabelBn: 'লোগো ম্যানেজমেন্ট ও ব্র্যান্ড',
      fullLabelEn: 'Logo & Brand Management',
      count: null,
      color: 'text-[#C6A15B]',
    },
    {
      id: 'chats' as const,
      icon: MessageSquare,
      labelBn: 'লাইভ চ্যাট',
      labelEn: 'Chats',
      fullLabelBn: 'ফায়ারবেস লাইভ চ্যাট',
      fullLabelEn: 'Firebase Live Chats',
      count: null,
      color: 'text-amber-400',
    },
  ];

  const currentActiveTabObj = tabsConfig.find((t) => t.id === activeTab) || tabsConfig[0];

  return (
    <div
      id="admin-panel-backdrop"
      className="fixed inset-0 z-50 flex flex-col sm:items-center sm:justify-center p-0 sm:p-4 md:p-6 bg-slate-950/90 backdrop-blur-md sm:overflow-y-auto"
      onClick={() => setIsAdminPanelOpen(false)}
    >
      <div
        id="admin-panel-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0b1120] w-full max-w-6xl xl:max-w-7xl rounded-none sm:rounded-3xl shadow-2xl border-0 sm:border sm:border-amber-500/25 overflow-hidden flex flex-col h-[100dvh] sm:h-auto sm:max-h-[94vh] animate-in fade-in zoom-in-95 duration-200 text-slate-100"
      >
        {/* Header */}
        <div className="bg-[#070b14] text-white px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between border-b border-slate-800/90 shrink-0 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Slidebar Toggle Button */}
            <button
              type="button"
              id="admin-slidebar-toggle-btn"
              onClick={() => {
                if (typeof window !== 'undefined' && window.innerWidth < 768) {
                  setIsMobileSidebarOpen((prev) => !prev);
                } else {
                  setIsSidebarCollapsed((prev) => !prev);
                }
              }}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-900 border border-slate-700/80 text-amber-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm shrink-0"
              title={language === 'bn' ? 'স্লাইডবার মেনু টগল' : 'Toggle Slidebar Menu'}
            >
              <PanelLeft className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] font-bold text-slate-300 hidden lg:inline">
                {language === 'bn' ? 'স্লাইডবার' : 'Sidebar'}
              </span>
            </button>

            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20 shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-xs sm:text-base md:text-lg font-bold font-serif text-white tracking-wide truncate leading-tight">
                  {language === 'bn' ? 'খড়ম অ্যাডমিন ড্যাশবোর্ড' : 'Khorom Admin Dashboard'}
                </h2>
                <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>{language === 'bn' ? 'লাইভ ডাটা' : 'LIVE'}</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate leading-tight hidden sm:block mt-0.5">
                {language === 'bn'
                  ? 'প্রকৃত ডাটা, লাইভ স্টক, পজিশন এডিটর ও কেন্দ্রীয় কনটেন্ট কন্ট্রোল'
                  : 'Real-time metrics, live inventory, positioning & content control'}
              </p>
            </div>
          </div>

          {/* Header Action Buttons (High-Contrast Segmented Language Switcher & Close) */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl p-0.5 shadow-inner">
              <button
                type="button"
                id="admin-lang-bn-btn"
                onClick={() => setLanguage('bn')}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                  language === 'bn'
                    ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                বাংলা
              </button>
              <button
                type="button"
                id="admin-lang-en-btn"
                onClick={() => setLanguage('en')}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ENG
              </button>
            </div>

            <button
              id="close-admin-panel-btn"
              onClick={() => setIsAdminPanelOpen(false)}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              aria-label="Close admin panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Area: Left Sidebar (Desktop/Laptop) + Right Content */}
        <div className="flex-1 flex overflow-hidden min-h-0 relative">
          {/* DESKTOP / LAPTOP SIDEBAR ("স্লাইডবার") */}
          <aside
            id="admin-desktop-sidebar"
            className={`hidden md:flex flex-col shrink-0 bg-[#070b14] border-r border-slate-800/90 transition-all duration-300 select-none z-10 ${
              isSidebarCollapsed ? 'w-16' : 'w-56 lg:w-60'
            }`}
          >
            {/* Top Header of Sidebar */}
            <div className="p-2.5 lg:p-3 border-b border-slate-800/80 flex items-center justify-between gap-2 shrink-0 bg-[#05080f]">
              {!isSidebarCollapsed && (
                <div className="flex items-center gap-1.5 min-w-0">
                  <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 truncate">
                    {language === 'bn' ? 'স্লাইডবার মেনু' : 'Slidebar Menu'}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed((prev) => !prev)}
                className={`p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800/80 transition-colors cursor-pointer ${
                  isSidebarCollapsed ? 'mx-auto' : ''
                }`}
                title={
                  isSidebarCollapsed
                    ? (language === 'bn' ? 'স্লাইডবার বড় করুন' : 'Expand slidebar')
                    : (language === 'bn' ? 'স্লাইডবার ছোট করুন' : 'Collapse slidebar')
                }
              >
                {isSidebarCollapsed ? (
                  <PanelLeft className="w-4 h-4 text-amber-400" />
                ) : (
                  <PanelLeftClose className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Sidebar Nav Items List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 slim-scrollbar">
              {tabsConfig.map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <React.Fragment key={tab.id}>
                    <button
                      type="button"
                      id={`admin-sidebar-nav-${tab.id}`}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer group ${
                        isSidebarCollapsed ? 'justify-center' : 'justify-between'
                      } ${
                        isSelected
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/15'
                          : 'text-slate-300 hover:text-white hover:bg-slate-900/90 border border-transparent hover:border-slate-800'
                      }`}
                      title={language === 'bn' ? tab.fullLabelBn : tab.fullLabelEn}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-slate-950' : tab.color}`} />
                        {!isSidebarCollapsed && (
                          <span className="truncate">
                            {language === 'bn' ? tab.labelBn : tab.labelEn}
                          </span>
                        )}
                      </div>
                      {!isSidebarCollapsed && tab.count !== null && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold transition-colors ${
                            isSelected
                              ? 'bg-slate-950 text-amber-300'
                              : 'bg-slate-800 text-slate-300 border border-slate-700/80'
                          }`}
                        >
                          {tab.count}
                        </span>
                      )}
                    </button>

                    {/* Right after Products item, insert direct Position Editor quick link! */}
                    {tab.id === 'products' && (
                      <button
                        type="button"
                        id="admin-sidebar-position-btn"
                        onClick={() => {
                          setActiveTab('products');
                          setIsPositionModalOpen(true);
                        }}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer group ${
                          isSidebarCollapsed ? 'justify-center' : 'justify-between'
                        } bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-200 border border-indigo-500/30 hover:border-indigo-400/50 shadow-xs`}
                        title={language === 'bn' ? 'পজিশন এডিটর (পণ্য ক্রমানুসারে সাজান)' : 'Position Editor (Arrange order)'}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-300 shrink-0 group-hover:scale-110 transition-transform" />
                          {!isSidebarCollapsed && (
                            <span className="truncate text-indigo-200">
                              {language === 'bn' ? 'পজিশন সাজান' : 'Edit Positions'}
                            </span>
                          )}
                        </div>
                        {!isSidebarCollapsed && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-400/30">
                            {language === 'bn' ? 'সাজান' : 'Sort'}
                          </span>
                        )}
                      </button>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Sidebar Footer */}
            <div className="p-2.5 border-t border-slate-800/80 bg-[#05080f] shrink-0">
              {!isSidebarCollapsed ? (
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-slate-300 font-bold">KHOROM v2.5</span>
                  </div>
                  <span className="text-amber-400 font-mono text-[9px] px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                    {language === 'bn' ? 'লাইভ' : 'LIVE'}
                  </span>
                </div>
              ) : (
                <span className="w-2 h-2 rounded-full bg-emerald-400 block mx-auto animate-pulse" title="Online" />
              )}
            </div>
          </aside>

          {/* MOBILE SLIDE-OVER DRAWER ("মোবাইল স্লাইডবার") */}
          {isMobileSidebarOpen && (
            <div
              className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm md:hidden flex animate-in fade-in duration-200"
              onClick={() => setIsMobileSidebarOpen(false)}
            >
              <aside
                onClick={(e) => e.stopPropagation()}
                className="w-72 max-w-[85vw] h-full bg-[#070b14] border-r border-amber-500/30 flex flex-col animate-in slide-in-from-left duration-200 shadow-2xl text-slate-100"
              >
                <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-[#05080f]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-400/20 border border-amber-400/30 text-amber-400 flex items-center justify-center font-bold">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-white font-serif">
                      {language === 'bn' ? 'খড়ম অ্যাডমিন মেনু' : 'Khorom Admin Menu'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2.5 space-y-1 slim-scrollbar">
                  {tabsConfig.map((tab) => {
                    const Icon = tab.icon;
                    const isSelected = activeTab === tab.id;
                    return (
                      <React.Fragment key={tab.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab(tab.id);
                            setIsMobileSidebarOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black shadow-md'
                              : 'text-slate-300 hover:text-white hover:bg-slate-900/90 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-slate-950' : tab.color}`} />
                            <span className="truncate">{language === 'bn' ? tab.fullLabelBn : tab.fullLabelEn}</span>
                          </div>
                          {tab.count !== null && (
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                                isSelected
                                  ? 'bg-slate-950 text-amber-300'
                                  : 'bg-slate-800 text-slate-300 border border-slate-700/80'
                              }`}
                            >
                              {tab.count}
                            </span>
                          )}
                        </button>

                        {tab.id === 'products' && (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('products');
                              setIsPositionModalOpen(true);
                              setIsMobileSidebarOpen(false);
                            }}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold bg-indigo-950/40 text-indigo-200 border border-indigo-500/30 cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5">
                              <SlidersHorizontal className="w-4 h-4 text-indigo-300" />
                              <span>{language === 'bn' ? 'পজিশন সাজান' : 'Edit Positions'}</span>
                            </div>
                            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-400/30">
                              {language === 'bn' ? 'সাজান' : 'Sort'}
                            </span>
                          </button>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </aside>
            </div>
          )}

          {/* MAIN CONTENT AREA ON RIGHT */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#090e1a]">
            {/* Mobile Quick Tab Dropdown / Selector Bar (Visible on mobile) */}
            <div className="sm:hidden bg-[#090e1a] border-b border-slate-800/80 px-3 py-2 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 min-w-0">
                <span className="text-[10px] text-slate-400 shrink-0 uppercase tracking-wider">{language === 'bn' ? 'ট্যাব:' : 'Tab:'}</span>
                <div className="flex items-center gap-1.5 text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/25 truncate text-xs">
                  <currentActiveTabObj.icon className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  <span className="truncate">{language === 'bn' ? currentActiveTabObj.fullLabelBn : currentActiveTabObj.fullLabelEn}</span>
                  {currentActiveTabObj.count !== null && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-amber-300 font-bold border border-slate-700 ml-1 shrink-0">
                      {currentActiveTabObj.count}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setShowMobileTabMenu((prev) => !prev)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 shrink-0 cursor-pointer transition-colors"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'bn' ? 'সব ট্যাব' : 'All Tabs'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showMobileTabMenu ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Mobile Tab Full Menu Grid Dropdown */}
            {showMobileTabMenu && (
              <div className="sm:hidden bg-[#070b14] border-b border-amber-500/20 p-2.5 grid grid-cols-3 gap-1.5 shrink-0 shadow-2xl animate-in slide-in-from-top-2 duration-150 z-20">
                {tabsConfig.map((tab) => {
                  const Icon = tab.icon;
                  const isSelected = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setShowMobileTabMenu(false);
                      }}
                      className={`p-2.5 rounded-xl text-left flex flex-col gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                          : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-slate-950' : tab.color}`} />
                        {tab.count !== null && (
                          <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${isSelected ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-300'}`}>
                            {tab.count}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-bold truncate leading-tight">
                        {language === 'bn' ? tab.labelBn : tab.labelEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Tab Navigation Pill Strip with Slidebar Arrows (< and >) */}
            <div className="bg-[#070b14]/95 border-b border-slate-800/90 px-2 sm:px-3 flex items-center gap-1 shrink-0">
              {/* Left Scroll Arrow */}
              <button
                type="button"
                onClick={() => scrollTabs('left')}
                className="hidden sm:flex items-center justify-center p-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer border border-slate-800 shrink-0"
                title={language === 'bn' ? 'বামে স্লাইড করুন' : 'Slide left'}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {/* Scrollable tab strip */}
              <div
                ref={tabStripRef}
                className="flex-1 flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1.5 px-0.5 scroll-smooth slim-scrollbar touch-pan-x overscroll-contain"
              >
                {tabsConfig.map((tab) => {
                  const Icon = tab.icon;
                  const isSelected = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      id={`admin-tab-${tab.id}`}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setShowMobileTabMenu(false);
                      }}
                      className={`py-2 sm:py-2.5 px-2.5 sm:px-3.5 text-xs font-bold border-b-2 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 transition-all cursor-pointer min-h-[38px] ${
                        isSelected
                          ? 'border-amber-400 text-amber-300 bg-amber-400/10 rounded-t-xl font-black'
                          : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSelected ? 'text-amber-400' : tab.color}`} />
                      {/* Responsive Label */}
                      <span className="sm:hidden">{language === 'bn' ? tab.labelBn : tab.labelEn}</span>
                      <span className="hidden sm:inline">{language === 'bn' ? tab.fullLabelBn : tab.fullLabelEn}</span>
                      {tab.count !== null && (
                        <span className={`text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full font-bold transition-colors ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 shadow-xs'
                            : 'bg-slate-800 text-amber-300 border border-slate-700/80'
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Right Scroll Arrow */}
              <button
                type="button"
                onClick={() => scrollTabs('right')}
                className="hidden sm:flex items-center justify-center p-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer border border-slate-800 shrink-0"
                title={language === 'bn' ? 'ডানে স্লাইড করুন' : 'Slide right'}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="p-3 sm:p-5 md:p-6 overflow-y-auto flex-1 bg-[#090e1a] slim-scrollbar pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] sm:pb-6">
              {activeTab === 'overview' && <AdminOverviewTab />}
              {activeTab === 'products' && <AdminProductsTab />}
              {activeTab === 'categories' && <AdminCategoriesTab />}
              {activeTab === 'facebook' && <AdminFacebookTab />}
              {activeTab === 'orders' && <AdminOrdersTab />}
              {activeTab === 'courier' && <AdminCourierTab />}
              {activeTab === 'coupons' && <AdminCouponsTab />}
              {activeTab === 'offers' && <AdminOffersTab />}
              {activeTab === 'coins' && <AdminCoinsTab />}
              {activeTab === 'settings' && <AdminSettingsTab />}
              {activeTab === 'logo' && <AdminLogoTab />}
              {activeTab === 'chats' && <AdminChatsTab />}
            </div>
          </div>
        </div>

        {/* Position Editor Modal triggered from Sidebar or Top Bar */}
        <AdminPositionEditorModal
          isOpen={isPositionModalOpen}
          onClose={() => setIsPositionModalOpen(false)}
        />
      </div>
    </div>
  );
};
