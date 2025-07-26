"use client";
import BarbersHomePage from "@/components/layout/BarbersHomePage";
import Gallery from "@/components/layout/gallery";
import Hero from "@/components/layout/Hero";
import Reviewes from "@/components/layout/Reviewes";
import Services from "@/components/layout/Services";
import { useCreateUser } from "@/feature-modules/users/hooks/useuserApi";
import { User } from "@/feature-modules/users/type";
import { useUser } from "@clerk/nextjs";
import React, { useEffect } from "react";
const Page = () => {
  const { user, isLoaded } = useUser(); // Clerk
  const { mutate: syncUser } = useCreateUser();

  // Somewhere in your component
  useEffect(() => {
    if (isLoaded && user) {
      const customUser: User = {
        id: user.id,
        fullName: user.fullName ?? "",
        email: user.primaryEmailAddress?.emailAddress ?? "",
        role: (user.publicMetadata?.role as string) ?? "customer",
        barberId: user.publicMetadata?.barberId as string | undefined,
        image: user.imageUrl ?? undefined,
      };

      syncUser(customUser, {
        onSuccess() {
          console.log("create account ");
        },
        onError: (err) => console.log(err),
      }); // 👈 you're good now
    }
  }, [isLoaded, user, syncUser]);

  return (
    <div className=" w-full flex flex-col  gap-8 md:gap-12 ">
      <Hero />
      <Services />
      <Gallery />
      <Reviewes />
      <BarbersHomePage />
    </div>
  );
};

export default Page;
