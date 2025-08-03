"use client";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import clsx from "clsx";

interface SelectBarberProps {
  barbers?: { name: string; id: string }[];
  onChange: (barberId: string) => void;
  isLoading: boolean;
  selectedBarberId?: string; // ✅ new optional prop
  des?: boolean;
  className?: string;
}

const SelectBarber: React.FC<SelectBarberProps> = ({
  barbers = [],
  onChange,
  isLoading,
  selectedBarberId,
  des = false,
  className = "w-3/4   sm:w-1/2",
}) => {
  return (
    <div className={clsx("space-y-1", className)}>
      <label className="block font-medium text-dark-purple text-lg">
        Select Barber
      </label>

      <Select onValueChange={onChange} value={selectedBarberId} disabled={des}>
        <SelectTrigger className="outline-0 rounded-none md:w-[300px] w-full border-dark-purple border-2 ring-0">
          <SelectValue
            placeholder={isLoading ? "Loading barbers..." : "Choose a barber"}
          />
        </SelectTrigger>
        <SelectContent className="max-h-60 overflow-y-auto w-full">
          {barbers.map((barber) => (
            <SelectItem key={barber.id} value={barber.id}>
              {barber.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SelectBarber;
