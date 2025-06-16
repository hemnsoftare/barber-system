import { format } from "date-fns";
import { DayOffEntry } from "../type";
import { Button } from "@/components/ui/button";
import { Icon } from "@/constants/icons";

interface OffDayListProps {
  offDays: DayOffEntry[];
  onDelete?: (entry: DayOffEntry) => void;
}

const OffDayList = ({ offDays, onDelete }: OffDayListProps) => {
  if (!offDays.length) {
    return <p className="text-dark-purple text-lg">No off days set.</p>;
  }

  return (
    <div className="my-5">
      <h4 className="font-medium text-lg text-dark-purple mb-1">
        Scheduled Off Days
      </h4>
      <ul className="space-y-2 text-sm text-gray-700">
        {offDays.map((entry, i) => {
          const dateStr = format(entry.date.toDate(), "dd/MM/yyyy (EEEE)");

          return (
            <li
              key={i}
              className="flex items-center justify-between bg-gray-100 rounded-md px-3 py-2"
            >
              <span>
                {entry.wholeDay ? (
                  <>
                    🛑 <strong>{dateStr}</strong> - Whole day off
                  </>
                ) : (
                  <>
                    🕒 <strong>{dateStr}</strong> - From {entry.from} to{" "}
                    {entry.to}
                  </>
                )}
              </span>

              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(entry)}
                  className="md:hover:bg-dark-purple/15 transition-all duration-300"
                >
                  <Icon
                    name="delete"
                    onClick={() => onDelete(entry)}
                    className="w-4 h-4 text-red-500 hover:text-red-700"
                  />
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default OffDayList;
