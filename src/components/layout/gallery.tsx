"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
const Gallery = () => {
  const router = useRouter().push;
  const arrImage = Array.from(
    { length: 8 },
    (_, i) => `/gallery/i${i + 1}.png`
  );

  return (
    <div className="-mx-24 px-24 w-screen mt-12 bg-[#1E1E1E] py-4">
      <h1 className="text-[#989898] w-full text-center font-bold pb-4 text-3xl">
        GALLERY
      </h1>
      <div className="grid gap-6 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2">
        {arrImage.map((src, index) => (
          <Image
            key={index}
            src={src}
            alt={`gallery image ${index + 1}`}
            width={230}
            height={368}
            className="w-[230px] h-[268px] object-cover filter grayscale hover:grayscale-0 transition duration-300"
          />
        ))}
      </div>
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
