import React from 'react';

export function ProductCardSkeleton() {
  return (
    <div className="bg-[#141820] border border-[#262C38] rounded-xl p-3 flex flex-col justify-between animate-pulse shadow-xs h-full">
      <div className="relative aspect-square w-full rounded-lg bg-[#181D26] overflow-hidden mb-3">
        <div className="absolute top-2 left-2 w-14 h-4 rounded-xs bg-[#242C38]"></div>
        <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#242C38]"></div>
      </div>
      <div className="space-y-2 flex-1">
        <div className="w-1/3 h-3 rounded bg-[#242C38]"></div>
        <div className="w-4/5 h-4 rounded bg-[#2C3544]"></div>
        <div className="w-2/3 h-3 rounded bg-[#242C38]"></div>
      </div>
      <div className="mt-4 pt-3 border-t border-[#232936] flex items-center justify-between">
        <div className="space-y-1">
          <div className="w-16 h-5 rounded bg-[#2C3544]"></div>
          <div className="w-10 h-3 rounded bg-[#242C38]"></div>
        </div>
        <div className="w-16 h-7 rounded-md bg-[#C6A15B]/20 border border-[#C6A15B]/30"></div>
      </div>
    </div>
  );
}
