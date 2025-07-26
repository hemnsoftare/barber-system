import React from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { FilterOptions } from "../action";
import { format } from "date-fns";
import { Barber, Service } from "@/feature-modules/barber/type";
import { Icon } from "@/constants/icons";

interface HeaderAppointmentFilterProps {
  filters: FilterOptions;
  barbers: Barber[];
  services: Service[];
  currentDate: Date;
  handleFilterChange: (key: keyof FilterOptions, value: string) => void;
  handleTodayClick: () => void;
  handleNextDay: () => void;
  handlePrevDay: () => void;
  // role : "admin" | "barber";
}

const HeaderAppointmentFilter = ({
  filters,
  // barbers,
  // services,
  currentDate,
  handleFilterChange,
  handleTodayClick,
  handleNextDay,
  handlePrevDay,
}: HeaderAppointmentFilterProps) => {
  return (
    <header className="flex flex-wrap w-full  sm:items-center gap-4  py-4  border-b">
      <div className="flex  w-full justify-between sm:justify-start sm:w-fit items-center gap-4 ">
        <div className="flex items-center gap-2 bg-white border-dark-purple border-2  sm:px-2">
          <label className="text-dark-purple pl-2">From:</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="text-dark-purple border-0 rounded-none"
              >
                {" "}
                {filters.from}
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <Calendar
                mode="single"
                selected={new Date(filters.from || "")}
                onSelect={(date) => {
                  if (date)
                    handleFilterChange("from", format(date, "yyyy-MM-dd"));
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-2 bg-white border-dark-purple border-2  px-2">
          <label className="text-dark-purple ">To:</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="text-dark-purple border-0 rounded-none"
              >
                {filters.to}
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <Calendar
                mode="single"
                selected={new Date(filters.to || "")}
                onSelect={(date) => {
                  if (date)
                    handleFilterChange("to", format(date, "yyyy-MM-dd"));
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="flex items-center w-full sm:w-fit justify-between sm:justify-start gap-4">
        <div className="flex items-center   gap-2">
          <button
            onClick={handlePrevDay}
            className="text-dark-purple sm:px-3 text-3xl rounded-full hover:bg-dark-purple/10 py-1 "
          >
            <Icon name="next" size={35} className="rotate-180" />
          </button>
          <span className="font-semibold text-dark-purple ">
            {format(currentDate, "EEEE, MMM dd")}
          </span>
          <button
            onClick={handleNextDay}
            className="text-dark-purple sm:px-3 text-3xl rounded-full hover:bg-dark-purple/10 py-1 "
          >
            <Icon name="next" size={35} className="" />
          </button>
        </div>

        <button
          onClick={handleTodayClick}
          className="bg-dark-purple text-lg  text-white px-5 py-1 "
        >
          Today
        </button>
      </div>
    </header>
  );
};

export default HeaderAppointmentFilter;
