"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { toast } from "sonner";
import { Icon } from "@/constants/icons";

const DeleteBarberDialog = ({
  onDelete,
  isOpenDailog,
  ispending,
  onOpen,
}: {
  onDelete: (deleteAll: boolean) => void;
  isOpenDailog: boolean;
  ispending?: boolean;
  onOpen: () => void;
}) => {
  const [deleteAllData, setDeleteAllData] = useState(false);

  const handleConfirm = () => {
    onDelete(deleteAllData);
    onOpen();
    toast.success("Barber deletion started...");
  };

  return (
    <Dialog open={isOpenDailog} onOpenChange={onOpen}>
      <DialogTrigger asChild>
        <Button className="bg-error text-white md:hover:bg-error/50 transition-all duration-300">
          <Icon name="delete" className="w-5 h-5" />
          <span className="hidden sm:inline">Delete Barber</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Barber</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this barber? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-3 mt-4">
          <Checkbox
            id="delete-all-data"
            checked={deleteAllData}
            onCheckedChange={(val) => setDeleteAllData(!!val)}
          />
          <label
            htmlFor="delete-all-data"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Also delete all data related to this barber (appointments, reviews,
            etc.)
          </label>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="ghost" onClick={() => onOpen()}>
            {ispending ? "Deleting..." : "Cancel"}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={ispending}
          >
            {ispending ? "Deleting..." : "Yes, Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteBarberDialog;
