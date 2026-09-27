import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../../context/StoreContext';
import { Category, SubCategory } from '../../types';
import { CATEGORIES_DATA } from '../../data/categories';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  MoveUp,
  MoveDown,
  Shirt,
  Footprints,
  Glasses,
  Watch,
  Wallet,
  LayoutGrid,
  Sparkles,
  ShoppingBag,
  Tag,
  Package,
  Check,
  X,
  AlertTriangle,
  FolderTree,
  Briefcase,
  Crown,
  Gem,
  Flame,
  Zap,
  Award,
  Compass,
  Feather,
  Scissors,
  Sun,
  Star,
  Gift,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Save,
  Loader2,
} from 'lucide-react';
import { CategoryIcon, CATEGORY_ICON_OPTIONS } from '../CategoryIcon';

const AVAILABLE_ICONS = CATEGORY_ICON_OPTIONS.map((opt) => ({
  id: opt.id,
  label: opt.nameBn,
  subLabel: opt.nameEn,
}));

export const AdminCategoriesTab: React.FC = () => {
  const {
    categories,
    products,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    language,
    showToast,
  } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirmCat, setDeleteConfirmCat] = useState<Category | null>(null);
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);

  // Form State
  const [id, setId] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [iconName, setIconName] = useState('LayoutGrid');
  const [orderIndex, setOrderIndex] = useState(1);
  const [subcategoriesList, setSubcategoriesList] = useState<SubCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Subcategory input state inside modal
  const [newSubBn, setNewSubBn] = useState('');
  const [newSubEn, setNewSubEn] = useState('');
  const [newSubId, setNewSubId] = useState('');
  const [editingSubId, setEditingSubId] = useState<string | null>(null);

  const getCategoryIconComponent = (name: string) => {
    return <CategoryIcon iconName={name} className="w-4 h-4 text-[#dfb76c]" />;
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setId('');
    setNameBn('');
    setNameEn('');
    setIconName('Shirt');
    setOrderIndex(categories.length + 1);
    setSubcategoriesList([]);
    setEditingSubId(null);
    setNewSubBn('');
    setNewSubEn('');
    setNewSubId('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setId(cat.id);
    setNameBn(cat.nameBn);
    setNameEn(cat.nameEn);
    setIconName(cat.iconName || 'LayoutGrid');
    setOrderIndex(cat.orderIndex ?? (cat.order ?? 1));

    // Populate subcategories either from category or fallback to predefined categories
    if (Array.isArray(cat.subcategories)) {
      setSubcategoriesList([...cat.subcategories]);
    } else {
      const match = CATEGORIES_DATA.find((c) => c.id === cat.id);
      setSubcategoriesList(match?.subcategories ? [...match.subcategories] : []);
    }

    setEditingSubId(null);
    setNewSubBn('');
    setNewSubEn('');
    setNewSubId('');
    setIsModalOpen(true);
  };

  const handleStartEditSubcategory = (sub: SubCategory) => {
    setEditingSubId(sub.id);
    setNewSubBn(sub.nameBn);
    setNewSubEn(sub.nameEn);
    setNewSubId(sub.id);
  };

  const handleCancelEditSubcategory = () => {
    setEditingSubId(null);
    setNewSubBn('');
    setNewSubEn('');
    setNewSubId('');
  };

  const handleSaveSubcategory = () => {
    // 14. Prevent empty sub-category names from being saved
    // 15. Trim unnecessary leading/trailing spaces
    const trimmedBn = newSubBn.trim();
    const trimmedEn = newSubEn.trim();

    if (!trimmedBn || !trimmedEn) {
      showToast(
        language === 'bn'
          ? 'সাবক্যাটাগরির বাংলা ও ইংরেজি উভয় নাম দিন'
          : 'Please enter both Bengali & English names for the subcategory'
      );
      return;
    }

    const targetSlug =
      newSubId.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') ||
      trimmedEn.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') ||
      `sub-${Date.now()}`;

    // 16. If the same sub-category already exists under the same parent category, prevent accidental duplication
    const isDuplicate = subcategoriesList.some((s) => {
      if (editingSubId && s.id === editingSubId) return false;
      return (
        s.id.toLowerCase() === targetSlug ||
        s.nameBn.trim().toLowerCase() === trimmedBn.toLowerCase() ||
        s.nameEn.trim().toLowerCase() === trimmedEn.toLowerCase()
      );
    });

    if (isDuplicate) {
      showToast(
        language === 'bn'
          ? 'এই সাবক্যাটাগরিটি ইতিমধ্যে এই ক্যাটাগরিতে অন্তর্ভুক্ত রয়েছে'
          : 'This subcategory already exists under this category'
      );
      return;
    }

    const currentParentId = id.trim() || (editingCategory?.id ?? '');

    if (editingSubId) {
      // 11. Editing a sub-category should update only that sub-category
      setSubcategoriesList((prev) =>
        prev.map((s) => {
          if (s.id === editingSubId) {
            return {
              ...s,
              id: targetSlug,
              nameBn: trimmedBn,
              nameEn: trimmedEn,
              parentId: currentParentId,
            };
          }
          return s;
        })
      );
      setEditingSubId(null);
      setNewSubBn('');
      setNewSubEn('');
      setNewSubId('');
      showToast(
        language === 'bn'
          ? 'সাবক্যাটাগরি সফলভাবে আপডেট করা হয়েছে'
          : 'Subcategory updated successfully'
      );
    } else {
      // 4. Add Subcategory
      const newSub: SubCategory = {
        id: targetSlug,
        parentId: currentParentId,
        nameBn: trimmedBn,
        nameEn: trimmedEn,
      };

      setSubcategoriesList((prev) => [...prev, newSub]);
      setNewSubBn('');
      setNewSubEn('');
      setNewSubId('');
      showToast(
        language === 'bn'
          ? `সাবক্যাটাগরি "${newSub.nameBn}" যুক্ত হয়েছে`
          : `Subcategory "${newSub.nameEn}" added`
      );
    }
  };

  const handleRemoveSubcategory = (subId: string) => {
    if (editingSubId === subId) {
      setEditingSubId(null);
      setNewSubBn('');
      setNewSubEn('');
      setNewSubId('');
    }
    setSubcategoriesList((prev) => prev.filter((s) => s.id !== subId));
    showToast(
      language === 'bn' ? 'সাবক্যাটাগরি তালিকা থেকে সরানো হয়েছে' : 'Subcategory removed from list'
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameBn.trim() || !nameEn.trim()) {
      showToast(
        language === 'bn' ? 'বাংলা ও ইংরেজি নাম উভয়ই দিন' : 'Enter both Bengali & English names'
      );
      return;
    }

    const currentCatId = editingCategory
      ? editingCategory.id
      : (id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') || nameEn.toLowerCase().trim().replace(/\s+/g, '-'));

    // Sanitize subcategories to ensure complete parentId association
    const sanitizedSubs = subcategoriesList
      .filter((s) => s && (s.nameBn.trim() || s.nameEn.trim()))
      .map((s) => ({
        ...s,
        id: String(s.id).trim(),
        nameBn: String(s.nameBn).trim(),
        nameEn: String(s.nameEn).trim(),
        parentId: currentCatId,
      }));

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        const success = await updateCategory(editingCategory.id, {
          nameBn: nameBn.trim(),
          nameEn: nameEn.trim(),
          iconName,
          orderIndex: Number(orderIndex),
          order: Number(orderIndex),
          subcategories: sanitizedSubs,
        });

        if (!success) {
          // Do not close modal on persistence failure; error toast already shown by StoreContext
          return;
        }
      } else {
        const slug = currentCatId;
        if (categories.some((c) => c.id === slug)) {
          showToast(
            language === 'bn'
              ? 'এই ক্যাটাগরি আইডিটি ইতিমধ্যে ব্যবহৃত হচ্ছে'
              : 'Category ID already exists'
          );
          return;
        }

        const newCat: Category = {
          id: slug,
          nameBn: nameBn.trim(),
          nameEn: nameEn.trim(),
          iconName,
          itemCount: 0,
          orderIndex: Number(orderIndex),
          order: Number(orderIndex),
          subcategories: sanitizedSubs.map((s) => ({ ...s, parentId: slug })),
        };

        const success = await addCategory(newCat);
        if (!success) {
          return;
        }
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showToast(err?.message || 'Error saving category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmCat) return;
    if (deleteConfirmCat.id === 'all') {
      showToast(language === 'bn' ? '"সব পণ্য" ক্যাটাগরি মোছা যাবে না' : 'Cannot delete "All" category');
      setDeleteConfirmCat(null);
      return;
    }

    try {
      await deleteCategory(deleteConfirmCat.id);
      showToast(language === 'bn' ? 'ক্যাটাগরি মুছে ফেলা হয়েছে' : 'Category deleted successfully');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete category');
    } finally {
      setDeleteConfirmCat(null);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index <= 1) return; // protect 'all' at index 0
    if (direction === 'down' && index >= categories.length - 1) return;

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx === 0) return; // keep 'all' first

    const updated = [...categories];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    // re-assign orderIndex
    const reindexed = updated.map((c, idx) => ({ ...c, orderIndex: idx }));
    await reorderCategories(reindexed);
    showToast(language === 'bn' ? 'ক্যাটাগরি ক্রম সাজানো হয়েছে' : 'Category order updated');
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-[#0c1424] to-[#0f172a] border border-amber-500/20 p-3.5 sm:p-4 rounded-2xl shadow-lg">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white font-serif flex items-center gap-2">
            <FolderTree className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            <span>{language === 'bn' ? 'ক্যাটাগরি ও সাবক্যাটাগরি ম্যানেজমেন্ট' : 'Category & Subcategory Management'}</span>
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
            {language === 'bn'
              ? 'ক্যাটাগরির ভেতরে সাবক্যাটাগরি তৈরি, কাস্টম আইকন নির্বাচন, ক্রম সাজানো এবং ডেটাবেজ সিঙ্ক করুন।'
              : 'Create nested subcategories, customize icons, reorder, and dynamically sync with database.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold text-amber-300 bg-amber-400/10 border border-amber-400/25 px-3 py-1.5 rounded-xl">
            {categories.length} {language === 'bn' ? 'টি ক্যাটাগরি' : 'Categories'}
          </span>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'bn' ? 'নতুন ক্যাটাগরি' : 'Add Category'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Category Cards (Visible on mobile < sm) */}
      <div className="sm:hidden space-y-3">
        {categories.map((cat, idx) => {
          const productCount =
            cat.id === 'all'
              ? products.length
              : products.filter((p) => p.category === cat.id).length;
          const isAll = cat.id === 'all';
          const subcats = cat.subcategories || CATEGORIES_DATA.find((c) => c.id === cat.id)?.subcategories || [];
          const isExpanded = expandedCategoryId === cat.id;

          return (
            <div
              key={`mobile-cat-${cat.id}`}
              id={`mobile-cat-card-${cat.id}`}
              className="bg-[#0c1424] rounded-2xl border border-slate-800 p-3.5 space-y-2.5 shadow-md hover:border-slate-700/80 transition-all"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#080d19] border border-slate-800 flex items-center justify-center shrink-0">
                    {getCategoryIconComponent(cat.iconName)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-xs sm:text-sm truncate">
                      {cat.nameBn}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate">{cat.nameEn}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      productCount > 0
                        ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                        : 'bg-slate-800/80 text-slate-400'
                    }`}
                  >
                    {productCount} {language === 'bn' ? 'পণ্য' : 'items'}
                  </span>
                </div>
              </div>

              {/* Subcategories count badge & expand */}
              {subcats.length > 0 && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setExpandedCategoryId(isExpanded ? null : cat.id)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 hover:text-white"
                  >
                    <span className="flex items-center gap-1 font-semibold text-amber-400">
                      <FolderTree className="w-3 h-3" />
                      {subcats.length} {language === 'bn' ? 'টি সাবক্যাটাগরি' : 'Subcategories'}
                    </span>
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-2 p-2 bg-[#080d19] rounded-xl border border-slate-800/80 space-y-1 text-[11px]">
                      {subcats.map((s) => {
                        const subCount = products.filter(
                          (p) => p.category === cat.id && (p.subcategory === s.id || p.subcategoryId === s.id)
                        ).length;
                        return (
                          <div key={s.id} className="flex items-center justify-between px-2 py-1 bg-slate-900/60 rounded border border-slate-800/50">
                            <span className="text-white font-medium">
                              {s.nameBn} <span className="text-slate-400 text-[10px]">({s.nameEn})</span>
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                              {subCount} {language === 'bn' ? 'পণ্য' : 'items'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
                <div className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                  <span>ID:</span>
                  <span className="text-amber-300 px-1.5 py-0.2 bg-[#080d19] rounded border border-slate-800">
                    {cat.id}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {!isAll && (
                    <div className="flex items-center gap-1 mr-1">
                      <button
                        type="button"
                        disabled={idx <= 1}
                        onClick={() => handleMove(idx, 'up')}
                        className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg bg-slate-800/90 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Move Up"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx >= categories.length - 1}
                        onClick={() => handleMove(idx, 'down')}
                        className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg bg-slate-800/90 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Move Down"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(cat)}
                    className="px-3 py-1.5 min-h-[36px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3 text-indigo-400" />
                    <span>{language === 'bn' ? 'এডিট' : 'Edit'}</span>
                  </button>

                  {!isAll && (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmCat(cat)}
                      className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Categories Table (Desktop only, sm and above) */}
      <div className="hidden sm:block bg-[#0c1424] rounded-2xl border border-slate-800 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070b14] text-slate-300 font-bold border-b border-slate-800">
              <tr>
                <th className="p-3.5 w-14 text-center">{language === 'bn' ? 'ক্রম' : 'Order'}</th>
                <th className="p-3.5">{language === 'bn' ? 'আইকন' : 'Icon'}</th>
                <th className="p-3.5">{language === 'bn' ? 'বাংলা নাম' : 'Bangla Name'}</th>
                <th className="p-3.5">{language === 'bn' ? 'ইংরেজি নাম' : 'English Name'}</th>
                <th className="p-3.5">{language === 'bn' ? 'ক্যাটাগরি আইডি (Slug)' : 'Category ID'}</th>
                <th className="p-3.5">{language === 'bn' ? 'সাবক্যাটাগরি সমূহ' : 'Subcategories'}</th>
                <th className="p-3.5 text-center">{language === 'bn' ? 'যুক্ত পণ্য' : 'Linked Products'}</th>
                <th className="p-3.5 text-right">{language === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {categories.map((cat, idx) => {
                const productCount =
                  cat.id === 'all'
                    ? products.length
                    : products.filter((p) => p.category === cat.id).length;
                const isAll = cat.id === 'all';
                const subcats = cat.subcategories || CATEGORIES_DATA.find((c) => c.id === cat.id)?.subcategories || [];

                return (
                  <tr key={cat.id} className="hover:bg-[#090e1a] transition-colors">
                    {/* Order Controls */}
                    <td className="p-3.5 text-center">
                      {!isAll ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            disabled={idx <= 1}
                            onClick={() => handleMove(idx, 'up')}
                            className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Move Up"
                          >
                            <MoveUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx >= categories.length - 1}
                            onClick={() => handleMove(idx, 'down')}
                            className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Move Down"
                          >
                            <MoveDown className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-500">Top</span>
                      )}
                    </td>

                    {/* Icon */}
                    <td className="p-3.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                        {getCategoryIconComponent(cat.iconName)}
                      </div>
                    </td>

                    {/* Bangla Name */}
                    <td className="p-3.5 font-bold text-white">
                      {cat.nameBn}
                    </td>

                    {/* English Name */}
                    <td className="p-3.5 text-slate-300">
                      {cat.nameEn}
                    </td>

                    {/* ID */}
                    <td className="p-3.5">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-[#070b14] border border-slate-800 text-amber-300">
                        {cat.id}
                      </span>
                    </td>

                    {/* Subcategories */}
                    <td className="p-3.5">
                      {subcats.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {subcats.slice(0, 3).map((s) => (
                            <span
                              key={s.id}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                            >
                              {s.nameBn}
                            </span>
                          ))}
                          {subcats.length > 3 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                              +{subcats.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px]">-</span>
                      )}
                    </td>

                    {/* Linked Products Count */}
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          productCount > 0
                            ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {productCount} {language === 'bn' ? 'টি' : 'items'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
                        </button>
                        {!isAll && (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmCat(cat)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Category Modal (Rendered with createPortal to escape nesting) */}
      {isModalOpen &&
        (typeof document !== 'undefined'
          ? createPortal(
              <div
                id="category-modal-backdrop"
                className="fixed inset-0 z-[100] flex flex-col sm:items-center sm:justify-center p-0 sm:p-4 bg-slate-950/95 backdrop-blur-md"
                onClick={() => !isSubmitting && setIsModalOpen(false)}
              >
                <div
                  id="category-modal-panel"
                  onClick={(e) => e.stopPropagation()}
                  className="bg-[#0c1322] border-0 sm:border sm:border-amber-500/30 w-full max-w-xl h-full sm:h-auto sm:max-h-[90vh] rounded-none sm:rounded-3xl shadow-2xl text-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95"
                >
                  {/* Modal Header */}
                  <div className="p-3.5 sm:p-4 border-b border-slate-800 bg-[#070b14] flex items-center justify-between shrink-0 gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0">
                        <FolderTree className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-white font-serif truncate">
                        {editingCategory
                          ? language === 'bn'
                            ? `ক্যাটাগরি সম্পাদনা: ${editingCategory.nameBn}`
                            : `Edit Category: ${editingCategory.nameEn}`
                          : language === 'bn'
                          ? 'নতুন ক্যাটাগরি ও সাবক্যাটাগরি যোগ করুন'
                          : 'Add New Category & Subcategories'}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Mobile Header Direct Save Button */}
                      <button
                        id="mobile-header-save-cat-btn"
                        type="submit"
                        form="admin-category-form"
                        disabled={isSubmitting}
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
                        onClick={() => setIsModalOpen(false)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
                        aria-label="Close"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Scrollable Form Body */}
                  <form
                    id="admin-category-form"
                    onSubmit={handleSave}
                    className="flex-1 flex flex-col min-h-0 overflow-hidden"
                  >
                    <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 pb-28 sm:pb-5 space-y-4 text-xs overscroll-contain">
                      {/* Category ID (Slug) */}
                      <div className="space-y-1">
                        <label className="font-bold text-slate-300 block">
                          {language === 'bn' ? 'ক্যাটাগরি আইডি (Slug) *' : 'Category ID (Slug) *'}
                        </label>
                        <input
                          type="text"
                          required
                          disabled={!!editingCategory}
                          value={id}
                          onChange={(e) => setId(e.target.value.toLowerCase())}
                          placeholder="e.g. clothing, shoes, sunglasses, watch"
                          className="w-full px-3 py-2 bg-[#090e1a] border border-slate-700 rounded-xl text-white font-mono placeholder-slate-600 focus:outline-none focus:border-amber-400 disabled:opacity-50"
                        />
                      </div>

                      {/* Bangla & English Names */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-300 block">
                            {language === 'bn' ? 'ক্যাটাগরির নাম (বাংলা) *' : 'Name (Bangla) *'}
                          </label>
                          <input
                            type="text"
                            required
                            value={nameBn}
                            onChange={(e) => setNameBn(e.target.value)}
                            placeholder="যেমন: জেন্টস পোশাক"
                            className="w-full px-3 py-2 bg-[#090e1a] border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-300 block">
                            {language === 'bn' ? 'ক্যাটাগরির নাম (English) *' : 'Name (English) *'}
                          </label>
                          <input
                            type="text"
                            required
                            value={nameEn}
                            onChange={(e) => setNameEn(e.target.value)}
                            placeholder="e.g. Men's Clothing"
                            className="w-full px-3 py-2 bg-[#090e1a] border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      {/* Icon Selector (Rich List) */}
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-300 flex items-center justify-between">
                          <span>{language === 'bn' ? 'ক্যাটাগরির আইকন নির্বাচন করুন' : 'Select Category Icon'}</span>
                          <span className="text-[10px] text-amber-400 font-mono">
                            {AVAILABLE_ICONS.find((i) => i.id === iconName)?.label || iconName}
                          </span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto p-1.5 bg-[#090e1a] rounded-xl border border-slate-800 slim-scrollbar">
                          {AVAILABLE_ICONS.map((item) => {
                            const isSelected = iconName === item.id;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => setIconName(item.id)}
                                className={`p-2 rounded-lg text-left flex items-center gap-2 border transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-bold'
                                    : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                              >
                                <CategoryIcon iconName={item.id} className="w-4 h-4 shrink-0" />
                                <span className="truncate text-[11px]">{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Nested Subcategories Management Section */}
                      <div className="space-y-2.5 pt-2 border-t border-slate-800">
                        <div className="flex items-center justify-between">
                          <label className="font-bold text-amber-400 flex items-center gap-1.5">
                            <FolderTree className="w-3.5 h-3.5" />
                            <span>
                              {language === 'bn'
                                ? 'সাবক্যাটাগরি সমূহ (ক্যাটাগরির ভিতরের ক্যাটাগরি)'
                                : 'Nested Subcategories'}
                            </span>
                          </label>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
                            {subcategoriesList.length} {language === 'bn' ? 'টি' : 'items'}
                          </span>
                        </div>

                        {/* Existing Subcategories Pills/List */}
                        {subcategoriesList.length > 0 ? (
                          <div className="space-y-1.5 max-h-44 overflow-y-auto p-1 bg-[#090e1a] rounded-xl border border-slate-800">
                            {subcategoriesList.map((sub) => {
                              const isEditingThis = editingSubId === sub.id;
                              return (
                                <div
                                  key={sub.id}
                                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs transition-all ${
                                    isEditingThis
                                      ? 'bg-amber-400/15 border-amber-400/60 shadow-sm'
                                      : 'bg-slate-900/80 border-slate-800'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                        isEditingThis ? 'bg-amber-300 animate-pulse' : 'bg-amber-400'
                                      }`}
                                    />
                                    <span className="font-bold text-white truncate">{sub.nameBn}</span>
                                    <span className="text-slate-400 text-[11px] truncate">({sub.nameEn})</span>
                                    <span className="text-[10px] font-mono text-amber-400/80 px-1.5 bg-[#070b14] rounded">
                                      {sub.id}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleStartEditSubcategory(sub)}
                                      className="p-1 text-slate-400 hover:text-amber-300 hover:bg-amber-400/10 rounded transition-colors cursor-pointer"
                                      title={language === 'bn' ? 'সাবক্যাটাগরি সম্পাদনা' : 'Edit Subcategory'}
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveSubcategory(sub.id)}
                                      className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                                      title={language === 'bn' ? 'সাবক্যাটাগরি মুছুন' : 'Remove Subcategory'}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-3 bg-[#090e1a] rounded-xl border border-dashed border-slate-800 text-center text-slate-500 text-[11px]">
                            {language === 'bn'
                              ? 'এখনও কোনো সাবক্যাটাগরি যোগ করা হয়নি। নিচে নতুন সাবক্যাটাগরি যোগ করুন।'
                              : 'No subcategories added yet. Add a new one below.'}
                          </div>
                        )}

                        {/* Add / Edit Subcategory Mini-Form */}
                        <div
                          className={`p-2.5 rounded-xl border space-y-2 transition-all ${
                            editingSubId
                              ? 'bg-amber-400/5 border-amber-400/40'
                              : 'bg-slate-900/60 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                              {editingSubId ? (
                                <>
                                  <Edit2 className="w-3 h-3 text-amber-400" />
                                  <span className="text-amber-300">
                                    {language === 'bn' ? 'সাবক্যাটাগরি সম্পাদনা করুন' : 'Edit Subcategory'}
                                  </span>
                                </>
                              ) : (
                                <span>
                                  {language === 'bn' ? '+ নতুন সাবক্যাটাগরি যোগ করুন' : '+ Add New Subcategory'}
                                </span>
                              )}
                            </p>
                            {editingSubId && (
                              <button
                                type="button"
                                onClick={handleCancelEditSubcategory}
                                className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 cursor-pointer transition-colors"
                              >
                                {language === 'bn' ? 'বাতিল' : 'Cancel'}
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <input
                              type="text"
                              value={newSubBn}
                              onChange={(e) => setNewSubBn(e.target.value)}
                              placeholder={language === 'bn' ? 'নাম (বাংলা) যেমন: শার্ট' : 'Bangla (e.g. শার্ট)'}
                              className="px-2.5 py-1.5 bg-[#090e1a] border border-slate-700 rounded-lg text-white text-xs placeholder-slate-600 focus:outline-none focus:border-amber-400"
                            />
                            <input
                              type="text"
                              value={newSubEn}
                              onChange={(e) => setNewSubEn(e.target.value)}
                              placeholder={language === 'bn' ? 'Name (English) e.g. Shirt' : 'English (e.g. Shirt)'}
                              className="px-2.5 py-1.5 bg-[#090e1a] border border-slate-700 rounded-lg text-white text-xs placeholder-slate-600 focus:outline-none focus:border-amber-400"
                            />
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={newSubId}
                                onChange={(e) => setNewSubId(e.target.value.toLowerCase())}
                                placeholder="Slug (optional)"
                                className="w-full px-2.5 py-1.5 bg-[#090e1a] border border-slate-700 rounded-lg text-white font-mono text-xs placeholder-slate-600 focus:outline-none focus:border-amber-400"
                              />
                              <button
                                type="button"
                                onClick={handleSaveSubcategory}
                                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg shrink-0 cursor-pointer transition-colors text-xs"
                              >
                                {editingSubId
                                  ? (language === 'bn' ? 'আপডেট' : 'Update')
                                  : (language === 'bn' ? 'যোগ' : 'Add')}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Modal Sticky Footer */}
                    <div
                      id="category-modal-footer"
                      className="sticky bottom-0 z-40 p-3 sm:p-4 pb-[max(0.85rem,env(safe-area-inset-bottom,16px))] sm:pb-4 border-t border-slate-800 bg-[#070b14]/98 backdrop-blur-md flex items-center justify-between sm:justify-end gap-2.5 shrink-0 shadow-2xl"
                    >
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                      >
                        {language === 'bn' ? 'বাতিল' : 'Cancel'}
                      </button>
                      <button
                        id="admin-save-cat-btn"
                        type="submit"
                        form="admin-category-form"
                        disabled={isSubmitting}
                        className="px-5 sm:px-6 py-2 min-h-[44px] rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xl cursor-pointer disabled:opacity-50 active:scale-95 transition-all"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                            <span>{language === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'}</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>{language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Category'}</span>
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-[#0c1322] border border-rose-500/40 w-full max-w-sm rounded-3xl p-6 shadow-2xl text-slate-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-white">
              {language === 'bn' ? 'ক্যাটাগরি মুছে ফেলতে চান?' : 'Delete Category?'}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'bn'
                ? `আপনি কি নিশ্চিত যে "${deleteConfirmCat.nameBn}" ক্যাটাগরিটি মুছে ফেলতে চান? এতে যুক্ত পণ্যগুলো মুছে যাবে না, তবে তাদের ক্যাটাগরি পুনরায় নির্ধারণ করতে হতে পারে।`
                : `Are you sure you want to delete "${deleteConfirmCat.nameEn}"? Linked products won't be deleted.`}
            </p>
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmCat(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
              >
                {language === 'bn' ? 'না, বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black cursor-pointer shadow-md shadow-rose-900/40"
              >
                {language === 'bn' ? 'হ্যাঁ, মুছুন' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
