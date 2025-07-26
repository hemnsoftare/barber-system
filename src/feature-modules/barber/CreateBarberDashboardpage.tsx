"use client";

import React, { useState } from "react";
import TiltleDashboardPages from "../dashboard/component/TiltleDashboardPages";
import CreateFormBarber from "./components/CreateFormBarber";
import AvailableForm from "./components/AvailableForm";
import { Button } from "@/components/ui/button";
import { createBarberAction } from "./actionBarber";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
// import { useServices } from "./hook.ts/useSerices";
// import ServicesRow from "./components/ServicesRow";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEY } from "./hook.ts/useBarberApi";
import { useUser } from "@clerk/nextjs";

export interface AvailabilityData {
  day: string;
  enabled: boolean;
  from: string;
  to: string;
}

const CreateBarberDashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const role = user?.publicMetadata.role as "admin" | "barber";

  const [formData, setFormData] = useState({
    userId: "",
    description: "",
    experience: 0,
  });
  // const { services, isLoading: isLoadingServices } = useServices();
  // const [enabledServiceIds, setEnabledServiceIds] = useState<string[]>([]);
  const [availabilities, setAvailabilities] = useState<AvailabilityData[]>([
    { day: "Sunday", enabled: true, from: "08:00", to: "18:00" },
    { day: "Monday", enabled: true, from: "08:00", to: "18:00" },
    { day: "Tuesday", enabled: true, from: "08:00", to: "18:00" },
    { day: "Wednesday", enabled: true, from: "08:00", to: "18:00" },
    { day: "Thursday", enabled: true, from: "08:00", to: "18:00" },
    { day: "Friday", enabled: true, from: "08:00", to: "18:00" },
    { day: "Saturday", enabled: true, from: "08:00", to: "18:00" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  console.log(formData);
  const handleFormDataChange = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    if (Object.keys(errors).length > 0) setErrors({});
  };

  // const toggleServiceEnable = (id: string) => {
  //   setEnabledServiceIds((prev) =>
  //     prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
  //   );
  // };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.userId) {
      newErrors.userId = "Please select a barber";
    }
    if (!formData.description || formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    const enabledAvailabilities = availabilities.filter((a) => a.enabled);
    if (enabledAvailabilities.length === 0) {
      newErrors.availability = "At least one day must be available";
    }

    enabledAvailabilities.forEach((avail) => {
      if (!avail.from || !avail.to) {
        newErrors[
          `${avail.day}_time`
        ] = `${avail.day} requires both start and end times`;
      } else if (avail.from >= avail.to) {
        newErrors[
          `${avail.day}_time`
        ] = `${avail.day} end time must be after start time`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateBarber = async () => {
    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    setIsLoading(true);
    const profileImageUrl = "";

    try {
      // ... image upload logic ...

      const barberFormData = new FormData();
      barberFormData.append("userId", formData.userId);
      barberFormData.append("description", formData.description);
      if (formData.experience)
        barberFormData.append("experience", formData.experience.toString());
      if (profileImageUrl)
        barberFormData.append("profileImage", profileImageUrl);

      // Process availabilities with better validation
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      days.forEach((day) => {
        const dayAvailability = availabilities.find(
          (avail) => avail.day === day
        );

        if (dayAvailability) {
          barberFormData.append(
            `${day}_enabled`,
            dayAvailability.enabled.toString()
          );

          if (dayAvailability.enabled) {
            // Validate time format before appending
            if (isValidTimeFormat(dayAvailability.from)) {
              barberFormData.append(`${day}_from`, dayAvailability.from);
            }
            if (isValidTimeFormat(dayAvailability.to)) {
              barberFormData.append(`${day}_to`, dayAvailability.to);
            }
          }
        } else {
          // Default to disabled if no availability set
          barberFormData.append(`${day}_enabled`, "false");
        }
      });

      // Log form data for debugging

      barberFormData.append("services", JSON.stringify(null));

      const result = await createBarberAction(barberFormData);

      if (result.success) {
        toast.success(result.message || "Barber created successfully!");
        queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        router.push("/dashboard/barbers");
      } else {
        toast.error(result.error || "Failed to create barber");
      }
    } catch (error) {
      console.error("Error creating barber:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to validate time format
  function isValidTimeFormat(timeString: string): boolean {
    if (!timeString) return false;
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(timeString);
  }
  console.log(availabilities);
  if (role !== "admin") {
    toast.error("Only admins can create barbers.");
    router.push("/dashboard/barbers");
    return null;
  }
  return (
    <div className="w-full px-4">
      <TiltleDashboardPages showBackBotton={true} title="Create Barber" />

      <CreateFormBarber
        formData={formData}
        onFormDataChange={handleFormDataChange}
        errors={errors}
      />

      <AvailableForm
        availabilities={availabilities}
        onAvailabilitiesChange={setAvailabilities}
        errors={errors}
      />

      {/* <div className=" my-5 w-9/12 flex items-center flex-col gap-3 ">
        {isLoadingServices ? (
          <p>Loading ...</p>
        ) : (
          services.map((item) => (
            <ServicesRow
              key={item.id}
              item={item}
              isEnable={enabledServiceIds.includes(item.id)}
              onEnable={() => toggleServiceEnable(item.id)}
            />
          ))
        )}
      </div> */}

      <footer className="flex items-center my-4 justify-end">
        <Button
          onClick={handleCreateBarber}
          disabled={isLoading}
          className="min-w-[120px]"
        >
          {isLoading ? "Creating..." : "Create Barber"}
        </Button>
      </footer>
    </div>
  );
};

export default CreateBarberDashboardPage;
