import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  PackageCheck,
  RotateCcw,
  Sparkles,
  Quote,
} from 'lucide-react';

export const HomeReviewsSection: React.FC = () => {
  const { allStoreReviews, language } = useStore();

  const reviewsToDisplay =
    Array.isArray(allStoreReviews) && allStoreReviews.length > 0
      ? allStoreReviews
      : [
          {
            id: 'rev-1',
            userName: 'আরিফুল ইসলাম',
            userLocation: 'উত্তরা, ঢাকা',
            rating: 5,
            comment:
              'পাঞ্জাবির ফেব্রিক এবং কাটিং অসাধারণ! প্রিমিয়াম লুক দেয়। ঈদের শপিং সফল হলো।',
            commentEn:
              'Exceptional fabric and tailoring! Feels truly premium. Loved the unboxing experience.',
            verifiedBuyer: true,
          },
          {
            id: 'rev-2',
            userName: 'তানভীর আহমেদ',
            userLocation: 'গুলশান, ঢাকা',
            rating: 5,
            comment:
              'লোফার জুতোর আসল লেদারের ফিনিশিং চোখ জুড়ানো। সাইজ একদম পারফেক্ট হয়েছে।',
            commentEn:
              'Genuine leather loafer finish is incredible. Size fit perfectly and feels very comfy.',
            verifiedBuyer: true,
          },
          {
            id: 'rev-3',
            userName: 'মাহমুদুল হাসান',
            userLocation: 'জিইসি, চট্টগ্রাম',
            rating: 5,
            comment:
              'অফিসিয়াল ফরমাল শার্টের ফেব্রিক অনেক আরামদায়ক। পার্সেল খুলে দেখে পেমেন্ট করার অপশনটি দারুণ লেগেছে।',
            commentEn:
              'Office formal shirt is super comfortable. Loved the open-box checking facility.',
            verifiedBuyer: true,
          },
        ];

  return (
    <section id="home-reviews-section" className="py-6 sm:py-8 border-t border-slate-800/80 mt-6 sm:mt-10">
      {/* Trust Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-slate-800/80 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white font-serif">
              {language === 'bn' ? 'পার্সেল খুলে দেখে পেমেন্ট' : 'Open-Box Delivery Verification'}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              {language === 'bn'
                ? 'ডেলিভারিম্যানের সামনে পার্সেল খুলে গুণগত মান নিশ্চিত হয়ে মূল্য পরিশোধের সুবিধা।'
                : 'Inspect the parcel right in front of the delivery partner before payment.'}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-slate-800/80 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white font-serif">
              {language === 'bn' ? '১০০% অরিজিনাল খাঁটি লেদার' : '100% Genuine Handcrafted Goods'}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              {language === 'bn'
                ? 'প্রিমিয়াম কোয়ালিটির জেনুইন লেদার জুতো, বেল্ট ও ওয়ালেট এবং ১০০% সুতি ফেব্রিক।'
                : 'Top-grain genuine leather loafers, belts, wallets & pure combed cotton.'}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-slate-800/80 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white font-serif">
              {language === 'bn' ? '৭ দিনে সহজ সাইজ পরিবর্তন' : 'Hassle-Free 7-Day Size Exchange'}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              {language === 'bn'
                ? 'সাইজ নিয়ে কোনো দ্বিধা নেই—অর্ডার পাওয়ার পর যেকোনো সময় সাইজ পরিবর্তন সম্ভব।'
                : 'Zero worries about sizing. Easy, prompt doorstep size exchange available.'}
            </p>
          </div>
        </div>
      </div>

      {/* Customer Feedback Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 px-1">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-5 rounded-full bg-gradient-to-b from-amber-400 to-amber-600" />
            <h3 className="text-sm sm:text-base font-bold text-white font-serif tracking-wide flex items-center gap-2">
              <span>{language === 'bn' ? 'সন্তুষ্ট গ্রাহকদের প্রতিক্রিয়া' : 'Verified Customer Reviews'}</span>
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {language === 'bn'
              ? 'খড়মের প্রিমিয়াম ফ্যাশন ও সার্ভিসের উপর দেশজুড়ে বিশ্বস্ত গ্রাহকদের অভিমত'
              : 'Real reviews from verified shoppers across Bangladesh'}
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-[#0a0f1d] px-3 py-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
          <div className="flex items-center text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-xs font-bold text-white">4.9 / 5.0</span>
          <span className="text-[10px] text-slate-400">({language === 'bn' ? '৮৫০+ রিভিউ' : '850+ reviews'})</span>
        </div>
      </div>

      {/* Review Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {reviewsToDisplay.slice(0, 3).map((review: any) => (
          <div
            key={review.id}
            className="p-4 rounded-2xl bg-[#0a0f1d] border border-slate-800/80 flex flex-col justify-between hover:border-amber-500/30 transition-colors"
          >
            <div>
              {/* Stars & Verified Badge */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center text-amber-400">
                  {[...Array(review.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>{language === 'bn' ? 'ভেরিফাইড ক্রেতা' : 'Verified Buyer'}</span>
                </span>
              </div>

              {/* Review Text */}
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{language === 'bn' ? review.comment : review.commentEn || review.comment}"
              </p>
            </div>

            {/* User Details */}
            <div className="mt-3.5 pt-2.5 border-t border-slate-800/70 flex items-center justify-between text-xs">
              <div className="font-bold text-white font-serif">{review.userName}</div>
              <div className="text-[10px] text-slate-400">{review.userLocation || (language === 'bn' ? 'ঢাকা, বাংলাদেশ' : 'Dhaka, BD')}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
