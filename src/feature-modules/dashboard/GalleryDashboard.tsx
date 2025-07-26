"use client";
import React, { useRef, useState } from "react";
import Image from "next/image";
import TiltleDashboardPages from "./component/TiltleDashboardPages";
import {
  useDeleteImageMutation,
  useImageUploadMutation,
} from "@/lib/useImageUploadMutation";
import {
  useDeleteImage,
  useUploadImage,
  useGetGalleryImages,
} from "./useGalleryUpload";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";
import { Icon } from "@/constants/icons";
import GallerySkeleton from "../users/components/GallerySkeleton";
import gsap from "gsap";
import { useLayoutEffect } from "react";
import { useUser } from "@clerk/nextjs";

const GalleryDashboard = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [page, setPage] = useState(1);
  const { user } = useUser();
  const role = user?.publicMetadata.role as "admin" | "barber";
  const { data, isLoading, isError, error } = useGetGalleryImages({
    page,
    pageSize: 8,
  });
  const { mutate: uploadImage, isPending } = useImageUploadMutation();
  const { mutate } = useUploadImage();
  const { mutate: deleteImage } = useDeleteImageMutation();
  const { mutate: deleteOnFirebase } = useDeleteImage();

  const images = data?.items ?? [];
  const hasNextPage = data?.hasNextPage;
  const hasPreviousPage = data?.hasPreviousPage;

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (role !== "admin") {
      toast.error("Only admins can upload images.");
      return;
    }
    const file = e.target.files?.[0];
    if (file)
      uploadImage(file, {
        onSuccess: (e) => {
          mutate(e.url);
          data?.items.unshift({
            id: "e.id" + Math.random().toString(36).substring(2, 1225),
            favorite: 9,
            imageUrl: e.url,
          });
          toast.success("Image uploaded successfully 🎉", {
            description: "Your image has been compressed and saved.",
            icon: <CheckCircle className="text-green-600" />,
            duration: 4000,
          });
        },
      });
  };

  const handleDelete = (id: string, url: string) => {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.[a-zA-Z0-9]+$/);
    let public_id = match ? match[1] : null;

    if (public_id?.startsWith("/")) {
      public_id = public_id.slice(1);
    }

    if (public_id) {
      deleteImage(public_id, {
        onSuccess: () => {
          deleteOnFirebase(id);
          toast.success("Image deleted successfully 🗑️", {
            description: "The image has been removed from the gallery.",
            icon: <CheckCircle className="text-red-600" />,
          });
        },
        onError: (err) => {
          toast.error("Delete failed!", {
            description: err.message,
            icon: <XCircle className="text-red-600" />,
          });
        },
      });
    } else {
      console.warn("Could not extract valid public_id from:", url);
    }
  };
  const galleryRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!galleryRef.current || !images.length) return;

    const ctx = gsap.context(() => {
      gsap.from(".gallery-item", {
        opacity: 0,
        y: 40,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
      });
    }, galleryRef);

    return () => ctx.revert();
  }, [images]);

  return (
    <div className="flex flex-col px-4 gap-4">
      <TiltleDashboardPages title="Gallery">
        <label className="text-white active:scale-90 duration-200 transition-all md:hover:bg-dark-purple/90 box-content w-44 text-center px-7 py-2 bg-dark-purple rounded-none cursor-pointer">
          {isPending ? <p>Uploading...</p> : <p>Add Image</p>}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleSelect}
            className="hidden"
            disabled={isPending}
          />
        </label>
      </TiltleDashboardPages>

      {isError && (
        <div className="mt-4 p-3 bg-red-50 w-full border border-red-200 rounded text-red-700">
          {error?.message}
        </div>
      )}
      {isLoading ? (
        <GallerySkeleton />
      ) : (
        <div
          ref={galleryRef}
          className="grid grid-cols-2 md:grid-cols-4 h-[445px] items-center justify-center flex-wrap gap-3 w-full"
        >
          {images.map((image) => (
            <div key={image.imageUrl} className="relative group gallery-item">
              <Image
                src={image.imageUrl}
                alt="image"
                width={200}
                height={160}
                className="w-full h-[180px] lg:h-[220px] object-cover filter grayscale group-hover:grayscale-0 transition duration-300 rounded-md"
              />
              <button
                onClick={() => handleDelete(image.id, image.imageUrl)}
                className="absolute top-2 right-2  hover:bg-opacity-100 text-indigo-50 bg-dark-purple hover:text-red-700 rounded-full p-1 shadow transition"
              >
                <Icon name="delete" className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center items-center gap-4 mt-4">
        <button
          onClick={() => {
            setPage((prev) => Math.max(prev - 1, 1));
            gsap.to(".gallery-item", {
              scale: 0.95,
              yoyo: true,
              repeat: 1,
              duration: 0.2,
            });
          }}
          disabled={!hasPreviousPage}
          className="px-4 py-2 md:hover:bg-dark-purple/5 rounded "
        >
          <Icon name="next" className="rotate-180" />
        </button>
        <span>{page}</span>
        <button
          onClick={() => {
            setPage((prev) => prev + 1);
            gsap.to(".gallery-item", {
              scale: 0.95,
              yoyo: true,
              repeat: 1,
              duration: 0.2,
            });
          }}
          disabled={!hasNextPage}
          className="px-4 py-2 text-dark-purple transition  md:hover:bg-dark-purple/5"
        >
          <Icon name="next" />
        </button>
      </div>
    </div>
  );
};

export default GalleryDashboard;
