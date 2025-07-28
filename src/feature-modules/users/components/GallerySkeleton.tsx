import { Icon } from "@/constants/icons";
import React from "react";

const GallerySkeleton = ({ isHomePage }: { isHomePage?: boolean }) => {
  return (
    <div
      className={
        isHomePage
          ? "flex items-center justify-start overflow-x-auto sm:grid sm:grid-cols-4"
          : "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 mt-24"
      }
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="relative w-full h-[178px] md:h-[268px] bg-gray-300 animate-pulse rounded"
        >
          {/* Fake bookmark icon */}
          <div className="absolute top-3 right-3 w-6 h-6 bg-dark-purple/50 rounded-full flex items-center justify-center">
            <Icon
              name="bookmark_filled"
              className="w-3 h-4 bg-white rounded-sm"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default GallerySkeleton;
