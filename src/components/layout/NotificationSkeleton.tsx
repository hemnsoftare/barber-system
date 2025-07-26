import React from "react";

const NotificationSkeleton = () => {
  return (
    <div className="border my-3 border-dark-purple rounded-md p-4 bg-white w-full shadow-sm animate-pulse">
      <div className="flex justify-between items-start">
        {/* Left: Icon + Title + Message */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-dark-purple/20" />
            <div className="h-4 w-1/3 bg-dark-purple/10 rounded"></div>
          </div>
          <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
        </div>

        {/* Right: Mark as read */}
        <div className="h-3 w-20 bg-dark-purple/10 rounded" />
      </div>

      <div className="mt-4 h-3 w-24 bg-dark-purple/10 rounded" />
    </div>
  );
};

export default NotificationSkeleton;
