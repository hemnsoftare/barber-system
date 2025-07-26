"use client";
import React, { useState } from "react";
import TiltleDashboardPages from "../dashboard/component/TiltleDashboardPages";
import ServiceManagementDialog, {
  Service,
} from "./components/CreateSericesForm";
import { useServices } from "./hook.ts/useSerices";
import ServicesRow from "./components/ServicesRow";
// import { useBarbers, useGetBarbers } from "./hook.ts/useBarberApi";
// import SelectBarber from "./components/SelectBarber";
// import { Barber } from "./type";
import gsap from "gsap";
import { useLayoutEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

// import { useBarbers } from "./hook.ts/useBarberApi";

const ServicesDashboardPage = () => {
  const { createService, services, isLoading, deleteService, updateService } =
    useServices();
  const [editingService, setEditingService] = useState<Service | null>(null);
  const { user } = useUser();
  const role = user?.publicMetadata.role as "admin" | "barber";
  // const {
  //   // barbersWithServices,
  //   addServiceToBarber,
  //   removeServiceToBarber,
  // } = useBarbers();
  // const { data: barbersWithServices, isLoading: loadingWithBarber } =
  //   useGetBarbers();
  // const [currentBarber, setcurrentBarber] = useState<Barber>();
  const [isOpen, setisOpen] = useState(false);

  // fn
  const serviceListRef = useRef<HTMLDivElement>(null);
  const handleSubmit = async (
    serviceData: Service,
    type: "create" | "update"
  ) => {
    try {
      if (type === "update" && editingService) {
        console.log(serviceData);
        updateService({ data: serviceData, id: editingService.id as string });
        setEditingService(null);
      } else {
        createService(serviceData);
      }
    } catch (error) {
      console.error("Error saving service:", error);
    }
  };

  const handleDelete = (id: string) => {
    if (role !== "admin") {
      toast.error("Only admins can delete services.");
      return;
    }
    deleteService(id);
    // if (barbersWithServices)
    //   barbersWithServices.forEach(
    //     (item) => console.log(item)
    //     // removeServiceToBarber({ barberId: item.id as string, serviceId: id })
    //   );
  };

  const handleEdit = (service: Service) => {
    if (role !== "admin") {
      toast.error("Only admins can edit services.");
      return;
    }
    setEditingService(service);
    setisOpen(true);
  };

  // switch /
  //
  // const handleSwitchService = ({
  //   serviceId,
  //   serName,
  //   isEnable,
  // }: {
  //   serviceId: string;
  //   serName: string;
  //   isEnable: boolean;
  // }) => {
  //   if (!currentBarber) return;

  //   if (isEnable) {
  //     removeServiceToBarber(
  //       {
  //         barberId: currentBarber.id as string,
  //         serviceId,
  //         barberEmail: currentBarber.email,
  //         barberName: currentBarber.fullName,
  //         serviceName: serName,
  //       },
  //       {
  //         onError: (err) => console.log(err),
  //         onSuccess: () => console.log(" worked dddd"),
  //       }
  //     );
  //     setcurrentBarber((prev) =>
  //       prev
  //         ? {
  //             ...prev,
  //             serviceIds:
  //               prev.serviceIds?.filter((id) => id !== serviceId) || [],
  //           }
  //         : prev
  //     );
  //   } else {
  //     addServiceToBarber({
  //       barberId: currentBarber.id as string,
  //       serviceId,
  //     });

  //     setcurrentBarber((prev) => {
  //       if (!prev) return prev;

  //       const existing = prev.serviceIds || [];

  //       // 🛡️ Avoid adding duplicates
  //       if (existing.includes(serviceId)) return prev;

  //       return {
  //         ...prev,
  //         serviceIds: [...existing, serviceId],
  //       };
  //     });
  //   }
  // };
  useLayoutEffect(() => {
    if (!serviceListRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".service-card", {
        opacity: 0,
        y: 30,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
      });
    }, serviceListRef);

    return () => ctx.revert(); // Cleanup
  }, [services]);

  return (
    <div className=" ">
      <TiltleDashboardPages title="Services">
        {role === "admin" && (
          <ServiceManagementDialog
            title={!editingService?.name ? "create" : "edit"}
            onSubmit={handleSubmit}
            isOpen={isOpen}
            onOpenChange={setisOpen}
            defaultData={editingService || undefined}
          />
        )}
      </TiltleDashboardPages>

      {/* <div className="my-8">
        <SelectBarber
          barbers={
            barbersWithServices
              ?.filter((item) => typeof item.id === "string")
              .map((item) => ({
                name: item.fullName,
                id: item.id as string,
              })) ?? []
          }
          isLoading={loadingWithBarber}
          onChange={(id) => {
            if (barbersWithServices) {
              const selected = barbersWithServices.find(
                (barber) => barber.id === id
              );
              setcurrentBarber(selected);
            }
          }}
        />
      </div> */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ServicesCardSkeleton />
          <ServicesCardSkeleton />
          <ServicesCardSkeleton />
        </div>
      ) : (
        <div
          ref={serviceListRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-center w-full gap-6 mt-8"
        >
          {services.map((item) => (
            <ServicesRow
              showAction={true}
              item={item}
              onDelete={handleDelete}
              role={role}
              onEdit={handleEdit}
              key={item.id}
              className="service-card"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ServicesDashboardPage;

const ServicesCardSkeleton = () => {
  return (
    <div className="max-w-[340px] w-full bg-white border border-gray-200 rounded-md p-3 xs:p-4 shadow-sm animate-pulse">
      {/* Top: Image + Text + Switch */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Avatar */}
          <div className="w-10 h-10 xs:w-12 xs:h-12 bg-gray-200 rounded flex-shrink-0" />
          {/* Name + Info */}
          <div className="flex-1 space-y-2 min-w-0">
            <div className="h-4 w-2/3 bg-gray-200 rounded" />
            <div className="flex gap-4">
              <div className="h-3 w-10 bg-gray-200 rounded" />
              <div className="h-3 w-14 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
        {/* Switch */}
        {/* <div className="w-10 h-5 bg-gray-200 rounded-full mt-1 flex-shrink-0" /> */}
      </div>

      {/* Description */}
      <div className="mt-4 h-3 w-4/5 bg-gray-200 rounded" />

      {/* Bottom Buttons */}
      <div className="mt-4 pt-2 border-t border-gray-100 flex justify-end gap-2">
        <div className="w-16 h-8 bg-gray-200 rounded" />
        <div className="w-16 h-8 bg-gray-200 rounded" />
      </div>
    </div>
  );
};
