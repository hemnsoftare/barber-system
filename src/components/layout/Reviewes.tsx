"use client";

import React, { useEffect, useRef } from "react";
import SectionTitle from "./SectionTitle";
import ReviewCard from "@/feature-modules/barber/components/ReviewCard";
import { useFilterReviews } from "@/feature-modules/users/hooks/useReviw";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Reviewes = () => {
  const { data: reviews, isLoading } = useFilterReviews({ limit: 3 });
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!reviews || !reviews.length) return;

    cardsRef.current.forEach((card, i) => {
      if (!card) return;
      gsap.from(card, {
        opacity: 0,
        y: 50,
        duration: 0.6,
        delay: i * 0.2,
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [reviews]);

  return (
    <div className="mt-16">
      <SectionTitle title="Reviews" />
      <div className="flex overflow-x-auto items-center gap-8 justify-between">
        {isLoading ? (
          <ReviewCardSkeleton />
        ) : reviews && reviews.length > 0 ? (
          reviews.map((rev, idx) => (
            <div
              key={rev.id}
              ref={(el) => {
                cardsRef.current[idx] = el;
              }}
              className="min-w-[300px]" // add this so horizontal scroll works nicely
            >
              <ReviewCard role="barber" review={rev} />
            </div>
          ))
        ) : (
          <div
            className="text-center text-4xl w-full text-dark-purple"
            style={{ opacity: 0, transform: "translateY(40px)" }}
            ref={(el) => {
              if (el) {
                gsap.to(el, {
                  opacity: 1,
                  y: 0,
                  duration: 0.7,
                  ease: "power2.out",
                  scrollTrigger: {
                    trigger: el,
                    start: "top 90%",
                    toggleActions: "play none none none",
                  },
                });
              }
            }}
          >
            No reviews found.
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviewes;

export const ReviewCardSkeleton = () => {
  return (
    <div className="bg-[#460028] p-4 rounded-md w-full space-y-3 shadow-md animate-pulse min-w-[300px]">
      <div className="w-full flex justify-between items-center">
        <div className="w-5 h-5 bg-white/30 rounded-full" />
        <div className="h-4 w-24 bg-white/30 rounded" />
      </div>

      <div className="space-y-1">
        <div className="h-3 w-full bg-white/20 rounded" />
        <div className="h-3 w-5/6 bg-white/20 rounded" />
        <div className="h-3 w-2/3 bg-white/20 rounded" />
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="h-4 w-24 bg-white/30 rounded" />
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white/50 rounded-full" />
          <div className="h-3 w-10 bg-white/30 rounded" />
        </div>
      </div>

      <div className="flex gap-4 pt-3">
        <div className="h-8 w-full bg-white/20 rounded" />
        <div className="h-8 w-full bg-white/20 rounded" />
      </div>
    </div>
  );
};
