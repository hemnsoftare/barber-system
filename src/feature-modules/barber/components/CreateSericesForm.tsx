"use client";
import React, { useState, ChangeEvent, useEffect } from "react";
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

// Type definitions
interface DurationOption {
  value: number;
  label: string;
}

interface FormData {
  name: string;
  description: string;
  duration: number;
  price: string;
  imageFile: File | null;
  imagePreview: string | null;
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
  imageFile?: string;
}

interface ServiceManagementDialogProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit: (
    serviceData: ServiceData,
    type: "create" | "update"
  ) => Promise<void> | void;
  title: "create" | "edit";
  defaultData: ServiceData | undefined;
}

// Zod validation schema
const serviceSchema = z.object({
  name: z
    .string()
    .min(1, "Service name is required")
    .max(100, "Name must be less than 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters"),
  duration: z.number().int().positive("Duration must be a positive number"),
  price: z.number().positive("Price must be greater than 0"),
  imageFile: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "Image must be less than 5MB"
    )
    .refine((file) => file.type.startsWith("image/"), "File must be an image"),
});

const ServiceManagementDialog: React.FC<ServiceManagementDialogProps> = ({
  isOpen,
  onOpenChange,
  title,
  onSubmit,
  defaultData,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    duration: 20,
    price: "",
    imageFile: null,
    imagePreview: null,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const durationOptions: DurationOption[] = [
    { value: 20, label: "20 minutes" },
    { value: 40, label: "40 minutes" },
    { value: 60, label: "60 minutes" },
  ];

  const handleInputChange = (
    field: keyof FormData,
    value: string | number
  ): void => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear specific field error
    if (errors[field as keyof ValidationErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const result = e.target?.result;
        if (typeof result === "string") {
          setFormData((prev) => ({
            ...prev,
            imageFile: file,
            imagePreview: result,
          }));
        }
      };
      reader.readAsDataURL(file);

      // Clear image error
      setErrors((prev) => ({
        ...prev,
        imageFile: undefined,
      }));
    }
  };

  const removeImage = (): void => {
    setFormData((prev) => ({
      ...prev,
      imageFile: null,
      imagePreview: null,
    }));
  };

  const validateForm = (): boolean => {
    try {
      const validationData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
      };

      serviceSchema.parse(validationData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: ValidationErrors = {};
        error.errors.forEach((err) => {
          const fieldName = err.path[0] as keyof ValidationErrors;
          newErrors[fieldName] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (type: "create" | "update"): Promise<void> => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    const serviceData: ServiceData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      duration: formData.duration,
      price: parseFloat(formData.price),
      imageUrl: "images/barber.png", // We know it exists due to validation
    };
    onSubmit(serviceData, type);
    // Call parent's submit handler

    setIsSubmitting(false);
    resetForm();
  };

  const resetForm = (): void => {
    setFormData({
      name: "",
      description: "",
      duration: 20,
      price: "",
      imageFile: null,
      imagePreview: null,
    });
    setErrors({});
  };

  useEffect(() => {
    if (defaultData) {
      setFormData({
        name: defaultData.name,
        description: defaultData.description,
        duration: defaultData.duration,
        price: defaultData.price.toString(),
        imageFile: null,
        imagePreview: defaultData.imageUrl, // Or fetch preview if URL
      });
    }
  }, [defaultData]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          {title === "create" ? `Add New Service` : "Update Service"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {title === "create" ? `Add New Service` : "Update Service"}
          </DialogTitle>
          <DialogDescription>
            {title === "create" ? `Add New ` : "Update "}service with details,
            duration, and pricing. All fields are required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Service Name */}
          <div className="space-y-2">
            <Input
              id="name"
              value={formData.name}
              onChange={(
                e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
              ) => {
                handleInputChange("name", e.target.value);
              }}
              label="services name "
              placeholder="e.g., Deep Tissue Massage"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Input
              name="description"
              id="description"
              value={formData.description}
              onChange={(
                e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
              ) => handleInputChange("description", e.target.value)}
              placeholder="Describe your service in detail..."
              rows={4}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <Clock size={16} />
              Duration
            </label>
            <Select
              value={formData.duration.toString()}
              onValueChange={(value: string) =>
                handleInputChange("duration", parseInt(value))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map((option: DurationOption) => (
                  <SelectItem
                    key={option.value}
                    value={option.value.toString()}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Input
              id="price"
              label="price"
              type="number"
              value={formData.price}
              onChange={(
                e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
              ) => handleInputChange("price", e.target.value)}
              placeholder="0.00"
              className={errors.price ? "border-red-500" : ""}
            />
            {errors.price && (
              <p className="text-sm text-red-500">{errors.price}</p>
            )}
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <ImageIcon size={16} />
              Service Image
            </label>

            {!formData.imagePreview ? (
              <Card
                className={`border-2 border-dashed ${
                  errors.imageFile ? "border-red-500" : "border-gray-300"
                } hover:border-gray-400 transition-colors`}
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload size={32} className="text-gray-400 mb-2" />
                    <span className="text-sm font-medium">
                      Click to upload image
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      PNG, JPG up to 5MB
                    </span>
                  </label>
                </CardContent>
              </Card>
            ) : (
              <div className="relative">
                <Image
                  width={200}
                  height={200}
                  src={"/" + formData.imagePreview}
                  alt="Service preview"
                  className="w-full h-48 object-cover rounded-lg"
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

            {errors.imageFile && (
              <p className="text-sm text-red-500">{errors.imageFile}</p>
            )}
          </div>

          {/* Service Summary */}
          {formData.name && formData.duration && formData.price && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Service Summary</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Name:</strong> {formData.name}
                  </p>
                  <p>
                    <strong>Duration:</strong> {formData.duration} minutes
                  </p>
                  <p>
                    <strong>Price:</strong> ${formData.price}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{formData.duration} min</Badge>
                    <Badge variant="outline">${formData.price}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => onOpenChange && onOpenChange(!isOpen)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              onClick={() => {
                if (onOpenChange) onOpenChange(!isOpen);
                handleSubmit(defaultData === undefined ? "create" : "update");
              }}
            >
              {isSubmitting ? "Creating..." : "Create Service"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceManagementDialog;
