import React from 'react';

/**
 * Root Accessible Loading Skeleton for EngelsizForum.
 * Renders instantly when App Router performs route transitions or server component fetches.
 */
export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="İçerik yükleniyor, lütfen bekleyiniz"
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 animate-pulse"
    >
      <span className="sr-only">Sayfa içeriği yükleniyor...</span>

      {/* Hero / Header Skeleton */}
      <div className="space-y-3 max-w-3xl">
        <div className="h-4 w-28 bg-[#161f33] rounded-md" />
        <div className="h-8 sm:h-10 w-3/4 bg-[#161f33] rounded-xl" />
        <div className="h-4 w-full bg-[#111726] rounded-md" />
        <div className="h-4 w-2/3 bg-[#111726] rounded-md" />
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="p-6 bg-[#111726] border border-white/[0.08] rounded-2xl space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#161f33]" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3.5 w-24 bg-[#161f33] rounded-md" />
                <div className="h-2.5 w-16 bg-[#161f33]/60 rounded-md" />
              </div>
            </div>
            <div className="h-5 w-5/6 bg-[#161f33] rounded-md" />
            <div className="space-y-2">
              <div className="h-3.5 w-full bg-[#161f33]/80 rounded-md" />
              <div className="h-3.5 w-4/5 bg-[#161f33]/80 rounded-md" />
            </div>
            <div className="pt-2 flex items-center justify-between">
              <div className="h-3 w-16 bg-[#161f33] rounded-md" />
              <div className="h-3 w-12 bg-[#161f33] rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
