"use client";
import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";
import { Barber } from "@/feature-modules/barber/type/type";

interface Service {
  id: string;
  name: string;
}

interface Props {
  filters: {
    barberId: string;
    serviceId: string;
  };
  barbers?: Barber[];
  services?: Service[];
  handleFilterChange: (key: "barberId" | "serviceId", value: string) => void;
  role: "barber" | "admin";
  barberId?: string;
}

const THeadAppointment = ({
  filters,
  barbers,
  services,
  handleFilterChange,
  role,
  barberId,
}: // barberId = "All",
Props) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  return (
    <thead className="bg-white">
      {/* Mobile header */}
      <tr className="text-left lg:hidden font-normal">
        <th className="p-3 flex justify-between items-center">
          Appointments
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className={`p-2 hover:bg-gray-100 duration-300 rounded-md transition-colors ${
              showMobileFilters ? "bg-gray-100" : ""
            }`}
            aria-label={showMobileFilters ? "Close filters" : "Open filters"}
          >
            <Filter
              className={`w-5 h-5 transition-transform duration-300 ${
                showMobileFilters ? "rotate-45  text-blue-600" : ""
              } ${
                (filters.barberId !== "All" || filters.serviceId !== "All") &&
                !showMobileFilters
                  ? "text-blue-600 "
                  : ""
              }`}
            />
          </button>
        </th>
      </tr>

      {/* Mobile filter dropdown (card style) */}
      {showMobileFilters && (
        <tr className="lg:hidden bg-white border-t">
          <td colSpan={1} className="px-4 py-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Service
                </label>
                <Select
                  value={filters.serviceId}
                  onValueChange={(val) => handleFilterChange("serviceId", val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Services" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Services</SelectItem>
                    {services?.map((service) => (
                      <SelectItem
                        className="line-clamp-1"
                        key={service.id}
                        value={service.id}
                      >
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {role === "admin" && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Barber
                  </label>
                  <Select
                    value={filters.barberId}
                    onValueChange={(val) => handleFilterChange("barberId", val)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Barbers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Barbers</SelectItem>
                      {barbers?.map((barber) => (
                        <SelectItem
                          className="line-clamp-1"
                          key={barber.id}
                          value={barber.id || "All"}
                        >
                          {barber.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}

      {/* Desktop header */}
      <tr className="text-left hidden lg:table-row font-normal">
        <th className="p-3">Name</th>
        <th className="p-3">
          <Select
            value={filters.serviceId}
            onValueChange={(val) => handleFilterChange("serviceId", val)}
          >
            <SelectTrigger className="w-[120px] p-0">
              <SelectValue placeholder="All Services" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Services</SelectItem>
              {services?.map((service) => (
                <SelectItem
                  className="line-clamp-1"
                  key={service.id}
                  value={service.id}
                >
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </th>
        <th className="p-3">Date & Time</th>
        <th className="p-3">
          <Select
            value={role === "barber" ? barberId : "All"}
            disabled={role === "barber"}
            onValueChange={(val) => handleFilterChange("barberId", val)}
          >
            <SelectTrigger className="w-[120px] p-0 disabled:text-black">
              <SelectValue
                className="disabled:text-black"
                placeholder={role === "barber" ? "barber" : "All Barbers"}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">
                {" "}
                {role === "barber" ? "barber" : "All Barbers"}{" "}
              </SelectItem>
              {barbers?.map((barber) => (
                <SelectItem
                  className="line-clamp-1"
                  key={barber.id}
                  value={barber.id || "All"}
                >
                  {barber.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </th>
        <th className="p-3">Price</th>
        <th className="p-3 text-center">Status</th>
        <th hidden={role === "barber"} className="p-3 text-center">
          Actions
        </th>
      </tr>
    </thead>
  );
};

export default THeadAppointment;
