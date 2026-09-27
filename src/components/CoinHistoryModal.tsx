import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  X,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Sparkles,
  ShoppingBag,
  HelpCircle,
  Award,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

export const CoinHistoryModal: React.FC = () => {
  const {
    isCoinHistoryModalOpen,
    setIsCoinHistoryModalOpen,
    userCoins,
    coinTransactions,
    coinSettings,
    language,
    currentUser,
  } = useStore();

  if (!isCoinHistoryModalOpen) return null;

  const bdtValue = (userCoins * (coinSettings.valuePerCoin || 0.5)).toFixed(0);

  return (
    <div
      id="coin-history-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      onClick={() => setIsCoinHistoryModalOpen(false)}
    >
      <div
        id="coin-history-modal-content"
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0b1220] border border-amber-500/30 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh] my-auto animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header with Balance Card */}
        <div className="p-5 sm:p-6 bg-gradient-to-b from-[#131f37] to-[#0b1220] border-b border-slate-800 shrink-0 relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {language === 'bn' ? 'খড়ম কয়েন লয়্যালটি পোর্টাল' : 'Khorom Coins Portal'}
                </h3>
                <p className="text-xs text-slate-400">
                  {currentUser?.name || currentUser?.email || 'Customer'}
                </p>
              </div>
            </div>

            <button
              id="close-coin-modal-btn"
              onClick={() => setIsCoinHistoryModalOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Balance card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-transparent border border-amber-400/30 flex items-center justify-between relative z-10">
            <div>
              <div className="text-xs text-amber-300 font-medium">
                {language === 'bn' ? 'আপনার বর্তমান কয়েন ব্যালেন্স' : 'Current Coin Balance'}
              </div>
              <div className="text-3xl font-black text-amber-400 flex items-baseline gap-2 mt-0.5">
                <span>{userCoins.toLocaleString()}</span>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {language === 'bn' ? 'কয়েন' : 'Coins'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-amber-300 font-semibold">
                {language === 'bn' ? '🪙 দৈনিক ১০০ কয়েন রিওয়ার্ড' : '🪙 100 Daily Coins Reward'}
              </div>
              <div className="text-[11px] text-slate-300 mt-1 max-w-[180px]">
                {language === 'bn' ? 'চেকআউটে কয়েন ব্যবহার করে উপভোগ করুন বিশেষ মূল্যছাড়!' : 'Use your coins at checkout to enjoy discounts!'}
              </div>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3 slim-scrollbar bg-[#090f1d]">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'bn' ? 'লেনদেনের ইতিহাস' : 'Transaction History'}</span>
          </div>

          {coinTransactions.length === 0 ? (
            <div className="p-6 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
              <Coins className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p className="text-xs">
                {language === 'bn'
                  ? 'এখনও কোনো কয়েন লেনদেন হয়নি। পণ্য অর্ডার করে এবং ডেলিভারি কনফার্ম করে কয়েন অর্জন করুন!'
                  : 'No coin transactions yet. Place an order to start earning!'}
              </p>
            </div>
          ) : (
            coinTransactions.map((tx) => {
              const isPositive = (tx.amount !== undefined && tx.amount > 0) || ['earned', 'bonus', 'reward', 'daily_claim'].includes(tx.type);
              const txTitle = language === 'bn'
                ? (tx.descriptionBn || tx.reason || (isPositive ? 'কয়েন জমা' : 'কয়েন ব্যবহার'))
                : (tx.descriptionEn || tx.reason || (isPositive ? 'Coin Credit' : 'Coin Debit'));
              const dateStr = tx.createdAt ? new Date(tx.createdAt).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              }) : 'N/A';

              return (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isPositive
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {isPositive ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="text-xs font-bold text-white">
                        {txTitle}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        {tx.orderId && <span>Order #{tx.orderId}</span>}
                        <span>•</span>
                        <span>{dateStr}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`text-sm font-black ${
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isPositive ? `+${Math.abs(tx.amount)}` : `-${Math.abs(tx.amount)}`}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {isPositive ? (language === 'bn' ? 'জমা হয়েছে' : 'Credited') : (language === 'bn' ? 'ব্যবহৃত' : 'Spent')}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* How Coins Work Explainer */}
          <div className="mt-5 p-4 rounded-2xl bg-slate-950/70 border border-slate-850 space-y-2.5">
            <h5 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              {language === 'bn' ? 'খড়ম কয়েন কীভাবে কাজ করে?' : 'How Khorom Coins Work'}
            </h5>
            <ul className="text-[11px] text-slate-300 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>
                {language === 'bn'
                  ? `প্রতি ১০০ টাকার কেনাকাটায় ${coinSettings.coinsPer100Bdt}টি কয়েন অর্জিত হয়।`
                  : `Earn ${coinSettings.coinsPer100Bdt} coin for every ৳100 spent on any purchase.`}
              </li>
              <li>
                {language === 'bn'
                  ? 'অর্ডার হাতে পেয়ে "পণ্য হাতে পেয়েছি" বাটন প্রেস করে কনফার্ম করলে সাথে সাথে কয়েন অ্যাকাউন্টে যুক্ত হবে।'
                  : 'Coins are automatically credited once you confirm order receipt.'}
              </li>
              <li>
                {language === 'bn'
                  ? `চেকআউটে সর্বনিম্ন ${coinSettings.minRedeemCoins}টি কয়েন থেকে সর্বোচ্চ ${coinSettings.maxRedeemCoinsPerOrder}টি কয়েন ব্যবহার করে সরাসরি টাকার ছাড় পাওয়া যায়।`
                  : `Redeem between ${coinSettings.minRedeemCoins} and ${coinSettings.maxRedeemCoinsPerOrder} coins at checkout for instant cash discounts.`}
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#070c16] border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={() => setIsCoinHistoryModalOpen(false)}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
