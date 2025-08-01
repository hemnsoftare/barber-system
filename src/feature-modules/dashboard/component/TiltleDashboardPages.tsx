"use client";
import { useRouter } from "next/navigation";
import React, { ReactNode } from "react";
import { IoChevronBackOutline } from "react-icons/io5";

const TiltleDashboardPages = ({
  title,
  children,
  showBackBotton = false,
  backHref,
}: {
  title: string;
  children?: ReactNode;
  showBackBotton?: boolean;
  backHref?: string; // 👈 NEW: Optional manual back route
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex sm:w-full w-fit items-center justify-start gap-3">
        {showBackBotton && (
          <IoChevronBackOutline
            className="text-dark-purple text-2xl mr-4 cursor-pointer rounded-full box-border md:hover:bg-dark-purple/5"
            onClick={handleBack}
          />
        )}
        <h1 className="text-2xl font-semibold text-dark-purple text-shadow-dark-purple capitalize">
          {title}
        </h1>
      </div>
      {children}
    </div>
  );
};

export default TiltleDashboardPages;
