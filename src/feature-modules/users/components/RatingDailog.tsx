"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import Input from "@/components/layout/Input";

export default function AppointmentReviewDialog({
  onSubmit,
  isPending,
  isOpen,
  onOpen,
}: {
  onSubmit: ({ rate, review }: { rate: number; review: string }) => void;
  isPending: boolean;
  isOpen: boolean;
  onOpen: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState({ rating: "", note: "" });

  const handleSubmit = () => {
    let hasError = false;
    const newErrors = { rating: "", note: "" };

    if (rating === 0) {
      newErrors.rating = "Please rate the appointment.";
      hasError = true;
    }

    if (note.trim().length < 5) {
      newErrors.note = "Please provide more than 5 characters.";
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;

    onSubmit({ rate: rating, review: note });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpen}>
      <DialogTrigger
        // onClick={onOpen}
        className="text-white border w-[23%] px-3 py-3 border-white "
      >
        Rate
      </DialogTrigger>
      <DialogContent className="w-[320px] sm:w-[430px] mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold text-dark-purple">
            Rate your appointment
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-center text-gray-800 font-medium">
            How was your overall experience?
          </p>

          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                onClick={() => setRating(star)}
                className={cn(
                  "w-6 h-6 cursor-pointer",
                  rating >= star
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-400"
                )}
              />
            ))}
          </div>
          {errors.rating && (
            <p className="text-sm text-red-500 text-center">{errors.rating}</p>
          )}

          <Input
            placeholder="Additional note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            error={errors.note}
            isTextArea
          />

          <Button
            disabled={isPending}
            onClick={handleSubmit}
            className="w-full bg-dark-purple text-white mt-4"
          >
            {isPending ? "Submit ...." : "Submit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
