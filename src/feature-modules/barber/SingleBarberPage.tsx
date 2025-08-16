"use client";

import React, { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import TiltleDashboardPages from "../dashboard/component/TiltleDashboardPages";
import { Button } from "@/components/ui/button";
import CreateFormBarber from "./components/CreateFormBarber";
import { useBarbers, useDeleteBarber } from "./hook.ts/useBarberApi";
import { useSelectedBarber } from "../booking/action/store";
import { UserProfile, useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import DeleteBarberDialog from "./components/DeleteBarberDialog";
import { Save } from "lucide-react";

const SingleBarberPage = () => {
  const { user } = useUser();
  const role = user?.publicMetadata.role;
  const { updateBarber } = useBarbers();
  const { mutate: deleteBarber, isPending } = useDeleteBarber();
  const { selected: data } = useSelectedBarber();
  const [isOpenDailog, setisOpenDailog] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    description: "",
    experience: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data) {
      console.log(data);
      setFormData({
        userId: data.userId || "",
        description: data.description || "",
        experience: data.experience,
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
    if (role !== "admin") {
      toast.error("Only admins can edit barbers.");
      return;
    }
    console.log("Saving edits:", formData);
    updateBarber({
      data: {
        description: formData.description,
        experience: formData.experience as number,
      },
      id: data?.id as string,
    });
  };

  return (
    <div className="w-full px-4 h-full">
      <TiltleDashboardPages
        title={data?.fullName || ""}
        showBackBotton
        backHref="/dashboard/barbers"
      >
        <div className="flex gap-2 sm:gap-4 items-center">
          <Button
            onClick={handleSaveEdits}
            className="bg-gray-400 text-white md:hover:bg-gray-700 transition-all duration-300"
          >
            <Save className="w-5 h-5" />
            <span className="hidden sm:inline">Save edits</span>
          </Button>
          <DeleteBarberDialog
            isOpenDailog={isOpenDailog}
            ispending={isPending}
            onOpen={() => {
              if (role === "admin") {
                setisOpenDailog((pre) => !pre);
              } else {
                toast.error("Only admin can delete the barber", {
                  style: {
                    background: "#fff0f0",
                    color: "#b91c1c",
                    border: "1px solid #fca5a5",
                    fontWeight: "600",
                    padding: "16px 24px",
                    fontSize: "16px",
                    borderRadius: "8px",
                    boxShadow: "0 0 10px rgba(255, 0, 0, 0.1)",
                  },
                  icon: "⛔",
                });
              }
            }}
            onDelete={(deleteAll) => {
              if (role !== "admin") {
                toast.error("Only admin can delete the barber", {
                  style: {
                    background: "#fff0f0",
                    color: "#b91c1c",
                    border: "1px solid #fca5a5",
                    fontWeight: "600",
                    padding: "16px 24px",
                    fontSize: "16px",
                    borderRadius: "8px",
                    boxShadow: "0 0 10px rgba(255, 0, 0, 0.1)",
                  },
                  icon: "⛔",
                });
                return;
              }
              const id = data?.id || "";
              deleteBarber(
                { id, deleteAll },
                { onError: (err) => console.log(err) }
              );
              redirect("/dashboard/barbers");
            }}
          />
        </div>
      </TiltleDashboardPages>
      <br />
      <br />
      <UserProfile
        appearance={{
          elements: {
            rootBox: {
              height: "400px",
              overflowY: "hidden",
              borderRadius: "4px",
              border: "1px solid #460028",

              // Remove default margin
              margin: "0px",

              // Responsive fix for mobile
              "@media (max-width: 640px)": {
                height: "640px",
                marginLeft: "-16px",
                marginRight: "-16px",
              },
            },
          },
        }}
      />
      <CreateFormBarber
        formData={formData}
        onFormDataChange={handleFormDataChange}
        errors={errors}
        hiddenitem={true}
      />
    </div>
  );
};

export default SingleBarberPage;
