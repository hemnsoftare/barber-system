import { Skeleton } from "@/components/ui/skeleton";

export default function AppointmentCardSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl bg-dark-purple p-4 space-y-3 shadow-md"
        >
          <Skeleton className="h-4 w-1/2 bg-purple-300/30" />
          <Skeleton className="h-4 w-2/3 bg-purple-300/30" />
          <div className="flex gap-2 items-center">
            <Skeleton className="h-4 w-1/4 bg-purple-300/30" />
            <Skeleton className="h-4 w-1/3 bg-purple-300/30" />
          </div>
          <Skeleton className="h-10 w-full bg-purple-400/30 rounded-md" />
        </div>
      ))}
    </div>
  );
}
