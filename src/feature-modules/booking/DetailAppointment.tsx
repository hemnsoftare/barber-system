"use client";
import React from "react";
import dayjs from "dayjs";
import { Timestamp } from "firebase/firestore";
import TiltleDashboardPages from "../dashboard/component/TiltleDashboardPages";
import { useSelectedAppointment } from "../users/action/store";

import { AppointmentProps } from "./action/action";
import SectionCard from "./components/SectionCard";
import ActionBar from "./components/ActionBar";
import Badge from "./components/Badge";

const DetailAppointment: React.FC = () => {
  const { selected: appointment } = useSelectedAppointment() as {
    selected?: AppointmentProps | null;
  };

  if (!appointment) {
    return (
      <div className="space-y-6">
        <TiltleDashboardPages
          title="Details Appointment"
          showBackBotton={true} // fixed spelling here too
          backHref="/dashboard/appointments"
        />
        <EmptyState />
      </div>
    );
  }
  const start = convertToDate(appointment.startTime);
  const end = dayjs(start)
    .add(appointment?.service?.duration ?? 0, "minute")
    .toDate();

  return (
    <div className="space-y-6">
      <TiltleDashboardPages
        title="Details Appointment"
        showBackBotton={true} // fixed spelling here too
        backHref="/dashboard/appointments"
      />
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:gap-4 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
            {appointment?.service?.name ?? "Service"}
          </h2>
        </div>
        <div className="w-full sm:w-auto">
          <ActionBar app={appointment} />
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        {/* Main */}
        <div className="md:col-span-8 space-y-4">
          <SectionCard title="Appointment">
            <div className="divide-y divide-gray-100">
              <KV k="Appointment ID" v={appointment?.id ?? "—"} />
              <KV k="Created" v={formatTimestamp(appointment?.createdAt)} />
              <KV
                k="Status"
                v={
                  <Badge
                    label={appointment?.status ?? "unknown"}
                    color={statusColor(appointment?.status)}
                  />
                }
              />
              <KV k="Blocked" v={appointment?.isBlocked ? "Yes" : "No"} />
              <KV k="Cancelled" v={appointment?.isCancelled ? "Yes" : "No"} />
              <KV
                k="Reminder sent"
                v={appointment?.sentReminder ? "Yes" : "No"}
              />
            </div>
          </SectionCard>

          <SectionCard title="Service">
            <div className="divide-y divide-gray-100">
              <KV k="Name" v={appointment?.service?.name ?? "—"} />
              <KV k="Price" v={formatCurrency(appointment?.service?.price)} />
              <KV
                k="Duration"
                v={
                  appointment?.service?.duration
                    ? `${appointment.service.duration} mins`
                    : "—"
                }
              />
              <KV
                k="Description"
                v={appointment?.service?.description ?? "—"}
              />
            </div>
          </SectionCard>

          <SectionCard title="Schedule">
            <div className="divide-y divide-gray-100">
              <KV
                k="Date"
                v={formatTimestamp(appointment?.date, "YYYY-MM-DD")}
              />
              <KV
                k="Start time"
                v={formatTimestamp(appointment?.startTime, "HH:mm")}
              />
              <KV k="End time" v={formatTimestamp(end, "HH:mm")} />
              <KV
                k="Day of week"
                v={
                  Array.isArray(appointment?.dayOffWeek)
                    ? appointment.dayOffWeek.join(", ")
                    : appointment?.dayOffWeek ?? "—"
                }
              />
              <KV
                k="Datetime (composed)"
                v={
                  appointment?.datetime
                    ? `${formatTimestamp(
                        appointment.datetime.date ?? null,
                        "YYYY-MM-DD"
                      )} ${appointment.datetime.time ?? ""}`
                    : "—"
                }
              />
            </div>
          </SectionCard>
        </div>

        {/* Sidebar */}
        <div className="md:col-span-4 space-y-4">
          <SectionCard title="Customer">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100" />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-gray-900">
                  {appointment?.user?.fullName ?? "Guest"}
                </div>
                <div className="truncate text-xs text-gray-600">
                  {appointment?.user?.email ?? "—"}
                </div>
                {appointment?.user?.id && (
                  <div className="mt-1 text-xs text-gray-500">
                    ID: {appointment.user.id}
                  </div>
                )}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Barber">
            <div className="flex items-start gap-3">
              {appointment?.barber?.profileImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={appointment.barber.profileImage}
                  alt="Barber"
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 shrink-0 rounded-full bg-gray-100" />
              )}
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-gray-900">
                  {appointment?.barber?.fullName ?? "—"}
                </div>
                <div className="truncate text-xs text-gray-600">
                  {appointment?.barber?.barberEmail ?? "—"}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  ID: {appointment?.barber?.id ?? "—"}
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Notes */}
      <SectionCard
        title="Notes"
        right={<span className="text-xs text-gray-400">UI only</span>}
      >
        <p className="text-sm text-gray-600">
          Add appointment notes here later. This is just the furniture, the
          wiring comes after.
        </p>
      </SectionCard>
    </div>
  );
};

export default DetailAppointment;
type FirestoreLikeTimestamp = {
  seconds: number;
  nanoseconds: number;
};
type Dateish = Date | Timestamp | FirestoreLikeTimestamp | null | undefined;
export function convertToDate(input: Dateish): Date {
  if (!input) return new Date();
  if (input instanceof Date) return input;
  if (input instanceof Timestamp) return input.toDate();
  if (
    typeof input === "object" &&
    "seconds" in input &&
    typeof input.seconds === "number"
  ) {
    return new Date(input.seconds * 1000);
  }
  return new Date();
}
export function formatTimestamp(
  input: Dateish,
  format = "YYYY-MM-DD HH:mm"
): string {
  const d = convertToDate(input);
  if (Number.isNaN(d.getTime())) return "—";
  return dayjs(d).format(format);
}
function formatCurrency(n?: number | null): string {
  if (n == null) return "—";
  return n % 1 === 0 ? `${n}` : n.toFixed(2);
}

function statusColor(
  s?: string
): "red" | "green" | "blue" | "yellow" | "orange" {
  switch (s) {
    case "finished":
      return "green";
    case "not-finished":
      return "blue";
    case "expired":
      return "orange";
    case "cancelled":
      return "red";
    default:
      return "blue";
  }
}

const KV: React.FC<{ k: string; v?: React.ReactNode }> = ({ k, v }) => (
  <div className="grid grid-cols-12 items-start gap-2 py-2">
    <div className="col-span-5 sm:col-span-4 text-[11px] sm:text-xs font-medium text-gray-500">
      {k}
    </div>
    <div className="col-span-7 sm:col-span-8 break-words text-sm">
      {v ?? "—"}
    </div>
  </div>
);

const EmptyState: React.FC = () => (
  <div className="mt-8 sm:mt-10 rounded-2xl border border-dashed border-gray-300 p-8 sm:p-10 text-center">
    <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-gray-100" />
    <h3 className="mb-1 text-base font-semibold text-gray-900">
      No appointment selected
    </h3>
    <p className="text-sm text-gray-600">
      Choose an appointment from the list to see its details.
    </p>
  </div>
);
