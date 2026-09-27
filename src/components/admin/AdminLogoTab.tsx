import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { LogoSettings, WebsiteCustomization } from '../../types';
import { KhoromLogo } from '../KhoromLogo';
import {
  Upload,
  RotateCcw,
  Save,
  CheckCircle2,
  Sliders,
  Maximize2,
  Move,
  Type,
  Eye,
  Image as ImageIcon,
  Lock,
  Unlock,
  AlertCircle,
} from 'lucide-react';

const DEFAULT_LOGO_SETTINGS: LogoSettings = {
  imageUrl: '/khorom-logo.jpg',
  width: 44,
  height: 44,
  scale: 1,
  alignment: 'left',
  offsetX: 0,
  offsetY: 0,
  showText: true,
  textBn: 'খড়ম',
  textEn: 'Khorom',
  subtextBn: 'Fabrics & Footwear • জেন্টস কালেকশন',
  subtextEn: 'Fabrics & Footwear • Gents Collection',
};

export const AdminLogoTab: React.FC = () => {
  const { customization, updateCustomization, language, showToast } = useStore();

  const [settings, setSettings] = useState<LogoSettings>(() => {
    return customization?.logoSettings || DEFAULT_LOGO_SETTINGS;
  });

  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [activePreviewSurface, setActivePreviewSurface] = useState<'navy' | 'ivory' | 'white'>('navy');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (customization?.logoSettings) {
      setSettings(customization.logoSettings);
      if (customization.logoSettings.width && customization.logoSettings.height) {
        setAspectRatio(customization.logoSettings.width / customization.logoSettings.height);
      }
    }
  }, [customization]);

  // Handle Dimension changes with aspect ratio lock
  const handleWidthChange = (val: number) => {
    setSettings((prev) => {
      const newWidth = Math.max(28, Math.min(val, 280));
      const newHeight = lockAspectRatio && aspectRatio > 0
        ? Math.round(newWidth / aspectRatio)
        : prev.height || 44;
      return { ...prev, width: newWidth, height: newHeight };
    });
  };

  const handleHeightChange = (val: number) => {
    setSettings((prev) => {
      const newHeight = Math.max(28, Math.min(val, 140));
      const newWidth = lockAspectRatio && aspectRatio > 0
        ? Math.round(newHeight * aspectRatio)
        : prev.width || 44;
      return { ...prev, width: newWidth, height: newHeight };
    });
  };

  // Preset size shortcuts
  const applyPresetSize = (w: number, h: number, label: string) => {
    setSettings((prev) => ({
      ...prev,
      width: w,
      height: h,
      scale: 1,
    }));
    setAspectRatio(w / h);
    showToast(
      language === 'bn' ? `${label} সাইজ প্রিভিউতে প্রয়োগ হয়েছে` : `${label} preset applied to preview`,
      'info'
    );
  };

  // File Upload Handler (FileReader to DataURL)
  const processUploadedFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast(
        language === 'bn' ? 'অনুগ্রহ করে একটি ছবি ফাইল নির্বাচন করুন' : 'Please select an image file',
        'error'
      );
      return;
    }

    // Limit to 4MB for high-res logo
    if (file.size > 4 * 1024 * 1024) {
      showToast(
        language === 'bn' ? 'ছবির সাইজ ৪MB এর কম হতে হবে' : 'Image size must be under 4MB',
        'error'
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        // Load image to detect natural aspect ratio
        const img = new Image();
        img.onload = () => {
          const natW = img.naturalWidth;
          const natH = img.naturalHeight;
          const ratio = natW > 0 && natH > 0 ? natW / natH : 1;
          setAspectRatio(ratio);

          // Proportional initial dimensions (clamp max width 90px)
          const initH = 44;
          const initW = Math.round(initH * ratio);

          setSettings((prev) => ({
            ...prev,
            imageUrl: result,
            width: initW,
            height: initH,
          }));

          showToast(
            language === 'bn'
              ? 'নতুন লোগো আপলোড হয়েছে! সেভ করার পূর্বে প্রিভিউ চেক করুন।'
              : 'New logo uploaded! Check the preview below before saving.',
            'success'
          );
        };
        img.src = result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processUploadedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processUploadedFile(file);
  };

  // Apply custom URL
  const handleApplyUrl = () => {
    if (!imageUrlInput.trim()) return;
    setSettings((prev) => ({
      ...prev,
      imageUrl: imageUrlInput.trim(),
    }));
    setImageUrlInput('');
    showToast(
      language === 'bn' ? 'লোগো URL প্রিভিউতে যুক্ত হয়েছে' : 'Logo URL linked to preview',
      'info'
    );
  };

  // Restore Default Logo
  const handleRestoreDefault = () => {
    if (
      window.confirm(
        language === 'bn'
          ? 'আপনি কি নিশ্চিত যে আসল KHOROM লোগো ও ডিফল্ট সেটিংস রিস্টোর করতে চান?'
          : 'Are you sure you want to restore the official KHOROM default logo?'
      )
    ) {
      setSettings(DEFAULT_LOGO_SETTINGS);
      setAspectRatio(1);
      showToast(
        language === 'bn' ? 'অফিসিয়াল KHOROM লোগো রিস্টোর হয়েছে' : 'Official KHOROM logo restored',
        'info'
      );
    }
  };

  // Save Settings
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates: Partial<WebsiteCustomization> = {
        logoSettings: settings,
        logoImageUrl: settings.imageUrl || '/khorom-logo.jpg',
      };
      await updateCustomization(updates);
      showToast(
        language === 'bn'
          ? 'লোগো সেটিংস সফলভাবে সেভ ও ওয়েবসাইটে প্রতিফলিত হয়েছে!'
          : 'Logo settings successfully saved and applied to entire website!',
        'success'
      );
    } catch (err) {
      console.error('Failed to save logo settings:', err);
      showToast(
        language === 'bn' ? 'লোগো সেভ করতে ত্রুটি হয়েছে' : 'Failed to save logo settings',
        'error'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const isUsingDefault =
    !settings.imageUrl || settings.imageUrl === '/khorom-logo.jpg';

  return (
    <div className="space-y-6 text-[#1C1C1C]">
      {/* Top Banner & Actions */}
      <div className="bg-[#0B1F33] text-[#F7F4EE] p-4 sm:p-5 rounded-xl border border-[#C6A15B]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#C6A15B]" />
            <h3 className="text-base sm:text-lg font-bold font-serif tracking-tight text-[#F7F4EE]">
              {language === 'bn' ? 'লোগো ম্যানেজমেন্ট ও ব্র্যান্ড কন্ট্রোল' : 'Logo Management & Brand Control'}
            </h3>
          </div>
          <p className="text-xs text-[#C5BEB3] mt-1 max-w-xl leading-relaxed">
            {language === 'bn'
              ? 'খড়ম এর অফিসিয়াল লোগো পরিবর্তন, আকার, প্রস্থ/উচ্চতা ও পজিশন সমন্বয় করুন। যেকোনো পরিবর্তন সাথে সাথে হেডার ও ইনভয়েসে প্রযোজ্য হবে।'
              : 'Customize the official KHOROM brand emblem, dimensions, scale, and alignment. Stored centrally in database and applied everywhere.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            id="restore-default-logo-btn"
            onClick={handleRestoreDefault}
            className="px-3.5 py-2 rounded-md bg-[#14263B] hover:bg-[#1E3652] text-[#E5DFD3] hover:text-white border border-[#2A405A] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Restore original KHOROM logo"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#C6A15B]" />
            <span>{language === 'bn' ? 'ডিফল্ট রিস্টোর' : 'Restore Default'}</span>
          </button>

          <button
            type="button"
            id="save-logo-settings-btn"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 rounded-md bg-[#C6A15B] hover:bg-[#B8924A] text-[#0B1F33] border border-[#C6A15B] font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>
              {isSaving
                ? language === 'bn' ? 'সেভ হচ্ছে...' : 'Saving...'
                : language === 'bn' ? 'লোগো সেভ করুন' : 'Save Changes'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Grid: Controls Left, Live Preview Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload & Dimension & Alignment Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Upload or Replace Logo */}
          <div className="bg-[#FFFFFF] p-4 sm:p-5 rounded-xl border border-[#E5DFD3] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-2.5">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#C6A15B]" />
                <h4 className="text-sm font-bold text-[#0B1F33] uppercase tracking-wide">
                  {language === 'bn' ? '১. লোগো আপলোড ও প্রতিস্থাপন' : '1. Upload or Replace Logo'}
                </h4>
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-sm border ${
                isUsingDefault
                  ? 'bg-[#F7F4EE] text-[#0B1F33] border-[#E5DFD3]'
                  : 'bg-[#C6A15B]/20 text-[#0B1F33] border-[#C6A15B]/40'
              }`}>
                {isUsingDefault
                  ? language === 'bn' ? 'অফিসিয়াল KHOROM লোগো' : 'Official KHOROM Logo'
                  : language === 'bn' ? 'কাস্টম লোগো সক্রিয়' : 'Custom Logo Active'}
              </span>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#C6A15B] bg-[#C6A15B]/10'
                  : 'border-[#DCD6C9] hover:border-[#C6A15B] bg-[#F7F4EE]/50 hover:bg-[#F7F4EE]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-10 h-10 rounded-full bg-[#0B1F33]/10 text-[#0B1F33] flex items-center justify-center mx-auto mb-2">
                <Upload className="w-5 h-5 text-[#C6A15B]" />
              </div>
              <p className="text-xs font-bold text-[#0B1F33]">
                {language === 'bn' ? 'নতুন লোগো আপলোড করতে ক্লিক করুন বা ড্র্যাগ করুন' : 'Click or drag & drop to upload new logo'}
              </p>
              <p className="text-[11px] text-[#6B655B] mt-1">
                PNG, JPG, WebP, SVG • সর্বোচ্চ ৪MB
              </p>
            </div>

            {/* URL input fallback */}
            <div className="pt-1">
              <label className="text-[11px] font-semibold text-[#6B655B] block mb-1">
                {language === 'bn' ? 'অথবা সরাসরি ছবির URL দিন:' : 'Or enter direct image URL:'}
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="flex-1 text-xs px-3 py-1.5 rounded-md border border-[#DCD6C9] bg-[#FFFFFF] text-[#1C1C1C] focus:border-[#C6A15B] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  disabled={!imageUrlInput.trim()}
                  className="px-3 py-1.5 rounded-md bg-[#0B1F33] hover:bg-[#14263B] text-[#F7F4EE] text-xs font-semibold disabled:opacity-40 cursor-pointer"
                >
                  {language === 'bn' ? 'প্রয়োগ' : 'Apply'}
                </button>
              </div>
            </div>
          </div>

          {/* 2. Adjust Logo Size & Dimensions */}
          <div className="bg-[#FFFFFF] p-4 sm:p-5 rounded-xl border border-[#E5DFD3] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-2.5">
              <div className="flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-[#C6A15B]" />
                <h4 className="text-sm font-bold text-[#0B1F33] uppercase tracking-wide">
                  {language === 'bn' ? '২. সাইজ, প্রস্থ ও উচ্চতা সমন্বয়' : '2. Size, Width & Height Control'}
                </h4>
              </div>

              {/* Aspect Ratio Lock Toggle */}
              <button
                type="button"
                onClick={() => setLockAspectRatio(!lockAspectRatio)}
                className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-md border transition-colors cursor-pointer ${
                  lockAspectRatio
                    ? 'bg-[#0B1F33] text-[#F7F4EE] border-[#0B1F33]'
                    : 'bg-[#F7F4EE] text-[#6B655B] border-[#DCD6C9]'
                }`}
                title="Lock proportional aspect ratio"
              >
                {lockAspectRatio ? <Lock className="w-3 h-3 text-[#C6A15B]" /> : <Unlock className="w-3 h-3" />}
                <span>{language === 'bn' ? 'অনুপাত লক' : 'Lock Ratio'}</span>
              </button>
            </div>

            {/* Quick Size Presets */}
            <div>
              <label className="text-xs font-semibold text-[#6B655B] block mb-1.5">
                {language === 'bn' ? 'কুইক সাইজ প্রিসেট:' : 'Quick Size Presets:'}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { w: 36, h: 36, label: 'Compact' },
                  { w: 44, h: 44, label: 'Standard' },
                  { w: 56, h: 56, label: 'Prominent' },
                  { w: 72, h: 72, label: 'Bespoke' },
                ].map((p) => {
                  const isCur = settings.width === p.w && settings.height === p.h;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => applyPresetSize(p.w, p.h, p.label)}
                      className={`px-2 py-1.5 rounded-md text-xs font-semibold border transition-all cursor-pointer text-center ${
                        isCur
                          ? 'bg-[#0B1F33] text-[#C6A15B] border-[#0B1F33]'
                          : 'bg-[#F7F4EE] hover:bg-[#EBE5D8] text-[#1C1C1C] border-[#DCD6C9]'
                      }`}
                    >
                      <div className="font-bold">{p.label}</div>
                      <div className="text-[10px] opacity-80">{p.w}x{p.h}px</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Granular Sliders: Width & Height */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-[#1C1C1C]">{language === 'bn' ? 'প্রস্থ (Width)' : 'Width'}</span>
                  <span className="font-mono text-[#0B1F33] font-bold">{settings.width || 44}px</span>
                </div>
                <input
                  type="range"
                  min="28"
                  max="240"
                  value={settings.width || 44}
                  onChange={(e) => handleWidthChange(Number(e.target.value))}
                  className="w-full accent-[#C6A15B] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-[#1C1C1C]">{language === 'bn' ? 'উচ্চতা (Height)' : 'Height'}</span>
                  <span className="font-mono text-[#0B1F33] font-bold">{settings.height || 44}px</span>
                </div>
                <input
                  type="range"
                  min="28"
                  max="120"
                  value={settings.height || 44}
                  onChange={(e) => handleHeightChange(Number(e.target.value))}
                  className="w-full accent-[#C6A15B] cursor-pointer"
                />
              </div>
            </div>

            {/* Granular Scale Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-[#1C1C1C]">{language === 'bn' ? 'স্কেল পরিবর্ধন (Scale Multiplier)' : 'Fine Scale Multiplier'}</span>
                <span className="font-mono text-[#0B1F33] font-bold">{settings.scale ?? 1}x</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.5"
                step="0.05"
                value={settings.scale ?? 1}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, scale: Number(e.target.value) }))
                }
                className="w-full accent-[#C6A15B] cursor-pointer"
              />
            </div>
          </div>

          {/* 3. Adjust Position & Alignment */}
          <div className="bg-[#FFFFFF] p-4 sm:p-5 rounded-xl border border-[#E5DFD3] shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E5DFD3] pb-2.5">
              <Move className="w-4 h-4 text-[#C6A15B]" />
              <h4 className="text-sm font-bold text-[#0B1F33] uppercase tracking-wide">
                {language === 'bn' ? '৩. পজিশন ও অ্যালাইনমেন্ট সমন্বয়' : '3. Position & Alignment Control'}
              </h4>
            </div>

            {/* Alignment Buttons */}
            <div>
              <label className="text-xs font-semibold text-[#6B655B] block mb-1.5">
                {language === 'bn' ? 'লোগো অ্যালাইনমেন্ট:' : 'Emblem Alignment:'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'left', labelBn: 'বামে (Left)', labelEn: 'Left' },
                  { id: 'center', labelBn: 'কেন্দ্রে (Center)', labelEn: 'Center' },
                  { id: 'right', labelBn: 'ডানে (Right)', labelEn: 'Right' },
                ].map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({ ...prev, alignment: a.id as any }))
                    }
                    className={`py-1.5 px-3 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                      settings.alignment === a.id
                        ? 'bg-[#0B1F33] text-[#C6A15B] border-[#0B1F33]'
                        : 'bg-[#F7F4EE] hover:bg-[#EBE5D8] text-[#1C1C1C] border-[#DCD6C9]'
                    }`}
                  >
                    {language === 'bn' ? a.labelBn : a.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Offset Sliders (X & Y) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-[#1C1C1C]">{language === 'bn' ? 'অনুভূমিক অফসেট (X Offset)' : 'Horizontal Offset (X)'}</span>
                  <span className="font-mono text-[#0B1F33] font-bold">{settings.offsetX || 0}px</span>
                </div>
                <input
                  type="range"
                  min="-40"
                  max="40"
                  value={settings.offsetX || 0}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, offsetX: Number(e.target.value) }))
                  }
                  className="w-full accent-[#C6A15B] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-[#1C1C1C]">{language === 'bn' ? 'উল্লম্ব অফসেট (Y Offset)' : 'Vertical Offset (Y)'}</span>
                  <span className="font-mono text-[#0B1F33] font-bold">{settings.offsetY || 0}px</span>
                </div>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  value={settings.offsetY || 0}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, offsetY: Number(e.target.value) }))
                  }
                  className="w-full accent-[#C6A15B] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* 4. Brand Typography & Text Controls */}
          <div className="bg-[#FFFFFF] p-4 sm:p-5 rounded-xl border border-[#E5DFD3] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-2.5">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-[#C6A15B]" />
                <h4 className="text-sm font-bold text-[#0B1F33] uppercase tracking-wide">
                  {language === 'bn' ? '৪. ব্র্যান্ড টেক্সট লকআপ' : '4. Brand Text Lockup'}
                </h4>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showText ?? true}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, showText: e.target.checked }))
                  }
                  className="rounded text-[#C6A15B] focus:ring-[#C6A15B] accent-[#C6A15B]"
                />
                <span className="text-xs font-bold text-[#0B1F33]">
                  {language === 'bn' ? 'টেক্সট প্রদর্শন করুন' : 'Show Text'}
                </span>
              </label>
            </div>

            {settings.showText !== false && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#6B655B] block mb-1">
                    {language === 'bn' ? 'বাংলা ব্র্যান্ড নাম:' : 'Bangla Brand Name:'}
                  </label>
                  <input
                    type="text"
                    value={settings.textBn || 'খড়ম'}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, textBn: e.target.value }))
                    }
                    className="w-full text-xs px-3 py-1.5 rounded-md border border-[#DCD6C9] bg-[#FFFFFF] text-[#1C1C1C] focus:border-[#C6A15B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#6B655B] block mb-1">
                    {language === 'bn' ? 'ইংরেজি ব্র্যান্ড নাম:' : 'English Brand Name:'}
                  </label>
                  <input
                    type="text"
                    value={settings.textEn || 'Khorom'}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, textEn: e.target.value }))
                    }
                    className="w-full text-xs px-3 py-1.5 rounded-md border border-[#DCD6C9] bg-[#FFFFFF] text-[#1C1C1C] focus:border-[#C6A15B] focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Multi-Surface Previews (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-[#FFFFFF] p-4 sm:p-5 rounded-xl border border-[#E5DFD3] shadow-xs sticky top-20 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-2.5">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#C6A15B]" />
                <h4 className="text-sm font-bold text-[#0B1F33] uppercase tracking-wide">
                  {language === 'bn' ? 'লাইভ প্রিভিউ (রিয়েল-টাইম)' : 'Live Multi-Surface Preview'}
                </h4>
              </div>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live
              </span>
            </div>

            {/* Surface Switcher Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-[#F7F4EE] p-1 rounded-lg border border-[#E5DFD3]">
              <button
                type="button"
                onClick={() => setActivePreviewSurface('navy')}
                className={`py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                  activePreviewSurface === 'navy'
                    ? 'bg-[#0B1F33] text-[#F7F4EE] shadow-xs'
                    : 'text-[#6B655B] hover:text-[#0B1F33]'
                }`}
              >
                {language === 'bn' ? 'হেডার (Navy)' : 'Header (Navy)'}
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewSurface('ivory')}
                className={`py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                  activePreviewSurface === 'ivory'
                    ? 'bg-[#F7F4EE] text-[#0B1F33] border border-[#C6A15B] shadow-xs'
                    : 'text-[#6B655B] hover:text-[#0B1F33]'
                }`}
              >
                {language === 'bn' ? 'স্টোরফ্রন্ট (Ivory)' : 'Storefront (Ivory)'}
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewSurface('white')}
                className={`py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                  activePreviewSurface === 'white'
                    ? 'bg-[#FFFFFF] text-[#0B1F33] border border-[#E5DFD3] shadow-xs'
                    : 'text-[#6B655B] hover:text-[#0B1F33]'
                }`}
              >
                {language === 'bn' ? 'ইনভয়েস (White)' : 'Invoice (White)'}
              </button>
            </div>

            {/* Surface Preview Canvas */}
            <div className="rounded-xl border border-[#E5DFD3] overflow-hidden shadow-inner">
              {activePreviewSurface === 'navy' && (
                <div className="bg-[#0B1F33] p-6 text-[#F7F4EE] min-h-[140px] flex items-center justify-center border-t-2 border-[#C6A15B]">
                  <KhoromLogo previewSettings={settings} textColor="light" />
                </div>
              )}

              {activePreviewSurface === 'ivory' && (
                <div className="bg-[#F7F4EE] p-6 text-[#1C1C1C] min-h-[140px] flex items-center justify-center">
                  <KhoromLogo previewSettings={settings} textColor="dark" />
                </div>
              )}

              {activePreviewSurface === 'white' && (
                <div className="bg-[#FFFFFF] p-6 text-[#1C1C1C] min-h-[140px] flex items-center justify-center border border-dashed border-[#E5DFD3]">
                  <KhoromLogo previewSettings={settings} textColor="dark" />
                </div>
              )}
            </div>

            {/* Specifications Summary Card */}
            <div className="bg-[#F7F4EE] p-3 rounded-lg border border-[#E5DFD3] text-xs space-y-1.5">
              <div className="text-[#6B655B] font-bold uppercase tracking-wider text-[10px]">
                {language === 'bn' ? 'বর্তমান কনফিগারেশন স্পেক্স:' : 'Current Configuration Specs:'}
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[#6B655B]">{language === 'bn' ? 'ডাইমেনশন:' : 'Dimensions:'} </span>
                  <span className="font-bold text-[#0B1F33]">{settings.width || 44} × {settings.height || 44}px</span>
                </div>
                <div>
                  <span className="text-[#6B655B]">{language === 'bn' ? 'স্কেল ফ্যাক্টর:' : 'Scale Factor:'} </span>
                  <span className="font-bold text-[#0B1F33]">{settings.scale ?? 1}x</span>
                </div>
                <div>
                  <span className="text-[#6B655B]">{language === 'bn' ? 'পজিশন অফসেট:' : 'Offset:'} </span>
                  <span className="font-bold text-[#0B1F33]">X:{settings.offsetX || 0}px, Y:{settings.offsetY || 0}px</span>
                </div>
                <div>
                  <span className="text-[#6B655B]">{language === 'bn' ? 'অ্যালাইনমেন্ট:' : 'Alignment:'} </span>
                  <span className="font-bold text-[#0B1F33] capitalize">{settings.alignment || 'left'}</span>
                </div>
              </div>
            </div>

            {/* Notice */}
            <div className="flex items-start gap-2 text-[11px] text-[#6B655B] bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/80">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p>
                {language === 'bn'
                  ? 'উপরে "লোগো সেভ করুন" বোতাম চাপলে সমস্ত পরিবর্তন স্বয়ংক্রিয়ভাবে ক্লাউড ডাটাবেজে পার্মানেন্টলি সংরক্ষিত হবে।'
                  : 'Clicking "Save Changes" above permanently stores configuration to Firebase and updates every customer view instantly.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
