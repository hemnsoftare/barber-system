"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Input from "@/components/layout/Input";

interface BroadcastMessageDialogProps {
  onSubmit: (message: string, subject: string) => Promise<void> | void;
  onOpen: () => void;
  isOpen: boolean;
  triggerLabel?: string;
}

const BroadcastMessageDialog: React.FC<BroadcastMessageDialogProps> = ({
  onSubmit,
  isOpen,
  onOpen,
}) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim() || !subject.trim()) return;
    setLoading(true);
    try {
      await onSubmit(message.trim(), subject.trim());
      setSubject("");
      setMessage("");
      onOpen(); // Close the dialog
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpen}>
      <DialogTrigger asChild>
        <button className="bg-dark-purple text-sm sm:text-lg text-nowrap transition-all active:scale-90 duration-200 font-[600] text-white px-3 sm:px-6 py-1.5 md:hover:bg-dark-purple/80 ">
          Message To All Users
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Broadcast message</DialogTitle>
          <DialogDescription>
            Write a subject and message to notify all users.
          </DialogDescription>
        </DialogHeader>

        <Input
          placeholder="Enter a subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        <Input
          placeholder="Type your announcement..."
          value={message}
          isTextArea
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[120px]"
        />

        <DialogFooter className="sm:justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline" disabled={loading}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleSubmit}
            disabled={loading || !message.trim() || !subject.trim()}
          >
            {loading ? "Sending..." : "Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BroadcastMessageDialog;
