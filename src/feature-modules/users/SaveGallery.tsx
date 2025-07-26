"use client";

import HeroAllPage from "@/components/layout/HeroAllPage";
import { Icon } from "@/constants/icons";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import React from "react";
import {
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
  useUserFavorites,
} from "./hooks/useFavorite";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import GallerySkeleton from "./components/GallerySkeleton";
gsap.registerPlugin(ScrollTrigger);

const SaveGallery = () => {
  const { user } = useUser();
  const userId = user?.id ?? "";

  const { data: favorites = [], isLoading, isError } = useUserFavorites(userId);

  const { mutate: addFavorite } = useAddFavoriteMutation();
  const { mutate: removeFavorite } = useRemoveFavoriteMutation();
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const bannerRef = useRef<HTMLDivElement | null>(null);
  const emptyStateRef = useRef<HTMLDivElement | null>(null);

  const isFavourited = (imageId: string) =>
    favorites.some((fav) => fav.imageId === imageId);

  const handleToggleFavourite = (img: {
    imageId: string;
    imageUrl: string;
  }) => {
    if (isFavourited(img.imageId)) {
      removeFavorite({ userId, imageId: img.imageId });
    } else {
      addFavorite({
        userId,
        imageId: img.imageId,
        imageUrl: img.imageUrl,
      });
    }
  };
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (bannerRef.current) {
        gsap.fromTo(
          bannerRef.current,
          { opacity: 0, scale: 0.95 },
          {
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: bannerRef.current,
              start: "top 85%",
            },
          }
        );
      }

      if (emptyStateRef.current) {
        gsap.fromTo(
          emptyStateRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: emptyStateRef.current,
              start: "top 85%",
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (galleryRef.current) {
        gsap.fromTo(
          galleryRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: galleryRef.current,
              start: "top 85%",
            },
          }
        );
      }

      if (bannerRef.current) {
        gsap.fromTo(
          bannerRef.current,
          { opacity: 0, scale: 0.95 },
          {
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: bannerRef.current,
              start: "top 85%",
            },
          }
        );
      }

      if (emptyStateRef.current) {
        gsap.fromTo(
          emptyStateRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: emptyStateRef.current,
              start: "top 85%",
            },
          }
        );
      }

      ScrollTrigger.refresh(); // 👈 add this here
    });

    return () => ctx.revert();
  }, [favorites]); // 👈 dependency updated

  return (
    <div>
      <HeroAllPage title="SAVED IMAGES" image="/images/save.png" />

      {isLoading ? (
        <GallerySkeleton />
      ) : isError ? (
        <p className="text-center mt-20 text-red-500">
          Something went wrong loading favorites.
        </p>
      ) : !favorites ? (
        <div
          ref={emptyStateRef}
          className="flex items-center justify-center w-full flex-col gap-8"
        >
          <p className="text-center mt-20  text-3xl font-bold text-dark-purple">
            No favorites yet
          </p>
          <button className="text-white px-8 py-2 bg-dark-purple text-2xl font-bold">
            Gallery
          </button>
        </div>
      ) : (
        <div
          ref={galleryRef}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8 mt-24"
        >
          {favorites.map((img) => {
            const fav = isFavourited(img.imageId);

            return (
              <div
                key={img.imageId}
                ref={(el) => {
                  if (el) {
                    gsap.fromTo(
                      el,
                      {
                        opacity: 0,
                        y: 20,
                        x: Math.floor(Math.random() * (40 - -20 + 1)) + -40,
                      },
                      {
                        opacity: 1,
                        y: 0,
                        x: 0,
                        duration: 0.4,
                        ease: "power2.out",
                        scrollTrigger: {
                          trigger: el,
                          start: "top 95%",
                        },
                      }
                    );
                  }
                }}
                className="relative group"
              >
                <Image
                  src={img.imageUrl}
                  alt="saved"
                  width={230}
                  height={368}
                  className="w-full h-[176px] sm:h-[268px] object-cover filter grayscale group-hover:grayscale-0 transition duration-300"
                />

                <button
                  onClick={() =>
                    handleToggleFavourite({
                      imageId: img.imageId,
                      imageUrl: img.imageUrl,
                    })
                  }
                  className="absolute top-3 right-3 p-2 rounded-full bg-dark-purple/80 hover:bg-dark-purple transition"
                >
                  <Icon
                    name={fav ? "bookmark_filled" : "bookmark"}
                    className={`text-white ${
                      fav ? "fill-current" : "stroke-current"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      )}
      <center>
        <div
          ref={bannerRef}
          className="relative mt-24  shadow-md shadow-dark-purple overflow-hidden"
        >
          {/* 🔹 Background Image */}
          <Image
            src="/images/contactUs.png"
            alt="Barber banner"
            width={1300}
            height={300}
            className="w-full min-h-[300px] max-h-[300px] object-cover"
          />

          {/* 🔹 Overlay Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h2 className="text-light-blue text-2xl sm:text-3xl font-extrabold drop-shadow-md">
              Look Sharp, Feel confident
            </h2>
            <p className="text-white mt-2 text-base sm:text-lg font-medium">
              Book your cut today!
            </p>

            <Link
              href="/booking/services"
              className="mt-6 bg-white text-black px-6 py-2 rounded shadow hover:bg-gray-200 transition font-semibold"
            >
              Book an appointment
            </Link>
          </div>
        </div>
      </center>
    </div>
  );
};

export default SaveGallery;
