"use client";

import Input from "@/components/layout/Input";
import { useNonCustomerUsers } from "@/feature-modules/users/hooks/useuserApi";
// import { useUsers } from "@/feature-modules/users/hooks/useuserApi";
import React from "react";

interface CreateFormBarberProps {
  hiddenitem?: boolean;
  formData: {
    userId: string;
    description: string;
    experience: number;
  };
  onFormDataChange: (data: Partial<CreateFormBarberProps["formData"]>) => void;
  errors: Record<string, string>;
}

const CreateFormBarber: React.FC<CreateFormBarberProps> = ({
  formData,
  onFormDataChange,
  errors,
  hiddenitem,
}) => {
  // const { data: users, isLoading } = useUsers();
  const { data: users, isLoading } = useNonCustomerUsers();

  const handleInputChange = (name: string, value: string) => {
    onFormDataChange({ [name]: value });
  };

  return (
    <form className="mt-9" onSubmit={(e) => e.preventDefault()}>
      <div className="lg:w-1/2 w-full flex flex-col gap-3">
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
            className={`w-full px-4 py-3 bg-white border-2  border-dark-purple
                      focus:border-dark-purple 
                       transition-all duration-200 ease-in-out
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
      </div>
    </form>
  );
};

export default CreateFormBarber;
