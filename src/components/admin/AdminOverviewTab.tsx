import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Users,
  Package,
  Ticket,
  MousePointerClick,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Eye,
  Heart,
  Calendar,
  Smartphone,
  Laptop
} from 'lucide-react';

export const AdminOverviewTab: React.FC = () => {
  const {
    language,
    formatPrice,
    overviewStats,
    refreshOverviewStats,
    userLoginLogs,
    orders,
    products,
    promoCodes,
    productClickStats,
  } = useStore();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshOverviewStats();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Safe fallback to actual store states if stats API hasn't loaded yet
  const totalUsers = overviewStats?.totalRegisteredUsers ?? (userLoginLogs.length > 0 ? new Set(userLoginLogs.map(l => l.email)).size : 0);
  const recentLogins = overviewStats?.recentLogins ?? userLoginLogs;
  const totalProducts = overviewStats?.totalProducts ?? products.length;
  const inStockProducts = overviewStats?.inStockProducts ?? products.filter(p => p.inStock).length;
  const outOfStockProducts = overviewStats?.outOfStockProducts ?? products.filter(p => !p.inStock).length;
  const totalOrders = overviewStats?.totalOrders ?? orders.length;
  const totalRevenue = overviewStats?.totalRevenue ?? orders.reduce((acc, o) => acc + o.total, 0);
  const totalClicks = overviewStats?.totalProductClicks ?? Object.values(productClickStats).reduce((acc: number, s: any) => acc + (s?.clicks || 0), 0);
  const totalViews = overviewStats?.totalProductViews ?? Object.values(productClickStats).reduce((acc: number, s: any) => acc + (s?.views || 0), 0);
  const couponsCreated = overviewStats?.totalCouponsCreated ?? promoCodes.length;
  const couponsRedeemed = overviewStats?.totalCouponsRedeemed ?? promoCodes.reduce((acc, c) => acc + (c.timesUsed || 0), 0);
  const mostViewed = overviewStats?.mostViewedProducts ?? [];
  const statusCounts = overviewStats?.ordersByStatus ?? {
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Banner: Real Database Indicator & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-[#0c1424] to-[#0f172a] border border-amber-500/20 p-3.5 sm:p-4 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs sm:text-sm md:text-base font-bold text-white font-serif tracking-wide">
                {language === 'bn' ? 'রিয়েল-টাইম ডাটাবেজ ওভারভিউ' : 'Real-Time Database Overview'}
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Firestore (khorom2)</span>
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
              {language === 'bn'
                ? 'ডাটাবেজের প্রকৃত রেকর্ড থেকে সংগৃহীত লাইভ ডাটা ও সেলস অ্যানালিটিক্স।'
                : 'Real-time metrics synced directly from live cloud database records.'}
            </p>
          </div>
        </div>

        <button
          id="admin-refresh-stats-btn"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700/90 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{language === 'bn' ? 'ডাটা রিফ্রেশ করুন' : 'Refresh Data'}</span>
        </button>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* 1. Registered Users & Logins */}
        <div className="bg-[#0c1424] p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800 hover:border-sky-500/30 transition-all shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="text-[11px] sm:text-xs font-semibold">{language === 'bn' ? 'নিবন্ধিত গ্রাহক' : 'Registered Users'}</span>
            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-white">
            {totalUsers}
            <span className="text-xs font-normal text-slate-400 ml-1">
              {language === 'bn' ? 'জন' : 'users'}
            </span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-sky-400/90 font-medium mt-1.5 flex items-center gap-1">
            <span>
              {language === 'bn'
                ? `সাম্প্রতিক লগইন: ${recentLogins.length} সেশন`
                : `Recent logins: ${recentLogins.length}`}
            </span>
          </div>
        </div>

        {/* 2. Total Products & Stock */}
        <div className="bg-[#0c1424] p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800 hover:border-amber-500/30 transition-all shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="text-[11px] sm:text-xs font-semibold">{language === 'bn' ? 'পণ্য ও স্টক' : 'Products & Stock'}</span>
            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-white">
            {totalProducts}
            <span className="text-xs font-normal text-slate-400 ml-1">
              {language === 'bn' ? 'টি' : 'items'}
            </span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-amber-400/90 font-medium mt-1.5 flex items-center gap-1.5">
            <span className="text-emerald-400 font-semibold">{inStockProducts} {language === 'bn' ? 'ইন-স্টক' : 'in stock'}</span>
            <span>•</span>
            <span className={outOfStockProducts > 0 ? 'text-rose-400 font-semibold' : 'text-slate-500'}>
              {outOfStockProducts} {language === 'bn' ? 'আউট' : 'out'}
            </span>
          </div>
        </div>

        {/* 3. Product Views & Clicks */}
        <div className="bg-[#0c1424] p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800 hover:border-purple-500/30 transition-all shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="text-[11px] sm:text-xs font-semibold">{language === 'bn' ? 'ভিউ ও ক্লিক' : 'Views & Clicks'}</span>
            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <MousePointerClick className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-white">
            {totalClicks}
            <span className="text-xs font-normal text-slate-400 ml-1">
              {language === 'bn' ? 'ক্লিক' : 'clicks'}
            </span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-purple-400/90 font-medium mt-1.5 flex items-center gap-1 truncate">
            <Eye className="w-3 h-3 shrink-0" />
            <span className="truncate">{totalViews} {language === 'bn' ? 'বার ভিউ হয়েছে' : 'total views'}</span>
          </div>
        </div>

        {/* 4. Orders & Revenue */}
        <div className="bg-[#0c1424] p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-all shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="text-[11px] sm:text-xs font-semibold">{language === 'bn' ? 'মোট অর্ডার ও আয়' : 'Orders & Revenue'}</span>
            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-amber-300">
            {formatPrice(totalRevenue)}
          </div>
          <div className="text-[10px] sm:text-[11px] text-emerald-400/90 font-medium mt-1.5">
            {totalOrders} {language === 'bn' ? 'টি সফল অর্ডার জমা পড়েছে' : 'orders placed'}
          </div>
        </div>
      </div>

      {/* Orders Breakdown by Status & Coupon Redemptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Order Status Breakdown */}
        <div className="bg-[#0c1424] rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-lg space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-800/90 pb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs sm:text-sm font-bold text-white font-serif">
                {language === 'bn' ? 'অর্ডার স্ট্যাটাস অনুযায়ী বাস্তব পরিসংখ্যান' : 'Order Status Distribution'}
              </h4>
            </div>
            <span className="text-xs font-bold text-slate-400">
              {totalOrders} {language === 'bn' ? 'মোট' : 'Total'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div className="p-2.5 sm:p-3 rounded-xl bg-[#080d19] border border-blue-500/25">
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">{language === 'bn' ? 'কনফার্মড' : 'Confirmed'}</p>
              <p className="text-lg sm:text-xl font-black text-white mt-1">{statusCounts.confirmed || 0}</p>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-[#080d19] border border-amber-500/25">
              <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">{language === 'bn' ? 'প্রসেসিং' : 'Processing'}</p>
              <p className="text-lg sm:text-xl font-black text-white mt-1">{statusCounts.processing || 0}</p>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-[#080d19] border border-indigo-500/25">
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">{language === 'bn' ? 'শিপড' : 'Shipped'}</p>
              <p className="text-lg sm:text-xl font-black text-white mt-1">{statusCounts.shipped || 0}</p>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-[#080d19] border border-emerald-500/25">
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">{language === 'bn' ? 'ডেলিভার্ড' : 'Delivered'}</p>
              <p className="text-lg sm:text-xl font-black text-white mt-1">{statusCounts.delivered || 0}</p>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-[#080d19] border border-rose-500/25 col-span-2 sm:col-span-1">
              <p className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">{language === 'bn' ? 'ক্যানসেলড' : 'Cancelled'}</p>
              <p className="text-lg sm:text-xl font-black text-white mt-1">{statusCounts.cancelled || 0}</p>
            </div>
          </div>
        </div>

        {/* Coupons Created, Used & Redemption Stats */}
        <div className="bg-[#0c1424] rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-lg space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-800/90 pb-3">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs sm:text-sm font-bold text-white font-serif">
                {language === 'bn' ? 'কুপন তৈরি ও ব্যবহারের তথ্য' : 'Coupon Redemption Stats'}
              </h4>
            </div>
            <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              {couponsRedeemed} {language === 'bn' ? 'বার রিডিম' : 'Redeemed'}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#080d19] border border-slate-800/90">
            <div>
              <p className="text-xs text-slate-400">{language === 'bn' ? 'তৈরিকৃত সক্রিয় কুপন' : 'Active Coupons'}</p>
              <p className="text-lg font-black text-white mt-0.5">{couponsCreated} {language === 'bn' ? 'টি' : 'coupons'}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">{language === 'bn' ? 'গ্রাহকদের মোট ব্যবহার' : 'Total Uses'}</p>
              <p className="text-lg font-black text-emerald-400 mt-0.5">{couponsRedeemed} {language === 'bn' ? 'বার' : 'times'}</p>
            </div>
          </div>

          {/* Individual Coupon Usage Breakdown */}
          <div className="space-y-2 max-h-36 overflow-y-auto pr-1 slim-scrollbar">
            {promoCodes.length === 0 ? (
              <p className="text-center py-4 text-xs text-slate-500">
                {language === 'bn' ? 'কোনো কুপন তৈরি করা হয়নি' : 'No coupons created yet'}
              </p>
            ) : (
              promoCodes.map((c) => (
                <div key={c.code} className="flex items-center justify-between p-2 rounded-lg bg-[#080d19] border border-slate-800/80 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-300 px-1.5 py-0.5 bg-amber-400/10 rounded border border-amber-400/20 text-[11px]">
                      {c.code}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {c.discountPercent ? `${c.discountPercent}% OFF` : `৳${c.discountAmount} OFF`}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-400 text-xs">
                      {c.timesUsed || 0} {c.usageLimit ? `/ ${c.usageLimit}` : ''} {language === 'bn' ? 'বার ব্যবহৃত' : 'used'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Two Detailed Real-Data Tables: Logged In Users & Product Views */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* 1. Real Login Logs */}
        <div className="bg-[#0c1424] rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/90 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-400" />
              <h4 className="text-xs sm:text-sm font-bold text-white font-serif">
                {language === 'bn' ? 'সাম্প্রতিক লগইন করা ব্যবহারকারী' : 'Recent User Logins'}
              </h4>
            </div>
            <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30">
              {recentLogins.length} {language === 'bn' ? 'সেশন' : 'Sessions'}
            </span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1 slim-scrollbar">
            {recentLogins.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                <Users className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                <p>{language === 'bn' ? 'কোনো লগইন রেকর্ড নেই' : 'No logins recorded yet'}</p>
                <p className="text-[10px] text-slate-500 mt-1">
                  {language === 'bn' ? 'ইউজার লগইন করলে এখানে স্বয়ংক্রিয়ভাবে দৃশ্যমান হবে' : 'New logins will appear here in real-time'}
                </p>
              </div>
            ) : (
              recentLogins.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#080d19] border border-slate-800/80 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={log.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={log.name}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-amber-400/40 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-white truncate">{log.name}</p>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400/15 text-amber-300 font-bold uppercase border border-amber-400/30 shrink-0">
                          {log.provider}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">{log.email}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-300 block font-medium">
                      {log.loginTime}
                    </span>
                    <span className="text-[9px] text-slate-500 block flex items-center justify-end gap-1">
                      {log.device?.includes('Mobile') ? <Smartphone className="w-2.5 h-2.5" /> : <Laptop className="w-2.5 h-2.5" />}
                      {log.device || 'Browser'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 2. Most Viewed / Clicked Products */}
        <div className="bg-[#0c1424] rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/90 pb-3">
            <div className="flex items-center gap-2">
              <MousePointerClick className="w-4 h-4 text-purple-400" />
              <h4 className="text-xs sm:text-sm font-bold text-white font-serif">
                {language === 'bn' ? 'কোন প্রোডাক্ট কতবার দেখা বা ক্লিক হয়েছে' : 'Product Views & Clicks'}
              </h4>
            </div>
            <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
              {totalClicks + totalViews} {language === 'bn' ? 'ইন্টারঅ্যাকশন' : 'Interactions'}
            </span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1 slim-scrollbar">
            {mostViewed.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                <MousePointerClick className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                <p>{language === 'bn' ? 'এখনও পর্যাপ্ত ক্লিক বা ভিউ রেকর্ড হয়নি' : 'No view or click data recorded yet'}</p>
                <p className="text-[10px] text-slate-500 mt-1">
                  {language === 'bn' ? 'কাস্টমাররা পণ্য ব্রাউজ করলে এখানে লাইভ ডাটা যোগ হবে' : 'Product clicks by shoppers will show here'}
                </p>
              </div>
            ) : (
              mostViewed.map((item, idx) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#080d19] border border-slate-800/80 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-slate-800 text-amber-400 font-black text-[10px] sm:text-xs flex items-center justify-center shrink-0 border border-slate-700">
                      #{idx + 1}
                    </div>
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.productTitleEn}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover border border-slate-700 shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        {language === 'bn' ? item.productTitleBn : item.productTitleEn}
                      </p>
                      <p className="text-[10px] text-amber-300 font-semibold">
                        {item.price ? formatPrice(item.price) : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 text-right">
                    <div className="text-right">
                      <span className="text-xs font-black text-purple-300 block">
                        {item.clicks} {language === 'bn' ? 'ক্লিক' : 'clicks'}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {item.views} {language === 'bn' ? 'ভিউ' : 'views'}
                      </span>
                    </div>
                    {item.likes !== undefined && item.likes > 0 && (
                      <div className="flex items-center gap-0.5 text-[10px] text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                        <Heart className="w-2.5 h-2.5 fill-rose-500" />
                        <span>{item.likes}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
