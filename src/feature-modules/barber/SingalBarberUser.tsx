"use client";
import React, { useState } from "react";
import { useSelectedBarber } from "../booking/action/store";
import HeroAllPage from "@/components/layout/HeroAllPage";
import { Icon } from "@/constants/icons";
import Image from "next/image";
import { useFilterReviews } from "../users/hooks/useReviw";
import ReviewCard from "./components/ReviewCard";
import { useRouter } from "next/navigation";
import BarberSchedule from "./components/BarberSchedule";
const SingalBarberUser = () => {
  const { selected } = useSelectedBarber();
  const [currentPage, setCurrentPage] = useState(0);
  console.log(selected?.id);
  const reviewsPerPage = 3;
  const router = useRouter().push;
  const {
    data: reviews,
    isLoading,
    error,
  } = useFilterReviews({
    barberId: selected?.id,
  });

  if (!isLoading) console.log(error);

  // Calculate pagination
  const totalReviews = reviews?.length || 0;
  const totalPages = Math.ceil(totalReviews / reviewsPerPage);
  const startIndex = currentPage * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;
  const currentReviews = reviews?.slice(startIndex, endIndex) || [];

  // Navigation handlers
  const goToPrevious = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  // Check if buttons should be disabled
  const isPreviousDisabled = currentPage === 0;
  const isNextDisabled = currentPage >= totalPages - 1 || totalReviews === 0;
  return (
    <div>
      <HeroAllPage title="About" image="/images/aboutUs.png" />
      <p
        onClick={() => router("/about-us")}
        className="flex items-center py-8 mt-24 gap-1"
      >
        <Icon name="next" className="rotate-180" /> <span>About</span>
      </p>
      <div className="flex gap-4  md:max-h-[300px] md:min-h-[300px] items-start">
        <Image
          alt="image"
          src={selected?.profileImage || ""}
          blurDataURL={selected?.profileImage || ""}
          priority
          width={290}
          height={380}
          className="object-cover md:min-w-[260px] min-w-[150px] max-w-[150px] min-h-[170px] max-h-[170px] md:max-w-[260px] md:max-h-[300px] md:min-h-[300px]"
        />

        <div className="flex flex-1 flex-col justify-between md:min-h-[300px] md:max-h-[300px] md:pr-4">
          <div>
            <h1 className="text-dark-purple text-xl w-full  md:text-4xl mt-2 font-bold">
              {selected?.fullName}
            </h1>
            <p className="text-[#480024] hidden sm:block mt-3 text-justify indent-2 w-6/12">
              {selected?.description} aaaaaaa With years of experience and a
              passion for the craft, John Doe delivers sharp cuts, clean fades,
              and expert grooming tailored to your style. Whether it is a
              classic look or a modern edge, every haircut is a step toward
              confidence. Book your appointment today and experience the
              difference.
            </p>
          </div>

          <div className="flex mt-2 sm:mt-0 items-center gap-2">
            <Icon name="star" color="#480024" />
            <span>
              {selected?.rating === 0 ? "3.8" : selected?.rating.toFixed(2)}
            </span>
            <span>
              ({selected?.reviewCount === 0 ? "42" : selected?.reviewCount}{" "}
              Reviews)
            </span>
          </div>
        </div>
      </div>
      <p className="text-[#480024] w-full sm:hidden mt-3 text-justify indent-2">
        {selected?.description} With years of experience and a passion for the
        craft, John Doe delivers sharp cuts, clean fades, and expert grooming
        tailored to your style. Whether it is a classic look or a modern edge,
        every haircut is a step toward confidence. Book your appointment today
        and experience the difference.
      </p>

      {/* Reviews Section */}
      <div className="mt-24">
        <div className="grid grid-cols-3 items-center justify-center gap-8 min-h-[200px]">
          {isLoading ? (
            <p>Loading reviews...</p>
          ) : currentReviews.length > 0 ? (
            currentReviews.map((item) => (
              <ReviewCard key={item.id} role="barber" review={item} />
            ))
          ) : (
            <p className="text-gray-500">No reviews available</p>
          )}
        </div>

        {/* Pagination Controls */}
        {totalReviews > 0 && (
          <div className="w-full flex items-center py-8 justify-center gap-8">
            <button
              onClick={goToPrevious}
              disabled={isPreviousDisabled}
              className={`text-2xl transition-colors ${
                isPreviousDisabled
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-[#480024] hover:text-[#6b0036] cursor-pointer"
              }`}
            >
              <Icon
                name="next"
                size={35}
                className="rotate-180"
                color={isPreviousDisabled ? "#d1d5db" : "#480024"}
              />
            </button>

            {/* Page indicator */}
            <span className="text-sm text-gray-600">
              Page {currentPage + 1} of {totalPages}
            </span>

            <button
              onClick={goToNext}
              disabled={isNextDisabled}
              className={`text-2xl transition-colors ${
                isNextDisabled
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-[#480024] hover:text-[#6b0036] cursor-pointer"
              }`}
            >
              <Icon
                name="next"
                size={35}
                color={isNextDisabled ? "#d1d5db" : "#480024"}
              />
            </button>
          </div>
        )}
      </div>
      {selected?.availability && selected.dayOff && (
        <BarberSchedule
          availability={selected?.availability}
          dayOff={selected?.dayOff}
        />
      )}
    </div>
  );
};

export default SingalBarberUser;
