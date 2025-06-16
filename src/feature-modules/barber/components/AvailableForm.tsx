"use client";

import { Switch } from "@/components/ui/switch";

interface AvailabilityData {
  day: string;
  enabled: boolean;
  from: string;
  to: string;
}

interface AvailableFormProps {
  availabilities: AvailabilityData[];
  onAvailabilitiesChange: (availabilities: AvailabilityData[]) => void;
  errors?: Record<string, string>;
}

export default function AvailableForm({
  availabilities,
  onAvailabilitiesChange,
  errors,
}: AvailableFormProps) {
  const handleToggle = (index: number) => {
    const updated = availabilities.map((item, i) =>
      i === index ? { ...item, enabled: !item.enabled } : item
    );
    onAvailabilitiesChange(updated);
  };

  const handleTimeChange = (
    index: number,
    field: "from" | "to",
    value: string
  ) => {
    const updated = availabilities.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onAvailabilitiesChange(updated);
  };

  return (
    <div className="space-y-4 w-full text-dark-purple mt-8 text-sm">
      <h2 className="font-semibold text-black mb-4">
        Available time *
        {errors && errors.availability && (
          <span className="text-red-500 text-sm font-normal ml-2">
            {errors.availability}
          </span>
        )}
      </h2>

      {availabilities.map((item, index) => (
        <div key={item.day} className="flex items-center w-full gap-4">
          {/* Day label and toggle */}
          <div className="flex items-center justify-between mr-12 gap-5">
            <div className="w-24 font-medium text-[15px] text-dark-purple">
              {item.day}
            </div>

            <Switch
              onClick={() => handleToggle(index)}
              checked={item.enabled}
              className="text-dark-purple bg-gray-200 border-0 outline-none"
            />
          </div>

          {/* From Time */}
          <div className="flex items-center mr-4 gap-3">
            <span className="text-black">From</span>
            <input
              type="time"
              className={`border px-3 py-1 h-[40px] w-[277px] 
                         disabled:bg-gray-100 disabled:text-gray-400
                         focus:outline-none focus:ring-2 focus:ring-dark-purple/20 ${
                           errors && errors[`${item.day}_time`]
                             ? "border-red-500"
                             : "border-dark-purple"
                         }`}
              value={item.from}
              onChange={(e) => handleTimeChange(index, "from", e.target.value)}
              disabled={!item.enabled}
            />
          </div>

          {/* To Time */}
          <div className="flex items-center gap-3">
            <span className="text-black">To</span>
            <input
              type="time"
              className={`border px-3 py-1 h-[40px] w-[277px] 
                         disabled:bg-gray-100 disabled:text-gray-400
                         focus:outline-none focus:ring-2 focus:ring-dark-purple/20 ${
                           errors && errors[`${item.day}_time`]
                             ? "border-red-500"
                             : "border-dark-purple"
                         }`}
              value={item.to}
              onChange={(e) => handleTimeChange(index, "to", e.target.value)}
              disabled={!item.enabled}
            />
          </div>

          {/* Error message for this day */}
          {errors && errors[`${item.day}_time`] && (
            <div className="text-red-500 text-xs ml-2">
              {errors[`${item.day}_time`]}
            </div>
          )}
        </div>
      ))}

      {/* General availability error */}
      {errors && errors.availability && (
        <p className="text-red-500 text-sm mt-2">{errors.availability}</p>
      )}
    </div>
  );
}
