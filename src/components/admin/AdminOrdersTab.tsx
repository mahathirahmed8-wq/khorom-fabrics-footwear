import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  Phone,
  User,
  MapPin,
  FileText,
  CreditCard,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  XCircle,
  Send,
  Coins,
  Sparkles,
  Package,
  RotateCcw,
  History,
  ChevronDown,
  ChevronUp,
  X,
  MessageSquare,
} from 'lucide-react';

export const AdminOrdersTab: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    language,
    formatPrice,
    refreshOverviewStats,
    dispatchPathaoOrder,
    trackPathaoOrder,
    showToast,
  } = useStore();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);
  const [isDispatchingId, setIsDispatchingId] = useState<string | null>(null);
  const [isTrackingId, setIsTrackingId] = useState<string | null>(null);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);

  // Status transition with reason/note modal
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    orderId: string;
    targetStatus: string;
    currentStatus: string;
  } | null>(null);
  const [statusReason, setStatusReason] = useState('');
  const [statusNote, setStatusNote] = useState('');

  const executeStatusChange = async (orderId: string, newStatus: string, reason?: string, note?: string) => {
    setIsUpdatingId(orderId);
    try {
      const isCancellation = newStatus === 'cancelled';
      const isReturn = newStatus === 'returned';

      const success = await updateOrderStatus(
        orderId,
        newStatus,
        undefined,
        reason || (isCancellation ? 'Cancelled by Admin' : isReturn ? 'Customer Returned' : undefined),
        note
      );

      if (success) {
        await refreshOverviewStats();

        if (newStatus === 'received') {
          showToast(
            language === 'bn'
              ? 'অর্ডার Received হিসেবে নিশ্চিত হয়েছে। গ্রাহকের একাউন্টে প্রযোজ্য খড়ম কয়েন স্বয়ংক্রিয়ভাবে জমা হয়েছে!'
              : 'Order confirmed as Received. Customer shopping coin rewards automatically credited!',
            'success'
          );
        } else if (newStatus === 'cancelled') {
          showToast(
            language === 'bn'
              ? 'অর্ডার সফলভাবে বাতিল করা হয়েছে এবং পণ্যের স্টক ইনভেন্টরিতে ফেরত দেওয়া হয়েছে।'
              : 'Order cancelled and stock returned to inventory.',
            'info'
          );
        } else if (newStatus === 'returned') {
          showToast(
            language === 'bn'
              ? 'অর্ডার রিটার্ন হিসেবে রেকর্ড করা হয়েছে এবং স্টক পুনরায় যোগ করা হয়েছে।'
              : 'Order marked as returned and stock restored.',
            'info'
          );
        }
      }
    } finally {
      setIsUpdatingId(null);
      setPendingStatusChange(null);
      setStatusReason('');
      setStatusNote('');
    }
  };

  const handleStatusSelect = (orderId: string, currentStatus: string, newStatus: string) => {
    if (newStatus === currentStatus) return;

    // Prompt for reason/note on cancellations and returns, or if user wants to log note
    if (newStatus === 'cancelled' || newStatus === 'returned') {
      setPendingStatusChange({ orderId, currentStatus, targetStatus: newStatus });
      setStatusReason('');
      setStatusNote('');
    } else {
      executeStatusChange(orderId, newStatus);
    }
  };

  const handlePathaoDispatch = async (orderId: string) => {
    setIsDispatchingId(orderId);
    try {
      const res = await dispatchPathaoOrder(orderId);
      if (res.success) {
        showToast(
          language === 'bn'
            ? `পাঠাও কুরিয়ারে বুকিং সম্পন্ন! কনসাইনমেন্ট: ${res.consignmentId}`
            : `Dispatched to Pathao! Consignment: ${res.consignmentId}`,
          'success'
        );
      } else {
        showToast(res.message || 'Pathao dispatch failed', 'error');
      }
    } finally {
      setIsDispatchingId(null);
    }
  };

  const handlePathaoTrack = async (orderId: string) => {
    setIsTrackingId(orderId);
    try {
      const res = await trackPathaoOrder(orderId);
      if (res.success) {
        showToast(
          language === 'bn'
            ? `পাঠাও স্ট্যাটাস: ${res.data?.order_status || 'আপডেটেড'}`
            : `Pathao Status: ${res.data?.order_status || 'Up to date'}`,
          'success'
        );
      } else {
        showToast(res.message || 'Tracking failed', 'error');
      }
    } finally {
      setIsTrackingId(null);
    }
  };

  const filteredOrders = orders.filter((ord) => {
    if (filterStatus !== 'all' && ord.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = ord.id.toLowerCase().includes(q);
      const matchName = ord.customer?.fullName?.toLowerCase().includes(q);
      const matchPhone = ord.customer?.phone?.includes(q);
      const matchConsignment = ord.pathaoConsignmentId?.toLowerCase().includes(q);
      if (!matchId && !matchName && !matchPhone && !matchConsignment) return false;
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>{language === 'bn' ? 'কনফার্মড' : 'Confirmed'}</span>
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            <span>{language === 'bn' ? 'প্রসেসিং' : 'Processing'}</span>
          </span>
        );
      case 'packed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
            <Package className="w-3 h-3" />
            <span>{language === 'bn' ? 'প্যাকড' : 'Packed'}</span>
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            <Truck className="w-3 h-3" />
            <span>{language === 'bn' ? 'শিপড' : 'Shipped'}</span>
          </span>
        );
      case 'out_for_delivery':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/15 text-orange-300 border border-orange-500/30">
            <Truck className="w-3 h-3" />
            <span>{language === 'bn' ? 'অন দ্য ওয়ে' : 'Out For Delivery'}</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>{language === 'bn' ? 'ডেলিভার্ড' : 'Delivered'}</span>
          </span>
        );
      case 'received':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>{language === 'bn' ? 'রিসিভড' : 'Received'}</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <XCircle className="w-3 h-3" />
            <span>{language === 'bn' ? 'বাতিল' : 'Cancelled'}</span>
          </span>
        );
      case 'returned':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-500/20 text-slate-300 border border-slate-500/30">
            <RotateCcw className="w-3 h-3" />
            <span>{language === 'bn' ? 'রিটার্নড' : 'Returned'}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300">
            <span>{status}</span>
          </span>
        );
    }
  };

  const STATUS_TABS = [
    { key: 'all', labelBn: 'সকল অর্ডার', labelEn: 'All' },
    { key: 'confirmed', labelBn: 'কনফার্মড', labelEn: 'Confirmed' },
    { key: 'processing', labelBn: 'প্রসেসিং', labelEn: 'Processing' },
    { key: 'packed', labelBn: 'প্যাকড', labelEn: 'Packed' },
    { key: 'shipped', labelBn: 'শিপড', labelEn: 'Shipped' },
    { key: 'out_for_delivery', labelBn: 'অন দ্য ওয়ে', labelEn: 'Out for Delivery' },
    { key: 'delivered', labelBn: 'ডেলিভার্ড', labelEn: 'Delivered' },
    { key: 'received', labelBn: 'রিসিভড', labelEn: 'Received' },
    { key: 'cancelled', labelBn: 'বাতিল', labelEn: 'Cancelled' },
    { key: 'returned', labelBn: 'রিটার্নড', labelEn: 'Returned' },
  ];

  return (
    <div id="admin-orders-tab" className="space-y-4">
      {/* Top Controls: Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0c1424] p-3 sm:p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              language === 'bn'
                ? 'অর্ডার আইডি, ফোন, নাম বা কনসাইনমেন্ট...'
                : 'Search by Order ID, phone, name or consignment...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#090e1a] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 slim-scrollbar">
          {STATUS_TABS.map((tab) => {
            const count = tab.key === 'all' ? orders.length : orders.filter((o) => o.status === tab.key).length;
            const isSelected = filterStatus === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                    : 'bg-[#090e1a] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>{language === 'bn' ? tab.labelBn : tab.labelEn}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Listing */}
      <div className="space-y-3 sm:space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-[#0c1424] rounded-2xl border border-slate-800 p-6">
            <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-white mb-1">
              {language === 'bn' ? 'কোনো অর্ডার খুঁজে পাওয়া যায়নি' : 'No orders found'}
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {language === 'bn'
                ? 'নির্বাচিত ফিল্টার বা সার্চ অনুযায়ী কোনো অর্ডার পাওয়া যায়নি।'
                : 'No orders match your active filter criteria.'}
            </p>
          </div>
        ) : (
          filteredOrders.map((ord) => {
            const hasPathao = !!ord.pathaoConsignmentId;
            const isDispatchingThis = isDispatchingId === ord.id;
            const isTrackingThis = isTrackingId === ord.id;
            const isHistoryOpen = expandedHistoryId === ord.id;

            return (
              <div
                key={ord.id}
                className="bg-[#0c1424] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-md transition-all hover:border-slate-700/80"
              >
                {/* Header Strip: ID, Date, Badges, Status Controller */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-bold text-amber-300 text-sm">
                      #{ord.id}
                    </span>

                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{new Date(ord.createdAt).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}</span>
                    </span>

                    {/* Pathao Consignment Badge */}
                    {hasPathao && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                        <Truck className="w-3 h-3" />
                        <span>Pathao CID: {ord.pathaoConsignmentId}</span>
                      </span>
                    )}

                    {/* Pathao Courier Status */}
                    {ord.pathaoCourierStatus && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30 capitalize">
                        {ord.pathaoCourierStatus}
                      </span>
                    )}

                    {/* KHOROM Coins Reward Granted Badge */}
                    {ord.coinRewardGranted && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        <Coins className="w-3 h-3 text-amber-400" />
                        <span>+{ord.coinRewardAmount || 0} Coins Rewarded</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto flex-wrap">
                    {getStatusBadge(ord.status)}

                    {/* Full 9-Stage Status Dropdown Controller */}
                    <select
                      value={ord.status}
                      disabled={isUpdatingId === ord.id}
                      onChange={(e) => handleStatusSelect(ord.id, ord.status, e.target.value)}
                      className="px-2.5 py-1.5 bg-[#080d19] border border-slate-700/90 rounded-lg text-xs font-bold text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer min-h-[34px]"
                    >
                      <option value="confirmed">1. Confirmed (কনফার্মড)</option>
                      <option value="processing">2. Processing (প্রসেসিং)</option>
                      <option value="packed">3. Packed (প্যাকেজিং সম্পন্ন)</option>
                      <option value="shipped">4. Shipped (শিপড / কুরিয়ারে)</option>
                      <option value="out_for_delivery">5. Out for Delivery (অন দ্য ওয়ে)</option>
                      <option value="delivered">6. Delivered (পৌঁছেছে)</option>
                      <option value="received">7. Received (গ্রাহক হাতে পেয়েছেন - Coins Reward)</option>
                      <option value="cancelled">Cancelled (বাতিল - স্টক রিস্টোর)</option>
                      <option value="returned">Returned (ফেরত - স্টক রিস্টোর)</option>
                    </select>

                    {/* Pathao Quick Action Button */}
                    {hasPathao ? (
                      <button
                        type="button"
                        onClick={() => handlePathaoTrack(ord.id)}
                        disabled={isTrackingThis}
                        className="px-2.5 py-1.5 bg-[#080d19] hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        title="Sync Pathao Status"
                      >
                        <RefreshCw className={`w-3 h-3 ${isTrackingThis ? 'animate-spin' : ''}`} />
                        <span>{isTrackingThis ? '...' : (language === 'bn' ? 'ট্র্যাক' : 'Track')}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handlePathaoDispatch(ord.id)}
                        disabled={isDispatchingThis || ord.status === 'cancelled' || ord.status === 'returned'}
                        className="px-3 py-1.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <Send className={`w-3 h-3 ${isDispatchingThis ? 'animate-pulse' : ''}`} />
                        <span>{isDispatchingThis ? '...' : (language === 'bn' ? 'পাঠাও এ পাঠান' : 'Dispatch')}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Reason Banner if cancelled or returned */}
                {ord.status === 'cancelled' && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">অর্ডার বাতিল (স্টক রিস্টোর করা হয়েছে)</span>
                      {ord.cancellationReason && (
                        <p className="text-slate-300 text-[11px] mt-0.5">
                          কারণ: <span className="text-rose-200">{ord.cancellationReason}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {ord.status === 'returned' && (
                  <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-300 flex items-start gap-2">
                    <RotateCcw className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-300">পণ্য রিটার্ন (স্টক রিস্টোর করা হয়েছে)</span>
                      {ord.returnReason && (
                        <p className="text-slate-300 text-[11px] mt-0.5">
                          কারণ: <span className="text-white">{ord.returnReason}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Order Content Grid: Customer Info & Items */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-4">
                  {/* Customer Information Column */}
                  <div className="md:col-span-4 bg-[#080d19] p-3.5 rounded-xl border border-slate-800/90 space-y-2 text-xs">
                    <h5 className="font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                      <User className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'গ্রাহকের তথ্য' : 'Customer Info'}</span>
                    </h5>
                    <div>
                      <p className="font-bold text-white text-sm">{ord.customer.fullName}</p>
                      <p className="text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-amber-400" />
                        <a href={`tel:${ord.customer.phone}`} className="hover:underline">{ord.customer.phone}</a>
                      </p>
                      {ord.customer.email && (
                        <p className="text-slate-500 text-[11px] truncate mt-0.5">{ord.customer.email}</p>
                      )}
                    </div>
                    <div className="pt-1.5 border-t border-slate-800">
                      <p className="text-slate-300 flex items-start gap-1">
                        <MapPin className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{ord.customer.address}, {ord.customer.city}</span>
                      </p>
                      {ord.customer.notes && (
                        <p className="text-amber-400/90 text-[11px] italic mt-1 bg-amber-400/5 p-1.5 rounded border border-amber-400/10">
                          Note: {ord.customer.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Ordered Items Breakdown */}
                  <div className="md:col-span-8 space-y-2">
                    <div className="divide-y divide-slate-800/60 bg-[#080d19] rounded-xl border border-slate-800/90 p-3">
                      {ord.items.map((item, idx) => (
                        <div key={idx} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={item.product.image}
                              alt={item.product.titleEn}
                              className="w-10 h-10 rounded-lg object-cover bg-slate-900 shrink-0 border border-slate-800"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-white truncate">
                                {language === 'bn' ? item.product.titleBn : item.product.titleEn}
                              </p>
                              <div className="text-[10px] text-slate-400 flex items-center gap-2">
                                {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                                {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                                <span className="text-amber-400 font-semibold">Qty: {item.quantity}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-black text-amber-300">
                              {formatPrice(item.product.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Financial Summary */}
                    <div className="p-3 rounded-xl bg-[#080d19] border border-slate-800/90 text-xs space-y-2">
                      <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-1.5">
                        <div className="flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-slate-400 uppercase text-[10px] font-bold">
                            {ord.paymentMethod === 'cod' ? 'Cash On Delivery' : ord.paymentMethod}
                          </span>
                        </div>
                        <span className="text-sm font-black text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                          {language === 'bn' ? 'মোট:' : 'Total:'} {formatPrice(ord.total)}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400">
                        <div>
                          <span className="block text-slate-500">{language === 'bn' ? 'সাবটোটাল' : 'Subtotal'}</span>
                          <span className="font-semibold text-white">{formatPrice(ord.subtotal)}</span>
                        </div>
                        <div>
                          <span className="block text-slate-500">{language === 'bn' ? 'ছাড়' : 'Discount'}</span>
                          <span className={ord.discount > 0 ? 'font-semibold text-emerald-400' : 'text-slate-400'}>
                            {ord.discount > 0 ? `-${formatPrice(ord.discount)}` : '৳০'}
                          </span>
                        </div>
                        <div>
                          <span className="block text-slate-500">{language === 'bn' ? 'ডেলিভারি' : 'Shipping'}</span>
                          <span className="font-semibold text-white">{formatPrice(ord.shipping)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Audit Trail Accordion */}
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setExpandedHistoryId(isHistoryOpen ? null : ord.id)}
                      className="text-xs font-bold text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <History className="w-3.5 h-3.5 text-amber-400" />
                      <span>{language === 'bn' ? 'অডিট হিস্ট্রি ও ইভেন্ট লগ' : 'Audit Trail & Event History'}</span>
                      <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded-full text-slate-300">
                        {Array.isArray(ord.history) ? ord.history.length : 1}
                      </span>
                      {isHistoryOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPendingStatusChange({
                          orderId: ord.id,
                          currentStatus: ord.status,
                          targetStatus: ord.status,
                        });
                        setStatusReason('');
                        setStatusNote('');
                      }}
                      className="text-[11px] font-bold text-slate-400 hover:text-amber-400 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>{language === 'bn' ? 'নোট যুক্ত করুন' : 'Add Note'}</span>
                    </button>
                  </div>

                  {isHistoryOpen && (
                    <div className="mt-3 bg-[#080d19] p-3 rounded-xl border border-slate-800/90 space-y-2">
                      <div className="space-y-2 divide-y divide-slate-800/50">
                        {Array.isArray(ord.history) && ord.history.length > 0 ? (
                          ord.history.map((entry, eIdx) => (
                            <div key={eIdx} className="pt-2 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                              <div>
                                <span className="font-bold text-amber-300 capitalize">
                                  {entry.toStatus.replace('_', ' ')}
                                </span>
                                {entry.fromStatus && (
                                  <span className="text-slate-500 text-[11px] ml-1">
                                    (from {entry.fromStatus.replace('_', ' ')})
                                  </span>
                                )}
                                {entry.changedBy && (
                                  <span className="text-slate-400 text-[10px] ml-2 bg-slate-800 px-1.5 py-0.5 rounded">
                                    by {entry.changedBy}
                                  </span>
                                )}
                                {entry.note && (
                                  <p className="text-slate-300 text-[11px] mt-0.5 italic bg-slate-900/60 p-1 rounded">
                                    "{entry.note}"
                                  </p>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-500 whitespace-nowrap">
                                {new Date(entry.timestamp).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-[11px] text-slate-500">
                            {language === 'bn' ? 'কোনো পূর্ববর্তী ইভেন্ট নেই' : 'Initial confirmed event logged'}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Status Reason / Note Modal */}
      {pendingStatusChange && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c1424] border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                <span>
                  {pendingStatusChange.targetStatus === 'cancelled'
                    ? 'অর্ডার বাতিলের কারণ ও নোট'
                    : pendingStatusChange.targetStatus === 'returned'
                    ? 'পণ্য রিটার্নের কারণ ও নোট'
                    : 'অর্ডার স্ট্যাটাস নোট'}
                </span>
              </h4>
              <button
                type="button"
                onClick={() => setPendingStatusChange(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                অর্ডার: <span className="font-mono text-amber-300 font-bold">#{pendingStatusChange.orderId}</span>
              </p>

              {(pendingStatusChange.targetStatus === 'cancelled' || pendingStatusChange.targetStatus === 'returned') && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px]">
                  ✓ এই অ্যাকশনের মাধ্যমে সংশ্লিষ্ট সকল পণ্যের স্টক স্বয়ংক্রিয়ভাবে ইনভেন্টরিতে রিস্টোর করা হবে।
                </div>
              )}

              {(pendingStatusChange.targetStatus === 'cancelled' || pendingStatusChange.targetStatus === 'returned') && (
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    {pendingStatusChange.targetStatus === 'cancelled' ? 'বাতিলের কারণ' : 'রিটার্নের কারণ'}{' '}
                    <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      pendingStatusChange.targetStatus === 'cancelled'
                        ? 'যেমন: গ্রাহক অনুরোধ করেছেন / আউট অফ স্টক'
                        : 'যেমন: সাইজ ম্যাচ করেনি / ত্রুটিপূর্ণ পণ্য'
                    }
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    className="w-full px-3 py-2 bg-[#080d19] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  ইন্টারনাল অডিট নোট (ঐচ্ছিক)
                </label>
                <textarea
                  rows={3}
                  placeholder="অর্ডারের সাথে সংরক্ষণ করার জন্য কোনো মন্তব্য থাকলে লিখুন..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full px-3 py-2 bg-[#080d19] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setPendingStatusChange(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                disabled={
                  (pendingStatusChange.targetStatus === 'cancelled' || pendingStatusChange.targetStatus === 'returned') &&
                  !statusReason.trim()
                }
                onClick={() =>
                  executeStatusChange(
                    pendingStatusChange.orderId,
                    pendingStatusChange.targetStatus,
                    statusReason.trim(),
                    statusNote.trim()
                  )
                }
                className="px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-colors cursor-pointer disabled:opacity-50"
              >
                নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
