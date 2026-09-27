import React, { useState } from 'react';
import { PromoCode } from '../../types';
import { useStore } from '../../context/StoreContext';
import {
  Ticket,
  Plus,
  Trash2,
  Sparkles,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Percent,
  DollarSign
} from 'lucide-react';

export const AdminCouponsTab: React.FC = () => {
  const { promoCodes, addPromoCode, deletePromoCode, language, formatPrice, showToast } = useStore();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'flat'>('percent');
  const [discountValue, setDiscountValue] = useState<number>(15);
  const [minSpend, setMinSpend] = useState<number>(1500);
  const [expiryDate, setExpiryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [usageLimit, setUsageLimit] = useState<number>(50);
  const [descBn, setDescBn] = useState('');
  const [descEn, setDescEn] = useState('');

  const handleGenerateRandomCode = () => {
    const prefixes = ['KHOROM', 'GENTS', 'EID', 'ROYAL', 'BESPOKE', 'OFFER'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(10 + Math.random() * 89);
    const genCode = `${prefix}${num}`;
    setCode(genCode);
    setDescBn(`${genCode} কোডে বিশেষ ছাড় উপভোগ করুন`);
    setDescEn(`Enjoy special savings with code ${genCode}`);
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      showToast(language === 'bn' ? 'কুপন কোড লিখুন' : 'Please enter coupon code');
      return;
    }

    const cleanCode = code.trim().toUpperCase();

    const newCoupon: PromoCode = {
      code: cleanCode,
      discountPercent: discountType === 'percent' ? Number(discountValue) : undefined,
      discountAmount: discountType === 'flat' ? Number(discountValue) : undefined,
      minSpend: Number(minSpend) || 0,
      expiryDate,
      usageLimit: Number(usageLimit) || 100,
      timesUsed: 0,
      isActive: true,
      descriptionBn: descBn || `${cleanCode} ব্যবহারে বিশেষ ক্যাশব্যাক বা ছাড়`,
      descriptionEn: descEn || `Special savings with ${cleanCode}`,
    };

    await addPromoCode(newCoupon);
    setIsAddOpen(false);

    // Reset Form
    setCode('');
    setDiscountValue(15);
    setMinSpend(1500);
    setDescBn('');
    setDescEn('');
  };

  return (
    <div className="space-y-5">
      {/* Header with Server Validation info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-[#0c1424] to-[#0f172a] border border-amber-500/20 p-3.5 sm:p-4 rounded-2xl shadow-lg">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white font-serif flex items-center gap-2">
            <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            <span>{language === 'bn' ? 'সার্ভার ভ্যালিডেটেড কুপন কোড সিস্টেম' : 'Server-Validated Coupons'}</span>
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
            {language === 'bn'
              ? 'এখানে সংরক্ষিত ভ্যালিড কুপন ছাড়া কাস্টমার চেকআউটে কোনো ভুল বা ভুয়া কোড ব্যবহার করতে পারবে না।'
              : 'Every coupon is strictly validated by database server for expiry, min spend, and usage limits.'}
          </p>
        </div>

        <button
          id="admin-add-coupon-btn"
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'bn' ? 'নতুন কুপন তৈরি করুন' : 'Create Coupon'}</span>
        </button>
      </div>

      {/* Server Validation Guarantee Badge */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 px-3.5 sm:px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="text-[11px] sm:text-xs">
          {language === 'bn'
            ? 'সার্ভার-সাইড ভ্যালিডেশন চালু রয়েছে: কুপনের মেয়াদ, মোট ব্যবহারের সীমা (Usage Limit) এবং ন্যূনতম অর্ডারের পরিমাণ সরাসরি ডাটাবেজ থেকে যাচাই করা হয়।'
            : 'Server-side validation active: Expiry dates, usage limits, and minimum cart subtotals are verified against backend records.'}
        </span>
      </div>

      {/* Coupons Table */}
      <div className="bg-[#0c1424] rounded-2xl border border-slate-800 shadow-lg overflow-hidden">
        <div className="p-3.5 sm:p-4 border-b border-slate-800 flex items-center justify-between">
          <h4 className="text-xs sm:text-sm font-bold text-white font-serif">
            {language === 'bn' ? 'সক্রিয় কুপন তালিকা' : 'Active Coupons Inventory'}
          </h4>
          <span className="text-xs font-bold text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/25">
            {promoCodes.length} {language === 'bn' ? 'টি কুপন সক্রিয়' : 'Coupons'}
          </span>
        </div>

        {/* Mobile Coupon Cards (Visible on mobile < sm) */}
        <div className="sm:hidden p-3 space-y-3">
          {promoCodes.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              {language === 'bn' ? 'কোনো কুপন তৈরি করা হয়নি' : 'No coupons exist in database.'}
            </div>
          ) : (
            promoCodes.map((coupon) => {
              const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
              const isLimitReached = coupon.usageLimit && (coupon.timesUsed || 0) >= coupon.usageLimit;

              return (
                <div
                  key={`mobile-coupon-${coupon.code}`}
                  className="bg-[#080d19] rounded-xl border border-slate-800/90 p-3 space-y-2.5 shadow-sm hover:border-slate-700/80 transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-black text-amber-300 px-2 py-0.5 bg-amber-400/10 rounded-lg border border-amber-400/20 text-xs">
                      {coupon.code}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isExpired || isLimitReached
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {isExpired
                        ? (language === 'bn' ? 'মেয়াদোত্তীর্ণ' : 'Expired')
                        : isLimitReached
                        ? (language === 'bn' ? 'সীমা পূর্ণ' : 'Limit Reached')
                        : (language === 'bn' ? 'সক্রিয়' : 'Active')}
                    </span>
                  </div>

                  {(coupon.descriptionBn || coupon.descriptionEn) && (
                    <p className="text-[11px] text-slate-400">
                      {language === 'bn' ? coupon.descriptionBn : coupon.descriptionEn}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1.5 border-t border-slate-800/80">
                    <div>
                      <span className="block text-slate-500">{language === 'bn' ? 'ছাড়' : 'Discount'}</span>
                      <span className="font-bold text-emerald-400">
                        {coupon.discountPercent
                          ? `${coupon.discountPercent}% OFF`
                          : formatPrice(coupon.discountAmount || 0) + ' OFF'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-500">{language === 'bn' ? 'ন্যূনতম অর্ডার' : 'Min Spend'}</span>
                      <span className="font-semibold text-slate-300">{formatPrice(coupon.minSpend)}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">{language === 'bn' ? 'মেয়াদ' : 'Expiry'}</span>
                      <span className={isExpired ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                        {coupon.expiryDate || 'Unlimited'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-500">{language === 'bn' ? 'ব্যবহার' : 'Usage'}</span>
                      <span className="text-white font-bold">
                        {coupon.timesUsed || 0}
                        <span className="text-slate-500 font-normal">
                          {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ' (Unl)'}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex justify-end">
                    <button
                      onClick={() => deletePromoCode(coupon.code)}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-bold text-xs cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>{language === 'bn' ? 'কুপন মুছুন' : 'Delete Coupon'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table (sm and above) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070b14] text-slate-300 font-bold border-b border-slate-800">
              <tr>
                <th className="p-3.5">{language === 'bn' ? 'কুপন কোড' : 'Code'}</th>
                <th className="p-3.5">{language === 'bn' ? 'ছাড়ের পরিমাণ' : 'Discount'}</th>
                <th className="p-3.5">{language === 'bn' ? 'ন্যূনতম কেনাকাটা' : 'Min Spend'}</th>
                <th className="p-3.5">{language === 'bn' ? 'মেয়াদ' : 'Expiry'}</th>
                <th className="p-3.5">{language === 'bn' ? 'ব্যবহার সংখ্যা' : 'Usage / Limit'}</th>
                <th className="p-3.5">{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
                <th className="p-3.5 text-right">{language === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {promoCodes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    {language === 'bn' ? 'কোনো কুপন তৈরি করা হয়নি' : 'No coupons exist in database.'}
                  </td>
                </tr>
              ) : (
                promoCodes.map((coupon) => {
                  const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
                  const isLimitReached = coupon.usageLimit && (coupon.timesUsed || 0) >= coupon.usageLimit;

                  return (
                    <tr key={coupon.code} className="hover:bg-[#090e1a] transition-colors">
                      <td className="p-3.5">
                        <span className="font-mono font-black text-amber-300 px-2.5 py-1 bg-amber-400/10 rounded-lg border border-amber-400/20">
                          {coupon.code}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {language === 'bn' ? coupon.descriptionBn : coupon.descriptionEn}
                        </div>
                      </td>
                      <td className="p-3.5 font-black text-emerald-400">
                        {coupon.discountPercent
                          ? `${coupon.discountPercent}% OFF`
                          : formatPrice(coupon.discountAmount || 0) + ' OFF'}
                      </td>
                      <td className="p-3.5 font-medium text-slate-300">
                        {formatPrice(coupon.minSpend)}
                      </td>
                      <td className="p-3.5 text-slate-400">
                        <span className={`inline-flex items-center gap-1 ${isExpired ? 'text-rose-400 font-bold' : ''}`}>
                          <Calendar className="w-3 h-3" />
                          <span>{coupon.expiryDate || 'Unlimited'}</span>
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-white">
                          {coupon.timesUsed || 0}
                        </span>
                        <span className="text-slate-500">
                          {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ' (Unlimited)'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isExpired || isLimitReached
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {isExpired
                            ? (language === 'bn' ? 'মেয়াদোত্তীর্ণ' : 'Expired')
                            : isLimitReached
                            ? (language === 'bn' ? 'সীমা পূর্ণ' : 'Limit Reached')
                            : (language === 'bn' ? 'সক্রিয় ও বৈধ' : 'Active & Valid')}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => deletePromoCode(coupon.code)}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-bold text-[11px] cursor-pointer inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          <span>{language === 'bn' ? 'মুছুন' : 'Delete'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Coupon Modal */}
      {isAddOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={() => setIsAddOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0c1322] rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-amber-500/30 text-slate-100 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#070b14]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
                  <Ticket className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white font-serif">
                  {language === 'bn' ? 'নতুন কুপন কোড তৈরি করুন' : 'Create New Coupon'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-slate-800 text-slate-400 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-300">{language === 'bn' ? 'কুপন কোড' : 'Coupon Code'}</label>
                  <button
                    type="button"
                    onClick={handleGenerateRandomCode}
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{language === 'bn' ? 'কুপন তৈরি করুন (Generate)' : 'Generate Code'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. KHOROM20"
                  className="w-full px-3 py-2 bg-[#090e1a] border border-slate-700 rounded-xl text-white font-mono font-bold uppercase focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">{language === 'bn' ? 'ছাড়ের ধরন' : 'Discount Type'}</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#090e1a] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat Amount (৳)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-amber-300">
                    {discountType === 'percent'
                      ? (language === 'bn' ? 'ছাড়ের হার (%)' : 'Percent (%)')
                      : (language === 'bn' ? 'ছাড়ের টাকা (৳)' : 'Amount (৳)')}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={discountType === 'percent' ? 99 : 10000}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#090e1a] border border-slate-700 rounded-xl text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">{language === 'bn' ? 'ন্যূনতম কেনাকাটা (৳)' : 'Min Spend (৳)'}</label>
                  <input
                    type="number"
                    value={minSpend}
                    onChange={(e) => setMinSpend(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#090e1a] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">{language === 'bn' ? 'সর্বোচ্চ ব্যবহার সীমা' : 'Usage Limit'}</label>
                  <input
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#090e1a] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">{language === 'bn' ? 'মেয়াদ শেষের তারিখ' : 'Expiry Date'}</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#090e1a] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">{language === 'bn' ? 'বিবরণ (বাংলা)' : 'Description (Bangla)'}</label>
                <input
                  type="text"
                  value={descBn}
                  onChange={(e) => setDescBn(e.target.value)}
                  placeholder="যেমন: বিশেষ অফারে ১৫% ছাড়"
                  className="w-full px-3 py-2 bg-[#090e1a] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black cursor-pointer shadow-md"
                >
                  {language === 'bn' ? 'ডাটাবেজে সেভ করুন' : 'Save to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
