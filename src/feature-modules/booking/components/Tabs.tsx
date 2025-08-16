// components/Tabs.tsx
import React from "react";

type TabsProps<T extends string> = {
  options: T[];
  activeTab: T;
  onChange: (tab: T) => void;
  activeClassName?: string;
  inactiveClassName?: string;
};

export default function Tabs<T extends string>({
  options,
  activeTab,
  onChange,
  activeClassName = "border-b-2 border-dark-purple",
  inactiveClassName = "",
}: TabsProps<T>) {
  return (
    <div className="flex overflow-x-auto gap-4 mt-16">
      {options.map((tab) => (
        <button
          key={tab}
          className={`text-dark-purple text-nowrap text-[16px] font-semibold ${
            activeTab === tab ? activeClassName : inactiveClassName
          }`}
          onClick={() => onChange(tab)}
        >
          {tab.replace("-", " ").replace(/\b\w/g, (char) => char.toUpperCase())}
        </button>
      ))}
    </div>
  );
}
