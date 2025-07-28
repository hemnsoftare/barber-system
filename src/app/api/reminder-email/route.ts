// /api/reminder-email/route.ts
import { NextResponse } from "next/server";

import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { AppointmentProps } from "@/feature-modules/booking/action";

async function getTomorrowAppointments() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const endOfTomorrow = new Date(tomorrow);
  endOfTomorrow.setHours(23, 59, 59, 999);

  const q = query(
    collection(db, "appointments"),
    where("date", ">=", Timestamp.fromDate(tomorrow)),
    where("date", "<=", Timestamp.fromDate(endOfTomorrow))
  );

  const snapshot = await getDocs(q);
  const appointments = snapshot.docs.map((doc) => {
    const data = doc.data() as AppointmentProps;
    return {
      email: data.user.email,
      name: data.user.fullName,
      date: data?.date?.seconds
        ? new Date(data.date.seconds * 1000).toDateString()
        : "Unknown date",

      time: data.startTime || "Unknown",
    };
  });

  return appointments;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const appointments = await getTomorrowAppointments();

    const responses = await Promise.allSettled(
      appointments.map((appt) =>
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: appt.email,
            from: "noreply@yourdomain.com",
            subject: "⏰ Appointment Reminder",
            message: `Hello ${appt.name},\n\nThis is a reminder for your appointment on ${appt.date} at ${appt.time}.`,
            emailUser: "Booking Reminder Bot",
          }),
        })
      )
    );

    const failed = responses.filter((r) => r.status === "rejected");

    return NextResponse.json({
      success: true,
      total: appointments.length,
      failed: failed.length,
    });
  } catch (error) {
    console.error("Reminder Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
