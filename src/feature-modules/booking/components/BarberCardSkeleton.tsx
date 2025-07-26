// BarberCardSkeleton.tsx
import React from "react";

export const BarberCardSkeleton = () => {
  return (
    <div className="flex items-center gap-4 py-4 px-6 rounded-lg bg-gray-200 animate-pulse">
      {/* Profile Image Skeleton */}
      <div className="w-16 h-16 bg-gray-400 rounded-full flex-shrink-0"></div>

      {/* Content Skeleton */}
      <div className="flex-1">
        {/* Name Skeleton */}
        <div className="h-6 bg-gray-400 rounded w-32 mb-2"></div>

        {/* Rating Skeleton */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-400 rounded"></div>
          <div className="h-4 bg-gray-400 rounded w-20"></div>
        </div>
      </div>

      {/* Selection Circle Skeleton */}
      <div className="w-6 h-6 border-2 border-gray-400 rounded-full"></div>
    </div>
  );
};

// BarberSelectionSkeleton.tsx - Full page skeleton
const BarberSelectionSkeleton = () => {
  return (
    <div className=" flex items-center gap-2.5">
      {/* Header Skeleton */}

      {/* Content Skeleton */}
      <div className="px-6 md:px-24 py-10">
        <div className="space-x-4 flex items-center ">
          {/* Render multiple skeleton cards */}
          {Array.from({ length: 3 }).map((_, index) => (
            <BarberCardSkeleton key={index} />
          ))}
        </div>

        {/* Buttons Skeleton */}
      </div>
    </div>
  );
};

// Usage in your main component
const BarberSelectionPage = () => {
  return <BarberSelectionSkeleton />;
};

export default BarberSelectionPage;
