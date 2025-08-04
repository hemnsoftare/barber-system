"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import { Upload, Clock, ImageIcon } from "lucide-react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Input from "@/components/layout/Input";
import { ServiceData } from "../type";
import { useImageUploadMutation } from "@/lib/useImageUploadMutation";

// ────────────────────────────────────────────────────────────────────────────────
// Type definitions
// ────────────────────────────────────────────────────────────────────────────────
interface DurationOption {
  value: number;
  label: string;
}

/** Raw form state held locally before submit */
interface FormData {
  name: string;
  description: string;
  duration: number;
  price: string; // keep as string for Input value binding
  imageUrl: string | null; // data-URL or uploaded URL
}

export interface Service {
  name: string;
  description: string;
  duration: number;
  price: number;
  imageUrl: string;
  id?: string;
}

interface ValidationErrors {
  name?: string;
  description?: string;
  duration?: string;
  price?: string;
  imageurl?: string;
}

interface ServiceManagementDialogProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Callback invoked after validation passes. Implement your persistence logic
   * externally so this component stays presentation-only.
   */
  onSubmit: (
    serviceData: ServiceData,
    type: "create" | "update"
  ) => Promise<void> | void;
  /** Controls wording & whether defaultData is filled */
  title: "create" | "edit";
  defaultData?: ServiceData;
}

// ────────────────────────────────────────────────────────────────────────────────
// Validation Schema
//   • Separate schema for create vs update so editing an existing service
//     doesn't force users to re-upload an image unless they change it.
// ────────────────────────────────────────────────────────────────────────────────
const createSchema = z.object({
  name: z.string().min(1, "Service name is required").max(100),
  description: z.string().min(10).max(500),
  duration: z.number().int().positive(),
  price: z.number().positive(),
  imageUrl: z.string(),
});

const updateSchema = createSchema.partial({ imageUrl: true });

const durationOptions: DurationOption[] = [
  { value: 20, label: "20 minutes" },
  { value: 40, label: "40 minutes" },
  { value: 60, label: "60 minutes" },
];

// ────────────────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────────────────
const ServiceManagementDialog: React.FC<ServiceManagementDialogProps> = ({
  isOpen,
  onOpenChange,
  title,
  onSubmit,
  defaultData,
}) => {
  // ── state ────────────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    duration: 20,
    price: "",
    imageUrl: null,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // cloudinary mutation
  const {
    mutate: uploadImage,
    data: uploadedImage,
    isPending: isUploading,
    isSuccess: isUploadSuccess,
  } = useImageUploadMutation();

  // When upload succeeds swap preview URL to Cloudinary URL so we store a remote link
  useEffect(() => {
    if (isUploadSuccess && uploadedImage?.url) {
      setFormData((prev) => ({ ...prev, imageUrl: uploadedImage.url }));
    }
  }, [isUploadSuccess, uploadedImage]);

  // Populate form when editing
  useEffect(() => {
    if (defaultData) {
      setFormData({
        name: defaultData.name,
        description: defaultData.description,
        duration: defaultData.duration,
        price: defaultData.price.toString(),
        imageUrl: defaultData.imageUrl,
      });
    }
  }, [defaultData]);

  // ── helpers ──────────────────────────────────────────────────────────────────
  const clearFieldError = (field: keyof ValidationErrors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    clearFieldError(field as keyof ValidationErrors);
  };

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    clearFieldError("imageurl");

    // kick off upload — component will update preview again on success
    uploadImage(file);
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, imageUrl: null }));
  };

  const validateForm = (): boolean => {
    const dataForValidation = {
      ...formData,
      price: Number(formData.price) || 0,
    };

    try {
      const schema = title === "create" ? createSchema : updateSchema;
      schema.parse(dataForValidation);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrs: ValidationErrors = {};
        err.errors.forEach((issue) => {
          newErrs[issue.path[0] as keyof ValidationErrors] = issue.message;
        });
        console.log(newErrs);
        setErrors(newErrs);
      }
      return false;
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      duration: 20,
      price: "",
      imageUrl: null,
    });
    setErrors({});
  };

  const handleSubmit = async (type: "create" | "update") => {
    console.log(formData);
    console.log(validateForm());
    if (!validateForm()) return;
    setIsSubmitting(true);
    console.log(type);
    try {
      const payload: ServiceData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        duration: formData.duration,
        price: Number(formData.price),
        imageUrl: formData.imageUrl ?? "",
      } as ServiceData;
      console.log(payload);
      await onSubmit(payload, type);
      resetForm();
      onOpenChange?.(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── render ───────────────────────────────────────────────────────────────────
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          {title === "create" ? "Add New Service" : "Update Service"}
        </Button>
      </DialogTrigger>

      <DialogContent className="w-full h-full max-w-none max-h-none sm:max-w-[500px] sm:h-auto sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>
            {title === "create" ? "Add New Service" : "Update Service"}
          </DialogTitle>
          <DialogDescription>
            {title === "create" ? "Add" : "Update"} service details. All fields
            required.
          </DialogDescription>
        </DialogHeader>

        {/* ── Form ─────────────────────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Service Name */}
          <Input
            id="name"
            label="Service Name"
            placeholder="e.g., Deep Tissue Massage"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}

          {/* Description */}
          <Input
            id="description"
            name="description"
            placeholder="Describe your service…"
            rows={4}
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className={errors.description ? "border-red-500" : ""}
          />
          {errors.description && (
            <p className="text-xs text-red-500">{errors.description}</p>
          )}

          {/* Duration */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <Clock size={16} /> Duration
            </label>
            <Select
              value={String(formData.duration)}
              onValueChange={(val) =>
                handleInputChange("duration", Number(val))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price */}
          <Input
            id="price"
            label="Price ($)"
            type="number"
            placeholder="0.00"
            value={formData.price}
            onChange={(e) => handleInputChange("price", e.target.value)}
            className={errors.price ? "border-red-500" : ""}
          />
          {errors.price && (
            <p className="text-xs text-red-500">{errors.price}</p>
          )}

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <ImageIcon size={16} /> Service Image
            </label>

            {!formData.imageUrl ? (
              <Card
                className={`border-2 border-dashed ${
                  errors.imageurl ? "border-red-500" : "border-gray-300"
                } hover:border-gray-400 transition-colors`}
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload size={32} className="text-gray-400 mb-2" />
                    <span className="text-sm font-medium">
                      {isUploading ? "Uploading…" : "Click to upload image"}
                    </span>
                    <span className="text-xs text-gray-500">
                      PNG/JPG up to 5 MB
                    </span>
                  </label>
                </CardContent>
              </Card>
            ) : (
              <div className="relative">
                <Image
                  src={formData.imageUrl || ""}
                  alt="Service preview"
                  width={500}
                  height={500}
                  className="h-48 w-full object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={removeImage}
                  className="absolute top-2 right-2"
                >
                  Remove
                </Button>
              </div>
            )}
            {errors.imageurl && (
              <p className="text-xs text-red-500">{errors.imageurl}</p>
            )}
          </div>

          {/* Summary */}
          {formData.name && formData.duration && formData.price && (
            <Card>
              <CardContent className="p-4 text-sm space-y-1">
                <h4 className="font-medium mb-2">Service Summary</h4>
                <p>
                  <strong>Name:</strong> {formData.name}
                </p>
                <p>
                  <strong>Duration:</strong> {formData.duration} min
                </p>
                <p>
                  <strong>Price:</strong> $ {formData.price}
                </p>
                <div className="flex gap-2 pt-2">
                  <Badge variant="outline">{formData.duration} min</Badge>
                  <Badge variant="outline">$ {formData.price}</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => onOpenChange?.(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isSubmitting || isUploading}
              onClick={() =>
                handleSubmit(title === "create" ? "create" : "update")
              }
            >
              {isSubmitting
                ? title === "create"
                  ? "Creating…"
                  : "Updating…"
                : title === "create"
                ? "Create Service"
                : "Update Service"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceManagementDialog;
