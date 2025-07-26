"use client";
import React, { useLayoutEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGetServices } from "../barber/hook.ts/useSerices";
import ServiceCard from "@/components/layout/servicesCard";
import { useSelectedService } from "./store";
import ServicesSkeleton from "@/components/layout/ServicesSkeleton";
import HeroAllPage from "@/components/layout/HeroAllPage";
import { Service } from "../barber/type";
import gsap from "gsap";

const ServicesPageUser = () => {
  const { data: services, isLoading } = useGetServices();
  const { toggleSelected, selected } = useSelectedService();
  const router = useRouter();
  const cardsRef = useRef<Array<HTMLDivElement | null>>([]);

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
  }, [services]);

  const handleConfirm = (e: Service) => {
    toggleSelected(e);
    router.push("/booking/schedule");
  };

  return (
    <div className="flex flex-col gap-12">
      <HeroAllPage
        image="/images/bg-servics.png"
        title="BOOK AN APPOINTMENT"
        subTitle="Pick a service"
      />

      {isLoading ? (
        <ServicesSkeleton showCenter={true} />
      ) : (
        services && (
          <div className="grid grid-cols-2 md:grid-cols-2 gap-x-4 sm:gap-x-16 gap-y-4 sm:gap-y-8 sm:px-6 md:px-24 py-10">
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
