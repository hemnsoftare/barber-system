"use client";
import { useRouter } from "next/navigation";
import React, { ReactNode } from "react";
import { IoChevronBackOutline } from "react-icons/io5";

type Props = {
  title: string;
  children?: ReactNode;
  showBackBotton?: boolean; // fixed spelling
  backHref?: string;
};

const TiltleDashboardPages: React.FC<Props> = ({
  title,
  children,
  showBackBotton = false,
  backHref,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) router.push(backHref);
    else router.back();
  };

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex sm:w-full w-fit items-center justify-start gap-3">
        {showBackBotton && (
          <button
            type="button"
            onClick={handleBack}
            aria-label="Go back"
            className="mr-2 rounded-full p-1 text-dark-purple hover:bg-dark-purple/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-purple/40"
          >
            <IoChevronBackOutline className="text-2xl" />
          </button>
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
