"use client";

import Input from "@/components/layout/Input";
import { Icon } from "@/constants/icons";
import { useUsers } from "@/feature-modules/users/hooks/useuserApi";
import Image from "next/image";
import React from "react";

interface CreateFormBarberProps {
  selectedImage: File | undefined;
  imageUrl?: string;
  hiddenitem?: boolean;
  onUploadImage: (file: File) => void;
  formData: {
    userId: string;
    description: string;
    bio: string;
    experience: number;
  };
  onFormDataChange: (data: Partial<CreateFormBarberProps["formData"]>) => void;
  errors: Record<string, string>;
}

const CreateFormBarber: React.FC<CreateFormBarberProps> = ({
  selectedImage,
  onUploadImage,
  formData,
  onFormDataChange,
  errors,
  hiddenitem,
  imageUrl,
}) => {
  const { data: users, isLoading } = useUsers();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadImage(e.target.files[0]);
    }
  };

  const handleInputChange = (name: string, value: string) => {
    onFormDataChange({ [name]: value });
  };
  console.log(!selectedImage && !imageUrl);
  return (
    <form className="mt-9" onSubmit={(e) => e.preventDefault()}>
      <div className="w-1/2 flex flex-col gap-3">
        {/* Barber Selection */}
        <div hidden={hiddenitem}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Barber *
          </label>
          <select
            name="userId"
            id="userId"
            value={formData.userId}
            onChange={(e) => handleInputChange("userId", e.target.value)}
            className={`w-full px-4 py-3 bg-white border-2 rounded-lg
                      focus:border-dark-purple focus:ring-2 focus:ring-dark-purple/20
                      focus:outline-none transition-all duration-200 ease-in-out
                      text-gray-700 font-medium cursor-pointer
                      hover:border-gray-300 hover:shadow-sm
                      disabled:bg-gray-50 disabled:cursor-not-allowed
                      appearance-none ${
                        errors.userId
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-200"
                      }`}
            disabled={isLoading}
          >
            <option value="" className="text-gray-500 bg-white py-2">
              {isLoading ? "Loading barbers..." : "Choose a barber"}
            </option>
            {!isLoading &&
              users?.map((user) => (
                <option
                  key={user.id}
                  value={user.id}
                  className="text-gray-700 bg-white py-2 px-4
                            hover:bg-gray-50 focus:bg-dark-purple/10"
                >
                  {user.fullName}
                </option>
              ))}
          </select>
          {errors.userId && (
            <p className="text-red-500 text-sm mt-1">{errors.userId}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <Input
            isTextArea={true}
            name="description"
            label="Description *"
            cols={6}
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            error={errors.description}
            placeholder="Describe the barber's services and specialties..."
          />
        </div>

        {/* Experience (Optional) */}
        <div>
          <Input
            name="experience"
            label="Years of Experience "
            type="number"
            value={formData.experience.toString()}
            onChange={(e) => handleInputChange("experience", e.target.value)}
            error={errors.experience}
            placeholder="e.g. 5"
          />
        </div>

        {/* Photo Upload */}
        <div className="w-full">
          <p className="block font-medium w-full text-gray-700 mb-2">Photo</p>

          {!selectedImage && !imageUrl ? (
            <label
              htmlFor="barberImage"
              className="relative w-[114px] h-[114px] border border-dark-purple flex items-center justify-center cursor-pointer
              hover:border-dark-purple/70 transition-colors rounded overflow-hidden"
            >
              <div className="absolute bottom-1 right-1 bg-dark-purple p-[6px] rounded z-10">
                <Icon name="image_upload" className="w-5 h-5 text-white" />
              </div>
            </label>
          ) : (
            <label
              htmlFor="barberImage"
              className="relative w-[114px] h-[114px] border border-dark-purple flex items-center justify-center cursor-pointer
              hover:border-dark-purple/70 transition-colors rounded overflow-hidden"
            >
              <Image
                src={
                  selectedImage
                    ? URL.createObjectURL(selectedImage)
                    : imageUrl || "/images/barber.png"
                }
                alt="Barber"
                width={112}
                height={112}
                className="object-cover border w-[112px] h-[112px]"
              />
              <div className="absolute bottom-1 right-1 bg-dark-purple p-[6px] rounded z-10">
                <Icon name="image_upload" className="w-5 h-5 text-white" />
              </div>
            </label>
          )}

          <input
            type="file"
            accept="image/*"
            className="hidden"
            name="barberImage"
            id="barberImage"
            onChange={handleImageChange}
          />

          {selectedImage && (
            <p className="text-sm text-gray-600 mt-2">
              Selected: {selectedImage.name}
            </p>
          )}
        </div>
      </div>
    </form>
  );
};

export default CreateFormBarber;
