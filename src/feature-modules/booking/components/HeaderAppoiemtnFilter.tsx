"use client";
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { FilterOptions } from "../action/action";
import { format } from "date-fns";
import { Barber, Service } from "@/feature-modules/barber/type/type";
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
}

const HeaderAppointmentFilter = ({
  filters,
  currentDate,
  handleFilterChange,
  handleTodayClick,
  handleNextDay,
  handlePrevDay,
}: HeaderAppointmentFilterProps) => {
  return (
    <header className="w-full flex flex-col lg:flex-row sm:items-center gap-4 py-4 border-b">
      {/* Date Filters */}
      <div className="flex flex-col  sm:flex-row gap-3 w-full lg:w-auto">
        {/* From Date */}
        <div className="flex items-center w-full gap-2 bg-white border-dark-purple border-2 px-2 py-1 rounded-[2px]">
          <label className="text-dark-purple min-w-9 text-sm">From:</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="text-dark-purple border-0 px-2 py-1 text-sm"
              >
                {filters.from}
              </Button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="start">
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

        {/* To Date */}
        <div className="flex items-center w-full gap-2 bg-white border-dark-purple border-2 px-2 py-1 rounded-[2px]">
          <label className="text-dark-purple w-9 text-sm">To:</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="text-dark-purple border-0 px-2 py-1 text-sm"
              >
                {filters.to}
              </Button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="start">
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

      {/* Navigation Controls */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
        <div className="flex min-w-[250px] max-w-[250px] justify-between items-center gap-2">
          <button
            onClick={handlePrevDay}
            className="text-dark-purple hover:bg-dark-purple/10 p-1 rounded-full transition"
          >
            <Icon name="next" size={30} className="rotate-180" />
          </button>
          <span className="font-semibold text-dark-purple text-sm sm:text-base whitespace-nowrap">
            {format(currentDate, "EEEE, MMM dd")}
          </span>
          <button
            onClick={handleNextDay}
            className="text-dark-purple hover:bg-dark-purple/10 p-1 rounded-full transition"
          >
            <Icon name="next" size={30} />
          </button>
        </div>

        <button
          onClick={handleTodayClick}
          className="bg-dark-purple text-white px-4 py-1 rounded-[2px]  sm:text-base hover:bg-dark-purple/90 transition"
        >
          Today
        </button>
      </div>
    </header>
  );
};

export default HeaderAppointmentFilter;
