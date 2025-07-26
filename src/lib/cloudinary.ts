import { v2 as cloudinary } from "cloudinary";
export interface CloudinaryDeleteResponse {
  result: "ok" | "not found";
  public_id?: string;
  error?: {
    message: string;
    http_code: number;
  };
}

export interface CloudinaryConfig {
  cloud_name: string;
  api_key: string;
  api_secret: string;
}

export interface DeleteImageRequest {
  publicId: string;
  resourceType?: "image" | "video" | "raw" | "auto";
}

export interface DeleteImageResponse {
  success: boolean;
  message: string;
  result?: string;
}

const config: CloudinaryConfig = {
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
};

cloudinary.config(config);

export { cloudinary };
