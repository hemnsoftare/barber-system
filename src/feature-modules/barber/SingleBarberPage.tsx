"use client";

import React, { useState, useEffect } from "react";
import { redirect, useParams } from "next/navigation";
import TiltleDashboardPages from "../dashboard/component/TiltleDashboardPages";
import { Button } from "@/components/ui/button";
import CreateFormBarber from "./components/CreateFormBarber";
import { useBarbers, useGetBarberById } from "./hook.ts/useBarberApi";

const SingleBarberPage = () => {
  const params = useParams();
  const barberId = params.id as string;
  const { data, isLoading, error } = useGetBarberById(barberId);
  const { updateBarber, updateError, deleteBarber } = useBarbers();
  const [selectedImage, setSelectedImage] = useState<File | undefined>();
  const [formData, setFormData] = useState({
    userId: "",
    description: "",
    bio: "",
    experience: 0,
    profileImage: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data) {
      console.log(data);
      setFormData({
        userId: data.userId || "",
        description: data.description || "",
        bio: data.bio || "",
        experience: data.experience,
        profileImage: data.profileImage,
      });
    }
  }, [data]);

  const handleFormDataChange = (newData: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
    setErrors((prev) => {
      const updatedErrors = { ...prev };
      for (const key in newData) delete updatedErrors[key];
      return updatedErrors;
    });
  };

  const handleSaveEdits = () => {
    // Update logic here
    console.log("Saving edits:", formData);
    updateBarber({
      data: {
        description: formData.description,
        profileImage: formData.profileImage,
        experience: formData.experience as number,
      },
      id: data?.id as string,
    });
    console.log(updateError);
  };

  const handleDeleteBarber = () => {
    deleteBarber(barberId);
    redirect("/dashboard/barbers");
  };

  if (isLoading) return <div>Loading barber...</div>;
  if (isLoading) console.log(error);

  if (error || !data) {
    console.log(error?.message);
    return <div>Error loading barber</div>;
  }
  return (
    <div>
      <TiltleDashboardPages title={data.fullName} showBackBotton>
        <div className="flex gap-4 items-center">
          <Button
            onClick={handleSaveEdits}
            className="bg-gray-400 text-white md:hover:bg-gray-700 transition-all duration-300"
          >
            Save edits
          </Button>
          <Button
            onClick={handleDeleteBarber}
            className="bg-error text-white md:hover:bg-error/50 transition-all duration-300"
          >
            Delete this barber
          </Button>
        </div>
      </TiltleDashboardPages>

      <CreateFormBarber
        onUploadImage={setSelectedImage}
        selectedImage={selectedImage}
        formData={formData}
        onFormDataChange={handleFormDataChange}
        errors={errors}
        hiddenitem={true}
        imageUrl={"/images/barber.png"}
      />
    </div>
  );
};

export default SingleBarberPage;
