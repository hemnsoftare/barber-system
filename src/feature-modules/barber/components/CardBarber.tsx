"use client";
import Image from "next/image";

interface BarberCardProps {
  name: string;
  appointments: number;
  image?: string;
  onView?: () => void;
}

export default function BarberCard({
  name,
  appointments,
  onView,
}: BarberCardProps) {
  return (
    <div className="bg-dark-purple text-white p-4 w-72 relative rounded shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{name}</h3>
          <p className="text-gray-300 text-sm mt-1">
            {appointments} Appointments
          </p>
        </div>
        <div className="w-14 h-14 overflow-hidden">
          <Image
            src={"/images/barber.png"}
            alt={name}
            width={62}
            height={62}
            className="object-cover min-w-[62px] min-h-[62px] max-h-[62px] bg-red-50"
          />
        </div>
      </div>
      <div className="mt-6 text-center">
        <button
          onClick={onView}
          className="bg-white text-[#4b002f] px-4 py-2 rounded shadow hover:opacity-90"
        >
          View
        </button>
      </div>
    </div>
  );
}
