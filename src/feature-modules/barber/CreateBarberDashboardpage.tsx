"use client";
import React from "react";
import TiltleDashboardPages from "../dashboard/component/TiltleDashboardPages";
import CreateFormBarber from "./components/CreateFormBarber";
import AvailableForm from "./components/AvailableForm";
import { Button } from "@/components/ui/button";

const CreateBarberDashboardPage: React.FC = () => {
  const [selectedImage, setSelectedImage] = React.useState<File>();
  const data = async () => {
    console.log("object");
  };
  data();

  return (
    <div className="w-full  ">
      <TiltleDashboardPages
        showBackBotton={true}
        title="Create Barber"
      ></TiltleDashboardPages>
      <CreateFormBarber
        onUploadImage={setSelectedImage}
        selectedImage={selectedImage}
        error=""
      />
      <AvailableForm />
      <footer className="flex items-center my-4 justify-end">
        <Button>Create Barber </Button>
      </footer>
    </div>
  );
};

export default CreateBarberDashboardPage;
