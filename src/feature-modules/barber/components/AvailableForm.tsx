// "use client";
// import { Switch } from "@/components/ui/switch";
// import { useState } from "react";

// const daysOfWeek = [
//   "Sunday",
//   "Monday",
//   "Tuesday",
//   "Wednesday",
//   "Thursday",
//   "Friday",
//   "Saturday",
// ];

// export default function WeeklyAvailability() {
//   const [availability, setAvailability] = useState(
//     daysOfWeek.map((day) => ({
//       day,
//       enabled: true,
//       from: "",
//       to: "",
//     }))
//   );

//   const handleToggle = (index: number) => {
//     console.log(index);
//     setAvailability((prev) =>
//       prev.map((item, i) =>
//         i === index ? { ...item, enabled: !item.enabled } : item
//       )
//     );
//   };

//   const handleTimeChange = (
//     index: number,
//     field: "from" | "to",
//     value: string
//   ) => {
//     setAvailability((prev) =>
//       prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
//     );
//   };
//   console.log(availability);
//   return (
//     <div className="space-y-4 w-full  text-dark-purple mt-8 text-sm">
//       <h2 className="font-semibold text-black mb-4">Available time</h2>
//       {availability.map((item, index) => (
//         <div key={item.day} className="flex items-center w-full gap-4 ">
//           {/* Day label */}
//           <div className="flex items-center justify-between mr-12 gap-5">
//             <div className="w-24 font-medium text-[15px] text-dark-purple">
//               {item.day}
//             </div>

//             {/* Toggle */}
//             <Switch
//               onClick={() => handleToggle(index)}
//               checked={item.enabled}
//               className="text-dark-purple bg-gray-200 border-0 outline-none"
//             />
//           </div>
//           {/* From Time */}
//           <div className="flex items-center mr-4 gap-3">
//             <span className="text-black">From</span>
//             <input
//               type="time"
//               className="border border-dark-purple px-3 py-1 h-[40px] w-[277px] disabled:bg-gray-100 disabled:text-gray-400"
//               value={item.from || "08:00"}
//               onChange={(e) => handleTimeChange(index, "from", e.target.value)}
//               disabled={!item.enabled}
//               placeholder="8:00 Am"
//             />
//           </div>

//           {/* To Time */}
//           <span className="text-black">To</span>
//           <input
//             type="time"
//             className="border border-dark-purple px-3 py-1 h-[40px] w-[277px] disabled:bg-gray-100 disabled:text-gray-400"
//             onChange={(e) => handleTimeChange(index, "to", e.target.value)}
//             disabled={!item.enabled}
//             value={item.to || "18:00"}
//             placeholder="6:00 PM "
//           />
//         </div>
//       ))}
//     </div>
//   );
// }

import React from "react";

const AvailableForm = () => {
  return <div>fd</div>;
};

export default AvailableForm;
