import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Package,
  X,
  Clock,
  Calendar,
  CheckCircle2,
  ShoppingBag,
  Truck,
  Star,
  XCircle,
  RotateCcw,
  History,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const OrderTrackingModal: React.FC = () => {
  const {
    isOrderTrackingOpen,
    setIsOrderTrackingOpen,
    orders,
    formatPrice,
    language,
    updateOrderStatus,
    setSelectedProduct,
  } = useStore();

  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);

  if (!isOrderTrackingOpen) return null;

  const handleMarkAsReceived = async (orderId: string) => {
    setUpdatingOrderId(orderId);
    await updateOrderStatus(orderId, 'received');
    setUpdatingOrderId(null);
  };

  const handleOpenReview = (itemProduct: any) => {
    setSelectedProduct(itemProduct);
    setIsOrderTrackingOpen(false);
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 text-[11px] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            <span>{language === 'bn' ? 'অর্ডার কনফার্মড' : 'Confirmed'}</span>
          </span>
        );
      case 'processing':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'bn' ? 'প্রসেসিং হচ্ছে' : 'Processing'}</span>
          </span>
        );
      case 'packed':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[11px] font-bold">
            <Package className="w-3.5 h-3.5 text-purple-400" />
            <span>{language === 'bn' ? 'প্যাকেজিং সম্পন্ন' : 'Packed'}</span>
          </span>
        );
      case 'shipped':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold">
            <Truck className="w-3.5 h-3.5 text-indigo-400" />
            <span>{language === 'bn' ? 'ডেলিভারিতে রয়েছে' : 'Shipped'}</span>
          </span>
        );
      case 'out_for_delivery':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/15 text-orange-300 border border-orange-500/30 text-[11px] font-bold">
            <Truck className="w-3.5 h-3.5 text-orange-400" />
            <span>{language === 'bn' ? 'ডেলিভারির জন্য বের হয়েছে' : 'Out For Delivery'}</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'bn' ? 'ডেলিভার্ড' : 'Delivered'}</span>
          </span>
        );
      case 'received':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[11px] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
            <span>{language === 'bn' ? 'পণ্য রিসিভড' : 'Received'}</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[11px] font-bold">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>{language === 'bn' ? 'বাতিল করা হয়েছে' : 'Cancelled'}</span>
          </span>
        );
      case 'returned':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-500/20 text-slate-300 border border-slate-500/30 text-[11px] font-bold">
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>{language === 'bn' ? 'ফেরত দেওয়া হয়েছে' : 'Returned'}</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-bold">
            {status}
          </span>
        );
    }
  };

  const TRACKING_STEPS = [
    { key: 'confirmed', labelBn: 'কনফার্মড', labelEn: 'Confirmed' },
    { key: 'processing', labelBn: 'প্রসেসিং', labelEn: 'Processing' },
    { key: 'packed', labelBn: 'প্যাকড', labelEn: 'Packed' },
    { key: 'shipped', labelBn: 'শিপড', labelEn: 'Shipped' },
    { key: 'out_for_delivery', labelBn: 'অন দ্য ওয়ে', labelEn: 'On the Way' },
    { key: 'delivered', labelBn: 'ডেলিভার্ড', labelEn: 'Delivered' },
    { key: 'received', labelBn: 'রিসিভড', labelEn: 'Received' },
  ];

  return (
    <div
      id="order-tracking-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={() => setIsOrderTrackingOpen(false)}
    >
      <div
        id="order-tracking-panel"
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0c1322] rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-amber-500/30 text-slate-100 animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#070b14]">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white font-serif">
              {language === 'bn' ? 'আমার অর্ডার হিস্ট্রি ও ট্র্যাকিং' : 'My Orders & Tracking'}
            </h2>
          </div>
          <button
            onClick={() => setIsOrderTrackingOpen(false)}
            className="w-8 h-8 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#080d19] text-amber-400/60 border border-slate-800 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-white">
                {language === 'bn' ? 'এখনও কোনো অর্ডার করেননি' : 'No orders placed yet'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {language === 'bn'
                  ? 'আপনার অর্ডারকৃত পণ্য ও ডেলিভারি স্ট্যাটাস দেখতে শপ থেকে অর্ডার সম্পন্ন করুন।'
                  : 'Complete an order to track its delivery and progress status here.'}
              </p>
            </div>
          ) : (
            orders.map((order) => {
              const isTerminalNegative = order.status === 'cancelled' || order.status === 'returned';
              const isHistoryOpen = expandedHistoryId === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-[#070b14] rounded-2xl p-4 border border-slate-800 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-amber-300 bg-amber-400/15 px-2 py-0.5 rounded border border-amber-400/30">
                        #{order.id}
                      </span>
                      {order.orderType === 'pre-order' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Pre-order
                        </span>
                      )}
                      <span className="text-xs text-slate-400 ml-1">
                        {new Date(order.createdAt).toLocaleDateString(
                          language === 'bn' ? 'bn-BD' : 'en-US',
                          { month: 'short', day: 'numeric', year: 'numeric' }
                        )}
                      </span>
                    </div>

                    <div>{renderStatusBadge(order.status)}</div>
                  </div>

                  {/* Terminal Notification Banner */}
                  {order.status === 'cancelled' && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 space-y-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <XCircle className="w-4 h-4 text-rose-400" />
                        <span>{language === 'bn' ? 'এই অর্ডারটি বাতিল করা হয়েছে' : 'This order has been cancelled'}</span>
                      </p>
                      {order.cancellationReason && (
                        <p className="text-slate-400 text-[11px]">
                          {language === 'bn' ? 'বাতিলের কারণ: ' : 'Reason: '}
                          <span className="text-slate-200">{order.cancellationReason}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {order.status === 'returned' && (
                    <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-slate-300 space-y-1">
                      <p className="font-bold flex items-center gap-1.5 text-amber-300">
                        <RotateCcw className="w-4 h-4 text-amber-400" />
                        <span>{language === 'bn' ? 'অর্ডারটি ফেরত দেওয়া হয়েছে' : 'This order was returned'}</span>
                      </p>
                      {order.returnReason && (
                        <p className="text-slate-400 text-[11px]">
                          {language === 'bn' ? 'ফেরতের কারণ: ' : 'Reason: '}
                          <span className="text-slate-200">{order.returnReason}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Visual Status Progress Steps for active orders */}
                  {!isTerminalNegative && (
                    <div className="py-2 px-1">
                      <div className="flex items-center justify-between relative">
                        {/* Connecting Line */}
                        <div className="absolute left-3 right-3 top-3 -translate-y-1/2 h-0.5 bg-slate-800 -z-0" />

                        {TRACKING_STEPS.map((step, stepIdx) => {
                          const orderLevels = TRACKING_STEPS.map((s) => s.key);
                          const currentLevel = orderLevels.indexOf(order.status);
                          const isCompleted = currentLevel >= stepIdx;
                          const isCurrent = currentLevel === stepIdx;

                          return (
                            <div key={step.key} className="flex flex-col items-center gap-1 z-10">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border transition-all ${
                                  isCurrent
                                    ? 'bg-amber-400 text-slate-950 border-amber-300 ring-4 ring-amber-400/20'
                                    : isCompleted
                                    ? 'bg-emerald-500 text-white border-emerald-400'
                                    : 'bg-slate-900 text-slate-500 border-slate-700'
                                }`}
                              >
                                {isCompleted && !isCurrent ? '✓' : stepIdx + 1}
                              </div>
                              <span
                                className={`text-[9px] sm:text-[10px] font-medium text-center ${
                                  isCurrent
                                    ? 'text-amber-400 font-bold'
                                    : isCompleted
                                    ? 'text-emerald-400'
                                    : 'text-slate-500'
                                }`}
                              >
                                {language === 'bn' ? step.labelBn : step.labelEn}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Items preview */}
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-300 truncate max-w-[240px]">
                            {language === 'bn' ? item.product.titleBn : item.product.titleEn} × {item.quantity}
                          </span>
                          {order.status === 'received' && (
                            <button
                              type="button"
                              onClick={() => handleOpenReview(item.product)}
                              className="px-2 py-0.5 rounded-md bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 font-bold text-[10px] flex items-center gap-1 border border-amber-400/30 transition-colors cursor-pointer"
                            >
                              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                              <span>{language === 'bn' ? 'রিভিউ দিন' : 'Review'}</span>
                            </button>
                          )}
                        </div>
                        <span className="font-semibold text-white">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Actions & Delivery status */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="text-slate-400 flex items-center gap-2">
                      <span>
                        <span>{language === 'bn' ? 'সম্ভাব্য ডেলিভারি:' : 'Est. Delivery:'}</span>{' '}
                        <span className="font-bold text-amber-300">{order.estimatedDelivery}</span>
                      </span>

                      {/* Audit History Toggle Button */}
                      {Array.isArray(order.history) && order.history.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setExpandedHistoryId(isHistoryOpen ? null : order.id)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-amber-400 transition-colors cursor-pointer ml-1"
                        >
                          <History className="w-3 h-3" />
                          <span>{language === 'bn' ? 'হিস্ট্রি' : 'History'}</span>
                          {isHistoryOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {order.status === 'delivered' && (
                        <button
                          type="button"
                          disabled={updatingOrderId === order.id}
                          onClick={() => handleMarkAsReceived(order.id)}
                          className="px-3 py-1 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                          <span>
                            {updatingOrderId === order.id
                              ? language === 'bn'
                                ? 'আপডেট হচ্ছে...'
                                : 'Updating...'
                              : language === 'bn'
                              ? 'আমি পণ্য পেয়েছি (Mark Received)'
                              : 'Mark as Received'}
                          </span>
                        </button>
                      )}

                      <div className="flex items-center gap-3">
                        {order.coinsUsed && order.coinsUsed > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">
                            🪙 {order.coinsUsed} কয়েন ছাড়
                          </span>
                        )}
                        {order.coinsEarned && order.coinsEarned > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            🪙 +{order.coinsEarned} কয়েন অর্জিত
                          </span>
                        )}
                        <div className="font-black text-white">
                          <span>{language === 'bn' ? 'মোট:' : 'Total:'} </span>
                          <span className="text-amber-300 text-sm">{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Event History / Audit Trail Log */}
                  {isHistoryOpen && Array.isArray(order.history) && order.history.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 bg-[#080d19] p-3 rounded-xl space-y-2">
                      <h6 className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                        <History className="w-3.5 h-3.5 text-amber-400" />
                        <span>{language === 'bn' ? 'অর্ডার স্ট্যাটাস লগ' : 'Status Audit Trail'}</span>
                      </h6>
                      <div className="space-y-1.5">
                        {order.history.map((h, hIdx) => (
                          <div
                            key={hIdx}
                            className="flex items-start justify-between gap-2 text-[11px] border-b border-slate-800/50 pb-1.5 last:border-0 last:pb-0"
                          >
                            <div>
                              <span className="font-bold text-amber-300 capitalize">{h.toStatus.replace('_', ' ')}</span>
                              {h.note && <p className="text-slate-400 italic text-[10px] mt-0.5">{h.note}</p>}
                            </div>
                            <span className="text-slate-500 text-[10px] shrink-0">
                              {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                              {new Date(h.timestamp).toLocaleDateString([], { month: 'numeric', day: 'numeric' })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
