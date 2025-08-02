import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Timestamp } from "firebase/firestore";

// Extend dayjs
dayjs.extend(utc);
dayjs.extend(timezone);

// Your local timezone — change if needed
export const LOCAL_TZ = "Asia/Baghdad";

/**
 * Convert Firebase timestamp or JS Date to local Baghdad time formatted
 */
export const toLocalTime = (
  input: Date | Timestamp,
  format = "YYYY-MM-DD HH:mm"
) => {
  const date = input instanceof Timestamp ? input.toDate() : input;
  return dayjs(date).tz(LOCAL_TZ).format(format);
};

/**
 * Convert date + time string in local time to UTC Date (for saving to Firebase)
 * export const localToUTC = (date: string, time: string) => {
  return dayjs
    .tz(`${date} ${time}`, "YYYY-MM-DD HH:mm", LOCAL_TZ)
    .utc()
    .toDate();
};
 */
export const localToUTC = (dateStr: string, timeStr: string): Date => {
  const datetime = dayjs.tz(
    `${dateStr} ${timeStr}`,
    "YYYY-MM-DD HH:mm",
    LOCAL_TZ
  );
  return datetime.utc().toDate();
};

export default dayjs;
