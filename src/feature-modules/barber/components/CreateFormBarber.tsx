import Input from "@/components/layout/Input";
import { Icon } from "@/constants/icons";
import Image from "next/image";
import React from "react";

interface CreateFormBarberProps {
  error?: string;
  selectedImage: File | undefined;
  onUploadImage: (file: File) => void;
}

const CreateFormBarber: React.FC<CreateFormBarberProps> = ({
  error,
  selectedImage,
  onUploadImage,
}) => {
  console.log(error);
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadImage(e.target.files[0]);
    }
  };

  return (
    <form className="mt-9">
      <div className="w-1/2 flex flex-col gap-3">
        <Input name="barberName" placeholder="Ahmad mustafa" label="Name" />
        <Input
          isTextArea={true}
          name={"barbrDescription"}
          label="Description"
          cols={6}
        />
        <p className="block  font-medium text-gray-700 mb-">Photo</p>
        {!selectedImage ? (
          <label
            htmlFor="barberImage"
            className="border-dark-purple border relative w-[114px] h-[114px] px-3 py-4"
          >
            <div className="absolute bottom-1 right-1 bg-dark-purple p-[6px] rounded z-10">
              <Icon name="image_upload" className="w-5 h-5 text-white" />
            </div>
          </label>
        ) : (
          <label
            htmlFor="barberImage"
            className=" relative w-[114px] h-[114px] border-2"
          >
            <Image
              src={URL.createObjectURL(selectedImage)}
              alt="Barber"
              width={114}
              height={114}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-1 right-1 bg-dark-purple p-[6px] rounded z-10">
              <Icon name="image_upload" className="w-5 h-5 text-white" />
            </div>
          </label>
        )}

        <input
          type="file"
          accept="image/*"
          className="hidden"
          name="barberImage"
          id="barberImage"
          onChange={handleImageChange}
        />
      </div>
    </form>
  );
};

export default CreateFormBarber;
