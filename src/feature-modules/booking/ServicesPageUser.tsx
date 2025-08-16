"use client";
import React, { useLayoutEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGetServices } from "../barber/hook.ts/useSerices";
import ServiceCard from "@/components/layout/servicesCard";
import { useSelectedService } from "./action/store";
import ServicesSkeleton from "@/components/layout/ServicesSkeleton";
import HeroAllPage from "@/components/layout/HeroAllPage";
import { Service } from "../barber/type/type";
import gsap from "gsap";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { checkInUK } from "@/lib/checkCountery";

const ServicesPageUser = () => {
  const { data: services, isLoading } = useGetServices();
  const { toggleSelected, selected } = useSelectedService();
  const router = useRouter();
  const cardsRef = useRef<Array<HTMLDivElement | null>>([]);
  const { isSignedIn, isLoaded } = useUser();
  useLayoutEffect(() => {
    if (services && services.length > 0) {
      gsap.from(cardsRef.current, {
        opacity: 0,
        y: 50,
        stagger: 0.1,
        duration: 0.6,
        ease: "power3.out",
      });
    }
  }, [services, isLoading]);

  const handleConfirm = async (e: Service) => {
    const allowed = await checkInUK();
    if (!allowed) {
      toast.error("Booking is only available in Birmingham. ");
      // return;
    }
    toggleSelected(e);
    router.push("/booking/schedule");
  };

  if (!isSignedIn && isLoaded) {
    toast.error("Please log in to access this page.", {
      action: {
        label: "Login",
        onClick: () => {
          router.push("/sign-in");
        },
      },
    });
    router.push("/sign-in");
  }
  return (
    <div className="flex flex-col gap-12">
      <HeroAllPage
        image="/images/bg-servics.png"
        title="BOOK AN APPOINTMENT"
        subTitle="Pick a service"
      />

      {isLoading ? (
        <>
          <ServicesSkeleton />
          <ServiceSkeleton />
        </>
      ) : (
        services && (
          <div className="grid grid-cols-2 md:grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-4 sm:gap-y-8 sm:px-6 md:px-24 py-10">
            {services.map((service, idx) => (
              <div
                key={idx}
                ref={(el) => {
                  cardsRef.current[idx] = el;
                }}
              >
                <ServiceCard
                  item={service}
                  onClickService={() => handleConfirm(service)}
                  isSelected={service.id === selected?.id}
                  showCircal={true}
                />
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default ServicesPageUser;

const ServiceSkeleton = () => {
  return (
    <div className="grid grid-cols-2 lg:hidden md:grid-cols-3 gap-6 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse bg-white rounded-xl shadow-md p-4 flex flex-col gap-4"
        >
          <div className="flex items-center gap-3 w-full">
            <div className="w-8 h-8 bg-gray-300 rounded" />
            <div className="w-2/3 h-4 bg-gray-300 rounded" />
          </div>
          <div className="space-y-1">
            <div className="w-full h-3 bg-gray-200 rounded" />
            <div className="w-5/6 h-3 bg-gray-200 rounded" />
            <div className="w-4/6 h-3 bg-gray-200 rounded" />
          </div>
          <div className="flex justify-between gap-3 items-center mt-2">
            <div className="w-24 h-3 bg-gray-200 rounded" />
            <div className="w-10 h-4 bg-gray-300 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};
