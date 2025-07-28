"use client";
import React, { useState } from "react";
import {
  useFilterReviews,
  useUpdateReviewStatus,
} from "../users/hooks/useReviw";
import { useUser } from "@clerk/nextjs";
import TiltleDashboardPages from "./component/TiltleDashboardPages";
import ReviewCard from "../barber/components/ReviewCard";
import { Review } from "../users/type";
import { useGetBarbers } from "../barber/hook.ts/useBarberApi";
import SelectBarber from "../barber/components/SelectBarber";
import { Barber } from "../barber/type";

type ReviewStatus = "accept" | "reject" | "pending";

const ReviewPage = () => {
  const { user } = useUser();
  const { data: barbers, isLoading: loadingBarber } = useGetBarbers();
  const [currentBarber, setCurrentBarber] = useState<Barber | null>(null);
  const [activeTab, setActiveTab] = useState<ReviewStatus>("pending");
  // Add local state for optimistic updates
  const [localReviews, setLocalReviews] = useState<Review[]>([]);

  const role = user?.publicMetadata.role as "barber" | "admin";

  // Build filter based on role and current selections
  const buildFilter = () => {
    if (role === "barber") {
      // Barbers only see accepted reviews for their own barbershop
      return { barberId: user?.id, status: "accept" as const };
    } else if (role === "admin") {
      // Admin can see all reviews or filter by barber and status
      if (false) {
        // If a barber is selected, filter by that barber
      } else {
        // No barber selected, show all reviews or filter by status
        if (activeTab === "pending") {
          return { isAll: true };
        } else {
          return { status: activeTab };
        }
      }
    }
    // Default fallback
    return { isAll: true };
  };

  const filter = buildFilter();

  const {
    data: reviews,
    isLoading: loadingReview,
    error,
  } = useFilterReviews(filter);

  const { mutate } = useUpdateReviewStatus();

  // Update local state when reviews data changes
  React.useEffect(() => {
    if (reviews) {
      setLocalReviews(reviews);
    }
  }, [reviews]);
  if (!loadingReview) {
    console.log(reviews);
  }
  if (error) {
    console.error("Error fetching reviews:", error);
    return (
      <div>
        Error loading reviews <p>{error.message}</p>
      </div>
    );
  }

  const handleAccept = (review: Review, type: "accept" | "reject") => {
    // Optimistic update - immediately update local state
    setLocalReviews((prevReviews) =>
      prevReviews.map((item) =>
        item.id === review.id ? { ...item, status: type } : item
      )
    );

    // Then update the server
    mutate(
      { reviewId: review.id || "", status: type },
      {
        onSuccess: () => {
          console.log("success");
          // Optionally refetch data or keep optimistic update
        },
        onError: () => {
          console.log("error");
          // Revert optimistic update on error
          setLocalReviews((prevReviews) =>
            prevReviews.map((item) =>
              item.id === review.id ? { ...item, status: review.status } : item
            )
          );
        },
      }
    );
  };

  const handleBarberChange = (barberId: string) => {
    const selectedBarber =
      barbers?.find((item) => item.id === barberId) || null;
    setCurrentBarber(selectedBarber);
    // Reset tab to "all" when changing barber
  };

  const handleTabChange = (tab: ReviewStatus) => {
    setActiveTab(tab);
  };

  // Use localReviews instead of reviews for rendering
  const displayReviews = localReviews || reviews || [];

  return (
    <div>
      <TiltleDashboardPages title="Review " />

      {/* Admin Controls */}
      {role === "admin" && (
        <div className="mb-6  space-y-4">
          {/* Barber Selection - Only for Admin */}
          <div className="flex items-center  flex-row-reverse justify-end gap-5">
            <button
              onClick={() => setCurrentBarber(null)}
              className="bg-dark-purple text-base py-3 sm:text-lg self-end text-nowrap  text-white px-3 sm:px-7  rounded-none "
            >
              All Barbers
            </button>
            <SelectBarber
              key={currentBarber?.id}
              isLoading={loadingBarber}
              barbers={
                barbers
                  ?.filter((item) => typeof item.id === "string")
                  .map((item) => ({
                    name: item.fullName,
                    id: item.id as string,
                  })) ?? []
              }
              onChange={handleBarberChange}
            />
          </div>
          {/* Status Tabs - Only for Admin */}
          <div className="flex font-semibold space-x-2 border-b">
            <button
              onClick={() => handleTabChange("pending")}
              className={`px-4 py-2 font-medium text-lg rounded-t-lg ${
                activeTab === "pending"
                  ? " text-dark-purple border-b-2 border-dark-purple"
                  : "text-dark-purple md:hover:border-b-2 border-dark-purple"
              }`}
            >
              Pending
              <span className="ml-2 rounded-full px-2 py-0.5">
                {
                  displayReviews.filter((item) => {
                    const isStatusMatch = item.status === "pending";
                    const isBarberMatch = currentBarber
                      ? item.barberId === currentBarber.id
                      : true;
                    return isStatusMatch && isBarberMatch;
                  }).length
                }
              </span>
            </button>
            <button
              onClick={() => handleTabChange("accept")}
              className={`px-4 py-2 font-medium text-lg rounded-t-lg ${
                activeTab === "accept"
                  ? " text-dark-purple border-b-2 border-dark-purple"
                  : "text-dark-purple md:hover:border-b-2 border-dark-purple"
              }`}
            >
              Accepted
              <span className="ml-2  rounded-full px-2 py-0.5">
                {
                  displayReviews.filter((item) => {
                    const isStatusMatch = item.status === "accept";
                    const isBarberMatch = currentBarber
                      ? item.barberId === currentBarber.id
                      : true;
                    return isStatusMatch && isBarberMatch;
                  }).length
                }
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Reviews Grid */}
      <div className="mt-6 w-full gap-3 sm:gap-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 items-center justify-center">
        {loadingReview ? (
          <div className="col-span-full text-center">
            <p className="text-gray-500">Loading reviews...</p>
          </div>
        ) : displayReviews && displayReviews.length > 0 ? (
          displayReviews
            .filter((item) => {
              const isStatusMatch = item.status === activeTab;
              const isBarberMatch = currentBarber
                ? item.barberId === currentBarber.id
                : true;
              const isbarber = role === "barber";
              return (isStatusMatch && isBarberMatch) || isbarber;
            })
            .map((review) => (
              <ReviewCard
                key={`${review.id}_${currentBarber?.id ?? "all"}_${
                  displayReviews.length
                }_${activeTab}`}
                review={review}
                role={role}
                onAccept={() => handleAccept(review, "accept")}
                onReject={() => handleAccept(review, "reject")}
              />
            ))
        ) : (
          <div className="col-span-full text-center">
            <h1 className="text-dark-purple text-xl font-semibold">
              No reviews found
            </h1>
            <p className="text-gray-500 mt-2">
              {role === "admin" && currentBarber
                ? `No reviews found for ${currentBarber.fullName}`
                : role === "admin"
                ? "No reviews available"
                : "No accepted reviews for your barbershop"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewPage;
