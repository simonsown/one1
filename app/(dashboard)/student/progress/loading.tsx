import React from 'react'

export default function ProgressLoading() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto p-6 md:p-10">
      {/* Title Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 bg-[#1a1c25] animate-pulse rounded-lg" />
        <div className="h-4 w-96 bg-[#1a1c25] animate-pulse rounded-lg" />
      </div>

      {/* 4 Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(idx => (
          <div key={idx} className="bg-[#1a1c25] border border-white/5 rounded-2xl p-6 h-28 flex flex-col justify-between animate-pulse">
            <div className="h-4 w-24 bg-white/5 rounded-md" />
            <div className="h-8 w-16 bg-white/5 rounded-md" />
          </div>
        ))}
      </div>

      {/* Two Columns Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#1a1c25] border border-white/5 rounded-2xl p-6 h-96 animate-pulse">
          <div className="h-6 w-48 bg-white/5 rounded-md mb-6" />
          <div className="w-full h-72 bg-white/5 rounded-xl" />
        </div>
        <div className="bg-[#1a1c25] border border-white/5 rounded-2xl p-6 h-96 animate-pulse">
          <div className="h-6 w-48 bg-white/5 rounded-md mb-6" />
          <div className="w-full h-72 bg-white/5 rounded-xl" />
        </div>
      </div>

      {/* Heatmap Skeleton */}
      <div className="bg-[#1a1c25] border border-white/5 rounded-2xl p-6 h-40 animate-pulse">
        <div className="h-6 w-64 bg-white/5 rounded-md mb-6" />
        <div className="w-full h-16 bg-white/5 rounded-xl" />
      </div>

      {/* Table Skeleton */}
      <div className="bg-[#1a1c25] border border-white/5 rounded-2xl p-6 space-y-4 animate-pulse">
        <div className="h-6 w-48 bg-white/5 rounded-md" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(idx => (
            <div key={idx} className="h-12 w-full bg-white/5 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
