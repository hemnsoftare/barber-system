"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import HeroAllPage from "@/components/layout/HeroAllPage";
import { Icon } from "@/constants/icons";
import { useGetGalleryImages } from "../dashboard/useGalleryUpload";
import {
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
  useUserFavorites,
} from "./hooks/useFavorite";
import { useUser } from "@clerk/nextjs";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import GallerySkeleton from "./components/GallerySkeleton";
import { toast } from "sonner";
import { redirect } from "next/navigation";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type GalleryItem = {
  id: string;
  imageUrl: string;
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const Gallery = () => {
  /* --------------------------- Refs for animations --------------------------- */
  const galleryGridRef = useRef<HTMLDivElement | null>(null);
  const paginationRef = useRef<HTMLDivElement | null>(null);
  const ctaBannerRef = useRef<HTMLDivElement | null>(null);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const loadingRef = useRef<HTMLParagraphElement | null>(null);

  /* --------------------------- user & favourites --------------------------- */
  const { user } = useUser();
  const userId = user?.id ?? "";

  const { data: favourites = [], isLoading } = useUserFavorites(userId);
  if (!isLoading) console.log(favourites);
  const { mutate: addFavourite } = useAddFavoriteMutation();
  const { mutate: removeFavourite } = useRemoveFavoriteMutation();

  /* ----------------------------- pagination ------------------------------ */
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  const { data, isLoading: galleryLoading } = useGetGalleryImages({
    page,
    pageSize: PAGE_SIZE,
  });

  const images: GalleryItem[] = data?.items ?? [];
  const hasNextPage = data?.hasNextPage;
  const hasPreviousPage = data?.hasPreviousPage;

  /* --------------------------- GSAP Animations --------------------------- */
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Gallery grid container animation
      if (galleryGridRef.current) {
        gsap.fromTo(
          galleryGridRef.current,
          {
            opacity: 0,
            y: 50,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: galleryGridRef.current,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Pagination animation
      if (paginationRef.current) {
        gsap.fromTo(
          paginationRef.current,
          {
            opacity: 0,
            y: 30,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: paginationRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // CTA Banner animation
      if (ctaBannerRef.current) {
        gsap.fromTo(
          ctaBannerRef.current,
          {
            opacity: 0,
            y: 60,
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ctaBannerRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Loading animation
      if (loadingRef.current && galleryLoading) {
        gsap.fromTo(
          loadingRef.current,
          {
            opacity: 0,
            scale: 0.8,
          },
          {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: "back.out(1.7)",
          }
        );
      }
    });

    return () => ctx.revert();
  }, [galleryLoading]);

  /* --------------------------- Image animations --------------------------- */
  useEffect(() => {
    if (!galleryLoading && images.length > 0) {
      const ctx = gsap.context(() => {
        // Animate individual image items
        imageRefs.current.forEach((ref, index) => {
          if (ref) {
            gsap.fromTo(
              ref,
              {
                opacity: 0,
                y: 40,
                scale: 0.9,
              },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.6,
                ease: "power2.out",
                delay: index * 0.1, // Stagger effect
                scrollTrigger: {
                  trigger: ref,
                  start: "top 85%",
                  toggleActions: "play none none reverse",
                },
              }
            );

            // Hover animations for images
            const imageElement = ref.querySelector("img");
            const buttonElement = ref.querySelector("button");

            if (imageElement) {
              ref.addEventListener("mouseenter", () => {
                gsap.to(imageElement, {
                  scale: 1.05,
                  duration: 0.3,
                  ease: "power2.out",
                });
              });

              ref.addEventListener("mouseleave", () => {
                gsap.to(imageElement, {
                  scale: 1,
                  duration: 0.3,
                  ease: "power2.out",
                });
              });
            }

            if (buttonElement) {
              buttonElement.addEventListener("mouseenter", () => {
                gsap.to(buttonElement, {
                  scale: 1.1,
                  duration: 0.2,
                  ease: "back.out(1.7)",
                });
              });

              buttonElement.addEventListener("mouseleave", () => {
                gsap.to(buttonElement, {
                  scale: 1,
                  duration: 0.2,
                  ease: "power2.out",
                });
              });
            }
          }
        });
      });

      return () => ctx.revert();
    }
  }, [galleryLoading, images]);

  /* --------------------------- Button click animations --------------------------- */
  const animateButtonClick = (element: HTMLElement) => {
    gsap.to(element, {
      scale: 0.95,
      duration: 0.1,
      ease: "power2.out",
      yoyo: true,
      repeat: 1,
    });
  };

  /* --------------------------- Page transition animation --------------------------- */
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (galleryGridRef.current) {
        gsap.fromTo(
          galleryGridRef.current,
          {
            opacity: 0,
            x: page > 1 ? -30 : 30,
          },
          {
            opacity: 1,
            x: 0,
            duration: 0.5,
            ease: "power2.out",
          }
        );
      }
    });

    return () => ctx.revert();
  }, [page]);

  /* --------------------------- helper fns --------------------------- */
  const isFavourited = (imageId: string) =>
    favourites.some((f) => f.imageUrl === imageId);

  const handleToggleFavourite = (image: GalleryItem) => {
    if (!userId) {
      toast.error("You must be logged in to favourite images.", {
        action: {
          label: "Login",
          onClick: () => {
            redirect("/sign-in");
          },
        },
      });
      return;
    }

    if (isFavourited(image.imageUrl)) {
      removeFavourite(
        { userId, imageId: image.id },
        { onSuccess: () => console.log("add") }
      );
      favourites.map((item) => item.id !== image.id);
    } else {
      addFavourite(
        {
          userId,
          imageId: image.id,
          imageUrl: image.imageUrl,
        },
        { onSuccess: () => console.log("remove") }
      );
      favourites.push({
        id: image.id,
        imageId: image.id,
        imageUrl: image.imageUrl,
        userId: "",
      });
    }
  };

  const handlePaginationClick = (
    callback: () => void,
    element: HTMLElement
  ) => {
    animateButtonClick(element);
    setTimeout(callback, 100);
  };

  /* ------------------------------------------------------------------ */
  /* Render                                                              */
  /* ------------------------------------------------------------------ */
  const setImageRef = (el: HTMLDivElement | null, index: number) => {
    imageRefs.current[index] = el;
  };

  return (
    <div>
      {/* ---------- Hero ---------- */}
      <HeroAllPage title="Gallery" image="/images/gallery.png" />

      {/* ---------- Image grid ---------- */}
      <div
        ref={galleryGridRef}
        className={
          galleryLoading
            ? ""
            : "grid grid-cols-2 sm:grid-cols-2  min-h-[520px] lg:grid-cols-4 lg:gap-8 gap-4 mt-24"
        }
      >
        {galleryLoading ? (
          <GallerySkeleton />
        ) : (
          images.map((img, index) => {
            const fav = isFavourited(img.imageUrl);
            console.log(fav);
            return (
              <div
                key={img.id}
                ref={(el) => setImageRef(el, index)}
                className="relative group"
              >
                <Image
                  src={img.imageUrl}
                  alt="gallery"
                  width={230}
                  height={368}
                  className="w-full md:h-[268px] h-[178px]  object-cover filter grayscale group-hover:grayscale-0 transition duration-300"
                />

                <button
                  onClick={() => handleToggleFavourite(img)}
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
          })
        )}
      </div>

      {/* ---------- Pagination ---------- */}
      <div
        ref={paginationRef}
        className="flex items-center justify-center gap-5 mt-8"
      >
        <button
          onClick={(e) =>
            handlePaginationClick(
              () => setPage((p) => Math.max(p - 1, 1)),
              e.currentTarget
            )
          }
          disabled={!hasPreviousPage}
          className="px-4 py-2 rounded-md md:hover:bg-dark-purple/5 disabled:opacity-40"
        >
          <Icon name="next" className="rotate-180" />
        </button>

        <span className="font-semibold">{page}</span>

        <button
          onClick={(e) =>
            handlePaginationClick(() => setPage((p) => p + 1), e.currentTarget)
          }
          disabled={!hasNextPage}
          className="px-4 py-2 text-dark-purple transition md:hover:bg-dark-purple/5 disabled:opacity-40"
        >
          <Icon name="next" />
        </button>
      </div>

      {/* ---------- CTA banner ---------- */}
      <div
        ref={ctaBannerRef}
        className="flex flex-col lg:flex-row items-center mt-12 gap-12"
      >
        <div className="text-center lg:text-left">
          <h1 className="font-black text-2xl text-dark-purple">
            Fresh cuts. <br /> Sharp styles.
          </h1>
          <h2 className="text-dark-purple text-xl mb-4">Book now!</h2>
          <button className="px-12 bg-dark-purple py-2 text-white rounded">
            Book an appointment
          </button>
        </div>

        <div className="relative">
          <Image
            src="/images/contactUs.png"
            alt="contact us"
            width={600}
            height={400}
            className="w-[600px] min-h-[170px] max-h-[200px] object-cover"
          />
          <h1 className="text-light-blue font-black sm:text-4xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            FOOTBALL <br /> BARBER CLUB
          </h1>
        </div>
      </div>
    </div>
  );
};

export default Gallery;
