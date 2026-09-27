import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  Award,
  Truck,
  RotateCcw
} from 'lucide-react';
import { KhoromLogo } from './KhoromLogo';
import { formatFacebookLink, formatWhatsAppLink } from '../utils/socialLinks';

export const Footer: React.FC = () => {
  const { language, customization, categories } = useStore();

  const brandDesc =
    language === 'bn'
      ? customization.footerBrandDescriptionBn || 'খড়ম (Khorom) — পুরুষদের আভিজাত্য ও রুচিশীলতার বিশ্বস্ত ঠিকানা। ১০০% আসল চামড়ার জুতো, প্রিমিয়াম পাঞ্জাবি, শার্ট, সানগ্লাস, ঘড়ি ও মানিব্যাগ।'
      : customization.footerBrandDescriptionEn || 'Khorom — The quintessential destination for men of distinction. Featuring handcrafted leather footwear, pure cotton fabrics, watches, sunglasses, and wallets.';

  const address =
    language === 'bn'
      ? customization.footerAddressBn || 'হাউস ১২, রোড ৭, সেক্টর ৩, উত্তরা, ঢাকা-১২৩০, বাংলাদেশ'
      : customization.footerAddressEn || 'House 12, Road 7, Sector 3, Uttara, Dhaka-1230, Bangladesh';

  const phone = customization.footerPhone || customization.helpline || '+880 1700-000000';
  const email = customization.footerEmail || 'info@khorom.com.bd';
  const openingHours =
    language === 'bn'
      ? customization.footerOpeningHoursBn || 'সপ্তাহে ৭ দিন খোলা (সকাল ১০টা - রাত ১০টা)'
      : customization.footerOpeningHoursEn || 'Open 7 Days a Week (10:00 AM - 10:00 PM)';

  const copyright =
    language === 'bn'
      ? customization.footerCopyrightBn || `© ${new Date().getFullYear()} খড়ম (Khorom) Fabrics & Footwear. সর্বস্বত্ব সংরক্ষিত।`
      : customization.footerCopyrightEn || `© ${new Date().getFullYear()} Khorom Fabrics & Footwear. All rights reserved.`;

  return (
    <footer className="bg-[#0B1F33] text-slate-300 pt-12 pb-10 border-t border-[#C6A15B]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* 4-Column Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-xs">
          {/* Brand Info with Khorom Logo */}
          <div className="space-y-4">
            <KhoromLogo size="md" textColor="light" />
            <p className="text-slate-400 leading-relaxed text-xs">
              {brandDesc}
            </p>
            <div className="flex items-center gap-2 text-[#dfb76c] font-medium text-xs">
              <ShieldCheck className="w-4 h-4 text-[#dfb76c]" />
              <span>{language === 'bn' ? '১০০% অরিজিনাল কোয়ালিটি নিশ্চয়তা' : '100% Genuine Quality Guarantee'}</span>
            </div>

            {/* Configured Social Links */}
            {((customization.enableFacebookIcon ?? true) || (customization.enableWhatsappIcon ?? true)) && (
              <div className="flex items-center gap-2 pt-1">
                {(customization.enableFacebookIcon ?? true) && (
                  <a
                    href={formatFacebookLink(customization.facebookUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-[#0B1522] hover:bg-[#1877F2] border border-slate-700 hover:border-transparent text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
                    title="Facebook Page"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                )}
                {(customization.enableWhatsappIcon ?? true) && (
                  <a
                    href={formatWhatsAppLink(customization.whatsappUrl || customization.whatsappNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-[#0B1522] hover:bg-[#25D366] border border-slate-700 hover:border-transparent text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
                    title="WhatsApp Chat"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#faf8f5] uppercase tracking-wider text-xs">
              {customization.footerCustomerCareTitleBn && language === 'bn'
                ? customization.footerCustomerCareTitleBn
                : customization.footerCustomerCareTitleEn && language === 'en'
                ? customization.footerCustomerCareTitleEn
                : language === 'bn'
                ? 'গ্রাহক সেবা ও নীতি'
                : 'Customer Care'}
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <span className="hover:text-[#dfb76c] transition-colors cursor-pointer">
                  {language === 'bn' ? 'সাইজ গাইড ও পরিমাপ' : 'Size Guide & Fit Chart'}
                </span>
              </li>
              <li>
                <span className="hover:text-[#dfb76c] transition-colors cursor-pointer">
                  {language === 'bn' ? 'ডেলিভারি ও শিপিং পলিসি' : 'Delivery & Shipping Policy'}
                </span>
              </li>
              <li>
                <span className="hover:text-[#dfb76c] transition-colors cursor-pointer">
                  {language === 'bn' ? '৭ দিনের সহজ রিটার্ন ও এক্সচেঞ্জ' : '7 Days Easy Exchange Policy'}
                </span>
              </li>
              <li>
                <span className="hover:text-[#dfb76c] transition-colors cursor-pointer">
                  {language === 'bn' ? 'লেদার কেয়ার নির্দেশিকা' : 'Genuine Leather Care Tips'}
                </span>
              </li>
            </ul>
          </div>

          {/* Dynamic Categories */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#faf8f5] uppercase tracking-wider text-xs">
              {customization.footerCategoriesTitleBn && language === 'bn'
                ? customization.footerCategoriesTitleBn
                : customization.footerCategoriesTitleEn && language === 'en'
                ? customization.footerCategoriesTitleEn
                : language === 'bn'
                ? 'জেন্টস ক্যাটাগরি'
                : 'Gents Categories'}
            </h4>
            <ul className="space-y-2 text-slate-400">
              {categories
                .filter((c) => c.id !== 'all')
                .slice(0, 6)
                .map((cat) => (
                  <li key={cat.id}>
                    <span className="hover:text-[#dfb76c] transition-colors cursor-pointer">
                      {language === 'bn' ? cat.nameBn : cat.nameEn}
                    </span>
                  </li>
                ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#faf8f5] uppercase tracking-wider text-xs">
              {customization.footerShowroomTitleBn && language === 'bn'
                ? customization.footerShowroomTitleBn
                : customization.footerShowroomTitleEn && language === 'en'
                ? customization.footerShowroomTitleEn
                : language === 'bn'
                ? 'যোগাযোগ ও শোরুম'
                : 'Contact & Showroom'}
            </h4>
            <div className="space-y-2.5 text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#dfb76c] shrink-0 mt-0.5" />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#dfb76c] shrink-0" />
                <span>{email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{openingHours}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Partner Badges & Copyright */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>{copyright}</p>

          {/* Payment Badges */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-400">
            <span>
              {customization.footerPaymentTitleBn && language === 'bn'
                ? customization.footerPaymentTitleBn
                : customization.footerPaymentTitleEn && language === 'en'
                ? customization.footerPaymentTitleEn
                : language === 'bn'
                ? 'নিরাপদ পেমেন্ট:'
                : 'Secure Payments:'}
            </span>
            <span className="px-2 py-0.5 bg-[#0a0f1d] rounded-md border border-slate-800 text-pink-400 font-bold">
              bKash
            </span>
            <span className="px-2 py-0.5 bg-[#0a0f1d] rounded-md border border-slate-800 text-orange-400 font-bold">
              Nagad
            </span>
            <span className="px-2 py-0.5 bg-[#0a0f1d] rounded-md border border-slate-800 text-blue-400 font-bold">
              VISA
            </span>
            <span className="px-2 py-0.5 bg-[#0a0f1d] rounded-md border border-slate-800 text-[#dfb76c] font-bold">
              MasterCard
            </span>
            <span className="px-2 py-0.5 bg-[#0a0f1d] rounded-md border border-slate-800 text-emerald-400 font-bold">
              Cash on Delivery
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
