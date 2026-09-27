import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { LogoSettings } from '../types';

export interface KhoromLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: 'dark' | 'light';
  previewSettings?: LogoSettings;
}

export const KhoromLogo: React.FC<KhoromLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  textColor = 'dark',
  previewSettings,
}) => {
  const { customization, language } = useStore();
  const [imageLoaded, setImageLoaded] = useState(true);

  const activeSettings = previewSettings || customization?.logoSettings;
  const logoSrc = activeSettings?.imageUrl || customization?.logoImageUrl || '/khorom-logo.jpg';

  // Dimension helpers
  const sizeMap = {
    sm: { img: 'w-8 h-8 sm:w-9 sm:h-9', title: 'text-sm sm:text-base', sub: 'text-[8px] sm:text-[9px]' },
    md: { img: 'w-10 h-10 sm:w-11 sm:h-11', title: 'text-lg sm:text-xl', sub: 'text-[9px] sm:text-[10px]' },
    lg: { img: 'w-14 h-14 sm:w-16 sm:h-16', title: 'text-xl sm:text-2xl', sub: 'text-[11px] sm:text-xs' },
    xl: { img: 'w-20 h-20 sm:w-24 sm:h-24', title: 'text-2xl sm:text-3xl', sub: 'text-xs sm:text-sm' },
  };

  const currentSize = sizeMap[size];

  // Custom dimensional overrides from admin settings
  const customWidth = activeSettings?.width;
  const customHeight = activeSettings?.height;
  const customScale = activeSettings?.scale ?? 1;
  const customOffsetX = activeSettings?.offsetX ?? 0;
  const customOffsetY = activeSettings?.offsetY ?? 0;
  const alignment = activeSettings?.alignment || 'left';

  const shouldShowText = showText && (activeSettings?.showText ?? true);
  const textBn = activeSettings?.textBn || 'খড়ম';
  const textEn = activeSettings?.textEn || 'Khorom';
  const subtextBn = activeSettings?.subtextBn || 'Fabrics & Footwear • জেন্টস কালেকশন';
  const subtextEn = activeSettings?.subtextEn || 'Fabrics & Footwear • Gents Collection';

  // Alignment classes
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  }[alignment];

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${alignClasses} ${className}`}>
      {/* Official Logo Emblem - preserved with exact ratio and no distortion */}
      <div
        className="relative group shrink-0 transition-transform duration-200"
        style={{
          transform: `translate(${customOffsetX}px, ${customOffsetY}px) scale(${customScale})`,
          transformOrigin: alignment === 'center' ? 'center center' : alignment === 'right' ? 'right center' : 'left center',
        }}
      >
        <div
          className={`${
            customWidth && customHeight ? '' : currentSize.img
          } rounded-xl bg-white p-1 shadow-sm border border-[#E5DFD3]/80 overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-md group-hover:border-[#C6A15B]/50`}
          style={
            customWidth && customHeight
              ? { width: `${customWidth}px`, height: `${customHeight}px` }
              : undefined
          }
        >
          {imageLoaded ? (
            <img
              src={logoSrc}
              alt="খড়ম - Khorom Logo"
              className="w-full h-full object-contain object-center"
              onError={() => setImageLoaded(false)}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full rounded-lg bg-[#0B1F33] flex flex-col items-center justify-center text-[#F7F4EE]">
              <span className="font-serif font-black text-[#C6A15B] text-xs tracking-wider">খড়ম</span>
            </div>
          )}
        </div>
      </div>

      {/* Brand Text Lockup */}
      {shouldShowText && (
        <div className="leading-tight">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight font-serif ${currentSize.title} ${
                textColor === 'light' ? 'text-[#F7F4EE]' : 'text-[#0B1F33]'
              }`}
            >
              {textBn}
            </span>
            <span
              className={`font-sans font-bold text-[10px] sm:text-xs uppercase tracking-widest px-1.5 py-0.5 rounded-sm ${
                textColor === 'light'
                  ? 'bg-[#C6A15B]/20 text-[#C6A15B] border border-[#C6A15B]/40'
                  : 'bg-[#0B1F33] text-[#F7F4EE] border border-[#0B1F33]'
              }`}
            >
              {textEn}
            </span>
          </div>
          <p
            className={`font-medium tracking-wider uppercase mt-0.5 ${currentSize.sub} ${
              textColor === 'light' ? 'text-[#C5BEB3]' : 'text-[#6B655B]'
            }`}
          >
            {language === 'bn' ? subtextBn : subtextEn}
          </p>
        </div>
      )}
    </div>
  );
};

