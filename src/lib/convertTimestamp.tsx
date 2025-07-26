// utils/convertTimestamp.ts
import { Timestamp } from "firebase/firestore";

type FirestoreLikeTimestamp = {
  seconds: number;
  nanoseconds: number;
};

export function convertToDate(
  input: Timestamp | FirestoreLikeTimestamp | null | undefined
): Date {
  if (!input) return new Date(); // fallback

  if (input instanceof Timestamp) return input.toDate();

  // Check for object shape match
  if ("seconds" in input && typeof input.seconds === "number") {
    return new Date(input.seconds * 1000);
  }

  return new Date(); // fallback again
}
export const toDateSafe = (value: Date | Timestamp): Date => {
  return value instanceof Timestamp ? value.toDate() : value;
};
