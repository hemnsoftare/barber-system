"use client";
import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import imageCompression from "browser-image-compression";

/* ------------------------------------------------------------------ */
/* 🔸 Types                                                            */
/* ------------------------------------------------------------------ */
export type CompressionStats = {
  originalSize: string; // KB
  compressedSize: string; // KB
  compressionRatio: string; // %
};

export type UploadResult = {
  url: string;
  stats: CompressionStats;
};

/* ------------------------------------------------------------------ */
/* 🔸 Config – ideally pull from .env.local                            */
/* ------------------------------------------------------------------ */
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD || "dmfqwott6";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET || "barber";

/* ------------------------------------------------------------------ */
/* 🔸 Core upload function (used by the mutation)                      */
/* ------------------------------------------------------------------ */
const uploadImageFn = async (file: File): Promise<UploadResult> => {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please select a valid image file");
  }

  /* -- 1. Compress -------------------------------------------------- */
  const options = {
    maxSizeMB: 0.3,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    fileType: "image/jpeg",
  };
  const compressed = await imageCompression(file, options);

  /* -- 2. Send to Cloudinary --------------------------------------- */
  const formData = new FormData();
  formData.append("file", compressed);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );
  const data = await res.json();

  if (!data.secure_url) {
    throw new Error("Upload failed");
  }

  /* -- 3. Return nicely formatted stats + URL ---------------------- */
  const stats: CompressionStats = {
    originalSize: (file.size / 1024).toFixed(2),
    compressedSize: (compressed.size / 1024).toFixed(2),
    compressionRatio: (
      ((file.size - compressed.size) / file.size) *
      100
    ).toFixed(1),
  };

  return { url: data.secure_url, stats };
};

/* ------------------------------------------------------------------ */
/* 🔸 Hook                                                            */
/* ------------------------------------------------------------------ */
export const useImageUploadMutation = (): UseMutationResult<
  UploadResult,
  Error,
  File
> =>
  useMutation({
    mutationFn: uploadImageFn,
    // Optional tweaks:
    // retry: 1,
    // onError: (e) => toast.error(e.message),
    // onSuccess: (data) => console.log("Uploaded!", data),
  });
// lib/hooks/useDeleteImageMutation.ts
// lib/hooks/useDeleteImageMutation.ts

export type DeleteImageInput = string;

export type DeleteImageSuccess = {
  success: true;
  result: {
    public_id: string;
    result: "ok";
    [key: string]: unknown;
  };
};

export type DeleteImageError = {
  success: false;
  error: string;
};

type DeleteImageResponse = DeleteImageSuccess | DeleteImageError;

/* 🔥 Main Hook */
export const useDeleteImageMutation = (): UseMutationResult<
  DeleteImageSuccess,
  Error,
  DeleteImageInput
> =>
  useMutation({
    mutationFn: async (
      publicId: DeleteImageInput
    ): Promise<DeleteImageSuccess> => {
      const response = await fetch("/api/delete-image", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ publicId }),
      });

      const data: DeleteImageResponse = await response.json();

      // 💥 Defensive logging
      console.log("Cloudinary delete response:", data);

      if (!data.success || !("result" in data)) {
        throw new Error(data.error || "Unknown Cloudinary error");
      }

      return data;
    },
  });
