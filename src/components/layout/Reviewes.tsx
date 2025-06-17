import React from "react";
import SectionTitle from "./SectionTitle";
import ReviewCard from "@/feature-modules/barber/components/ReviewCard";

const Reviewes = () => {
  return (
    <div className="mt-6">
      <SectionTitle title="Reviews" />
      <div className="flex items-center gap-8 justify-between">
        <ReviewCard />
        <ReviewCard />
        <ReviewCard />
      </div>
    </div>
  );
};

export default Reviewes;
