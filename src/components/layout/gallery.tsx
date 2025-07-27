"use client";
import { useGetGalleryImages } from "@/feature-modules/dashboard/useGalleryUpload";
import GallerySkeleton from "@/feature-modules/users/components/GallerySkeleton";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
const Gallery = () => {
  const router = useRouter().push;
  const { data: images, isLoading } = useGetGalleryImages({
    page: 1,
    pageSize: 8,
  });

  return (
    <div className="lg:-mx-24 md:-mx-8 md:px-8 -mx-4 px-4 lg:px-24 w-screen mt-12 bg-[#1E1E1E] py-4">
      <h1 className="text-[#989898] w-full text-center font-bold pb-4 text-3xl">
        GALLERY
      </h1>
      {isLoading ? (
        <GallerySkeleton />
      ) : (
        <div className="md:grid gap-6 min-w-full flex overflow-x-auto lg:grid-cols-4 md:grid-cols-4 sm:grid-cols-2">
          {images &&
            images.items?.map((src, index) => (
              <Image
                key={index}
                src={src.imageUrl}
                alt={`gallery image ${index + 1}`}
                width={230}
                height={368}
                className="lg:w-[230px] lg:h-[268px] w-full h-[177px] md:h-[177.1px] object-cover filter grayscale hover:grayscale-0 transition duration-300"
              />
            ))}
        </div>
      )}
      <center>
        <button
          onClick={() => router("/gallery")}
          className="text-light-blue md:hover:bg-light-blue md:hover:text-white transition-all mt-6 px-4 py-1 border-light-blue border-2 "
        >
          View Gallery
        </button>
      </center>
    </div>
  );
};

export default Gallery;
