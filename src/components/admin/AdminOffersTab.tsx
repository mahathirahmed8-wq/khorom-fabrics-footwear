import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { KhoromOffer, OfferStatus } from '../../types';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  Copy,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Coins,
  Truck,
  Percent,
  TrendingUp,
  Flame,
  Power,
  Sliders,
} from 'lucide-react';

export const AdminOffersTab: React.FC = () => {
  const {
    offers,
    createOffer,
    updateOffer,
    deleteOffer,
    duplicateOffer,
    toggleOfferStatus,
    offersStats,
    fetchOffersStats,
    categories,
    products,
    language,
    formatPrice,
  } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<KhoromOffer>>({
    name: '',
    description: '',
    badgeText: 'SPECIAL',
    type: 'discount',
    discountType: 'percent',
    discountValue: 10,
    maxDiscount: 500,
    minPurchase: 1000,
    bonusCoinsMultiplier: 1,
    bonusCoinsFlat: 0,
    freeShipping: false,
    startDate: '',
    endDate: '',
    allowCoupon: false,
    allowCoins: true,
    status: 'active',
    priority: 10,
  });

  const resetForm = () => {
    setEditingOfferId(null);
    setFormData({
      name: '',
      description: '',
      badgeText: 'SPECIAL',
      type: 'discount',
      discountType: 'percent',
      discountValue: 10,
      maxDiscount: 500,
      minPurchase: 1000,
      bonusCoinsMultiplier: 1,
      bonusCoinsFlat: 0,
      freeShipping: false,
      startDate: '',
      endDate: '',
      allowCoupon: false,
      allowCoins: true,
      status: 'active',
      priority: 10,
    });
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (offer: KhoromOffer) => {
    setEditingOfferId(offer.id);
    setFormData({ ...offer });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    if (editingOfferId) {
      await updateOffer(editingOfferId, formData);
    } else {
      await createOffer(formData);
    }
    setIsModalOpen(false);
    resetForm();
  };

  // Stats
  const activeCount = offers.filter((o) => o.status === 'active').length;
  const totalDiscountsGiven = offers.reduce((sum, o) => sum + (o.totalDiscountGiven || 0), 0);
  const totalUses = offers.reduce((sum, o) => sum + (o.usageCount || 0), 0);

  return (
    <div id="admin-offers-tab" className="space-y-4 sm:space-y-5">
      {/* Top Banner & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-[#0c1424] border border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-md">
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">
              {language === 'bn' ? 'সক্রিয় অফার' : 'Active Offers'}
            </div>
            <div className="text-2xl font-black text-white">{activeCount}</div>
          </div>
        </div>

        <div className="bg-[#0c1424] border border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-md">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">
              {language === 'bn' ? 'মোট অফার ব্যবহার' : 'Total Redemptions'}
            </div>
            <div className="text-2xl font-black text-white">{totalUses}</div>
          </div>
        </div>

        <div className="bg-[#0c1424] border border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-md">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">
              {language === 'bn' ? 'মোট ছাড় দেওয়া হয়েছে' : 'Total Discount Disbursed'}
            </div>
            <div className="text-2xl font-black text-emerald-400">৳{totalDiscountsGiven.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-[#0c1424] to-[#0f172a] p-3.5 sm:p-4 rounded-2xl border border-amber-500/20 shadow-lg">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white font-serif flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            {language === 'bn' ? 'অফার সেন্টার ম্যানেজমেন্ট' : 'Dynamic Offers Center'}
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
            {language === 'bn'
              ? 'এখানে তৈরি সব অফার স্বয়ংক্রিয়ভাবে ওয়েবসাইটের অফার সেন্টারে ও কার্টে দেখাবে।'
              : 'All active offers dynamically appear in the customer storefront and cart.'}
          </p>
        </div>

        <button
          id="btn-create-offer"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'bn' ? 'নতুন অফার তৈরি করুন' : 'Create New Offer'}</span>
        </button>
      </div>

      {/* Offer Cards / List */}
      {offers.length === 0 ? (
        <div className="bg-[#0c1424] border border-dashed border-slate-800 p-8 sm:p-12 rounded-2xl text-center text-slate-400 shadow-md">
          <Tag className="w-12 h-12 mx-auto mb-3 text-slate-600 opacity-40" />
          <p className="text-sm font-medium text-white">
            {language === 'bn' ? 'বর্তমানে কোনো অফার যোগ করা হয়নি।' : 'No offers created yet.'}
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-3 px-4 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl transition cursor-pointer"
          >
            {language === 'bn' ? 'প্রথম অফার তৈরি করুন' : 'Create First Offer'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {offers.map((offer) => {
            const isActive = offer.status === 'active';
            const isPaused = offer.status === 'paused';
            return (
              <div
                key={offer.id}
                id={`offer-card-${offer.id}`}
                className={`p-4 sm:p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between shadow-md ${
                  isActive
                    ? 'bg-[#0c1424] border-slate-800 hover:border-slate-700/80'
                    : 'bg-[#080d19] border-slate-900 opacity-75'
                }`}
              >
                {/* Status bar */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 text-[10px] sm:text-[11px] font-black rounded-md bg-amber-400 text-slate-950">
                      {offer.badgeText || 'SPECIAL'}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isPaused
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {offer.status.toUpperCase()}
                    </span>
                    {offer.allowCoins && (
                      <span className="px-2 py-0.5 text-[10px] rounded-md bg-sky-500/15 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                        <Coins className="w-3 h-3" /> +Coins
                      </span>
                    )}
                    {offer.allowCoupon && (
                      <span className="px-2 py-0.5 text-[10px] rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                        <Tag className="w-3 h-3" /> +Coupon
                      </span>
                    )}
                  </div>

                  {/* Toggle button */}
                  <button
                    onClick={() => toggleOfferStatus(offer.id, isActive ? 'paused' : 'active')}
                    title={isActive ? 'Pause offer' : 'Activate offer'}
                    className={`p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-xs font-bold transition cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </div>

                {/* Offer Details */}
                <div className="mb-4">
                  <h4 className="text-sm sm:text-base font-bold text-white mb-1">{offer.name}</h4>
                  {offer.description && (
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">{offer.description}</p>
                  )}

                  <div className="p-3 bg-[#080d19] rounded-xl border border-slate-800/90 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500">{language === 'bn' ? 'ছাড়ের পরিমাণ:' : 'Benefit:'}</span>
                      <span className="font-bold text-amber-300">
                        {offer.discountType === 'percent'
                          ? `${offer.discountValue}% ${language === 'bn' ? 'ছাড়' : 'Off'} (সর্বোচ্চ ৳${offer.maxDiscount || 'আনলিমিটেড'})`
                          : `৳${offer.discountValue} ${language === 'bn' ? 'ফ্ল্যাট ছাড়' : 'Flat Off'}`}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500">{language === 'bn' ? 'সর্বনিম্ন ক্রয়:' : 'Min Purchase:'}</span>
                      <span className="font-semibold text-white">৳{offer.minPurchase.toLocaleString()}</span>
                    </div>

                    {offer.type === 'bonus_coins' && (
                      <div className="flex justify-between text-slate-300">
                        <span className="text-slate-500">{language === 'bn' ? 'বোনাস কয়েন:' : 'Bonus Coins:'}</span>
                        <span className="font-semibold text-sky-400">
                          {offer.bonusCoinsMultiplier && offer.bonusCoinsMultiplier > 1
                            ? `${offer.bonusCoinsMultiplier}x কয়েন গুণক`
                            : `+${offer.bonusCoinsFlat} ফ্ল্যাট কয়েন`}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-800/80">
                      <span>{language === 'bn' ? 'ব্যবহার সংখ্যা:' : 'Redeemed:'}</span>
                      <span className="text-white font-medium">{offer.usageCount || 0} বার</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-slate-800/80">
                  <button
                    onClick={() => duplicateOffer(offer.id)}
                    className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                    title="Duplicate offer"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(offer)}
                    className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl bg-slate-800/90 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 transition cursor-pointer"
                    title="Edit offer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(language === 'bn' ? 'আপনি কি নিশ্চিত এই অফারটি মুছে ফেলতে চান?' : 'Delete this offer?')) {
                        deleteOffer(offer.id);
                      }
                    }}
                    className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition cursor-pointer"
                    title="Delete offer"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
          <div
            className="bg-[#0e172a] border border-amber-500/30 rounded-3xl w-full max-w-xl p-6 text-slate-200 shadow-2xl my-auto animate-in zoom-in-95 max-h-[90vh] overflow-y-auto slim-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              {editingOfferId
                ? language === 'bn'
                  ? 'অফার সম্পাদনা করুন'
                  : 'Edit Offer'
                : language === 'bn'
                ? 'নতুন অফার তৈরি করুন'
                : 'Create New Offer'}
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              {language === 'bn'
                ? 'অফারের বিবরণ, ডিসকাউন্ট শর্ত ও কয়েন সমন্বয়ের নিয়ম নির্ধারণ করুন।'
                : 'Configure discount value, minimum order value, stacking limits, and timeline.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'bn' ? 'অফারের নাম *' : 'Offer Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={language === 'bn' ? 'যেমন: ঈদ স্পেশাল ১৫% ডিসকাউন্ট' : 'e.g. Eid Super Savings 15%'}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'bn' ? 'বর্ণনা (Description)' : 'Description'}
                </label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={language === 'bn' ? 'অফারের বিশেষ সুবিধা বা শর্তসমূহ...' : 'Key benefits or conditions...'}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {language === 'bn' ? 'ব্যাজ টেক্সট' : 'Badge Tag'}
                  </label>
                  <input
                    type="text"
                    value={formData.badgeText || ''}
                    onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                    placeholder="HOT / LIMITED / EID"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {language === 'bn' ? 'অফার ধরন' : 'Offer Type'}
                  </label>
                  <select
                    value={formData.type || 'discount'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="discount">সরাসরি ডিসকাউন্ট (Price Discount)</option>
                    <option value="hot_deal">🔥 হট ডিলস (Hot Deals)</option>
                    <option value="limited_time">⏳ লিমিটেড টাইম অফার (Limited Time)</option>
                    <option value="best_discount">🏷️ সেরা ছাড় (Best Discount)</option>
                    <option value="buy_more_save_more">📦 বেশি কিনলে বেশি ছাড় (Buy More Save More)</option>
                    <option value="bonus_coins">🪙 বোনাস কয়েন অফার (Bonus Coins)</option>
                    <option value="free_shipping">🚚 ফ্রি ডেলিভারি অফার (Free Shipping)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {language === 'bn' ? 'ডিসকাউন্ট টাইপ' : 'Discount Type'}
                  </label>
                  <select
                    value={formData.discountType || 'percent'}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="percent">শতাংশ (%)</option>
                    <option value="fixed">ফিক্সড টাকা (৳)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {language === 'bn' ? 'ছাড়ের পরিমাণ' : 'Discount Value'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.discountValue ?? 0}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {language === 'bn' ? 'সর্বোচ্চ ছাড় (৳)' : 'Max Discount (৳)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxDiscount ?? ''}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) || undefined })}
                    placeholder="Unlimited"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {language === 'bn' ? 'সর্বনিম্ন অর্ডার মূল্য (৳)' : 'Min Purchase (৳)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minPurchase ?? 0}
                    onChange={(e) => setFormData({ ...formData, minPurchase: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {language === 'bn' ? 'বোনাস কয়েন গুণক' : 'Bonus Coin Multiplier'}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={formData.bonusCoinsMultiplier ?? 1}
                    onChange={(e) => setFormData({ ...formData, bonusCoinsMultiplier: Number(e.target.value) })}
                    placeholder="e.g. 2 for 2X coins"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Stacking Toggles */}
              <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2.5">
                <div className="text-xs font-bold text-amber-300">
                  {language === 'bn' ? 'অন্যান্য ডিসকাউন্টের সাথে সমন্বয় (Stacking Rules)' : 'Stacking Rules'}
                </div>

                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowCoupon || false}
                    onChange={(e) => setFormData({ ...formData, allowCoupon: e.target.checked })}
                    className="rounded border-slate-700 text-amber-400 focus:ring-0 cursor-pointer"
                  />
                  <span>
                    {language === 'bn'
                      ? 'কুপন কোড ব্যবহারের অনুমতি দিন (Allow Coupon Stacking)'
                      : 'Allow stacking with coupon codes'}
                  </span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowCoins ?? true}
                    onChange={(e) => setFormData({ ...formData, allowCoins: e.target.checked })}
                    className="rounded border-slate-700 text-amber-400 focus:ring-0 cursor-pointer"
                  />
                  <span>
                    {language === 'bn'
                      ? 'খড়ম কয়েন রিডেম্পশনের অনুমতি দিন (Allow Khorom Coins)'
                      : 'Allow stacking with Khorom Coins'}
                  </span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.freeShipping ?? false}
                    onChange={(e) => setFormData({ ...formData, freeShipping: e.target.checked })}
                    className="rounded border-slate-700 text-amber-400 focus:ring-0 cursor-pointer"
                  />
                  <span>
                    {language === 'bn'
                      ? 'ফ্রি হোম ডেলিভারি অন্তর্ভুক্ত করুন (Free Delivery Included)'
                      : 'Include Free Home Delivery'}
                  </span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md transition cursor-pointer"
                >
                  {editingOfferId
                    ? language === 'bn'
                      ? 'আপডেট করুন'
                      : 'Save Changes'
                    : language === 'bn'
                    ? 'অফার সংরক্ষণ করুন'
                    : 'Save Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
