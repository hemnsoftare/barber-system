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
interface ServicesRowProps {
  item: Service;
  onEdit?: (item: Service) => void;
  onDelete?: (id: string) => void;
  showAction?: boolean;
  onEnable: (isEnable: boolean) => void;
  isEnable: boolean;
  showSwitch?: boolean;
}

const ServicesRow: React.FC<ServicesRowProps> = ({
  item,
  onEdit,
  onDelete,
  onEnable,
  isEnable,
  showAction,
  showSwitch = true,
}) => {
  return (
    <div
      key={item.id}
      className="bg-white shadow-sm shadow-dark-purple/60 pr-3  overflow-hidden w-full border flex items-center justify-between flex-wrap gap-4 border-dark-purple"
    >
      <div className="flex items-center w-1/2 justify-start gap-4">
        <Image
          src={"/" + item.imageUrl}
          alt={item.name}
          width={100}
          height={100}
          className="object-cover rounded"
        />
        <h3 className="text-sm w-[150px] font-semibold text-gray-900">
          {item.name}
        </h3>
        <p className="text-sm w-[100px] text-center text-gray-600">
          ${item.price}
        </p>
        <p className="text-sm text-center text-blue-600">{item.duration}</p>
      </div>
      <div className="flex items-center gap-5">
        {showAction ? (
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => onEdit && onEdit(item)}
              className="flex items-center justify-center gap-1 px-3 py-1 text-sm border border-dark-purple text-dark-purple hover:bg-blue-50 rounded"
            >
              <Edit size={16} />
              Edit
            </button>
            <Dialog>
              <DialogTrigger className="flex items-center gap-1 px-3 py-1 text-sm border border-red-500 text-red-600 hover:bg-red-50 rounded">
                <Trash2 size={16} />
                Delete
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you absolutely sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center justify-end gap-4 mt-4">
                  <DialogTrigger asChild>
                    <button className="px-4 py-2 border rounded text-sm hover:bg-gray-100">
                      Cancel
                    </button>
                  </DialogTrigger>
                  <button
                    onClick={() => onDelete && onDelete(item.id || "")}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    Confirm Delete
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ) : null}
        {showSwitch && (
          <Switch checked={isEnable} onClick={() => onEnable(isEnable)} />
        )}
      </div>
    </div>
  );
};

export default ServicesRow;
