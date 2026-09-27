import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { WebsiteCustomization } from '../../types';
import {
  Settings,
  Save,
  RotateCcw,
  Sparkles,
  Type,
  Layout,
  Megaphone,
  Truck,
  Phone,
  CheckCircle2,
  Image as ImageIcon,
  Tag,
  DollarSign
} from 'lucide-react';

export const AdminSettingsTab: React.FC = () => {
  const { customization, updateCustomization, resetCustomization, language, showToast } = useStore();

  const [formData, setFormData] = useState<WebsiteCustomization>({ ...customization });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData({ ...customization });
  }, [customization]);

  const handleChange = (field: keyof WebsiteCustomization, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCategoryLabelChange = (catId: string, lang: 'nameBn' | 'nameEn', val: string) => {
    setFormData((prev) => {
      const currentCats = prev.categoryLabels || {};
      const catObj = currentCats[catId] || { nameBn: '', nameEn: '' };
      return {
        ...prev,
        categoryLabels: {
          ...currentCats,
          [catId]: {
            ...catObj,
            [lang]: val,
          },
        },
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateCustomization(formData);
    setIsSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {/* Header with Save & Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-[#0c1424] to-[#0f192d] border border-slate-800 p-4 rounded-2xl shadow-md">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white font-serif flex items-center gap-2">
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            <span>{language === 'bn' ? 'ওয়েবসাইট কনটেন্ট ও টেক্সট কন্ট্রোল' : 'Website Content & Text Control'}</span>
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
            {language === 'bn'
              ? 'এখানে টাইটেল, ব্যানার টেক্সট, বোতামের লেখা ও ক্যাটাগরি টেক্সট পরিবর্তন করলে ওয়েবসাইটে রিয়েল-টাইম আপডেট হবে।'
              : 'Edit headings, banner text, button copy, and notices. Saved directly to the central database.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={resetCustomization}
            className="px-3 py-2 rounded-xl bg-[#080d19] border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer min-h-[38px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'ডিফল্ট রিসেট' : 'Reset'}</span>
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 min-h-[38px]"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? (language === 'bn' ? 'সেভ হচ্ছে...' : 'Saving...') : (language === 'bn' ? 'টেক্সট সেভ করুন' : 'Save Changes')}</span>
          </button>
        </div>
      </div>

      {/* 1. Brand & Header Notice */}
      <div className="bg-[#0c1424] p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4 shadow-md">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
          <Megaphone className="w-4 h-4 text-amber-400" />
          <h4 className="text-sm font-bold text-white font-serif">
            {language === 'bn' ? 'ব্র্যান্ড ও টপ নোটিশ বার' : 'Brand & Top Notice Bar'}
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">{language === 'bn' ? 'দোকানের নাম (বাংলা)' : 'Store Name (Bangla)'}</label>
            <input
              type="text"
              value={formData.storeNameBn || ''}
              onChange={(e) => handleChange('storeNameBn', e.target.value)}
              className="w-full px-3 py-2 bg-[#080d19] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">{language === 'bn' ? 'দোকানের নাম (English)' : 'Store Name (English)'}</label>
            <input
              type="text"
              value={formData.storeNameEn || ''}
              onChange={(e) => handleChange('storeNameEn', e.target.value)}
              className="w-full px-3 py-2 bg-[#080d19] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="font-bold text-slate-300">{language === 'bn' ? 'টপ নোটিশ বার এনাউন্সমেন্ট (বাংলা)' : 'Top Notice Bar Text (Bangla)'}</label>
            <input
              type="text"
              value={formData.topAnnouncementBn || ''}
              onChange={(e) => handleChange('topAnnouncementBn', e.target.value)}
              className="w-full px-3 py-2 bg-[#080d19] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className="font-bold text-slate-300">{language === 'bn' ? 'টপ নোটিশ বার এনাউন্সমেন্ট (English)' : 'Top Notice Bar Text (English)'}</label>
            <input
              type="text"
              value={formData.topAnnouncementEn || ''}
              onChange={(e) => handleChange('topAnnouncementEn', e.target.value)}
              className="w-full px-3 py-2 bg-[#080d19] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* 2. Hero Banner Customization */}
      <div className="bg-[#0c1424] p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4 shadow-md">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
          <Layout className="w-4 h-4 text-amber-400" />
          <h4 className="text-sm font-bold text-white font-serif">
            {language === 'bn' ? 'মূল হিরো ব্যানার কনটেন্ট (Hero Banner)' : 'Hero Banner Content'}
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">{language === 'bn' ? 'ব্যানার শিরোনাম (বাংলা)' : 'Hero Title (Bangla)'}</label>
            <input
              type="text"
              value={formData.heroTitleBn || ''}
              onChange={(e) => handleChange('heroTitleBn', e.target.value)}
              className="w-full px-3 py-2 bg-[#080d19] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">{language === 'bn' ? 'ব্যানার শিরোনাম (English)' : 'Hero Title (English)'}</label>
            <input
              type="text"
              value={formData.heroTitleEn || ''}
              onChange={(e) => handleChange('heroTitleEn', e.target.value)}
              className="w-full px-3 py-2 bg-[#080d19] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="font-bold text-slate-300">{language === 'bn' ? 'ব্যানার সাবটাইটেল (বাংলা)' : 'Hero Subtitle (Bangla)'}</label>
            <textarea
              rows={2}
              value={formData.heroSubtitleBn || ''}
              onChange={(e) => handleChange('heroSubtitleBn', e.target.value)}
              className="w-full px-3 py-2 bg-[#080d19] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className="font-bold text-slate-300">{language === 'bn' ? 'ব্যানার সাবটাইটেল (English)' : 'Hero Subtitle (English)'}</label>
            <textarea
              rows={2}
              value={formData.heroSubtitleEn || ''}
              onChange={(e) => handleChange('heroSubtitleEn', e.target.value)}
              className="w-full px-3 py-2 bg-[#080d19] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">{language === 'bn' ? 'বোতামের লেখা CTA Button (বাংলা)' : 'Button Text (Bangla)'}</label>
            <input
              type="text"
              value={formData.heroCtaBn || 'এখনই কিনুন'}
              onChange={(e) => handleChange('heroCtaBn', e.target.value)}
              className="w-full px-3 py-2 bg-[#080d19] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">{language === 'bn' ? 'বোতামের লেখা CTA Button (English)' : 'Button Text (English)'}</label>
            <input
              type="text"
              value={formData.heroCtaEn || 'Shop Collection'}
              onChange={(e) => handleChange('heroCtaEn', e.target.value)}
              className="w-full px-3 py-2 bg-[#080d19] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="font-bold text-slate-300 flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'bn' ? 'ব্যানারের ফটো URL' : 'Hero Image URL'}</span>
            </label>
            <input
              type="url"
              value={formData.heroImage || ''}
              onChange={(e) => handleChange('heroImage', e.target.value)}
              className="w-full px-3 py-2 bg-[#080d19] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* 3. Section Headings & Titles */}
      <div className="bg-[#0c1424] p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4 shadow-md">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
          <Type className="w-4 h-4 text-amber-400" />
          <h4 className="text-sm font-bold text-white font-serif">
            {language === 'bn' ? 'প্রোডাক্ট সেকশন হেডিং ও সাবটাইটেল' : 'Product Section Headings'}
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">{language === 'bn' ? 'সেকশন টাইটেল (বাংলা)' : 'Section Title (Bangla)'}</label>
            <input
              type="text"
              value={formData.sectionTitleBn || 'খড়ম জেন্টস কালেকশন'}
              onChange={(e) => handleChange('sectionTitleBn', e.target.value)}
              className="w-full px-3 py-2 bg-[#080d19] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">{language === 'bn' ? 'সেকশন টাইটেল (English)' : 'Section Title (English)'}</label>
            <input
              type="text"
              value={formData.sectionTitleEn || 'Khorom Gents Collection'}
              onChange={(e) => handleChange('sectionTitleEn', e.target.value)}
              className="w-full px-3 py-2 bg-[#080d19] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="font-bold text-slate-300">{language === 'bn' ? 'সেকশন সাবটাইটেল (বাংলা)' : 'Section Subtitle (Bangla)'}</label>
            <input
              type="text"
              value={formData.sectionSubtitleBn || 'মার্জিত রুচি ও প্রিমিয়াম জেন্টস লাইফস্টাইলের সেরা সম্ভার'}
              onChange={(e) => handleChange('sectionSubtitleBn', e.target.value)}
              className="w-full px-3 py-2 bg-[#080d19] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className="font-bold text-slate-300">{language === 'bn' ? 'সেকশন সাবটাইটেল (English)' : 'Section Subtitle (English)'}</label>
            <input
              type="text"
              value={formData.sectionSubtitleEn || 'Handcrafted bespoke pieces for the refined gentleman'}
              onChange={(e) => handleChange('sectionSubtitleEn', e.target.value)}
              className="w-full px-3 py-2 bg-[#080d19] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* 4. Delivery Charges & Helpline */}
      <div className="bg-[#0c1424] p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4 shadow-md">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
          <Truck className="w-4 h-4 text-amber-400" />
          <h4 className="text-sm font-bold text-white font-serif">
            {language === 'bn' ? 'ডেলিভারি চার্জ ও হেল্পলাইন' : 'Delivery & Helpline'}
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">{language === 'bn' ? 'ঢাকার ভিতরে ডেলিভারি (৳)' : 'Inside Dhaka (BDT)'}</label>
            <input
              type="number"
              value={formData.deliveryInsideDhaka ?? 70}
              onChange={(e) => handleChange('deliveryInsideDhaka', Number(e.target.value))}
              className="w-full px-3 py-2 bg-[#080d19] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400 font-bold text-amber-300"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">{language === 'bn' ? 'ঢাকার বাইরে ডেলিভারি (৳)' : 'Outside Dhaka (BDT)'}</label>
            <input
              type="number"
              value={formData.deliveryOutsideDhaka ?? 130}
              onChange={(e) => handleChange('deliveryOutsideDhaka', Number(e.target.value))}
              className="w-full px-3 py-2 bg-[#080d19] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400 font-bold text-amber-300"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">{language === 'bn' ? 'হেল্পলাইন নম্বর' : 'Helpline Phone'}</label>
            <input
              type="text"
              value={formData.helpline || '+880 1712-345678'}
              onChange={(e) => handleChange('helpline', e.target.value)}
              className="w-full px-3 py-2 bg-[#080d19] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* 5. WhatsApp Business Order Integration Settings */}
      <div className="bg-[#0c1424] p-4 sm:p-5 rounded-2xl border border-emerald-500/30 space-y-4 shadow-md">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Phone className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-sm font-bold text-white font-serif">
              {language === 'bn' ? 'WhatsApp বিজনেস অর্ডার কনফিগারেশন' : 'WhatsApp Business Order Settings'}
            </h4>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            Active
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          {language === 'bn'
            ? 'কাস্টমার যখন কোনো পণ্যের "Buy Now" বোতামে ক্লিক করবে, তখন সরাসরি নিচের বিজনেস নম্বরে সুবিন্যস্ত পণ্য ও ভ্যারিয়েন্ট বিবরণসহ WhatsApp মেসেজ তৈরি হবে।'
            : 'Customers clicking "Buy Now" will be redirected to WhatsApp with pre-formatted product specifications and order details sent to this business number.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">
              {language === 'bn' ? 'WhatsApp বিজনেস নম্বর *' : 'WhatsApp Business Phone Number *'}
            </label>
            <input
              type="text"
              required
              value={formData.whatsappNumber || '01817629255'}
              onChange={(e) => handleChange('whatsappNumber', e.target.value)}
              placeholder="01817629255"
              className="w-full px-3 py-2 bg-[#080d19] border border-emerald-500/40 rounded-xl text-emerald-300 font-bold focus:outline-none focus:border-emerald-400 text-sm"
            />
            <p className="text-[10px] text-slate-500">
              {language === 'bn' ? 'ডিফল্ট: 01817629255' : 'Default: 01817629255'}
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">
              {language === 'bn' ? 'অফিসিয়াল বিকাশ নম্বর (Manual bKash)' : 'Official bKash Number'}
            </label>
            <input
              type="text"
              value={formData.bkashNumber || ''}
              onChange={(e) => handleChange('bkashNumber', e.target.value)}
              placeholder="01817629255"
              className="w-full px-3 py-2 bg-[#080d19] border border-rose-500/40 rounded-xl text-rose-300 font-bold focus:outline-none focus:border-rose-400 text-sm"
            />
            <p className="text-[10px] text-slate-500">
              {language === 'bn' ? 'চেকআউটে কাস্টমার এই নম্বরে টাকা পাঠাবে' : 'bKash receiver number displayed at checkout'}
            </p>
          </div>

          {/* Facebook Link & Toggle */}
          <div className="space-y-1.5 p-3 rounded-xl bg-[#060a14] border border-blue-900/40">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-300">
                {language === 'bn' ? 'ফেসবুক পেজ লিংক (Facebook Page URL)' : 'Facebook Page URL'}
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-blue-300">
                <input
                  type="checkbox"
                  checked={formData.enableFacebookIcon ?? true}
                  onChange={(e) => handleChange('enableFacebookIcon', e.target.checked)}
                  className="w-4 h-4 rounded text-blue-500 bg-slate-900 border-slate-700 cursor-pointer accent-blue-500"
                />
                <span>{formData.enableFacebookIcon ?? true ? (language === 'bn' ? 'আইকন সক্রিয়' : 'Icon Active') : (language === 'bn' ? 'আইকন বন্ধ' : 'Icon Disabled')}</span>
              </label>
            </div>
            <input
              type="url"
              value={formData.facebookUrl || ''}
              onChange={(e) => handleChange('facebookUrl', e.target.value)}
              placeholder="https://facebook.com/khoromstore"
              className="w-full px-3 py-2 bg-[#080d19] border border-blue-500/40 rounded-xl text-blue-300 font-medium focus:outline-none focus:border-blue-400 text-xs"
            />
            <p className="text-[10px] text-slate-500">
              {language === 'bn' ? 'হেডারের ফেসবুক আইকনে ক্লিক করলে এই পেজ সরাসরি ওপেন হবে' : 'Header Facebook icon will open this URL'}
            </p>
          </div>

          {/* WhatsApp Link & Toggle */}
          <div className="space-y-1.5 p-3 rounded-xl bg-[#060a14] border border-emerald-900/40">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-300">
                {language === 'bn' ? 'হোয়াটসঅ্যাপ চ্যাট লিংক বা নম্বর (WhatsApp URL/Number)' : 'WhatsApp Chat URL or Number'}
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-emerald-300">
                <input
                  type="checkbox"
                  checked={formData.enableWhatsappIcon ?? true}
                  onChange={(e) => handleChange('enableWhatsappIcon', e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 cursor-pointer accent-emerald-500"
                />
                <span>{formData.enableWhatsappIcon ?? true ? (language === 'bn' ? 'আইকন সক্রিয়' : 'Icon Active') : (language === 'bn' ? 'আইকন বন্ধ' : 'Icon Disabled')}</span>
              </label>
            </div>
            <input
              type="text"
              value={formData.whatsappUrl || ''}
              onChange={(e) => handleChange('whatsappUrl', e.target.value)}
              placeholder="https://wa.me/8801817629255 অথবা 01817629255"
              className="w-full px-3 py-2 bg-[#080d19] border border-emerald-500/40 rounded-xl text-emerald-300 font-medium focus:outline-none focus:border-emerald-400 text-xs"
            />
            <p className="text-[10px] text-slate-500">
              {language === 'bn' ? 'হেডারের হোয়াটসঅ্যাপ আইকনে ক্লিক করলে এই চ্যাট লিংক ওপেন হবে' : 'Header WhatsApp icon will open this chat link'}
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">
              {language === 'bn' ? 'হোয়াটসঅ্যাপ অর্ডার ফিচার স্ট্যাটাস' : 'WhatsApp Ordering Status'}
            </label>
            <div className="flex items-center gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.whatsappOrderEnabled ?? true}
                  onChange={(e) => handleChange('whatsappOrderEnabled', e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500 cursor-pointer accent-emerald-500"
                />
                <span className="text-xs font-semibold">
                  {formData.whatsappOrderEnabled ?? true
                    ? language === 'bn'
                      ? 'সক্রিয় (Enabled)'
                      : 'Enabled'
                    : language === 'bn'
                    ? 'নিষ্ক্রিয় (Disabled)'
                    : 'Disabled'}
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Footer Management & Policy Settings */}
      <div className="bg-[#0c1424] p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-5 shadow-md">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
          <Layout className="w-4 h-4 text-amber-400" />
          <div>
            <h4 className="text-sm font-bold text-white font-serif">
              {language === 'bn' ? 'ফুটার ও গ্রাহক সেবা ব্যবস্থাপনা' : 'Footer & Customer Care Settings'}
            </h4>
            <p className="text-[11px] text-slate-400">
              {language === 'bn'
                ? 'ওয়েবসাইটের ফুটার টেক্সট, শোরুমের ঠিকানা, ফোন, ইমেইল, নিউজলেটার ও কপিরাইট তথ্য নিয়ন্ত্রণ করুন।'
                : 'Manage footer brand description, showroom address, contact, newsletter text, and copyright.'}
            </p>
          </div>
        </div>

        {/* Brand Description Bn & En */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">
              {language === 'bn' ? 'ফুটার ব্র্যান্ড বিবরণ (বাংলা)' : 'Footer Brand Bio (Bengali)'}
            </label>
            <textarea
              rows={3}
              value={formData.footerBrandDescriptionBn || ''}
              onChange={(e) => handleChange('footerBrandDescriptionBn', e.target.value)}
              placeholder="খড়ম (Khorom) — পুরুষদের আভিজাত্য ও রুচিশীলতার বিশ্বস্ত ঠিকানা..."
              className="w-full px-3 py-2 bg-[#080d19] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">
              {language === 'bn' ? 'ফুটার ব্র্যান্ড বিবরণ (English)' : 'Footer Brand Bio (English)'}
            </label>
            <textarea
              rows={3}
              value={formData.footerBrandDescriptionEn || ''}
              onChange={(e) => handleChange('footerBrandDescriptionEn', e.target.value)}
              placeholder="Khorom — The quintessential destination for men of distinction..."
              className="w-full px-3 py-2 bg-[#080d19] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Newsletter Controls */}
        <div className="p-4 rounded-xl bg-[#080d19] border border-slate-800/80 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <label className="font-bold text-amber-300 flex items-center gap-2">
              <Megaphone className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'নিউজলেটার ব্যানার সেটিংস' : 'Newsletter Banner Settings'}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={formData.footerShowNewsletter ?? true}
                onChange={(e) => handleChange('footerShowNewsletter', e.target.checked)}
                className="w-4 h-4 rounded text-amber-400 bg-slate-900 border-slate-700 focus:ring-amber-400 cursor-pointer accent-amber-400"
              />
              <span className="text-xs">
                {formData.footerShowNewsletter ?? true
                  ? language === 'bn'
                    ? 'দেখাবে (Visible)'
                    : 'Visible'
                  : language === 'bn'
                  ? 'লুকানো (Hidden)'
                  : 'Hidden'}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-slate-400">{language === 'bn' ? 'নিউজলেটার শিরোনাম (বাংলা)' : 'Newsletter Title (Bn)'}</label>
              <input
                type="text"
                value={formData.footerNewsletterTitleBn || ''}
                onChange={(e) => handleChange('footerNewsletterTitleBn', e.target.value)}
                className="w-full px-3 py-1.5 bg-[#0c1424] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">{language === 'bn' ? 'নিউজলেটার শিরোনাম (English)' : 'Newsletter Title (En)'}</label>
              <input
                type="text"
                value={formData.footerNewsletterTitleEn || ''}
                onChange={(e) => handleChange('footerNewsletterTitleEn', e.target.value)}
                className="w-full px-3 py-1.5 bg-[#0c1424] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">{language === 'bn' ? 'সাব-টাইটেল (বাংলা)' : 'Subtitle (Bn)'}</label>
              <input
                type="text"
                value={formData.footerNewsletterSubtitleBn || ''}
                onChange={(e) => handleChange('footerNewsletterSubtitleBn', e.target.value)}
                className="w-full px-3 py-1.5 bg-[#0c1424] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">{language === 'bn' ? 'বাটন টেক্সট (বাংলা)' : 'Button Text (Bn)'}</label>
              <input
                type="text"
                value={formData.footerNewsletterButtonTextBn || ''}
                onChange={(e) => handleChange('footerNewsletterButtonTextBn', e.target.value)}
                className="w-full px-3 py-1.5 bg-[#0c1424] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Showroom & Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">
              {language === 'bn' ? 'শোরুমের ঠিকানা (বাংলা)' : 'Showroom Address (Bengali)'}
            </label>
            <input
              type="text"
              value={formData.footerAddressBn || ''}
              onChange={(e) => handleChange('footerAddressBn', e.target.value)}
              placeholder="হাউস ১২, রোড ৭, সেক্টর ৩, উত্তরা, ঢাকা..."
              className="w-full px-3 py-2 bg-[#080d19] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">
              {language === 'bn' ? 'শোরুমের ঠিকানা (English)' : 'Showroom Address (English)'}
            </label>
            <input
              type="text"
              value={formData.footerAddressEn || ''}
              onChange={(e) => handleChange('footerAddressEn', e.target.value)}
              placeholder="House 12, Road 7, Sector 3, Uttara, Dhaka..."
              className="w-full px-3 py-2 bg-[#080d19] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">
              {language === 'bn' ? 'যোগাযোগ ফোন নম্বর' : 'Contact Phone'}
            </label>
            <input
              type="text"
              value={formData.footerPhone || ''}
              onChange={(e) => handleChange('footerPhone', e.target.value)}
              placeholder="+880 1700-000000"
              className="w-full px-3 py-2 bg-[#080d19] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">
              {language === 'bn' ? 'যোগাযোগ ইমেইল' : 'Contact Email'}
            </label>
            <input
              type="text"
              value={formData.footerEmail || ''}
              onChange={(e) => handleChange('footerEmail', e.target.value)}
              placeholder="info@khorom.com.bd"
              className="w-full px-3 py-2 bg-[#080d19] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">
              {language === 'bn' ? 'খোলা থাকার সময় (বাংলা)' : 'Opening Hours (Bengali)'}
            </label>
            <input
              type="text"
              value={formData.footerOpeningHoursBn || ''}
              onChange={(e) => handleChange('footerOpeningHoursBn', e.target.value)}
              placeholder="সকাল ১০টা - রাত ১০টা (সপ্তাহে ৭ দিন খোলা)"
              className="w-full px-3 py-2 bg-[#080d19] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">
              {language === 'bn' ? 'খোলা থাকার সময় (English)' : 'Opening Hours (English)'}
            </label>
            <input
              type="text"
              value={formData.footerOpeningHoursEn || ''}
              onChange={(e) => handleChange('footerOpeningHoursEn', e.target.value)}
              placeholder="10:00 AM - 10:00 PM (Open 7 Days a Week)"
              className="w-full px-3 py-2 bg-[#080d19] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Copyright & Payment Title */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs pt-2 border-t border-slate-800/80">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">
              {language === 'bn' ? 'কপিরাইট টেক্সট (বাংলা)' : 'Copyright Text (Bengali)'}
            </label>
            <input
              type="text"
              value={formData.footerCopyrightBn || ''}
              onChange={(e) => handleChange('footerCopyrightBn', e.target.value)}
              placeholder="সর্বস্বত্ব সংরক্ষিত। খড়ম (Khorom)..."
              className="w-full px-3 py-2 bg-[#080d19] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">
              {language === 'bn' ? 'পেমেন্ট হেডার লেবেল' : 'Payment Header Label'}
            </label>
            <input
              type="text"
              value={formData.footerPaymentTitleBn || ''}
              onChange={(e) => handleChange('footerPaymentTitleBn', e.target.value)}
              placeholder="নিরাপদ পেমেন্ট:"
              className="w-full px-3 py-2 bg-[#080d19] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>
    </form>
  );
};
