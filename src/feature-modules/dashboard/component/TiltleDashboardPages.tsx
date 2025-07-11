"use client";
import { useRouter } from "next/navigation";
import React, { ReactNode } from "react";
import { IoChevronBackOutline } from "react-icons/io5";
const TiltleDashboardPages = ({
  title,
  children,
  showBackBotton = false,
}: {
  title: string;
  children?: ReactNode;
  showBackBotton?: boolean;
}) => {
  const router = useRouter();
  return (
    <div className="w-full flex items-center justify-between">
      <div className="flex items-center justify-center gap-3">
        {showBackBotton && (
          <IoChevronBackOutline
            className="text-dark-purple text-2xl mr-4 cursor-pointer  rounded-full box-border  md:hover:bg-dark-purple/5"
            onClick={() => {
              router.back();
            }}
          />
        )}
        <h1 className="text-2xl font-semibold text-dark-purple text-shadow-dark-purple capitalize">
          {title}
        </h1>
      </div>
      <div className="">{children}</div>
    </div>
  );
};

export default TiltleDashboardPages;
