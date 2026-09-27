import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  CheckCircle2,
  Package,
  Calendar,
  MapPin,
  Printer,
  ShoppingBag,
  Clock,
  Truck,
  CreditCard,
  X
} from 'lucide-react';

export const OrderConfirmationModal: React.FC = () => {
  const {
    lastCompletedOrder,
    setLastCompletedOrder,
    formatPrice,
    language,
    setIsOrderTrackingOpen,
  } = useStore();

  if (!lastCompletedOrder) return null;

  const handlePrint = () => {
    window.print();
  };

  const getPaymentName = (method: string) => {
    switch (method) {
      case 'bkash':
        return 'বিকাশ (bKash)';
      case 'nagad':
        return 'নগদ (Nagad)';
      case 'card':
        return 'কার্ড (Card)';
      default:
        return language === 'bn' ? 'ক্যাশ অন ডেলিভারি (COD)' : 'Cash On Delivery (COD)';
    }
  };

  return (
    <div
      id="order-confirmation-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div
        id="order-confirmation-card"
        className="bg-[#0c1322] rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-amber-500/30 text-slate-100 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top Celebration Bar */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 p-6 sm:p-8 text-center relative">
          <button
            id="close-confirmation-btn"
            onClick={() => setLastCompletedOrder(null)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 text-slate-950 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-black/10 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle2 className="w-10 h-10 text-slate-950" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black font-serif">
            {language === 'bn' ? 'অর্ডার সফলভাবে সম্পন্ন হয়েছে!' : 'Order Placed Successfully!'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-900 font-medium mt-1 max-w-md mx-auto">
            {language === 'bn'
              ? 'ধন্যবাদ! আপনার অর্ডারটি গ্রহণ করা হয়েছে এবং খুব শীঘ্রই খরম ডেলিভারি টিম প্রস্তুত করবে।'
              : 'Thank you! Your order has been placed and is currently being processed by Khorom.'}
          </p>

          <div className="mt-4 inline-flex items-center gap-2 bg-black/20 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider text-slate-950 border border-black/10">
            <span>{language === 'bn' ? 'অর্ডার নং:' : 'Order ID:'}</span>
            <span className="font-extrabold">{lastCompletedOrder.id}</span>
          </div>
        </div>

        {/* Order Details Body */}
        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
          {/* Status Timeline */}
          <div className="bg-[#070b14] p-4 rounded-2xl border border-slate-800">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-3">
              {language === 'bn' ? 'ডেলিভারি স্ট্যাটাস' : 'Delivery Progress'}
            </h4>
            <div className="grid grid-cols-4 gap-2 text-center text-[10px] sm:text-xs">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center justify-center animate-pulse shadow-md shadow-amber-500/10">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-amber-300 mt-1">
                  {language === 'bn' ? 'প্রসেসিং' : 'Processing'}
                </span>
                <span className="text-[9px] text-slate-400">
                  {language === 'bn' ? '(গৃহীত হয়েছে)' : '(Received)'}
                </span>
              </div>
              <div className="flex flex-col items-center opacity-60">
                <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-slate-300 mt-1">
                  {language === 'bn' ? 'কনফার্মড' : 'Confirmed'}
                </span>
                <span className="text-[9px] text-slate-500">
                  {language === 'bn' ? '(অ্যাডমিন যাচাই)' : '(Pending review)'}
                </span>
              </div>
              <div className="flex flex-col items-center opacity-40">
                <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center">
                  <Truck className="w-3.5 h-3.5" />
                </div>
                <span className="text-slate-400 mt-1">
                  {language === 'bn' ? 'শিপড' : 'Shipped'}
                </span>
              </div>
              <div className="flex flex-col items-center opacity-40">
                <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center">
                  <Package className="w-3.5 h-3.5" />
                </div>
                <span className="text-slate-400 mt-1">
                  {language === 'bn' ? 'ডেলিভার্ড' : 'Delivered'}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery & Payment Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-[#070b14] rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                {language === 'bn' ? 'ডেলিভারি ঠিকানা' : 'Shipping Address'}
              </span>
              <p className="font-bold text-white">{lastCompletedOrder.customer.fullName}</p>
              <p className="text-slate-300">{lastCompletedOrder.customer.phone}</p>
              <p className="text-slate-400">{lastCompletedOrder.customer.address}, {lastCompletedOrder.customer.city}</p>
            </div>

            <div className="p-3.5 bg-[#070b14] rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                {language === 'bn' ? 'পেমেন্ট ও সময়' : 'Payment & Estimated Time'}
              </span>
              <p className="text-slate-300">
                <span className="font-semibold text-slate-400">{language === 'bn' ? 'পেমেন্ট:' : 'Method:'}</span>{' '}
                {getPaymentName(lastCompletedOrder.paymentMethod)}
              </p>
              <p className="text-slate-300">
                <span className="font-semibold text-slate-400">{language === 'bn' ? 'সম্ভাব্য ডেলিভারি:' : 'Est. Delivery:'}</span>{' '}
                <span className="font-bold text-amber-300">{lastCompletedOrder.estimatedDelivery}</span>
              </p>
            </div>
          </div>

          {/* Itemized Invoice Table */}
          <div>
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
              {language === 'bn' ? 'অর্ডারকৃত পণ্যের তালিকা' : 'Order Items'}
            </h4>
            <div className="border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800">
              {lastCompletedOrder.items.map((item, index) => (
                <div key={index} className="p-3 flex items-center justify-between text-xs bg-[#070b14]">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={item.product.image}
                      alt="Thumbnail"
                      className="w-10 h-10 rounded-lg object-cover bg-slate-900 border border-slate-800"
                    />
                    <div>
                      <p className="font-bold text-white">
                        {language === 'bn' ? item.product.titleBn : item.product.titleEn}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {formatPrice(item.product.price)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-black text-amber-300">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total Math */}
            <div className="p-3.5 bg-[#070b14] rounded-xl border border-slate-800 mt-3 space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>{language === 'bn' ? 'সাবটোটাল' : 'Subtotal'}</span>
                <span>{formatPrice(lastCompletedOrder.subtotal)}</span>
              </div>
              {lastCompletedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>{language === 'bn' ? 'ছাড়' : 'Discount'}</span>
                  <span>-{formatPrice(lastCompletedOrder.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>{language === 'bn' ? 'ডেলিভারি চার্জ' : 'Shipping'}</span>
                <span>
                  {lastCompletedOrder.shipping === 0
                    ? language === 'bn'
                      ? 'ফ্রি'
                      : 'FREE'
                    : formatPrice(lastCompletedOrder.shipping)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between font-black text-sm text-white">
                <span>{language === 'bn' ? 'সর্বমোট প্রদেয় বিল' : 'Total Paid / Payable'}</span>
                <span className="text-amber-300 font-black">{formatPrice(lastCompletedOrder.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-5 border-t border-slate-800 bg-[#070b14] flex flex-wrap gap-3 justify-end">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'রিসিপ্ট প্রিন্ট করুন' : 'Print Invoice'}</span>
          </button>

          <button
            id="finish-order-btn"
            onClick={() => setLastCompletedOrder(null)}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-black transition-colors cursor-pointer shadow-md"
          >
            {language === 'bn' ? 'আরও কেনাকাটা করুন' : 'Continue Shopping'}
          </button>
        </div>
      </div>
    </div>
  );
};
