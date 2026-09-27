import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { KhoromCoinSettings } from '../../types';
import {
  Coins,
  ShieldCheck,
  TrendingUp,
  Settings2,
  DollarSign,
  Award,
  Clock,
  Sparkles,
  Save,
  CheckCircle2,
  Users,
  Search,
  Plus,
  Minus,
  RefreshCw,
} from 'lucide-react';

export const AdminCoinsTab: React.FC = () => {
  const {
    coinSettings,
    updateCoinSettings,
    coinStats,
    fetchCoinStats,
    fetchCoinCustomers,
    fetchCoinTransactions,
    adjustUserCoins,
    language,
    formatPrice,
    showToast,
  } = useStore();

  const [localSettings, setLocalSettings] = useState<KhoromCoinSettings>(coinSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<'settings' | 'customers' | 'transactions'>('settings');

  // Customer balances & search
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');

  // Transaction history
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  // Manual adjustment modal state
  const [adjustModalUser, setAdjustModalUser] = useState<any | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(50);
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [adjustReason, setAdjustReason] = useState<string>('Special Customer Reward');
  const [isSubmittingAdjust, setIsSubmittingAdjust] = useState(false);

  useEffect(() => {
    setLocalSettings(coinSettings);
  }, [coinSettings]);

  useEffect(() => {
    fetchCoinStats();
  }, [fetchCoinStats]);

  useEffect(() => {
    if (activeSection === 'customers') {
      loadCustomers();
    } else if (activeSection === 'transactions') {
      loadTransactions();
    }
  }, [activeSection]);

  const loadCustomers = async () => {
    setIsLoadingCustomers(true);
    try {
      const data = await fetchCoinCustomers();
      setCustomers(data || []);
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const loadTransactions = async () => {
    setIsLoadingTransactions(true);
    try {
      const data = await fetchCoinTransactions();
      setTransactions(data || []);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const ok = await updateCoinSettings(localSettings);
      if (ok) {
        showToast(
          language === 'bn' ? 'কয়েন সেটিংস সংরক্ষিত হয়েছে' : 'Coin settings saved successfully',
          'success'
        );
      } else {
        showToast('Failed to save settings', 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModalUser || adjustAmount <= 0) return;
    setIsSubmittingAdjust(true);
    try {
      const finalAmount = adjustType === 'debit' ? -Math.abs(adjustAmount) : Math.abs(adjustAmount);
      const res = await adjustUserCoins(adjustModalUser.id, finalAmount, adjustReason);
      if (res.success) {
        showToast(
          language === 'bn'
            ? `সফলভাবে ${adjustType === 'credit' ? 'যোগ' : 'কর্তন'} করা হয়েছে! বর্তমান ব্যালেন্স: ${res.newBalance} কয়েন`
            : `Successfully adjusted coins! New balance: ${res.newBalance}`,
          'success'
        );
        setAdjustModalUser(null);
        setAdjustAmount(50);
        setAdjustReason('Special Customer Reward');
        loadCustomers();
        fetchCoinStats();
      } else {
        showToast(res.message || 'Adjustment failed', 'error');
      }
    } finally {
      setIsSubmittingAdjust(false);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    if (!customerSearch) return true;
    const q = customerSearch.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q)) ||
      (c.id && c.id.toLowerCase().includes(q))
    );
  });

  return (
    <div id="admin-coins-tab" className="space-y-4 sm:space-y-5">
      {/* Economy Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#0c1424] border border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-md">
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">
              {language === 'bn' ? 'বর্তমান কয়েন ব্যালেন্স (সার্কুলেশন)' : 'Circulation Liability'}
            </div>
            <div className="text-xl font-black text-amber-300">
              {(coinStats?.totalCoinsInCirculation ?? 0).toLocaleString()} <span className="text-xs text-amber-500 font-bold">কয়েন</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              ≈ ৳{((coinStats?.totalCoinsInCirculation ?? 0) * (coinSettings.valuePerCoin || 0.5)).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-[#0c1424] border border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-md">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">
              {language === 'bn' ? 'মোট উপার্জিত কয়েন' : 'Total Coins Awarded'}
            </div>
            <div className="text-xl font-black text-emerald-400">
              {(coinStats?.totalCoinsEarned ?? 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {language === 'bn' ? 'সফল অর্ডারসমূহ থেকে' : 'From completed orders'}
            </div>
          </div>
        </div>

        <div className="bg-[#0c1424] border border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-md">
          <div className="w-12 h-12 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">
              {language === 'bn' ? 'মোট রিডিম / ব্যবহৃত কয়েন' : 'Total Coins Redeemed'}
            </div>
            <div className="text-xl font-black text-sky-300">
              {(coinStats?.totalCoinsRedeemed ?? 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {language === 'bn' ? 'মোট ছাড়: ' : 'Total discount: '}
              ৳{((coinStats?.totalCoinsRedeemed ?? 0) * (coinSettings.valuePerCoin || 0.5)).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-[#0c1424] border border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-md">
          <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">
              {language === 'bn' ? 'কয়েনধারী সক্রিয় ইউজার' : 'Active Coin Holders'}
            </div>
            <div className="text-xl font-black text-purple-300">
              {coinStats?.activeUsersWithCoins ?? 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {language === 'bn' ? 'নিবন্ধিত গ্রাহক' : 'Registered members'}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Buttons */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveSection('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSection === 'settings'
              ? 'bg-amber-400 text-slate-950 shadow-md font-black'
              : 'bg-[#0c1424] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'প্রোগ্রাম ও টিয়ার সেটিংস' : 'Program & Tier Settings'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('customers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSection === 'customers'
              ? 'bg-amber-400 text-slate-950 shadow-md font-black'
              : 'bg-[#0c1424] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'কাস্টমার ব্যালেন্স ও অ্যাডজাস্টমেন্ট' : 'Customer Balances & Adjustments'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('transactions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSection === 'transactions'
              ? 'bg-amber-400 text-slate-950 shadow-md font-black'
              : 'bg-[#0c1424] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'লেনদেন লেজার (Ledger)' : 'Transaction Ledger'}</span>
        </button>
      </div>

      {/* SECTION 1: SETTINGS FORM */}
      {activeSection === 'settings' && (
        <form onSubmit={handleSave} className="bg-[#0c1424] border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-5 sm:space-y-6 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white font-serif flex items-center gap-2">
                <Settings2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                {language === 'bn' ? 'খড়ম কয়েন লয়্যালটি প্রোগ্রাম সেটিংস' : 'Khorom Coins Loyalty Program Settings'}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                {language === 'bn'
                  ? '১ কয়েন = ৳০.৫০, শপিং রিওয়ার্ড টিয়ার এবং দৈনিক ১০০ কয়েন ফ্রি ক্লেইম সম্পূর্ণ সক্রিয়।'
                  : '1 Coin = ৳0.50, tiered purchase rewards upon order received, and 100 daily claim coins.'}
              </p>
            </div>

            <label className="flex items-center gap-3 cursor-pointer bg-[#080d19] px-4 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
              <span className="text-xs font-bold text-slate-300">
                {localSettings.enabled
                  ? language === 'bn'
                    ? 'কয়েন প্রোগ্রাম সক্রিয়'
                    : 'Coins Program ENABLED'
                  : language === 'bn'
                  ? 'কয়েন প্রোগ্রাম নিষ্ক্রিয়'
                  : 'Coins Program DISABLED'}
              </span>
              <input
                type="checkbox"
                checked={localSettings.enabled}
                onChange={(e) => setLocalSettings({ ...localSettings, enabled: e.target.checked })}
                className="w-5 h-5 rounded border-slate-700 text-amber-400 focus:ring-0 cursor-pointer accent-amber-400"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Earning & Value Rule */}
            <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-[#080d19] border border-slate-800/90">
              <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                {language === 'bn' ? 'উপার্জন ও টাকার বিনিময় হার' : 'Earning & Valuation Rate'}
              </h4>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'bn' ? '১টি কয়েনের টাকার সমমূল্য (টাকা)' : 'Value per 1 Coin (BDT)'}
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold">৳</span>
                  <input
                    type="number"
                    step="0.05"
                    min="0.05"
                    required
                    value={localSettings.valuePerCoin}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, valuePerCoin: parseFloat(e.target.value) })
                    }
                    className="w-full bg-[#0c1424] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {language === 'bn'
                    ? `বর্তমান হার: ১০০ কয়েন = ৳${(100 * localSettings.valuePerCoin).toFixed(0)} ক্যাশ ছাড়`
                    : `Current rate: 100 Coins = ৳${(100 * localSettings.valuePerCoin).toFixed(0)} cash discount.`}
                </p>
              </div>

              {/* Purchase Coin Reward Setting */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'bn' ? 'প্রতি ১,০০০ টাকা কেনাকাটায় রিওয়ার্ড কয়েন (Coins per ৳1,000 Purchase)' : 'Coins per ৳1,000 Purchase'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="5"
                    required
                    value={localSettings.coinsPer1000Bdt !== undefined ? localSettings.coinsPer1000Bdt : 50}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, coinsPer1000Bdt: Math.max(0, parseInt(e.target.value) || 0) })
                    }
                    className="w-full bg-[#0c1424] border border-amber-500/40 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-xs text-amber-400 font-bold whitespace-nowrap">কয়েন</span>
                </div>
                <p className="text-[11px] text-amber-400/90 mt-1 font-mono">
                  {language === 'bn'
                    ? `উদাহরণ: ৳১,০০০ = ${(localSettings.coinsPer1000Bdt ?? 50)} কয়েন | ৳২,০০০ = ${(localSettings.coinsPer1000Bdt ?? 50) * 2} কয়েন | ৳৫,০০০ = ${(localSettings.coinsPer1000Bdt ?? 50) * 5} কয়েন`
                    : `Example: ৳1,000 = ${(localSettings.coinsPer1000Bdt ?? 50)} Coins | ৳2,000 = ${(localSettings.coinsPer1000Bdt ?? 50) * 2} Coins | ৳5,000 = ${(localSettings.coinsPer1000Bdt ?? 50) * 5} Coins`}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'bn' ? 'দৈনিক ফ্রি ক্লেইম কয়েন' : 'Daily Free Claim Coins'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="5"
                    required
                    value={localSettings.dailyClaimCoins || 100}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, dailyClaimCoins: Number(e.target.value) })
                    }
                    className="w-full bg-[#0c1424] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-xs text-slate-400 font-bold whitespace-nowrap">কয়েন</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {language === 'bn'
                    ? `প্রতি গ্রাহক ২৪ ঘণ্টায় একবার এই কয়েন ক্লেইম করতে পারবেন।`
                    : `Granted once every 24h per customer account.`}
                </p>
              </div>

              {/* Reward Rules Info */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'অর্ডার সমাপ্তিতে কয়েন রিওয়ার্ডের নিয়মাবলী:' : 'Completed Order Coin Reward Policy:'}</span>
                </p>
                <ul className="list-disc list-inside text-[11px] space-y-0.5 text-amber-200/80">
                  <li>{language === 'bn' ? 'অর্ডার রিসিভড/ডেলিভার্ড মার্ক হলে স্বয়ংক্রিয়ভাবে কয়েন অ্যাকাউন্টে যোগ হবে।' : 'Awarded automatically when order is confirmed/received.'}</li>
                  <li>{language === 'bn' ? 'বাতিল বা রিটার্ন হওয়া অর্ডারে রিওয়ার্ড কয়েন দেওয়া হবে না।' : 'Cancelled or returned orders do not receive rewards.'}</li>
                  <li>{language === 'bn' ? 'একই অর্ডারে দুইবার কয়েন রিওয়ার্ড দেওয়া হবে না।' : 'Never reward the same order twice.'}</li>
                </ul>
              </div>
            </div>

            {/* Redemption Safety Rules */}
            <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-[#080d19] border border-slate-800/90">
              <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                {language === 'bn' ? 'রিডেম্পশন ও চেকআউট সুরক্ষা' : 'Redemption Safety Limits'}
              </h4>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'bn' ? 'রিডিম শুরু করার সর্বনিম্ন কয়েন থ্রেশহোল্ড' : 'Minimum Coins Required to Redeem'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="10"
                    required
                    value={localSettings.minRedeemCoins}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, minRedeemCoins: Number(e.target.value) })
                    }
                    className="w-full bg-[#0c1424] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-xs text-slate-400 font-bold whitespace-nowrap">কয়েন</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'bn' ? 'প্রতি অর্ডারে সর্বোচ্চ রিডিম সীমা (Max Coins/Order)' : 'Max Coins Allowed per Order'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="10"
                    required
                    value={localSettings.maxRedeemCoinsPerOrder}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, maxRedeemCoinsPerOrder: Number(e.target.value) })
                    }
                    className="w-full bg-[#0c1424] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-xs text-slate-400 font-bold whitespace-nowrap">কয়েন</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'bn' ? 'অর্ডারের সর্বোচ্চ কত শতাংশ কয়েনে কভার করা যাবে (%)' : 'Max Order Discount Cap (%)'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="5"
                    max="100"
                    required
                    value={localSettings.maxDiscountPercent}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, maxDiscountPercent: Number(e.target.value) })
                    }
                    className="w-full bg-[#0c1424] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-xs text-slate-400 font-bold whitespace-nowrap">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50 min-h-[42px]"
            >
              <Save className="w-4 h-4" />
              <span>
                {isSaving
                  ? language === 'bn'
                    ? 'সংরক্ষণ হচ্ছে...'
                    : 'Saving...'
                  : language === 'bn'
                  ? 'কয়েন সেটিংস আপডেট করুন'
                  : 'Save Coin Settings'}
              </span>
            </button>
          </div>
        </form>
      )}

      {/* SECTION 2: CUSTOMER BALANCES & ADJUSTMENT */}
      {activeSection === 'customers' && (
        <div className="bg-[#0c1424] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span>{language === 'bn' ? 'গ্রাহক কয়েন ব্যালেন্স তালিকা' : 'Customer Coin Balances'}</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                {language === 'bn'
                  ? 'যেকোনো গ্রাহকের ব্যালেন্স অনুসন্ধান করুন এবং প্রয়োজন অনুযায়ী ম্যানুয়ালি কয়েন যোগ বা কর্তন করুন।'
                  : 'Search customer balances and manually credit or debit coins with reason tracking.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder={language === 'bn' ? 'নাম, ইমেইল বা ফোন...' : 'Search by name, email, phone...'}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#080d19] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="button"
                onClick={loadCustomers}
                disabled={isLoadingCustomers}
                className="p-2 bg-[#080d19] border border-slate-800 rounded-xl text-slate-300 hover:text-white cursor-pointer"
                title="Refresh"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCustomers ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-800/80 max-h-[500px] overflow-y-auto slim-scrollbar">
            {isLoadingCustomers ? (
              <div className="py-8 text-center text-xs text-slate-400">
                {language === 'bn' ? 'লোড হচ্ছে...' : 'Loading customer coin balances...'}
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                {language === 'bn' ? 'কোনো গ্রাহক পাওয়া যায়নি' : 'No customers found'}
              </div>
            ) : (
              filteredCustomers.map((cust) => {
                const bdtVal = ((cust.coins || 0) * (coinSettings.valuePerCoin || 0.5)).toFixed(0);
                return (
                  <div key={cust.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate">{cust.name || 'Anonymous Customer'}</p>
                      <p className="text-[11px] text-slate-400 truncate">{cust.email || cust.phone || cust.id}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="font-black text-amber-300 text-sm">
                          {cust.coins || 0} <span className="text-[10px] text-amber-500">কয়েন</span>
                        </span>
                        <span className="block text-[10px] text-slate-500">≈ ৳{bdtVal}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setAdjustModalUser(cust)}
                        className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{language === 'bn' ? 'অ্যাডজাস্ট' : 'Adjust'}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: TRANSACTION HISTORY LEDGER */}
      {activeSection === 'transactions' && (
        <div className="bg-[#0c1424] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>{language === 'bn' ? 'কয়েন লেনদেন ইতিহাস (Audit Ledger)' : 'Coin Transaction Ledger'}</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                {language === 'bn' ? 'অর্ডার রিওয়ার্ড, রিডেম্পশন, দৈনিক ক্লেইম এবং অ্যাডমিন পরিবর্তনের পূর্ণ বিবরণ।' : 'Audit trail of all rewards, redemptions, daily claims, and adjustments.'}
              </p>
            </div>

            <button
              type="button"
              onClick={loadTransactions}
              disabled={isLoadingTransactions}
              className="p-2 bg-[#080d19] border border-slate-800 rounded-xl text-slate-300 hover:text-white cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTransactions ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="divide-y divide-slate-800/80 max-h-[500px] overflow-y-auto slim-scrollbar">
            {isLoadingTransactions ? (
              <div className="py-8 text-center text-xs text-slate-400">
                {language === 'bn' ? 'লোড হচ্ছে...' : 'Loading transaction ledger...'}
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                {language === 'bn' ? 'এখনও কোনো কয়েন লেনদেন হয়নি' : 'No transactions recorded yet'}
              </div>
            ) : (
              transactions.map((tx) => {
                const isPositive = (tx.amount || 0) > 0;
                return (
                  <div key={tx.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white truncate">{tx.userName || tx.userId}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 capitalize font-mono">
                          {tx.type}
                        </span>
                        {tx.orderId && (
                          <span className="text-[10px] text-amber-400 font-mono">
                            Order #{tx.orderId}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{tx.description || tx.reason}</p>
                      <span className="text-[10px] text-slate-500">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US') : ''}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`font-black text-sm ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPositive ? `+${tx.amount}` : tx.amount}
                      </span>
                      <span className="block text-[10px] text-slate-500">
                        Bal: {tx.balanceAfter ?? '-'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Manual Adjustment Modal */}
      {adjustModalUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0c1424] border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>{language === 'bn' ? 'কাস্টমার কয়েন অ্যাডজাস্টমেন্ট' : 'Adjust Customer Coins'}</span>
              </h4>
              <button
                type="button"
                onClick={() => setAdjustModalUser(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualAdjust} className="space-y-3.5 text-xs">
              <div className="p-3 bg-[#080d19] rounded-xl border border-slate-800">
                <p className="text-slate-400">{language === 'bn' ? 'গ্রাহক:' : 'Customer:'}</p>
                <p className="font-bold text-white">{adjustModalUser.name || 'Customer'}</p>
                <p className="text-[11px] text-slate-500">{adjustModalUser.email || adjustModalUser.phone}</p>
                <p className="mt-1 text-amber-300 font-bold">
                  {language === 'bn' ? 'বর্তমান ব্যালেন্স:' : 'Current Balance:'} {adjustModalUser.coins || 0} Coins
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {language === 'bn' ? 'অ্যাকশন নির্বাচন করুন' : 'Select Action'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('credit')}
                    className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer ${
                      adjustType === 'credit'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-[#080d19] text-slate-400 border border-slate-800'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Credit (যোগ)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustType('debit')}
                    className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer ${
                      adjustType === 'debit'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-[#080d19] text-slate-400 border border-slate-800'
                    }`}
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>Debit (কর্তন)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {language === 'bn' ? 'কয়েন পরিমাণ' : 'Coins Amount'}
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-[#080d19] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {language === 'bn' ? 'অ্যাডজাস্টমেন্ট কারণ / নোট' : 'Reason / Note'}
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Special customer loyalty bonus, return adjustment"
                  className="w-full bg-[#080d19] border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAdjustModalUser(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdjust}
                  className="px-4 py-2 gold-gradient-btn text-slate-950 font-bold rounded-xl cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSubmittingAdjust ? '...' : (language === 'bn' ? 'নিশ্চিত করুন' : 'Confirm')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
