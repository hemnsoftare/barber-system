"use client";
import React, { useState } from "react";
import TiltleDashboardPages from "../dashboard/component/TiltleDashboardPages";
import ServiceManagementDialog, {
  Service,
} from "./components/CreateSericesForm";
import { useServices } from "./hook.ts/useSerices";
import ServicesRow from "./components/ServicesRow";
import { useBarbers, useGetBarbersWithServices } from "./hook.ts/useBarberApi";
import SelectBarber from "./components/SelectBarber";
import { BarberWithServices } from "./type";

// import { useBarbers } from "./hook.ts/useBarberApi";

const ServicesDashboardPage = () => {
  const { createService, services, isLoading, deleteService, updateService } =
    useServices();
  const [editingService, setEditingService] = useState<Service | null>(null);
  const {
    // barbersWithServices,
    addServiceToBarber,
    removeServiceToBarber,
  } = useBarbers();
  const { data: barbersWithServices, isLoading: loadingWithBarber } =
    useGetBarbersWithServices();
  const [currentBarber, setcurrentBarber] = useState<BarberWithServices>();
  const [isOpen, setisOpen] = useState(false);

  // fn
  const handleSubmit = async (
    serviceData: Service,
    type: "create" | "update"
  ) => {
    console.log(type);
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
    deleteService(id);
    if (barbersWithServices)
      barbersWithServices.forEach((item) =>
        removeServiceToBarber({ barberId: item.id as string, serviceId: id })
      );
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setisOpen(true);
  };
  const handleSwitchService = ({
    serviceId,
    isEnable,
  }: {
    serviceId: string;
    isEnable: boolean;
  }) => {
    if (!currentBarber) return;

    if (isEnable) {
      removeServiceToBarber({
        barberId: currentBarber.id as string,
        serviceId,
      });
      setcurrentBarber((prev) =>
        prev
          ? {
              ...prev,
              services: prev.services.filter((s) => s.id !== serviceId),
            }
          : prev
      );
    } else {
      addServiceToBarber({
        barberId: currentBarber.id as string,
        serviceId,
      });

      setcurrentBarber((prev) =>
        prev
          ? {
              ...prev,
              services: [
                ...prev.services,
                {
                  id: serviceId,
                  name: "", // optional, UI won’t use it here
                  description: "",
                  duration: 0,
                  price: 0,
                  imageUrl: "",
                },
              ],
            }
          : prev
      );
    }
  };

  return (
    <div className="p-6">
      <TiltleDashboardPages title="Services">
        <ServiceManagementDialog
          title={!editingService?.name ? "create" : "edit"}
          onSubmit={handleSubmit}
          isOpen={isOpen}
          onOpenChange={setisOpen}
          defaultData={editingService || undefined}
        />
      </TiltleDashboardPages>

      <div className="my-8">
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
      </div>
      {isLoading ? (
        <p className="text-gray-500 mt-4">Loading ...</p>
      ) : (
        <div className="flex items-center w-full  flex-wrap  gap-6 mt-8">
          {services.map((item) => (
            <ServicesRow
              showAction={true}
              showSwitch={!!currentBarber?.id}
              item={item}
              onDelete={handleDelete}
              onEdit={handleEdit}
              key={item.id}
              isEnable={
                currentBarber?.services.some(
                  (service) => service.id === item.id
                ) || false
              }
              onEnable={(e) =>
                handleSwitchService({ serviceId: item.id, isEnable: e })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ServicesDashboardPage;
