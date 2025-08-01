"use client";

import React, { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import TiltleDashboardPages from "../dashboard/component/TiltleDashboardPages";
import { Button } from "@/components/ui/button";
import CreateFormBarber from "./components/CreateFormBarber";
import { useBarbers, useDeleteBarber } from "./hook.ts/useBarberApi";
import { useSelectedBarber } from "../booking/store";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import DeleteBarberDialog from "./components/DeleteBarberDialog";
import { Save } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      <Card className="w-full max-w-sm mt-12 rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle className="text-center">
            {data?.fullName || "User"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <Image
            src={data?.profileImage || "/default-avatar.png"}
            alt={data?.fullName || "User Avatar"}
            width={120}
            height={120}
            className="rounded-full w-28 h-28"
          />
          <div className="text-center space-y-1">
            <p className="text-sm text-gray-500">{data?.email}</p>
            <p className="font-medium">Rating: {data?.rating}</p>
            <p className="font-medium">Bookings: {data?.totalBookings}</p>
            <p className="text-xs text-muted-foreground">ID: {data?.userId}</p>
          </div>
        </CardContent>
      </Card>
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
