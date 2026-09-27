import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { AdminPositionEditorModal } from './AdminPositionEditorModal';
import { compressImageFile } from '../../lib/imageCompressor';
import { CATEGORIES_DATA } from '../../data/categories';
import {
  Package,
  Plus,
  Search,
  Trash2,
  Edit,
  SlidersHorizontal,
  Upload,
  ImagePlus,
  X,
  CheckCircle2,
  Tag,
  Palette,
  Ruler,
  AlertCircle,
  FileText,
  Loader2,
  Eye,
  EyeOff,
  Check,
  Save,
  Coins,
} from 'lucide-react';

const BASIC_COLORS = [
  { nameBn: 'রেড (লাল)', nameEn: 'Red', hex: '#DC2626' },
  { nameBn: 'ব্লু (নীল)', nameEn: 'Blue', hex: '#2563EB' },
  { nameBn: 'নেভি ব্লু (Navy)', nameEn: 'Navy Blue', hex: '#1E3A8A' },
  { nameBn: 'ব্ল্যাক (কালো)', nameEn: 'Black', hex: '#111827' },
  { nameBn: 'হোয়াইট (সাদা)', nameEn: 'White', hex: '#FFFFFF', isLight: true },
  { nameBn: 'ব্রাউন (বাদামী)', nameEn: 'Brown', hex: '#78350F' },
  { nameBn: 'মেরুন (Maroon)', nameEn: 'Maroon', hex: '#881337' },
  { nameBn: 'অলিভ (সবুজ)', nameEn: 'Olive Green', hex: '#15803D' },
  { nameBn: 'গ্রে (ধূসর)', nameEn: 'Grey', hex: '#4B5563' },
  { nameBn: 'ট্যান (Tan)', nameEn: 'Tan', hex: '#B45309' },
];

const WAIST_SIZES = ['28', '29', '30', '31', '32', '33', '34', '36', '38'];
const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];
const FOOTWEAR_SIZES = ['38', '39', '40', '41', '42', '43', '44', '45'];

interface SpecRow {
  id: string;
  key: string;
  value: string;
}

export const AdminProductsTab: React.FC = () => {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductPublished,
    language,
    formatPrice,
    showToast,
  } = useStore();

  const [productSearch, setProductSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [isPositionModalOpen, setIsPositionModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [nameBn, setNameBn] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [descBn, setDescBn] = useState('');
  const [descEn, setDescEn] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [category, setCategory] = useState('clothing');
  const [subcategory, setSubcategory] = useState('shirt');
  const [itemType, setItemType] = useState('');
  const [realPrice, setRealPrice] = useState<number | string>(2450);
  const [discountPrice, setDiscountPrice] = useState<number | string>('');
  const [stockCount, setStockCount] = useState<number | string>(20);
  const [isPreOrder, setIsPreOrder] = useState<boolean>(false);
  const [bonusCoinsEnabled, setBonusCoinsEnabled] = useState<boolean>(false);
  const [bonusCoins, setBonusCoins] = useState<number | string>('');
  const [productStatus, setProductStatus] = useState<'published' | 'draft' | 'disabled'>('published');
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['M', 'L', 'XL', 'XXL', '3XL']);
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [selectedColors, setSelectedColors] = useState<{ name: string; hex: string }[]>([
    { name: 'Black', hex: '#111827' },
    { name: 'Red', hex: '#DC2626' },
    { name: 'Blue', hex: '#2563EB' },
  ]);

  // Dynamic Specifications State - NO hardcoded default values
  const [specificationsList, setSpecificationsList] = useState<SpecRow[]>([]);
  const [isCompressingImages, setIsCompressingImages] = useState(false);

  const activeCatData = CATEGORIES_DATA.find(
    (c) => c.id === category || (category === 'footwear' && c.id === 'shoes') || (category === 'shoes' && c.id === 'shoes')
  );
  const activeSubcategories = activeCatData?.subcategories || [];
  const activeSubcatData = activeSubcategories.find((s) => s.id === subcategory);
  const availableTypes = activeSubcatData?.types || [];

  // Safe handler on focus: preserve standard mobile browser viewport without disruptive scroll jumps
  const handleFieldFocus = () => {
    // Native viewport behavior is preserved to prevent jumping while typing with Bengali or mobile keyboards
  };

  // Open modal for adding a brand-new product
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setNameBn('');
    setNameEn('');
    setDescBn('');
    setDescEn('');
    setImages([]);
    setCategory('clothing');
    setSubcategory('shirt');
    setItemType('');
    setRealPrice(2450);
    setDiscountPrice('');
    setStockCount(20);
    setIsPreOrder(false);
    setBonusCoinsEnabled(false);
    setBonusCoins('');
    setProductStatus('published');
    setSelectedSizes(['M', 'L', 'XL', 'XXL', '3XL']);
    setCustomSizeInput('');
    setSelectedColors([
      { name: 'Black', hex: '#111827' },
      { name: 'Red', hex: '#DC2626' },
      { name: 'Blue', hex: '#2563EB' },
    ]);
    setSpecificationsList([]);
    setIsFormModalOpen(true);
  };

  // Open modal for editing an existing product
  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setNameBn(prod.titleBn || '');
    setNameEn(prod.titleEn || '');
    setDescBn(prod.descriptionBn || '');
    setDescEn(prod.descriptionEn || '');
    setImages(prod.images && prod.images.length > 0 ? prod.images : prod.image ? [prod.image] : []);
    setCategory(prod.category || 'clothing');
    setSubcategory(prod.subcategory || prod.subcategoryId || '');
    setItemType(prod.itemType || '');

    const regularP = prod.realPrice ?? prod.originalPrice ?? prod.price;
    setRealPrice(regularP || 0);

    const discP =
      prod.discountPrice !== undefined && prod.discountPrice !== null
        ? prod.discountPrice
        : prod.originalPrice && prod.price < prod.originalPrice
        ? prod.price
        : '';
    setDiscountPrice(discP);

    setStockCount(prod.stockCount ?? prod.stock ?? 0);
    setIsPreOrder(!!prod.isPreOrder);
    setBonusCoinsEnabled(!!prod.bonusCoinsEnabled);
    setBonusCoins(prod.bonusCoins !== undefined && prod.bonusCoins !== null ? prod.bonusCoins : '');
    setProductStatus(prod.status || (prod.published === false ? 'draft' : 'published'));
    setSelectedSizes(prod.sizes || []);
    setCustomSizeInput('');
    setSelectedColors(prod.colors || []);

    if (prod.specifications && Object.keys(prod.specifications).length > 0) {
      const rows: SpecRow[] = Object.entries(prod.specifications).map(([k, v], idx) => ({
        id: `spec-${Date.now()}-${idx}`,
        key: k,
        value: v,
      }));
      setSpecificationsList(rows);
    } else {
      setSpecificationsList([]);
    }

    setIsFormModalOpen(true);
  };

  // Specification helpers
  const handleAddSpecRow = (presetKey = '', presetValue = '') => {
    setSpecificationsList((prev) => [
      ...prev,
      { id: `spec-${Date.now()}-${Math.random()}`, key: presetKey, value: presetValue },
    ]);
  };

  const handleUpdateSpecRow = (id: string, field: 'key' | 'value', value: string) => {
    setSpecificationsList((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const handleDeleteSpecRow = (id: string) => {
    setSpecificationsList((prev) => prev.filter((row) => row.id !== id));
  };

  // Images with client-side compression for mobile performance & Firestore 1MB limits
  const handleImageFiles = async (files: FileList | File[]) => {
    const fileList = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (fileList.length === 0) return;

    setIsCompressingImages(true);
    try {
      for (const file of fileList) {
        try {
          const compressedDataUrl = await compressImageFile(file, 1200, 0.82);
          if (compressedDataUrl) {
            setImages((prev) => [...prev, compressedDataUrl]);
          }
        } catch (compressErr) {
          console.warn('Image compression warning, falling back to direct reader:', compressErr);
          const reader = new FileReader();
          reader.onload = (e) => {
            const res = e.target?.result as string;
            if (res) setImages((prev) => [...prev, res]);
          };
          reader.readAsDataURL(file);
        }
      }
    } finally {
      setIsCompressingImages(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAddSamplePhotos = (cat: string) => {
    const samples: Record<string, string[]> = {
      shoes: [
        'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80',
      ],
      clothing: [
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop&q=80',
      ],
      watches: [
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80',
      ],
      sunglasses: [
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80',
      ],
      wallets: [
        'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
      ],
    };
    const toAdd = samples[cat] || samples.clothing;
    setImages((prev) => [...prev, ...toAdd]);
  };

  const toggleSize = (sizeId: string) => {
    setSelectedSizes((prev) =>
      prev.includes(sizeId) ? prev.filter((s) => s !== sizeId) : [...prev, sizeId]
    );
  };

  const handleAddCustomSize = () => {
    const trimmed = customSizeInput.trim().toUpperCase();
    if (!trimmed) return;
    if (!selectedSizes.includes(trimmed)) {
      setSelectedSizes((prev) => [...prev, trimmed]);
    }
    setCustomSizeInput('');
  };

  const toggleColor = (c: { nameBn: string; nameEn: string; hex: string }) => {
    setSelectedColors((prev) => {
      const exists = prev.some((item) => item.name === c.nameEn);
      if (exists) {
        return prev.filter((item) => item.name !== c.nameEn);
      } else {
        return [...prev, { name: c.nameEn, hex: c.hex }];
      }
    });
  };

  // Submit Add or Edit with loading state and duplicate prevention
  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!nameBn.trim() && !nameEn.trim()) {
      showToast(language === 'bn' ? 'পণ্যের নাম পূরণ করুন' : 'Enter product name');
      return;
    }

    const numRealPrice = Number(realPrice);
    if (isNaN(numRealPrice) || numRealPrice <= 0) {
      showToast(
        language === 'bn'
          ? 'অনুগ্রহ করে সঠিক আসল মূল্য দিন (০ এর বেশি)'
          : 'Real price must be greater than 0'
      );
      return;
    }

    const numDiscount =
      discountPrice !== '' && discountPrice !== null && discountPrice !== undefined
        ? Number(discountPrice)
        : null;

    if (numDiscount !== null) {
      if (isNaN(numDiscount) || numDiscount <= 0) {
        showToast(
          language === 'bn'
            ? 'ডিসকাউন্ট মূল্য ০ এর বেশি হতে হবে'
            : 'Discount price must be greater than 0'
        );
        return;
      }
      if (numDiscount >= numRealPrice) {
        showToast(
          language === 'bn'
            ? 'ডিসকাউন্ট মূল্য অবশ্যই আসল মূল্যের চেয়ে কম হতে হবে'
            : 'Discount price must be less than regular price'
        );
        return;
      }
    }

    const numStock = Number(stockCount);
    if (isNaN(numStock) || numStock < 0) {
      showToast(
        language === 'bn'
          ? 'স্টক সংখ্যা ০ বা তার বেশি হতে হবে'
          : 'Stock quantity must be 0 or greater'
      );
      return;
    }

    const defaultImg =
      images.length > 0
        ? images[0]
        : 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80';

    const compiledSpecs: Record<string, string> = {};
    specificationsList.forEach((row) => {
      const trimmedKey = row.key.trim();
      const trimmedVal = row.value.trim();
      if (trimmedKey) {
        compiledSpecs[trimmedKey] = trimmedVal;
      }
    });

    const activeSellingPrice = numDiscount !== null && numDiscount > 0 ? numDiscount : numRealPrice;
    const activeOriginalPrice =
      numDiscount !== null && numDiscount > 0 && numDiscount < numRealPrice ? numRealPrice : undefined;

    setIsSubmitting(true);
    let safetyTimeout: any = setTimeout(() => {
      setIsSubmitting(false);
    }, 12000);

    try {
      if (editingProduct) {
        // Update existing product
        const updatedData: Partial<Product> = {
          titleBn: nameBn.trim() || nameEn.trim(),
          titleEn: nameEn.trim() || nameBn.trim(),
          descriptionBn: descBn.trim(),
          descriptionEn: descEn.trim(),
          price: activeSellingPrice,
          originalPrice: activeOriginalPrice,
          realPrice: numRealPrice,
          discountPrice: numDiscount,
          category,
          categoryId: category,
          subcategory: subcategory || '',
          subcategoryId: subcategory || '',
          itemType: itemType || '',
          image: defaultImg,
          images: images.length > 0 ? images : [defaultImg],
          stockCount: numStock,
          stock: numStock,
          inStock: numStock > 0,
          isPreOrder: numStock === 0 ? isPreOrder : false,
          published: productStatus === 'published',
          status: productStatus,
          bonusCoinsEnabled: Boolean(bonusCoinsEnabled),
          bonusCoins: bonusCoinsEnabled ? (Number(bonusCoins) || 0) : 0,
          specifications: compiledSpecs,
          sizes: selectedSizes,
          colors: selectedColors,
        };

        const success = await updateProduct(editingProduct.id, updatedData);
        if (success) {
          setIsFormModalOpen(false);
          setEditingProduct(null);
        }
      } else {
        // Add new product with idempotent unique ID
        const uniqueId = `khorom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const newProd: Product = {
          id: uniqueId,
          productId: uniqueId,
          titleBn: nameBn.trim() || nameEn.trim(),
          titleEn: nameEn.trim() || nameBn.trim(),
          descriptionBn:
            descBn.trim() || 'খড়ম এক্সক্লুসিভ জেন্টস কালেকশনের অন্তর্ভুক্ত খাঁটি ও মার্জিত পণ্য।',
          descriptionEn:
            descEn.trim() || 'Exclusive handcrafted bespoke piece from Khorom gentleman collection.',
          price: activeSellingPrice,
          originalPrice: activeOriginalPrice,
          realPrice: numRealPrice,
          discountPrice: numDiscount,
          category,
          categoryId: category,
          subcategory: subcategory || '',
          subcategoryId: subcategory || '',
          itemType: itemType || '',
          image: defaultImg,
          images: images.length > 0 ? images : [defaultImg],
          rating: 5.0,
          reviewCount: 0,
          inStock: numStock > 0,
          stockCount: numStock,
          stock: numStock,
          isPreOrder: numStock === 0 ? isPreOrder : false,
          published: productStatus === 'published',
          status: productStatus,
          bonusCoinsEnabled: Boolean(bonusCoinsEnabled),
          bonusCoins: bonusCoinsEnabled ? (Number(bonusCoins) || 0) : 0,
          isNew: true,
          position: products.length + 1,
          specifications: compiledSpecs,
          sizes: selectedSizes,
          colors: selectedColors,
          tags: ['Gents', category],
        };

        const success = await addProduct(newProd);
        if (success) {
          setIsFormModalOpen(false);
        }
      }
    } catch (err: any) {
      console.error('Product save error:', err);
      showToast(
        language === 'bn'
          ? `ত্রুটি: ${err?.message || 'পণ্য সংরক্ষণ করা যায়নি'}`
          : `Error: ${err?.message || 'Failed to save product'}`
      );
    } finally {
      clearTimeout(safetyTimeout);
      setIsSubmitting(false);
    }
  };

  const filtered = products
    .filter((p) => {
      if (selectedCategoryFilter !== 'all' && p.category !== selectedCategoryFilter) return false;
      if (!productSearch.trim()) return true;
      const q = productSearch.toLowerCase();
      return (
        p.titleBn.toLowerCase().includes(q) ||
        p.titleEn.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => (a.position ?? 9999) - (b.position ?? 9999));

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Action Header & Position Editor Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-[#0c1424] to-[#0f192d] border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-md">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white font-serif flex items-center gap-2">
            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            <span>{language === 'bn' ? 'পণ্য ও স্টক ব্যবস্থাপনা' : 'Product & Stock Management'}</span>
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
            {language === 'bn'
              ? 'প্রতিটি পণ্যের স্পেসিফিকেশন (Material, Warranty ইত্যাদি), পজিশন, মূল্য ও স্টক ডাটাবেজ থেকে নিয়ন্ত্রণ করুন।'
              : 'Manage product specifications, positions, prices, inventory, and variants directly from the database.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Position Editor */}
          <button
            id="open-position-editor-btn"
            onClick={() => setIsPositionModalOpen(true)}
            className="px-3 sm:px-3.5 py-2 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer min-h-[38px]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-200" />
            <span>{language === 'bn' ? 'পজিশন সাজান' : 'Edit Position'}</span>
          </button>

          {/* Add Product Button */}
          <button
            id="admin-add-product-btn"
            onClick={handleOpenAddModal}
            className="px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer min-h-[38px]"
          >
            <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
            <span>{language === 'bn' ? 'নতুন পণ্য যোগ করুন' : 'Add Product'}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder={language === 'bn' ? 'পণ্য বা আইডি দিয়ে খুঁজুন...' : 'Search by name or category...'}
            className="w-full pl-9 pr-3 py-2 bg-[#0c1424] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all min-h-[34px] ${
              selectedCategoryFilter === 'all'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black shadow-sm'
                : 'bg-[#0c1424] text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-300'
            }`}
          >
            {language === 'bn' ? 'সব পণ্য' : 'All'} ({products.length})
          </button>
          {categories.filter((c) => c.id !== 'all').map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategoryFilter(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all capitalize min-h-[34px] ${
                selectedCategoryFilter === c.id
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black shadow-sm'
                  : 'bg-[#0c1424] text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-300'
              }`}
            >
              {language === 'bn' ? c.nameBn : c.nameEn}
            </button>
          ))}
        </div>
      </div>

      {/* Product List: Mobile Cards (visible on mobile < md) and Desktop Table (visible on md+) */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-[#0c1424] rounded-2xl border border-slate-800 p-8 text-center text-slate-400 shadow-md">
            <Package className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-xs font-medium">
              {language === 'bn' ? 'কোনো পণ্য পাওয়া যায়নি' : 'No products match your search.'}
            </p>
          </div>
        ) : (
          filtered.map((item, idx) => {
            const specCount = item.specifications ? Object.keys(item.specifications).length : 0;
            const isPublished = item.published !== false && item.status !== 'draft' && item.status !== 'disabled';
            const currentStock = item.stockCount ?? item.stock ?? 0;

            return (
              <div
                key={`mobile-prod-${item.id}`}
                id={`mobile-product-card-${item.id}`}
                className="bg-[#0c1424] rounded-2xl border border-slate-800/90 p-3.5 space-y-3 shadow-md"
              >
                {/* Card Top: Position & Badges */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="w-6 h-6 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-400 font-black text-xs flex items-center justify-center shrink-0">
                      #{item.position ?? idx + 1}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#080d19] text-slate-300 border border-slate-800 capitalize">
                      {item.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Stock badge */}
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.inStock && currentStock > 0
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : item.isPreOrder
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {item.inStock && currentStock > 0
                        ? `${currentStock} স্টকে`
                        : item.isPreOrder
                        ? (language === 'bn' ? 'প্রি-অর্ডার' : 'Pre-order')
                        : (language === 'bn' ? 'স্টক শেষ' : 'Stock out')}
                    </span>

                    {/* Status badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        isPublished
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : item.status === 'disabled'
                          ? 'bg-slate-800 text-slate-400 border-slate-700'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isPublished ? 'bg-emerald-400' : item.status === 'disabled' ? 'bg-slate-400' : 'bg-amber-400'
                        }`}
                      />
                      <span>
                        {isPublished
                          ? (language === 'bn' ? 'প্রকাশিত' : 'Published')
                          : item.status === 'disabled'
                          ? (language === 'bn' ? 'নিষ্ক্রিয়' : 'Disabled')
                          : (language === 'bn' ? 'ড্রাফট' : 'Draft')}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Card Middle: Thumbnail & Title & Price */}
                <div className="flex items-start gap-3">
                  <img
                    src={item.image}
                    alt={item.titleEn}
                    className="w-16 h-16 rounded-xl object-cover bg-[#080d19] border border-slate-700/80 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-white text-xs sm:text-sm leading-snug break-words">
                      {language === 'bn' ? item.titleBn : item.titleEn}
                    </h4>
                    {item.titleEn && item.titleBn && item.titleEn !== item.titleBn && (
                      <p className="text-[11px] text-slate-400 leading-tight mt-0.5 line-clamp-1">
                        {language === 'bn' ? item.titleEn : item.titleBn}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-sm font-black text-amber-300">
                        {formatPrice(item.price)}
                      </span>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className="text-xs text-slate-500 line-through font-normal">
                          {formatPrice(item.originalPrice)}
                        </span>
                      )}
                      {specCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 bg-[#080d19] px-1.5 py-0.5 rounded border border-slate-800">
                          <FileText className="w-2.5 h-2.5 text-amber-400" />
                          <span>{specCount} {language === 'bn' ? 'স্পেক' : 'specs'}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Bottom: Mobile Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                  {/* Visibility Button */}
                  <button
                    onClick={() => toggleProductPublished(item.id)}
                    className={`p-2 min-h-[40px] min-w-[40px] rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center justify-center shrink-0 ${
                      isPublished
                        ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'
                    }`}
                    title={isPublished ? 'Unpublish' : 'Publish'}
                  >
                    {isPublished ? (
                      <Eye className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="flex-1 min-h-[40px] py-2 px-3 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5 text-indigo-300" />
                    <span>{language === 'bn' ? 'সম্পাদনা করুন (Edit)' : 'Edit Product'}</span>
                  </button>

                  {/* Delete Button */}
                  {deleteConfirmId === item.id ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          deleteProduct(item.id);
                          setDeleteConfirmId(null);
                        }}
                        className="px-3 py-2 min-h-[40px] rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer"
                      >
                        {language === 'bn' ? 'মুছুন' : 'Confirm'}
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2.5 py-2 min-h-[40px] rounded-xl bg-slate-800 text-slate-400 text-xs cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="p-2 min-h-[40px] min-w-[40px] rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold cursor-pointer shrink-0 flex items-center justify-center"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4 text-rose-400" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Product Table (Desktop only, md and above) */}
      <div className="hidden md:block bg-[#0c1424] rounded-2xl border border-slate-800 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070b14] text-slate-300 font-bold border-b border-slate-800">
              <tr>
                <th className="p-3.5">{language === 'bn' ? 'পজিশন' : 'Pos'}</th>
                <th className="p-3.5">{language === 'bn' ? 'পণ্য' : 'Product'}</th>
                <th className="p-3.5">{language === 'bn' ? 'ক্যাটাগরি' : 'Category'}</th>
                <th className="p-3.5">{language === 'bn' ? 'বিক্রয় মূল্য' : 'Price'}</th>
                <th className="p-3.5">{language === 'bn' ? 'স্পেসিফিকেশন' : 'Specs'}</th>
                <th className="p-3.5">{language === 'bn' ? 'স্টক' : 'Stock'}</th>
                <th className="p-3.5">{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
                <th className="p-3.5 text-right">{language === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    {language === 'bn' ? 'কোনো পণ্য পাওয়া যায়নি' : 'No products match search.'}
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => {
                  const specCount = item.specifications ? Object.keys(item.specifications).length : 0;
                  const isPublished = item.published !== false && item.status !== 'draft' && item.status !== 'disabled';
                  const currentStock = item.stockCount ?? item.stock ?? 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3.5">
                        <span className="w-7 h-7 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-400 font-bold text-xs flex items-center justify-center">
                          #{item.position ?? idx + 1}
                        </span>
                      </td>
                      <td className="p-3.5 flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.titleEn}
                          className="w-11 h-11 rounded-xl object-cover bg-[#080d19] border border-slate-700/80 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-white truncate max-w-xs">
                            {language === 'bn' ? item.titleBn : item.titleEn}
                          </div>
                          <div className="text-[10px] text-slate-500">ID: {item.id}</div>
                        </div>
                      </td>
                      <td className="p-3.5 capitalize font-medium text-slate-300">
                        {item.category}
                      </td>
                      <td className="p-3.5 font-black text-amber-300">
                        {formatPrice(item.price)}
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="block text-[10px] text-slate-500 line-through font-normal">
                            {formatPrice(item.originalPrice)}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-[11px] text-slate-400">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                            specCount > 0
                              ? 'bg-amber-400/10 text-amber-300 border-amber-400/30'
                              : 'bg-[#080d19] text-slate-400 border-slate-800'
                          }`}
                        >
                          <FileText className="w-3 h-3 text-amber-400" />
                          <span>{specCount} {language === 'bn' ? 'টি স্পেক' : 'Specs'}</span>
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.inStock && currentStock > 0
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : item.isPreOrder
                              ? 'bg-blue-950 text-blue-300 border border-blue-800'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}
                        >
                          {item.inStock && currentStock > 0
                            ? `${currentStock} স্টকে`
                            : item.isPreOrder
                            ? (language === 'bn' ? 'প্রি-অর্ডার' : 'Pre-order')
                            : (language === 'bn' ? 'স্টক শেষ' : 'Out of Stock')}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            isPublished
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : item.status === 'disabled'
                              ? 'bg-slate-800 text-slate-400 border-slate-700'
                              : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isPublished ? 'bg-emerald-400' : item.status === 'disabled' ? 'bg-slate-400' : 'bg-amber-400'
                            }`}
                          />
                          <span>
                            {isPublished
                              ? (language === 'bn' ? 'প্রকাশিত' : 'Published')
                              : item.status === 'disabled'
                              ? (language === 'bn' ? 'নিষ্ক্রিয়' : 'Disabled')
                              : (language === 'bn' ? 'ড্রাফট' : 'Draft')}
                          </span>
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Visibility Toggle Button */}
                          <button
                            onClick={() => toggleProductPublished(item.id)}
                            className={`p-1.5 rounded-lg border text-[11px] font-bold transition-colors cursor-pointer inline-flex items-center ${
                              isPublished
                                ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/30'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'
                            }`}
                            title={
                              isPublished
                                ? (language === 'bn' ? 'স্টোরফ্রন্ট থেকে লুকান (Unpublish)' : 'Unpublish from store')
                                : (language === 'bn' ? 'স্টোরফ্রন্টে প্রকাশ করুন (Publish)' : 'Publish to store')
                            }
                          >
                            {isPublished ? (
                              <Eye className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                            title="Edit Product"
                          >
                            <Edit className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{language === 'bn' ? 'এডিট' : 'Edit'}</span>
                          </button>

                          {/* Delete Button */}
                          {deleteConfirmId === item.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  deleteProduct(item.id);
                                  setDeleteConfirmId(null);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] cursor-pointer"
                              >
                                {language === 'bn' ? 'নিশ্চিত' : 'Confirm'}
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-[11px] cursor-pointer"
                              >
                                {language === 'bn' ? 'না' : 'No'}
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(item.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-[11px] font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                              <span>{language === 'bn' ? 'মুছুন' : 'Delete'}</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Position Editor Modal */}
      <AdminPositionEditorModal
        isOpen={isPositionModalOpen}
        onClose={() => setIsPositionModalOpen(false)}
      />

      {/* Add / Edit Product Modal */}
      {isFormModalOpen &&
        (typeof document !== 'undefined'
          ? createPortal(
              <div
                id="product-form-modal-backdrop"
                className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex flex-col sm:items-center sm:justify-center p-0 sm:p-6"
                onClick={() => !isSubmitting && setIsFormModalOpen(false)}
              >
                <div
                  id="product-form-modal-panel"
                  onClick={(e) => e.stopPropagation()}
                  className="bg-[#0c1424] rounded-none sm:rounded-3xl shadow-2xl max-w-3xl w-full h-full sm:h-auto sm:max-h-[92vh] flex flex-col overflow-hidden border-0 sm:border sm:border-amber-500/30 text-slate-100"
                >
                  {/* Modal Header */}
                  <div className="p-3 sm:p-4 border-b border-slate-800 flex items-center justify-between bg-[#070b14] shrink-0 gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4" />
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-white font-serif truncate">
                        {editingProduct
                          ? language === 'bn'
                            ? `পণ্য সম্পাদনা: ${editingProduct.titleBn}`
                            : `Edit Product: ${editingProduct.titleEn}`
                          : language === 'bn'
                          ? 'নতুন পণ্য যোগ করুন (Add Product)'
                          : 'Add New Product'}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Mobile Header Direct Save Button */}
                      <button
                        id="mobile-header-save-product-btn"
                        type="submit"
                        form="admin-product-form"
                        disabled={isSubmitting || isCompressingImages}
                        className="sm:hidden px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 disabled:opacity-50 cursor-pointer active:scale-95 transition-all"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Save className="w-3.5 h-3.5" />
                        )}
                        <span>{language === 'bn' ? 'সেভ' : 'Save'}</span>
                      </button>

                      <button
                        disabled={isSubmitting}
                        onClick={() => setIsFormModalOpen(false)}
                        className="w-8 h-8 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0 transition-colors"
                        aria-label="Close"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Modal Form with Sticky Action Footer */}
                  <form id="admin-product-form" onSubmit={handleSubmitProduct} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-5 pb-32 sm:pb-6 space-y-4 text-xs overscroll-contain">
                {/* Titles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">
                      {language === 'bn' ? 'পণ্যের নাম (বাংলা) *' : 'Title (Bangla) *'}
                    </label>
                    <input
                      type="text"
                      required
                      disabled={isSubmitting}
                      value={nameBn}
                      onFocus={handleFieldFocus}
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
                      onChange={(e) => setNameBn(e.target.value)}
                      placeholder="যেমন: রয়্যাল কটন পাঞ্জাবি"
                      className="w-full px-3 py-2 bg-[#080d19] border border-slate-700/80 rounded-xl text-white text-base sm:text-xs focus:outline-none focus:border-amber-400 disabled:opacity-60"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">
                      {language === 'bn' ? 'পণ্যের নাম (English) *' : 'Title (English) *'}
                    </label>
                    <input
                      type="text"
                      required
                      disabled={isSubmitting}
                      value={nameEn}
                      onFocus={handleFieldFocus}
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
                      onChange={(e) => setNameEn(e.target.value)}
                      placeholder="e.g. Royal Cotton Panjabi"
                      className="w-full px-3 py-2 bg-[#080d19] border border-slate-700/80 rounded-xl text-white text-base sm:text-xs focus:outline-none focus:border-amber-400 disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* Descriptions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">
                      {language === 'bn' ? 'বিবরণ (বাংলা)' : 'Description (Bangla)'}
                    </label>
                    <textarea
                      rows={2}
                      disabled={isSubmitting}
                      value={descBn}
                      onFocus={handleFieldFocus}
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
                      onChange={(e) => setDescBn(e.target.value)}
                      placeholder="পণ্যের বিস্তারিত বিবরণ..."
                      className="w-full px-3 py-2 bg-[#080d19] border border-slate-700/80 rounded-xl text-white text-base sm:text-xs focus:outline-none focus:border-amber-400 resize-none disabled:opacity-60"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">
                      {language === 'bn' ? 'বিবরণ (English)' : 'Description (English)'}
                    </label>
                    <textarea
                      rows={2}
                      disabled={isSubmitting}
                      value={descEn}
                      onFocus={handleFieldFocus}
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
                      onChange={(e) => setDescEn(e.target.value)}
                      placeholder="Product detailed description..."
                      className="w-full px-3 py-2 bg-[#080d19] border border-slate-700/80 rounded-xl text-white text-base sm:text-xs focus:outline-none focus:border-amber-400 resize-none disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* Category, Real Price, Discount Price, Stock, and Status */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <label className="font-bold text-slate-300">
                      {language === 'bn' ? 'ক্যাটাগরি' : 'Category'}
                    </label>
                    <select
                      disabled={isSubmitting}
                      value={category}
                      onFocus={handleFieldFocus}
                      onChange={(e) => {
                        const newCat = e.target.value;
                        setCategory(newCat);
                        const match = CATEGORIES_DATA.find((c) => c.id === newCat);
                        if (match && match.subcategories && match.subcategories.length > 0) {
                          setSubcategory(match.subcategories[0].id);
                        } else {
                          setSubcategory('');
                        }
                        setItemType('');
                      }}
                      className="w-full px-3 py-2 bg-[#080d19] border border-slate-700/80 rounded-xl text-white text-base sm:text-xs focus:outline-none focus:border-amber-400 capitalize disabled:opacity-60"
                    >
                      {categories
                        .filter((c) => c.id !== 'all')
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nameEn} ({c.nameBn})
                          </option>
                        ))}
                    </select>
                  </div>

                  {activeSubcategories.length > 0 && (
                    <div className="space-y-1 col-span-2 sm:col-span-1">
                      <label className="font-bold text-amber-300">
                        {language === 'bn' ? 'সাবক্যাটাগরি' : 'Subcategory'}
                      </label>
                      <select
                        disabled={isSubmitting}
                        value={subcategory}
                        onFocus={handleFieldFocus}
                        onChange={(e) => {
                          setSubcategory(e.target.value);
                          setItemType('');
                        }}
                        className="w-full px-3 py-2 bg-[#080d19] border border-amber-500/40 rounded-xl text-white text-base sm:text-xs focus:outline-none focus:border-amber-400 capitalize disabled:opacity-60"
                      >
                        <option value="">{language === 'bn' ? '-- নির্বাচন করুন --' : '-- Select --'}</option>
                        {activeSubcategories.map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.nameEn} ({sub.nameBn})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {availableTypes.length > 0 && (
                    <div className="space-y-1 col-span-2 sm:col-span-1">
                      <label className="font-bold text-amber-300">
                        {language === 'bn' ? 'টাইপ / ভ্যারিয়েশন' : 'Item Type'}
                      </label>
                      <select
                        disabled={isSubmitting}
                        value={itemType}
                        onFocus={handleFieldFocus}
                        onChange={(e) => setItemType(e.target.value)}
                        className="w-full px-3 py-2 bg-[#080d19] border border-amber-500/40 rounded-xl text-white text-base sm:text-xs focus:outline-none focus:border-amber-400 capitalize disabled:opacity-60"
                      >
                        <option value="">{language === 'bn' ? '-- নির্বাচন করুন --' : '-- Select --'}</option>
                        {availableTypes.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.nameEn} ({t.nameBn})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="space-y-1 col-span-1">
                    <label className="font-bold text-slate-300 flex items-center justify-between">
                      <span className="truncate">{language === 'bn' ? 'আসল মূল্য (৳) *' : 'Real (৳) *'}</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      required
                      disabled={isSubmitting}
                      value={realPrice}
                      onFocus={handleFieldFocus}
                      onChange={(e) => setRealPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="2450"
                      className="w-full px-3 py-2 bg-[#080d19] border border-slate-700/80 rounded-xl text-white font-bold text-base sm:text-xs focus:outline-none focus:border-amber-400 disabled:opacity-60"
                    />
                  </div>

                  <div className="space-y-1 col-span-1">
                    <label className="font-bold text-amber-300">
                      <span className="truncate">{language === 'bn' ? 'অফার মূল্য (৳)' : 'Offer (৳)'}</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      disabled={isSubmitting}
                      value={discountPrice}
                      onFocus={handleFieldFocus}
                      onChange={(e) => setDiscountPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder={language === 'bn' ? 'ঐচ্ছিক' : 'Optional'}
                      className="w-full px-3 py-2 bg-[#080d19] border border-slate-700/80 rounded-xl text-amber-300 font-bold text-base sm:text-xs focus:outline-none focus:border-amber-400 disabled:opacity-60"
                    />
                  </div>

                  <div className="space-y-1 col-span-1">
                    <label className="font-bold text-slate-300">
                      <span className="truncate">{language === 'bn' ? 'স্টক সংখ্যা *' : 'Stock *'}</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      disabled={isSubmitting}
                      value={stockCount}
                      onFocus={handleFieldFocus}
                      onChange={(e) => setStockCount(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#080d19] border border-slate-700/80 rounded-xl text-white text-base sm:text-xs focus:outline-none focus:border-amber-400 disabled:opacity-60"
                    />
                  </div>

                  <div className="space-y-1 col-span-1 sm:col-span-1">
                    <label className="font-bold text-slate-300">
                      {language === 'bn' ? 'স্ট্যাটাস' : 'Status'}
                    </label>
                    <select
                      disabled={isSubmitting}
                      value={productStatus}
                      onFocus={handleFieldFocus}
                      onChange={(e) => setProductStatus(e.target.value as 'published' | 'draft' | 'disabled')}
                      className="w-full px-3 py-2 bg-[#080d19] border border-slate-700/80 rounded-xl text-white text-base sm:text-xs focus:outline-none focus:border-amber-400 disabled:opacity-60"
                    >
                      <option value="published">{language === 'bn' ? 'প্রকাশিত' : 'Published'}</option>
                      <option value="draft">{language === 'bn' ? 'ড্রাফট' : 'Draft'}</option>
                      <option value="disabled">{language === 'bn' ? 'নিষ্ক্রিয়' : 'Disabled'}</option>
                    </select>
                  </div>
                </div>

                {/* Price & Stock Calculation Feedback Banner */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-[#080d19] border border-slate-800 text-[11px]">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-slate-400">{language === 'bn' ? 'বিক্রয় মূল্য:' : 'Price:'}</span>
                    <span className="font-bold text-amber-300 text-sm">
                      ৳{discountPrice !== '' && Number(discountPrice) > 0 ? Number(discountPrice) : Number(realPrice) || 0}
                    </span>
                    {discountPrice !== '' && Number(discountPrice) > 0 && Number(realPrice) > Number(discountPrice) && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-300 font-bold border border-amber-400/30">
                        ৳{Number(realPrice) - Number(discountPrice)} ছাড় ({Math.round(((Number(realPrice) - Number(discountPrice)) / Number(realPrice)) * 100)}% Off)
                      </span>
                    )}
                  </div>

                  {/* Stock = 0 Pre-order option */}
                  {Number(stockCount) === 0 && (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold text-[10px]">
                        {language === 'bn' ? 'স্টক শেষ' : 'Out of Stock'}
                      </span>
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                        <input
                          type="checkbox"
                          disabled={isSubmitting}
                          checked={isPreOrder}
                          onChange={(e) => setIsPreOrder(e.target.checked)}
                          className="rounded border-slate-700 text-amber-400 focus:ring-0"
                        />
                        <span>{language === 'bn' ? 'প্রি-অর্ডার' : 'Pre-order'}</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* 🪙 BONUS KHOROM COINS SETTING SECTION */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-[#080d19] border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-white text-xs">
                        {language === 'bn' ? 'বোনাস খড়ম কয়েন অফার (Bonus KHOROM Coins)' : 'Bonus KHOROM Coins'}
                      </span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-amber-300">
                      <input
                        type="checkbox"
                        disabled={isSubmitting}
                        checked={bonusCoinsEnabled}
                        onChange={(e) => setBonusCoinsEnabled(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 cursor-pointer accent-amber-500"
                      />
                      <span>{bonusCoinsEnabled ? (language === 'bn' ? 'অফার সক্রিয়' : 'Enabled') : (language === 'bn' ? 'অফার বন্ধ' : 'Disabled')}</span>
                    </label>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {language === 'bn'
                      ? 'এই পণ্যের জন্য নির্দিষ্ট বোনাস কয়েন নির্ধারণ করুন। গ্রাহক পণ্যটি দেখার সময় "Buy this product & get 100 Bonus Coins" অফার দেখতে পাবেন।'
                      : 'Attach product-specific bonus coins. Customer sees: "Buy this product & get 100 Bonus Coins".'}
                  </p>

                  {bonusCoinsEnabled && (
                    <div className="space-y-1.5 pt-1">
                      <label className="block text-xs font-semibold text-slate-300">
                        {language === 'bn' ? 'বোনাস কয়েনের পরিমাণ (Bonus Coin Amount)' : 'Bonus Coin Amount'}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          step="10"
                          disabled={isSubmitting}
                          value={bonusCoins}
                          placeholder="100"
                          onChange={(e) => setBonusCoins(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full px-3 py-2 bg-[#0c1424] border border-amber-500/50 rounded-xl text-amber-300 font-bold text-xs focus:outline-none focus:border-amber-400 disabled:opacity-60"
                        />
                        <span className="text-xs text-amber-400 font-bold whitespace-nowrap">কয়েন</span>
                      </div>
                      <p className="text-[10px] text-amber-400/90 font-mono">
                        {language === 'bn'
                          ? `গ্রাহক দেখবেন: “এই পণ্যটি কিনে পান ${bonusCoins || 0} বোনাস কয়েন”`
                          : `Customer sees: “Buy this product & get ${bonusCoins || 0} Bonus Coins”`}
                      </p>
                    </div>
                  )}
                </div>

                {/* DYNAMIC SPECIFICATIONS CONTROL SECTION */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-[#080d19] border border-amber-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-white text-xs">
                        {language === 'bn'
                          ? 'স্পেসিফিকেশন ও বিবরণ কন্ট্রোল'
                          : 'Custom Specifications'}
                      </span>
                    </div>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleAddSpecRow()}
                      className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all shadow-sm disabled:opacity-50"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{language === 'bn' ? 'যোগ করুন' : 'Add Field'}</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {language === 'bn'
                      ? 'প্রতিটি পণ্যের নিজস্ব Material, Warranty, Fabric ইত্যাদি যোগ করুন। কোনো ফিল্ড ফাঁকা রাখলে ওয়েবসাইটে দেখানো হবে না।'
                      : 'Add custom fields (Material, Warranty, Origin, etc.).'}
                  </p>

                  {/* Quick Field Suggestions */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-500 font-semibold">
                      {language === 'bn' ? 'কুইক ফিল্ড:' : 'Presets:'}
                    </span>
                    {[
                      { label: 'মেটেরিয়াল (Material)', key: 'মেটেরিয়াল' },
                      { label: 'ওয়ারেন্টি (Warranty)', key: 'ওয়ারেন্টি' },
                      { label: 'ফেব্রিক', key: 'ফেব্রিক' },
                      { label: 'ফিটিং', key: 'ফিটিং' },
                      { label: 'উৎস (Origin)', key: 'উৎপাদন' },
                      { label: 'যত্ন (Care)', key: 'যত্ন ও ধোয়া' },
                    ].map((preset) => (
                      <button
                        key={preset.key}
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleAddSpecRow(preset.key, '')}
                        className="px-2 py-0.5 rounded-md bg-[#0c1424] hover:bg-slate-800 text-slate-300 text-[10px] font-medium border border-slate-700/80 cursor-pointer transition-colors disabled:opacity-50"
                      >
                        + {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Specification Rows */}
                  {specificationsList.length === 0 ? (
                    <div className="p-3.5 rounded-xl border border-dashed border-slate-800 text-center text-slate-500 text-xs">
                      {language === 'bn'
                        ? 'কোনো অতিরিক্ত স্পেসিফিকেশন নেই। উপরের বোতামে ক্লিক করে নতুন স্পেসিফিকেশন যোগ করুন।'
                        : 'No specifications added yet.'}
                    </div>
                  ) : (
                    <div className="space-y-2 pt-1">
                      {specificationsList.map((row, idx) => (
                        <div
                          key={row.id}
                          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 rounded-xl bg-[#0c1424] border border-slate-800"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <span className="w-5 text-center text-[10px] text-slate-500 font-bold shrink-0">
                              {idx + 1}.
                            </span>
                            <input
                              type="text"
                              disabled={isSubmitting}
                              value={row.key}
                              onFocus={handleFieldFocus}
                              autoCapitalize="none"
                              autoCorrect="off"
                              spellCheck="false"
                              onChange={(e) => handleUpdateSpecRow(row.id, 'key', e.target.value)}
                              placeholder={language === 'bn' ? 'ফিল্ড (যেমন: মেটেরিয়াল)' : 'Field (e.g. Material)'}
                              className="w-1/2 sm:w-1/3 px-2.5 py-1.5 bg-[#080d19] border border-slate-700/80 rounded-lg text-white text-base sm:text-xs focus:outline-none focus:border-amber-400 font-semibold disabled:opacity-60"
                            />
                            <input
                              type="text"
                              disabled={isSubmitting}
                              value={row.value}
                              onFocus={handleFieldFocus}
                              autoCapitalize="none"
                              autoCorrect="off"
                              spellCheck="false"
                              onChange={(e) => handleUpdateSpecRow(row.id, 'value', e.target.value)}
                              placeholder={language === 'bn' ? 'বিবরণ (যেমন: ১০০% কটন)' : 'Value (e.g. 100% Cotton)'}
                              className="flex-1 px-2.5 py-1.5 bg-[#080d19] border border-slate-700/80 rounded-lg text-white text-base sm:text-xs focus:outline-none focus:border-amber-400 disabled:opacity-60"
                            />
                          </div>
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleDeleteSpecRow(row.id)}
                            className="self-end sm:self-auto px-2.5 py-1 sm:p-0 sm:w-7 sm:h-7 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 flex items-center justify-center gap-1 cursor-pointer transition-colors disabled:opacity-50 text-[11px]"
                            title="Delete Field"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="sm:hidden">{language === 'bn' ? 'মুছুন' : 'Delete'}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sizes Selection (Categorized & Supports 28-34) */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-[#080d19] border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-200 flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5 text-amber-400" />
                      <span>{language === 'bn' ? 'সাইজ নির্বাচন (Waist 28-34, Tops & Shoes)' : 'Size Selector'}</span>
                    </label>
                    <span className="text-[10px] text-amber-400 font-semibold">
                      {selectedSizes.length} {language === 'bn' ? 'টি নির্বাচিত' : 'selected'}
                    </span>
                  </div>

                  {/* Waist / Pants Sizes (28 to 38) */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-slate-400">
                      {language === 'bn' ? 'প্যান্ট / ওয়েস্ট সাইজ (Waist 28-34+):' : 'Waist / Pants Sizes (28-34+):'}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {WAIST_SIZES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => toggleSize(s)}
                          className={`px-3 py-1.5 min-h-[36px] min-w-[38px] flex items-center justify-center rounded-lg font-bold border text-xs transition-colors cursor-pointer disabled:opacity-50 ${
                            selectedSizes.includes(s)
                              ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                              : 'bg-[#0c1424] text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Standard Tops Sizes (XS to 4XL) */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-slate-400">
                      {language === 'bn' ? 'পাঞ্জাবি / পোশাকের সাইজ (Standard Tops):' : 'Clothing / Tops Sizes:'}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {STANDARD_SIZES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => toggleSize(s)}
                          className={`px-3 py-1.5 min-h-[36px] min-w-[38px] flex items-center justify-center rounded-lg font-bold border text-xs transition-colors cursor-pointer disabled:opacity-50 ${
                            selectedSizes.includes(s)
                              ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                              : 'bg-[#0c1424] text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Footwear Sizes (38 to 45) */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-slate-400">
                      {language === 'bn' ? 'জুতো / খড়ম সাইজ (Footwear / EU):' : 'Footwear Sizes (EU):'}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {FOOTWEAR_SIZES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => toggleSize(s)}
                          className={`px-3 py-1.5 min-h-[36px] min-w-[38px] flex items-center justify-center rounded-lg font-bold border text-xs transition-colors cursor-pointer disabled:opacity-50 ${
                            selectedSizes.includes(s)
                              ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                              : 'bg-[#0c1424] text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Size Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      disabled={isSubmitting}
                      value={customSizeInput}
                      onFocus={handleFieldFocus}
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
                      onChange={(e) => setCustomSizeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomSize();
                        }
                      }}
                      placeholder={language === 'bn' ? 'কাস্টম সাইজ (যেমন: Free Size, 35)' : 'Custom size (e.g. Free Size)'}
                      className="px-2.5 py-2 bg-[#0c1424] border border-slate-700/80 rounded-lg text-white text-base sm:text-xs focus:outline-none focus:border-amber-400 flex-1 disabled:opacity-60"
                    />
                    <button
                      type="button"
                      disabled={isSubmitting || !customSizeInput.trim()}
                      onClick={handleAddCustomSize}
                      className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 cursor-pointer disabled:opacity-40 shrink-0"
                    >
                      + {language === 'bn' ? 'যোগ করুন' : 'Add'}
                    </button>
                  </div>
                </div>

                {/* Basic Colors Selection */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300 flex items-center gap-1">
                    <Palette className="w-3.5 h-3.5 text-amber-400" />
                    <span>{language === 'bn' ? 'কালার নির্বাচন' : 'Colors'}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {BASIC_COLORS.map((c) => {
                      const isSelected = selectedColors.some((item) => item.name === c.nameEn);
                      return (
                        <button
                          key={c.nameEn}
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => toggleColor(c)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg border text-xs font-bold cursor-pointer transition-all disabled:opacity-50 ${
                            isSelected
                              ? 'bg-amber-400/20 text-amber-300 border-amber-400'
                              : 'bg-[#080d19] text-slate-400 border-slate-800'
                          }`}
                        >
                          <span className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: c.hex }} />
                          <span>{language === 'bn' ? c.nameBn : c.nameEn}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Photos upload */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-300 flex items-center gap-1">
                      <ImagePlus className="w-3.5 h-3.5 text-amber-400" />
                      <span>{language === 'bn' ? 'পণ্যের ছবি (একাধিক ছবি)' : 'Product Photos'}</span>
                    </label>
                    <button
                      type="button"
                      disabled={isSubmitting || isCompressingImages}
                      onClick={() => handleAddSamplePhotos(category)}
                      className="text-[11px] text-amber-400 hover:underline cursor-pointer disabled:opacity-50"
                    >
                      + {language === 'bn' ? 'স্যাম্পল ছবি' : 'Add Sample Photos'}
                    </button>
                  </div>

                  {isCompressingImages && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
                      <span>{language === 'bn' ? 'ছবি প্রসেসিং ও অপ্টিমাইজেশন চলছে...' : 'Optimizing and compressing photos...'}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-700 bg-[#080d19] shrink-0">
                        <img src={img} alt="Product" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold cursor-pointer disabled:opacity-50"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      disabled={isSubmitting || isCompressingImages}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-16 h-16 rounded-xl border border-dashed border-slate-700 hover:border-amber-400 flex flex-col items-center justify-center text-slate-500 hover:text-amber-300 transition-colors cursor-pointer disabled:opacity-50 shrink-0 bg-[#080d19]"
                    >
                      <Upload className="w-4 h-4" />
                      <span className="text-[9px] mt-1">Upload</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      disabled={isSubmitting || isCompressingImages}
                      accept="image/*"
                      onChange={(e) => e.target.files && handleImageFiles(e.target.files)}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Sticky Bottom Actions Bar */}
              <div
                id="product-form-modal-footer"
                className="sticky bottom-0 z-40 p-3 sm:p-4 pb-[max(0.85rem,env(safe-area-inset-bottom,16px))] sm:pb-4 border-t border-slate-800 bg-[#070b14]/98 backdrop-blur-md flex items-center justify-between sm:justify-end gap-2.5 shrink-0 shadow-2xl"
              >
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2.5 min-h-[46px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  id="admin-save-product-db-btn"
                  type="submit"
                  form="admin-product-form"
                  disabled={isSubmitting || isCompressingImages}
                  className="px-5 sm:px-6 py-2.5 min-h-[46px] rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black text-xs sm:text-sm cursor-pointer shadow-xl inline-flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>{language === 'bn' ? 'সংরক্ষণ করা হচ্ছে...' : 'Saving to Database...'}</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-slate-950 shrink-0" />
                      <span>
                        {editingProduct
                          ? language === 'bn'
                            ? 'আপডেট সেভ করুন'
                            : 'Save Changes'
                          : language === 'bn'
                            ? 'ডাটাবেজে যুক্ত করুন'
                            : 'Save to Database'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )
    : null)}
    </div>
  );
};
