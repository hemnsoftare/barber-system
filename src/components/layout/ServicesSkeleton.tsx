import React from "react";

const ServicesSkeleton = ({ showCenter }: { showCenter?: boolean }) => {
  // Skeleton animation classes
  const skeletonBase = "animate-pulse bg-gray-300 ";

  const ServiceCardSkeleton = () => (
    <div className="p-4 w-full space-y-3">
      {/* Service icon and title row */}
      <div className="flex items-center w-full space-x-3">
        <div className={`${skeletonBase} w-6 h-6`} />
        <div className={`${skeletonBase} h-6 w-24`} />
        <div className={`${skeletonBase} h-4 self-end w-20 `} />
      </div>

      {/* Description */}
      <div className="flex items-center justify-between">
        <div className={`${skeletonBase} h-4 w-[60%]`} />

        {/* Price */}
        <div className="flex justify-end">
          <div className={`${skeletonBase} h-4 w-12`} />
        </div>
      </div>
      {/* Divider */}
      <div className="border-b border-gray-200 mt-4" />
    </div>
  );

  return (
    <div className="w-full p-6 hidden lg:block bg-gray-50">
      <div className="flex  justify-between gap-6 items-center w-full ">
        {/* Left Column - Service Cards */}
        <div className="bg-white w-full -lg shadow-sm">
          <ServiceCardSkeleton />

          <ServiceCardSkeleton />
          <ServiceCardSkeleton />
        </div>

        {/* Center Column - Hero Image */}
        {!showCenter && (
          <div className="relative bg-white self-center -lg min-w-[290px] shadow-sm overflow-hidden">
            <div className={`animate-pulse bg-gray-200 w-full h-80`} />

            {/* Overlay text skeleton */}
            <div className="absolute inset-0 flex flex-col justify-center items-center space-y-4 p-6">
              <div className={`${skeletonBase} h-8 w-48`} />
              <div className={`${skeletonBase} h-8 w-40`} />
              <div className={`${skeletonBase} h-8 w-32`} />
            </div>
          </div>
        )}

        {/* Right Column - Service Cards */}
        <div className="bg-white w-full -lg shadow-sm">
          <ServiceCardSkeleton />
          <ServiceCardSkeleton />
          <ServiceCardSkeleton />
        </div>
      </div>
    </div>
  );
};

export default ServicesSkeleton;
