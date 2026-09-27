import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import {
  X,
  GripVertical,
  ArrowUp,
  ArrowDown,
  ArrowUpToLine,
  ArrowDownToLine,
  Save,
  CheckCircle2,
  RefreshCw,
  SlidersHorizontal,
  Info
} from 'lucide-react';

interface AdminPositionEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPositionEditorModal: React.FC<AdminPositionEditorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { products, saveProductPositions, language, formatPrice, showToast } = useStore();

  // Local draft of product list ordered by position
  const [orderedItems, setOrderedItems] = useState<Product[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Sort products by existing position or natural order
      const sorted = [...products].sort((a, b) => (a.position ?? 9999) - (b.position ?? 9999));
      // Ensure each has a defined 1-indexed sequential position
      const indexed = sorted.map((p, idx) => ({ ...p, position: idx + 1 }));
      setOrderedItems(indexed);
      setHasChanges(false);
    }
  }, [isOpen, products]);

  if (!isOpen) return null;

  // Move product up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setOrderedItems((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next.map((item, idx) => ({ ...item, position: idx + 1 }));
    });
    setHasChanges(true);
  };

  // Move product down
  const handleMoveDown = (index: number) => {
    if (index === orderedItems.length - 1) return;
    setOrderedItems((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next.map((item, idx) => ({ ...item, position: idx + 1 }));
    });
    setHasChanges(true);
  };

  // Move directly to top
  const handleMoveToTop = (index: number) => {
    if (index === 0) return;
    setOrderedItems((prev) => {
      const target = prev[index];
      const others = prev.filter((_, idx) => idx !== index);
      const next = [target, ...others];
      return next.map((item, idx) => ({ ...item, position: idx + 1 }));
    });
    setHasChanges(true);
  };

  // Move directly to bottom
  const handleMoveToBottom = (index: number) => {
    if (index === orderedItems.length - 1) return;
    setOrderedItems((prev) => {
      const target = prev[index];
      const others = prev.filter((_, idx) => idx !== index);
      const next = [...others, target];
      return next.map((item, idx) => ({ ...item, position: idx + 1 }));
    });
    setHasChanges(true);
  };

  // Direct Position number input change (e.g. typing position 1 for an item)
  const handlePositionNumberChange = (index: number, newPositionVal: number) => {
    const targetPos = Math.max(1, Math.min(orderedItems.length, newPositionVal));
    const targetIdx = targetPos - 1;
    if (targetIdx === index) return;

    setOrderedItems((prev) => {
      const copy = [...prev];
      const [movedItem] = copy.splice(index, 1);
      copy.splice(targetIdx, 0, movedItem);
      return copy.map((item, idx) => ({ ...item, position: idx + 1 }));
    });
    setHasChanges(true);
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    setOrderedItems((prev) => {
      const copy = [...prev];
      const [draggedItem] = copy.splice(draggedIndex, 1);
      copy.splice(targetIndex, 0, draggedItem);
      return copy.map((item, idx) => ({ ...item, position: idx + 1 }));
    });
    setDraggedIndex(targetIndex);
    setHasChanges(true);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Save to Database
  const handleSaveToDatabase = async () => {
    setIsSaving(true);
    let safetyTimeout: any = setTimeout(() => {
      setIsSaving(false);
    }, 10000);

    try {
      const positionsPayload = orderedItems.map((item, idx) => ({
        id: item.id,
        position: idx + 1,
      }));

      const success = await saveProductPositions(positionsPayload);
      if (success) {
        setHasChanges(false);
        onClose();
      }
    } catch (err) {
      console.error('Failed to save positions:', err);
    } finally {
      clearTimeout(safetyTimeout);
      setIsSaving(false);
    }
  };

  const modalContent = (
    <div
      id="position-editor-modal-backdrop"
      className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex flex-col sm:items-center sm:justify-center p-0 sm:p-6"
      onClick={onClose}
    >
      <div
        id="position-editor-modal-panel"
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0c1322] rounded-none sm:rounded-3xl shadow-2xl max-w-4xl w-full h-full sm:h-auto sm:max-h-[92vh] flex flex-col overflow-hidden border-0 sm:border sm:border-amber-500/30 text-slate-100"
      >
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-slate-800 flex items-center justify-between bg-[#070b14] shrink-0 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-base font-bold text-white font-serif flex items-center gap-1.5 truncate">
                <span>{language === 'bn' ? 'পণ্য পজিশন এডিটর' : 'Position Editor'}</span>
                {hasChanges && (
                  <span className="text-[9px] sm:text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full font-black shrink-0">
                    {language === 'bn' ? 'বাকি' : 'Unsaved'}
                  </span>
                )}
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                {language === 'bn'
                  ? 'নম্বর বা তীর চিহ্ন দিয়ে ক্রম সাজান'
                  : 'Reorder using numbers or arrow buttons'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Header Save Button on Mobile */}
            <button
              id="mobile-header-save-positions-btn"
              onClick={handleSaveToDatabase}
              disabled={isSaving}
              className="sm:hidden px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 disabled:opacity-50 cursor-pointer active:scale-95 transition-all"
            >
              {isSaving ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{language === 'bn' ? 'সেভ' : 'Save'}</span>
            </button>

            <button
              id="close-position-editor-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-3.5 sm:px-5 py-2 flex items-center gap-2 text-[11px] sm:text-xs text-amber-300 shrink-0">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="truncate">
            {language === 'bn'
              ? '১ নম্বর পজিশনের পণ্যটি ওয়েবসাইটে প্রথমে দেখাবে, তারপর ২, ৩ ইত্যাদি।'
              : 'Position #1 appears first in store catalog, followed by #2, #3, etc.'}
          </span>
        </div>

        {/* Scrollable Reorderable List */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5 pb-28 sm:pb-6 space-y-2 overscroll-contain">
          {orderedItems.map((item, index) => {
            const isDragging = draggedIndex === index;

            return (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`p-2.5 sm:p-3 rounded-2xl border transition-all flex items-center gap-2 sm:gap-4 ${
                  isDragging
                    ? 'bg-amber-500/10 border-amber-400 shadow-xl opacity-80 scale-[1.01]'
                    : 'bg-[#090e1a] border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Drag Handle (Desktop) */}
                <div
                  className="hidden sm:flex cursor-grab active:cursor-grabbing text-slate-500 hover:text-amber-400 p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
                  title="Drag to reorder"
                >
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Position Badge & Direct Number Input */}
                <div className="flex items-center gap-1 shrink-0">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-400 font-black text-[11px] sm:text-xs flex items-center justify-center">
                    #{index + 1}
                  </div>
                  <div className="flex flex-col items-center">
                    <label className="text-[8px] sm:text-[9px] text-slate-500 font-bold uppercase">
                      {language === 'bn' ? 'ক্রম' : 'Pos'}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={orderedItems.length}
                      value={index + 1}
                      onChange={(e) => handlePositionNumberChange(index, parseInt(e.target.value) || 1)}
                      className="w-11 sm:w-12 px-1 py-0.5 text-center bg-[#050811] border border-slate-700 rounded-lg text-base sm:text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Product Thumbnail */}
                <img
                  src={item.image}
                  alt={item.titleEn}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl object-cover border border-slate-700 shrink-0 bg-slate-900"
                />

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                    {language === 'bn' ? item.titleBn : item.titleEn}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
                    <span className="capitalize px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-medium truncate max-w-[80px] sm:max-w-none">
                      {item.category}
                    </span>
                    <span className="text-amber-400 font-bold">{formatPrice(item.price)}</span>
                    <span className="text-slate-500 hidden sm:inline">• Stock: {item.stockCount || 10}</span>
                  </div>
                </div>

                {/* Quick Movement Buttons (Touch-Optimized) */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleMoveToTop(index)}
                    disabled={index === 0}
                    title="Move to Top"
                    className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowUpToLine className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    title="Move Up"
                    className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === orderedItems.length - 1}
                    title="Move Down"
                    className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveToBottom(index)}
                    disabled={index === orderedItems.length - 1}
                    title="Move to Bottom"
                    className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowDownToLine className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions (Sticky Bottom on Mobile) */}
        <div className="sticky bottom-0 z-40 p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom,16px))] sm:pb-4 border-t border-slate-800 flex items-center justify-between gap-3 bg-[#070b14]/98 backdrop-blur-md shrink-0 shadow-2xl">
          <div className="text-[11px] sm:text-xs text-slate-400 truncate">
            {language === 'bn'
              ? `মোট ${orderedItems.length} টি পণ্য`
              : `${orderedItems.length} products`}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2.5 min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition-colors flex items-center justify-center"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              id="admin-save-positions-db-btn"
              onClick={handleSaveToDatabase}
              disabled={isSaving}
              className="px-4 sm:px-6 py-2.5 min-h-[46px] rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl cursor-pointer flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-95"
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950 shrink-0" />
              ) : (
                <Save className="w-4 h-4 text-slate-950 shrink-0" />
              )}
              <span>{language === 'bn' ? 'ডাটাবেজে সেভ করুন' : 'Save to Database'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
