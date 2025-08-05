"use client";
import React, { useEffect, useRef } from "react";
import SectionTitle from "./SectionTitle";
import ServiceCard from "./servicesCard";
import Image from "next/image";
import { useGetServices } from "@/feature-modules/barber/hook.ts/useSerices";
import ServicesSkeleton from "./ServicesSkeleton";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

gsap.registerPlugin(ScrollTrigger);

const Services = () => {
  const { data, isLoading } = useGetServices(6);
  const router = useRouter().push;
  const { isSignedIn } = useUser();
  // Refs for cards
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Animate cards when in view
  useEffect(() => {
    if (!data || data.length === 0) return;

    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.from(el, {
        opacity: 0.94,
        y: 40,
        duration: 0.5,
        delay: i * 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
        },
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div className="flex items-center justify-center w-full flex-col">
      <SectionTitle title="Our Services" />

      {isLoading ? (
        <>
          <ServicesSkeleton />
          <ServiceSkeleton />
        </>
      ) : !data || data.length < 1 ? (
        <h1 className="text-center text-4xl font-semibold w-full text-dark-purple">
          No services available
        </h1>
      ) : (
        <div className="flex items-center md:flex-col lg:flex-row mt-6 w-full min-h-[368px] lg:justify-between justify-between md:justify-center gap-4 lg:gap-16">
          {/* LEFT column */}
          <div className="flex flex-col sm:grid lg:flex sm:grid-cols-3 lg:flex-col w-full h-full justify-between gap-4">
            {data.slice(0, 3).map((item, i) => (
              <div
                key={item.id}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
              >
                <ServiceCard
                  item={item}
                  onClickService={() => {
                    if (!isSignedIn) {
                      toast.error("Please log in to book an appointment.", {
                        action: {
                          label: "Login",
                          onClick: () => {
                            router("/sign-in");
                          },
                        },
                      });
                      return;
                    }
                    router("/booking/services");
                  }}
                />
              </div>
            ))}
          </div>

          {/* IMAGE */}
          <div className="w-[290px] hidden lg:block h-[368px] relative">
            <Image
              src={"/images/bg-sign-in.jpg"}
              alt="barber"
              width={290}
              height={368}
              priority
              className="max-w-[290px] min-w-[290px] min-h-[368px] z-[1] brightness-50 object-cover max-h-[368px]"
            />
            <div className="absolute text-2xl text-center text-white font-black z-[2] w-full top-[159px] left-0">
              <p>Fades, trims, and</p>
              <p>
                <span className="text-light-blue"> everything</span> in between.
              </p>
              <p>
                We <span className="text-light-blue">do</span> it all.
              </p>
            </div>
          </div>

          {/* RIGHT column */}
          <div className="flex flex-col sm:grid sm:grid-cols-3 lg:flex lg:flex-col w-full h-full justify-between gap-4">
            {data.slice(3, 6).map((item, i) => (
              <div
                key={item.id}
                ref={(el) => {
                  cardRefs.current[i + 3] = el;
                }}
              >
                <ServiceCard
                  item={item}
                  onClickService={() => {
                    if (!isSignedIn) {
                      toast.error("Please log in to book an appointment.", {
                        action: {
                          label: "Login",
                          onClick: () => {
                            router("/sign-in");
                          },
                        },
                      });
                      return;
                    }
                    router("/booking/services");
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Image Message */}
      <center className="w-full mt-4">
        <div className="w-full block lg:hidden  h-[170px] relative">
          <Image
            src={"/images/man-barbershop-salon-doing-haircut-beard-trim 1.png"}
            alt="barber mobile"
            width={290}
            height={368}
            priority
            className="max-w-full min-w-full min-h-[178px] z-[1] brightness-50 object-cover max-h-[178px]"
          />
          <div className="absolute text-lg text-center text-white font-black z-[2] w-full top-[44px] left-0">
            <p>Fades, trims, and</p>
            <p>
              <span className="text-light-blue"> everything</span> in between.
            </p>
            <p>
              We <span className="text-light-blue">do</span> it all.
            </p>
          </div>
        </div>
      </center>

      {/* CTA Button */}
      <button
        onClick={() => {
          if (!isSignedIn) {
            toast.error("Please log in to book an appointment.", {
              action: {
                label: "Login",
                onClick: () => {
                  router("/sign-in");
                },
              },
            });
          } else {
            router("/booking/services");
          }
        }}
        disabled={isLoading || !data || data.length < 1}
        className="disabled:bg-dark-purple/70 disabled:cursor-not-allowed bg-dark-purple font-semibold hidden lg:block text-white text-center py-3 max-w-[290px] min-w-[290px] mt-5"
      >
        Book an appointment
      </button>
    </div>
  );
};

export default Services;

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
