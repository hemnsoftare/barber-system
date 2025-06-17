import BarbersHomePage from "@/components/layout/BarbersHomePage";
import Gallery from "@/components/layout/gallery";
import Hero from "@/components/layout/Hero";
import Reviewes from "@/components/layout/Reviewes";
import Services from "@/components/layout/Services";
import React from "react";

const page = () => {
  return (
    <div className=" w-full flex flex-col overflow-y-scroll gap-2 hide-y-scrollbar">
      <Hero />
      <Services />
      <Gallery />
      <Reviewes />
      <BarbersHomePage />
    </div>
  );
};

export default page;
