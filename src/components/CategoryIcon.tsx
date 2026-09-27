import React from 'react';
import {
  Shirt,
  Footprints,
  Glasses,
  Watch,
  Wallet,
  LayoutGrid,
  ShoppingBag,
  Briefcase,
  Sparkles,
  Crown,
  Tag,
  Package,
  Layers,
  Flame,
  Scissors,
  Award,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export interface CategoryIconDefinition {
  id: string;
  nameBn: string;
  nameEn: string;
}

export const CATEGORY_ICON_OPTIONS: CategoryIconDefinition[] = [
  { id: 'Shirt', nameBn: 'শার্ট / পাঞ্জাবি (Shirt)', nameEn: 'Shirt / Panjabi' },
  { id: 'TShirt', nameBn: 'টি-শার্ট / পোলো (T-Shirt)', nameEn: 'T-Shirt / Polo' },
  { id: 'Clothing', nameBn: 'পোশাক সামগ্রী (Clothing)', nameEn: 'Men Clothing' },
  { id: 'Pants', nameBn: 'প্যান্ট / ট্রাউজার (Pants)', nameEn: 'Pants / Trousers' },
  { id: 'Jeans', nameBn: 'জিন্স প্যান্ট (Jeans)', nameEn: 'Denim Jeans' },
  { id: 'Shoes', nameBn: 'জুতো (Shoes)', nameEn: 'Formal Shoes' },
  { id: 'Loafers', nameBn: 'লোফার (Loafers)', nameEn: 'Leather Loafers' },
  { id: 'Sneakers', nameBn: 'স্নিকার্স (Sneakers)', nameEn: 'Casual Sneakers' },
  { id: 'Sandals', nameBn: 'স্যান্ডেল / চটি (Sandals)', nameEn: 'Leather Sandals' },
  { id: 'Boots', nameBn: 'বুট জুতো (Boots)', nameEn: 'Leather Boots' },
  { id: 'Belts', nameBn: 'লেদার বেল্ট (Belts)', nameEn: 'Leather Belts' },
  { id: 'Wallet', nameBn: 'মানিব্যাগ / ওয়ালেট (Wallet)', nameEn: 'Leather Wallet' },
  { id: 'Glasses', nameBn: 'সানগ্লাস / চশমা (Sunglasses)', nameEn: 'Sunglasses / Eyewear' },
  { id: 'Watch', nameBn: 'হাতঘড়ি / ওয়াচ (Watches)', nameEn: 'Luxury Watches' },
  { id: 'Perfume', nameBn: 'পারফিউম / আতর (Perfume)', nameEn: 'Perfume & Fragrance' },
  { id: 'Bags', nameBn: 'ব্যাগ / ট্রাভেল ব্যাগ (Bags)', nameEn: 'Bags & Luggage' },
  { id: 'Briefcase', nameBn: 'অফিস ব্রিফকেস (Briefcase)', nameEn: 'Office Briefcase' },
  { id: 'Accessories', nameBn: 'এক্সেসরিজ / অনুষঙ্গ (Accessories)', nameEn: 'Men Accessories' },
  { id: 'Crown', nameBn: 'রয়্যাল / প্রিমিয়াম (Royal)', nameEn: 'Royal Bespoke' },
  { id: 'Sparkles', nameBn: 'বিশেষ কালেকশন (Special)', nameEn: 'Special Collection' },
  { id: 'Tag', nameBn: 'অফার / ডিসকাউন্ট (Offers)', nameEn: 'Offers & Discounts' },
  { id: 'LayoutGrid', nameBn: 'সব কালেকশন (All)', nameEn: 'All Collection' },
];

interface CategoryIconProps {
  iconName: string;
  className?: string;
  style?: React.CSSProperties;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ iconName, className = 'w-4 h-4', style }) => {
  const norm = (iconName || '').toLowerCase().trim();

  // T-Shirt Icon
  if (norm === 'tshirt' || norm === 't-shirt') {
    return (
      <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10a2 2 0 002 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" />
      </svg>
    );
  }

  // Pants / Trousers / Jeans Icon
  if (norm === 'pants' || norm === 'jeans' || norm === 'trousers') {
    return (
      <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16v3l-2 13h-4l-2-9-2 9H6L4 7V4z" />
        <path d="M4 7h16" />
        <path d="M12 7v3" />
      </svg>
    );
  }

  // Belts Icon
  if (norm === 'belts' || norm === 'belt') {
    return (
      <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="10" rx="2" />
        <rect x="5" y="9" width="6" height="6" rx="1" />
        <circle cx="16" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
      </svg>
    );
  }

  // Loafers / Shoes / Footwear
  if (norm === 'loafers' || norm === 'shoes' || norm === 'footprints') {
    return <Footprints className={className} style={style} />;
  }

  // Sneakers Icon
  if (norm === 'sneakers' || norm === 'sneaker') {
    return (
      <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 17h20v3H2z" />
        <path d="M4 17l2-7h5l3 3 5 1v3H4z" />
        <path d="M9 10l-1 4" />
        <path d="M12 10l-1 4" />
      </svg>
    );
  }

  // Sandals Icon
  if (norm === 'sandals' || norm === 'sandal') {
    return (
      <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="16" rx="9" ry="3" />
        <path d="M7 14c1-4 4-6 7-6s4 3 4 7" />
        <path d="M9 15l3-4" />
      </svg>
    );
  }

  // Boots Icon
  if (norm === 'boots' || norm === 'boot') {
    return (
      <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3h7v9l6 3v5H5V3h1z" />
        <path d="M5 17h14v3H5z" />
      </svg>
    );
  }

  // Perfume / Fragrance Icon
  if (norm === 'perfume' || norm === 'fragrance') {
    return (
      <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="9" width="12" height="12" rx="3" />
        <path d="M10 5h4v4h-4z" />
        <path d="M12 2v3" />
        <circle cx="12" cy="15" r="2" />
      </svg>
    );
  }

  // Accessories Icon
  if (norm === 'accessories' || norm === 'accessory') {
    return <Award className={className} style={style} />;
  }

  // Standard switch by Lucide mapping
  switch (norm) {
    case 'shirt':
    case 'clothing':
      return <Shirt className={className} style={style} />;
    case 'glasses':
    case 'sunglasses':
      return <Glasses className={className} style={style} />;
    case 'watch':
    case 'watches':
      return <Watch className={className} style={style} />;
    case 'wallet':
    case 'wallets':
      return <Wallet className={className} style={style} />;
    case 'bags':
    case 'bag':
    case 'shoppingbag':
      return <ShoppingBag className={className} style={style} />;
    case 'briefcase':
      return <Briefcase className={className} style={style} />;
    case 'sparkles':
      return <Sparkles className={className} style={style} />;
    case 'crown':
      return <Crown className={className} style={style} />;
    case 'tag':
      return <Tag className={className} style={style} />;
    case 'layers':
      return <Layers className={className} style={style} />;
    case 'flame':
      return <Flame className={className} style={style} />;
    default:
      return <LayoutGrid className={className} style={style} />;
  }
};
