"use client";
import React from "react";
import Image from "next/image";
import { Edit, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Service } from "../type";
import { toast } from "sonner";

interface ServicesRowProps {
  item: Service;
  onEdit?: (item: Service) => void;
  onDelete?: (id: string) => void;
  showAction?: boolean;
  onEnable?: (isEnable: boolean) => void;
  isEnable?: boolean;
  showSwitch?: boolean;
  className?: string;
  role: "admin" | "barber";
}

const ServicesRow: React.FC<ServicesRowProps> = ({
  item,
  onEdit,
  onDelete,
  onEnable,
  isEnable,
  role,
  showAction,
  showSwitch = true,
  className = "",
}) => {
  return (
    <div
      key={item.id}
      className={`bg-white  shadow-sm shadow-dark-purple/60 w-full border border-dark-purple rounded-md p-3 xs:p-4 ${className}`}
    >
      {/* Mobile Layout (xs to sm) */}
      <div className="flex flex-col gap-3 ">
        {/* Top row: Image + Name + Switch */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Image
              src={item.imageUrl}
              alt={item.name}
              width={40}
              height={40}
              className="object-cover w-10 h-10 xs:w-12 xs:h-12 rounded flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm xs:text-base font-semibold text-gray-900 truncate">
                {item.name}
              </h3>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-sm text-gray-600 font-medium">
                  ${item.price}
                </p>
                <p className="text-sm text-blue-600">{item.duration} min</p>
              </div>
            </div>
          </div>
          {showSwitch && onEnable !== undefined && (
            <Switch
              checked={isEnable}
              onClick={() => onEnable(!isEnable)}
              className="flex-shrink-0 mt-1"
            />
          )}
        </div>
        <p className="text-sm text-gray-600 line-clamp-1">{item.description}</p>
        {/* Bottom row: Action buttons */}
        {showAction && (
          <div className="flex items-center gap-2 justify-end pt-2 border-t border-gray-100">
            <button
              onClick={() => onEdit && onEdit(item)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-dark-purple text-dark-purple hover:bg-blue-50 rounded transition-colors"
            >
              <Edit size={14} />
              <span>Edit</span>
            </button>
            <Dialog>
              <DialogTrigger
                onClick={() => {
                  if (role !== "admin") {
                    toast.error("Only admins can delete services.");
                    return;
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-sm border border-red-500 text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </DialogTrigger>
              <DialogContent className="mx-4 rounded-lg">
                <DialogHeader>
                  <DialogTitle>Are you absolutely sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete
                    the service and remove its data.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center justify-end gap-3 mt-4">
                  <DialogTrigger asChild>
                    <button className="px-4 py-2 border rounded text-sm hover:bg-gray-100 transition-colors">
                      Cancel
                    </button>
                  </DialogTrigger>
                  <button
                    onClick={() => onDelete && onDelete(item.id || "")}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesRow;
