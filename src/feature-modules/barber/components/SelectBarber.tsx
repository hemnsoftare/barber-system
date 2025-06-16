"use client";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface SelectBarberProps {
  barbers?: { name: string; id: string }[]; // Clean and optional
  onChange: (barberId: string) => void;
  isLoading: boolean;
}

const SelectBarber: React.FC<SelectBarberProps> = ({
  barbers,
  onChange,
  isLoading,
}) => {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">Select Barber</label>

      <Select onValueChange={onChange}>
        <SelectTrigger className="outline-0 md:w-[200px] w-full border-dark-purple border-2 ring-0">
          <SelectValue
            placeholder={
              isLoading ? "loading to get barbers ..." : "Choose a barber"
            }
          />
        </SelectTrigger>
        <SelectContent>
          {barbers &&
            barbers.map((barber) => (
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
