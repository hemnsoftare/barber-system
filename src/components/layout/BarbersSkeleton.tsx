import React from "react";

const BarbersSkeleton = () => {
  return (
    <div className="">
      <div className="max-w-6xl mx-auto">
        {/* Title Skeleton */}

        {/* Barbers Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {[1, 2, 3].map((index) => (
            <div key={index} className="text-center">
              {/* Name Skeleton */}
              <div className="mb-4">
                <div className="h-[250px]  bg-gray-400 rounded-md w-[350px] mx-auto animate-pulse"></div>
              </div>

              {/* Rating Skeleton */}
              <div className="flex items-center justify-between space-x-1">
                <div className="w-24 h-4 bg-gray-300 rounded-sm animate-pulse"></div>
                <div className="ml-2 h-4 bg-gray-300 rounded w-8 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Barbers Component with Loading State
const BarbersSection = () => {
  return <BarbersSkeleton />;
};

export default BarbersSection;
