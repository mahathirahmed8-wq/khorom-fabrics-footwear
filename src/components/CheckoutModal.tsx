import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { CustomerInfo, PaymentMethod } from '../types';
import { BANGLADESH_DISTRICTS } from '../data/bangladeshDistricts';
import {
  X,
  ShieldCheck,
  CreditCard,
  Banknote,
  CheckCircle,
  Truck,
  ArrowRight,
  Phone,
  User,
  MapPin,
  FileText,
  Coins,
  Tag,
  Plus,
  Minus,
  Trash2,
  AlertCircle,
  Check,
  Building2,
  Copy,
  Info,
} from 'lucide-react';

export const BANGLADESH_DIVISIONS = [
  { id: 'dhaka', bn: 'ঢাকা', en: 'Dhaka' },
  { id: 'chattogram', bn: 'চট্টগ্রাম', en: 'Chattogram' },
  { id: 'rajshahi', bn: 'রাজশাহী', en: 'Rajshahi' },
  { id: 'khulna', bn: 'খুলনা', en: 'Khulna' },
  { id: 'barishal', bn: 'বরিশাল', en: 'Barishal' },
  { id: 'sylhet', bn: 'সিলেট', en: 'Sylhet' },
  { id: 'rangpur', bn: 'রংপুর', en: 'Rangpur' },
  { id: 'mymensingh', bn: 'ময়মনসিংহ', en: 'Mymensingh' },
];

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    updateCartItemQuantity,
    removeFromCart,
    cartSubtotal,
    discountAmount,
    promoDiscount,
    offerDiscountAmount,
    appliedOffer,
    appliedPromo,
    appliedCoins,
    applyCoins,
    coinsDiscountAmount,
    shippingFee,
    cartTotal,
    formatPrice,
    language,
    placeOrder,
    customization,
    currentUser,
    userCoins,
    coinSettings,
    setIsAuthModalOpen,
    showToast,
  } = useStore();

  const [selectedDivision, setSelectedDivision] = useState<string>('chattogram');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('chandpur');
  const [selectedUpazila, setSelectedUpazila] = useState<string>('চাঁদপুর সদর');
  const [area, setArea] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [bkashSenderNumber, setBkashSenderNumber] = useState<string>('');
  const [bkashTrxId, setBkashTrxId] = useState<string>('');

  // Coins Input State
  const [coinInputAmount, setCoinInputAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedBkash, setCopiedBkash] = useState(false);

  // Sync user info if currentUser changes
  useEffect(() => {
    if (currentUser) {
      setFullName((prev) => prev || currentUser.name || '');
      setEmail((prev) => prev || currentUser.email || '');
      if (currentUser.phone) {
        setPhone((prev) => prev || currentUser.phone || '');
      }
    }
  }, [currentUser]);

  // District Selection helper
  const currentDistrict = BANGLADESH_DISTRICTS.find((d) => d.id === selectedDistrictId) || BANGLADESH_DISTRICTS[0];

  useEffect(() => {
    if (currentDistrict && currentDistrict.upazilas.length > 0) {
      setSelectedUpazila(currentDistrict.upazilas[0].bn);
    }
  }, [selectedDistrictId]);

  if (!isCheckoutOpen) return null;

  const officialBkash = customization?.bkashNumber || customization?.whatsappNumber || '01817629255';

  const handleCopyBkash = () => {
    navigator.clipboard.writeText(officialBkash);
    setCopiedBkash(true);
    showToast(language === 'bn' ? 'বিকাশ নম্বর কপি করা হয়েছে!' : 'bKash number copied!');
    setTimeout(() => setCopiedBkash(false), 2000);
  };

  const handleApplyMaxCoins = () => {
    if (userCoins < 100) {
      showToast(language === 'bn' ? 'কয়েন ব্যবহারের জন্য সর্বনিম্ন ১০০ কয়েন প্রয়োজন।' : 'Minimum 100 coins required to redeem.');
      return;
    }
    // Calculate max allowed in blocks of 100
    const maxAllowed = Math.min(coinSettings.maxRedeemCoinsPerOrder || 10000, userCoins);
    const roundedCoins = Math.floor(maxAllowed / 100) * 100;
    if (roundedCoins < 100) {
      showToast(language === 'bn' ? 'কয়েন ব্যবহারের জন্য সর্বনিম্ন ১০০ কয়েন প্রয়োজন।' : 'Minimum 100 coins required to redeem.');
      return;
    }
    setCoinInputAmount(roundedCoins);
    applyCoins(roundedCoins);
  };

  const handleCustomCoinApply = () => {
    const coins = Math.floor(coinInputAmount / 100) * 100;
    if (coins < 100) {
      showToast(language === 'bn' ? 'অনুগ্রহ করে সর্বনিম্ন ১০০ কয়েন লিখুন।' : 'Please enter at least 100 coins.');
      return;
    }
    if (coins > userCoins) {
      showToast(language === 'bn' ? `আপনার পর্যাপ্ত কয়েন নেই। বর্তমান কয়েন: ${userCoins}` : `Insufficient coins. Available: ${userCoins}`);
      return;
    }
    applyCoins(coins);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      setErrorMsg(language === 'bn' ? 'অর্ডার সম্পন্ন করতে অনুগ্রহ করে প্রথমে আপনার অ্যাকাউন্টে লগইন করুন।' : 'Please log in to place your order.');
      setIsAuthModalOpen(true);
      return;
    }

    if (!fullName.trim()) {
      setErrorMsg(language === 'bn' ? 'অনুগ্রহ করে আপনার পুরো নাম লিখুন।' : 'Please enter your full name.');
      return;
    }
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg(language === 'bn' ? 'অনুগ্রহ করে সঠিক মোবাইল নম্বর প্রদান করুন (১১ ডিজিট)।' : 'Please enter a valid 11-digit mobile number.');
      return;
    }
    if (!address.trim()) {
      setErrorMsg(language === 'bn' ? 'ডেলিভারির সম্পূর্ণ ঠিকানা লিখুন (বাসা/রোড নম্বর)।' : 'Please provide full delivery address (House/Road/Street).');
      return;
    }

    if (paymentMethod === 'bkash') {
      if (!bkashSenderNumber.trim()) {
        setErrorMsg(language === 'bn' ? 'অনুগ্রহ করে যে নম্বর থেকে বিকাশ পেমেন্ট করেছেন তা লিখুন।' : 'Please enter the bKash sender phone number.');
        return;
      }
      if (!bkashTrxId.trim()) {
        setErrorMsg(language === 'bn' ? 'বিকাশ ট্রানজেকশন আইডি (TrxID) প্রদান করুন।' : 'Please enter the bKash Transaction ID (TrxID).');
        return;
      }
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    const divisionObj = BANGLADESH_DIVISIONS.find((d) => d.id === selectedDivision);
    const divisionName = divisionObj ? (language === 'bn' ? divisionObj.bn : divisionObj.en) : selectedDivision;

    const customerData: CustomerInfo = {
      fullName: fullName.trim(),
      phone: cleanPhone,
      email: (email.trim() || currentUser.email).toLowerCase(),
      division: divisionName,
      district: currentDistrict.nameBn,
      city: currentDistrict.nameBn,
      upazila: selectedUpazila,
      thana: selectedUpazila,
      area: area.trim(),
      address: address.trim(),
      notes: notes.trim(),
      bkashNumber: paymentMethod === 'bkash' ? bkashSenderNumber.trim() : undefined,
      bkashTrxId: paymentMethod === 'bkash' ? bkashTrxId.trim().toUpperCase() : undefined,
    };

    try {
      const savedOrder = await placeOrder(customerData, paymentMethod);
      setIsSubmitting(false);

      if (savedOrder) {
        // Success! Order confirmed and stored directly into system and Firebase.
        // No WhatsApp redirect!
      }
    } catch (err: any) {
      console.error('Checkout submit error:', err);
      setIsSubmitting(false);
      setErrorMsg(language === 'bn' ? 'অর্ডার প্রক্রিয়া করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' : 'Failed to process order. Please try again.');
    }
  };

  return (
    <div
      id="checkout-modal-backdrop"
      className="fixed inset-0 z-50 bg-[#060D17]/85 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-y-auto"
      onClick={() => setIsCheckoutOpen(false)}
    >
      <div
        id="checkout-modal-panel"
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0B1F33] rounded-2xl sm:rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-[#C6A15B]/30 text-[#FAF8F5] animate-in fade-in zoom-in-95 duration-200 my-auto max-h-[92vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#1B2D42] flex items-center justify-between bg-[#060D17] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C6A15B]/15 border border-[#C6A15B]/40 text-[#C6A15B] flex items-center justify-center shadow-xs">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#FAF8F5] font-serif">
                {language === 'bn' ? 'খড়ম অফিসিয়াল চেকআউট' : 'Khorom Official Checkout'}
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-300">
                {language === 'bn' ? 'নিরাপদ ডেলিভারি তথ্য ও পেমেন্ট কনফার্মেশন' : 'Secure delivery details & payment confirmation'}
              </p>
            </div>
          </div>

          <button
            id="close-checkout-btn"
            onClick={() => setIsCheckoutOpen(false)}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#122B45] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-3.5 sm:p-6 space-y-4 sm:space-y-6 slim-scrollbar">
          {errorMsg && (
            <div className="p-3 sm:p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. ORDERED PRODUCTS REVIEW */}
          <div className="bg-[#060D17] p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-[#1B2D42]">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1B2D42]">
              <span className="text-xs font-bold text-[#C6A15B] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'অর্ডারকৃত পণ্যসমূহ' : 'Order Items'} ({cart.length})</span>
              </span>
              <span className="text-xs font-bold text-[#FAF8F5]">
                {language === 'bn' ? 'সাবটোটাল:' : 'Subtotal:'} {formatPrice(cartSubtotal)}
              </span>
            </div>

            <div className="divide-y divide-[#1B2D42] max-h-48 overflow-y-auto slim-scrollbar pr-1">
              {cart.map((item, idx) => {
                const itemKey = `${item.product.id}-${item.selectedSize || ''}-${item.selectedColor || ''}-${idx}`;
                return (
                  <div key={itemKey} className="py-2 sm:py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={item.product.image}
                        alt={item.product.titleBn}
                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg object-cover border border-[#1B2D42] shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-[#FAF8F5] truncate text-xs sm:text-sm">
                          {language === 'bn' ? item.product.titleBn : item.product.titleEn}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-slate-300 mt-0.5">
                          {item.selectedSize && (
                            <span className="px-1.5 py-0.2 rounded bg-[#0B1F33] border border-[#1B2D42]">
                              {language === 'bn' ? 'সাইজ:' : 'Size:'} {item.selectedSize}
                            </span>
                          )}
                          {item.selectedColor && (
                            <span className="px-1.5 py-0.2 rounded bg-[#0B1F33] border border-[#1B2D42]">
                              {item.selectedColor}
                            </span>
                          )}
                          <span className="font-semibold text-[#C6A15B]">
                            {formatPrice(item.product.price)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center bg-[#0B1F33] border border-[#1B2D42] rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => updateCartItemQuantity(item.product.id, item.quantity - 1, item.selectedColor, item.selectedSize)}
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 font-bold text-xs">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateCartItemQuantity(item.product.id, item.quantity + 1, item.selectedColor, item.selectedSize)}
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id, item.selectedColor, item.selectedSize)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 transition"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. CUSTOMER & DELIVERY ADDRESS */}
          <div className="bg-[#060D17] p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-[#1B2D42] space-y-3 sm:space-y-4">
            <span className="text-xs font-bold text-[#C6A15B] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#1B2D42] pb-2">
              <User className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'কাস্টমার ও ডেলিভারি তথ্য' : 'Customer & Delivery Information'}</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  {language === 'bn' ? 'আপনার পূর্ণ নাম *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={language === 'bn' ? 'যেমন: মোহাম্মদ আমজাদ হোসেন' : 'e.g. John Doe'}
                  className="w-full px-3 py-2 bg-[#0B1F33] border border-[#1B2D42] rounded-xl text-[#FAF8F5] focus:outline-none focus:border-[#C6A15B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  {language === 'bn' ? 'সচল মোবাইল নম্বর (১১ ডিজিট) *' : 'Phone Number *'}
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3 py-2 bg-[#0B1F33] border border-[#1B2D42] rounded-xl text-[#FAF8F5] focus:outline-none focus:border-[#C6A15B]"
                />
              </div>
            </div>

            {/* Division & District */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  {language === 'bn' ? 'বিভাগ (Division) *' : 'Division *'}
                </label>
                <select
                  value={selectedDivision}
                  onChange={(e) => setSelectedDivision(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B1F33] border border-[#1B2D42] rounded-xl text-[#FAF8F5] focus:outline-none focus:border-[#C6A15B]"
                >
                  {BANGLADESH_DIVISIONS.map((div) => (
                    <option key={div.id} value={div.id} className="bg-[#0B1F33] text-white">
                      {language === 'bn' ? div.bn : div.en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  {language === 'bn' ? 'জেলা (District) *' : 'District *'}
                </label>
                <select
                  value={selectedDistrictId}
                  onChange={(e) => setSelectedDistrictId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B1F33] border border-[#1B2D42] rounded-xl text-[#FAF8F5] focus:outline-none focus:border-[#C6A15B]"
                >
                  {BANGLADESH_DISTRICTS.map((dist) => (
                    <option key={dist.id} value={dist.id} className="bg-[#0B1F33] text-white">
                      {dist.nameBn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Upazila/Thana & Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  {language === 'bn' ? 'উপজেলা / থানা (Upazila / Thana) *' : 'Upazila / Thana *'}
                </label>
                <select
                  value={selectedUpazila}
                  onChange={(e) => setSelectedUpazila(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B1F33] border border-[#1B2D42] rounded-xl text-[#FAF8F5] focus:outline-none focus:border-[#C6A15B]"
                >
                  {currentDistrict.upazilas.map((up) => (
                    <option key={up.bn} value={up.bn} className="bg-[#0B1F33] text-white">
                      {language === 'bn' ? up.bn : up.en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  {language === 'bn' ? 'এলাকা / মহল্লা / রোড (Area) *' : 'Area / Neighborhood *'}
                </label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder={language === 'bn' ? 'যেমন: হাজী মহসিন রোড / সেকশন ৭' : 'e.g. Mohsin Road, Sector 7'}
                  className="w-full px-3 py-2 bg-[#0B1F33] border border-[#1B2D42] rounded-xl text-[#FAF8F5] focus:outline-none focus:border-[#C6A15B]"
                />
              </div>
            </div>

            {/* Full Address */}
            <div className="text-xs">
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                {language === 'bn' ? 'বাসার পূর্ণাঙ্গ ঠিকানা (হোল্ডিং, ফ্ল্যাট নং, ল্যান্ডমার্ক) *' : 'Full Delivery Address *'}
              </label>
              <textarea
                rows={2}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={language === 'bn' ? 'বাড়ি নং, রোড নং, ফ্ল্যাট বা নিকটবর্তী পরিচিত স্থান...' : 'House #, Road #, Apartment or Landmark...'}
                className="w-full px-3 py-2 bg-[#0B1F33] border border-[#1B2D42] rounded-xl text-[#FAF8F5] focus:outline-none focus:border-[#C6A15B]"
              />
            </div>
          </div>

          {/* 3. YOUR KHOROM COINS (খড়ম কয়েন) */}
          <div className="bg-[#060D17] p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-[#C6A15B]/30">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-[#C6A15B] uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-[#C6A15B]" />
                <span>{language === 'bn' ? 'আপনার খড়ম কয়েন (Your KHOROM Coins)' : 'Your KHOROM Coins'}</span>
              </span>
              <span className="text-xs font-bold text-[#FAF8F5] px-2 py-0.5 rounded-full bg-[#C6A15B]/15 border border-[#C6A15B]/30">
                🪙 {userCoins} {language === 'bn' ? 'কয়েন ব্যালেন্স' : 'Coins'}
              </span>
            </div>

            {appliedCoins > 0 ? (
              <div className="p-2.5 rounded-xl bg-[#C6A15B]/15 border border-[#C6A15B]/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#C6A15B]" />
                  <span className="font-semibold text-[#FAF8F5]">
                    {language === 'bn'
                      ? `${appliedCoins}টি কয়েন প্রয়োগ করা হয়েছে (৳${coinsDiscountAmount} ছাড়)!`
                      : `${appliedCoins} coins applied (৳${coinsDiscountAmount} off)!`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => applyCoins(0)}
                  className="text-xs font-bold text-rose-400 hover:text-rose-300 underline cursor-pointer"
                >
                  {language === 'bn' ? 'মুছে ফেলুন' : 'Remove'}
                </button>
              </div>
            ) : userCoins >= 100 ? (
              <div className="space-y-2">
                <p className="text-[11px] text-slate-300">
                  {language === 'bn'
                    ? 'আপনার অ্যাকাউন্টে থাকা কয়েন দিয়ে অর্ডারে তাৎক্ষণিক বিশেষ ছাড় পান (১০০ কয়েন = ৳১ ছাড়)।'
                    : 'Redeem your KHOROM coins for instant discount on this order (100 coins = ৳1 off).'}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleApplyMaxCoins}
                    className="px-3 py-1.5 rounded-lg bg-[#C6A15B] hover:bg-[#B8924A] text-[#060D17] font-bold text-xs shadow-xs cursor-pointer transition-all"
                  >
                    {language === 'bn' ? 'সব কয়েন ব্যবহার করুন' : 'Use All Allowed Coins'}
                  </button>
                  <span className="text-slate-400 text-xs">{language === 'bn' ? 'বা নির্দিষ্ট কয়েন লিখুন:' : 'or enter coins:'}</span>
                  <input
                    type="number"
                    step={100}
                    min={100}
                    max={userCoins}
                    value={coinInputAmount || ''}
                    onChange={(e) => setCoinInputAmount(Number(e.target.value))}
                    placeholder="100"
                    className="w-20 px-2 py-1 bg-[#0B1F33] border border-[#1B2D42] rounded-lg text-xs text-center text-white"
                  />
                  <button
                    type="button"
                    onClick={handleCustomCoinApply}
                    className="px-2.5 py-1 rounded-lg bg-[#122B45] hover:bg-[#1B2D42] text-[#C6A15B] font-semibold text-xs border border-[#C6A15B]/40 cursor-pointer"
                  >
                    {language === 'bn' ? 'প্রয়োগ' : 'Apply'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400">
                {language === 'bn'
                  ? 'কয়েন ব্যবহারের জন্য আপনার অ্যাকাউন্টে সর্বনিম্ন ১০০টি কয়েন থাকতে হবে। পণ্য কিনে এবং নিয়মিত ভিজিট করে আরও কয়েন অর্জন করুন!'
                  : 'You need at least 100 coins to redeem discounts. Keep shopping to earn more coins!'}
              </p>
            )}
          </div>

          {/* 4. PAYMENT METHOD (COD + MANUAL BKASH) */}
          <div className="bg-[#060D17] p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-[#1B2D42] space-y-3">
            <span className="text-xs font-bold text-[#C6A15B] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#1B2D42] pb-2">
              <Banknote className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'পেমেন্ট মেথড নির্বাচন করুন' : 'Select Payment Method'}</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Cash On Delivery */}
              <label
                className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-[#C6A15B] bg-[#C6A15B]/10 text-white shadow-xs'
                    : 'border-[#1B2D42] bg-[#0B1F33] text-slate-300 hover:border-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="accent-[#C6A15B] w-4 h-4 cursor-pointer"
                />
                <div className="min-w-0">
                  <div className="font-bold text-xs text-[#FAF8F5]">
                    {language === 'bn' ? 'ক্যাশ অন ডেলিভারি (COD)' : 'Cash on Delivery (COD)'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {language === 'bn' ? 'পণ্য হাতে পেয়ে টাকা পরিশোধ করুন' : 'Pay in cash when you receive the product'}
                  </div>
                </div>
              </label>

              {/* Manual bKash */}
              <label
                className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'bkash'
                    ? 'border-[#E2136E] bg-[#E2136E]/10 text-white shadow-xs'
                    : 'border-[#1B2D42] bg-[#0B1F33] text-slate-300 hover:border-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bkash"
                  checked={paymentMethod === 'bkash'}
                  onChange={() => setPaymentMethod('bkash')}
                  className="accent-[#E2136E] w-4 h-4 cursor-pointer"
                />
                <div className="min-w-0">
                  <div className="font-bold text-xs text-[#FAF8F5] flex items-center gap-1.5">
                    <span>{language === 'bn' ? 'ম্যানুয়াল বিকাশ (bKash)' : 'Manual bKash Payment'}</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#E2136E] text-white">
                      bKash
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {language === 'bn' ? 'অফিসিয়াল বিকাশ নম্বরে পেমেন্ট বা সেন্ড মানি' : 'Send money or payment to official bKash number'}
                  </div>
                </div>
              </label>
            </div>

            {/* bKash Instructions & Form */}
            {paymentMethod === 'bkash' && (
              <div className="mt-3 p-3 sm:p-4 rounded-xl bg-[#0B1F33] border border-[#E2136E]/40 space-y-3 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-[#060D17] border border-[#E2136E]/30">
                  <div>
                    <span className="text-[11px] text-slate-300 block">
                      {language === 'bn' ? 'খড়ম অফিসিয়াল বিকাশ নম্বর (Personal / Send Money):' : 'Official Khorom bKash Number:'}
                    </span>
                    <span className="text-sm sm:text-base font-black text-[#E2136E] tracking-wider font-mono">
                      {officialBkash}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyBkash}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#E2136E]/20 hover:bg-[#E2136E]/30 text-[#FAF8F5] border border-[#E2136E]/40 text-xs font-semibold cursor-pointer w-fit"
                  >
                    {copiedBkash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-white" />}
                    <span>{copiedBkash ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied') : (language === 'bn' ? 'নম্বর কপি করুন' : 'Copy')}</span>
                  </button>
                </div>

                <div className="text-[11px] text-slate-300 space-y-1">
                  <p>• {language === 'bn' ? `আপনার বিকাশ অ্যাপ থেকে মোট ৳${cartTotal.toLocaleString('bn-BD')} টাকা সেন্ড মানি করুন।` : `Send exactly ৳${cartTotal} from your bKash app.`}</p>
                  <p>• {language === 'bn' ? 'টাকা পাঠানো শেষ হলে নিচের ঘরে আপনার বিকাশ নম্বর এবং ট্রানজেকশন আইডি (TrxID) দিয়ে অর্ডার কনফার্ম করুন।' : 'Enter sender bKash number and Transaction ID (TrxID) below to confirm order.'}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {language === 'bn' ? 'প্রেরকের বিকাশ নম্বর *' : 'Sender bKash Phone *'}
                    </label>
                    <input
                      type="tel"
                      required={paymentMethod === 'bkash'}
                      value={bkashSenderNumber}
                      onChange={(e) => setBkashSenderNumber(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full px-3 py-2 bg-[#060D17] border border-[#E2136E]/50 rounded-xl text-white focus:outline-none focus:border-[#E2136E]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {language === 'bn' ? 'বিকাশ ট্রানজেকশন আইডি (TrxID) *' : 'bKash Transaction ID (TrxID) *'}
                    </label>
                    <input
                      type="text"
                      required={paymentMethod === 'bkash'}
                      value={bkashTrxId}
                      onChange={(e) => setBkashTrxId(e.target.value)}
                      placeholder="e.g. BL9A2X8Q01"
                      className="w-full px-3 py-2 bg-[#060D17] border border-[#E2136E]/50 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-[#E2136E]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 5. BILL SUMMARY BREAKDOWN */}
          <div className="bg-[#060D17] p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-[#1B2D42] space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>{language === 'bn' ? 'পণ্যের মোট মূল্য (Subtotal):' : 'Items Subtotal:'}</span>
              <span className="font-semibold text-white">{formatPrice(cartSubtotal)}</span>
            </div>

            <div className="flex justify-between text-slate-300">
              <span>
                {language === 'bn' ? 'ডেলিভারি চার্জ:' : 'Delivery Charge:'}{' '}
                <span className="text-[10px] text-slate-400">
                  ({currentDistrict.id === 'dhaka' || currentDistrict.isInsideDhaka ? 'ঢাকা সিটি' : 'সারাদেশ'})
                </span>
              </span>
              <span className="font-semibold text-white">
                {shippingFee === 0 ? (
                  <span className="text-emerald-400">{language === 'bn' ? 'ফ্রি' : 'FREE'}</span>
                ) : (
                  formatPrice(shippingFee)
                )}
              </span>
            </div>

            {offerDiscountAmount > 0 && (
              <div className="flex justify-between text-[#C6A15B]">
                <span>{language === 'bn' ? 'অফার ডিসকাউন্ট:' : 'Offer Discount:'}</span>
                <span className="font-semibold">-{formatPrice(offerDiscountAmount)}</span>
              </div>
            )}

            {promoDiscount > 0 && (
              <div className="flex justify-between text-[#C6A15B]">
                <span>{language === 'bn' ? 'কুপন ছাড়:' : 'Promo Discount:'}</span>
                <span className="font-semibold">-{formatPrice(promoDiscount)}</span>
              </div>
            )}

            {coinsDiscountAmount > 0 && (
              <div className="flex justify-between text-[#C6A15B]">
                <span>{language === 'bn' ? 'খড়ম কয়েন ছাড়:' : 'Khorom Coins Discount:'}</span>
                <span className="font-semibold">-{formatPrice(coinsDiscountAmount)}</span>
              </div>
            )}

            <div className="border-t border-[#1B2D42] pt-2 mt-2 flex justify-between items-baseline">
              <span className="text-sm font-bold text-[#FAF8F5] font-serif">
                {language === 'bn' ? 'সর্বমোট প্রদেয় বিল:' : 'Total Payable:'}
              </span>
              <span className="text-base sm:text-xl font-black text-[#C6A15B] font-mono">
                {formatPrice(cartTotal)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsCheckoutOpen(false)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#0B1F33] hover:bg-[#122B45] text-slate-300 text-xs font-semibold border border-[#1B2D42] transition cursor-pointer"
            >
              {language === 'bn' ? 'বাতিল করুন' : 'Cancel'}
            </button>

            <button
              type="submit"
              disabled={isSubmitting || cart.length === 0}
              className="w-full sm:flex-1 py-3 px-6 rounded-xl gold-gradient-btn text-[#060D17] font-bold text-xs sm:text-sm tracking-wide shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? (language === 'bn' ? 'অর্ডার প্রসেস হচ্ছে...' : 'Processing Order...')
                  : (language === 'bn' ? `অর্ডার নিশ্চিত করুন (৳${cartTotal.toLocaleString('bn-BD')})` : `Place Order (৳${cartTotal})`)}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
