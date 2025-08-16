"use client";
import React, { useMemo } from "react";
import Image from "next/image";
import { AppointmentsTableProps } from "../type/type";
import { AppointmentProps } from "../action/action";
import { useSelectedAppointment } from "@/feature-modules/users/action/store";
import { useRouter } from "next/navigation";

/* ===================== Types ===================== */

type Timestamp = { seconds: number; nanoseconds?: number };
type AppointmentStatus = "not-finished" | "finished" | "expired" | "cancelled";

/* ================== Helpers ================== */
type TimeRange = { startTime: string; endTime: string; hours: string[] };

const toHour = (hhmm: string): number => Number(hhmm.split(":")[0]);
const pad2 = (n: number) => n.toString().padStart(2, "0");
const tsToDate = (ts: Timestamp): Date => new Date(ts.seconds * 1000);

const getStatusColor = (status: AppointmentStatus) => {
  switch (status) {
    case "finished":
      return "bg-green-100 border-l-green-500";
    case "cancelled":
      return "bg-red-100 border-l-red-500";
    case "expired":
      return "bg-orange-100 border-l-orange-500";
    default:
      return "bg-blue-100 border-l-blue-500";
  }
};

const formatTimeRange = (
  start: Timestamp | null | undefined,
  durationMin: number | null | undefined
): string => {
  if (!start) return "";
  const startDate = tsToDate(start);
  const endDate = new Date(
    startDate.getTime() + Math.max(0, durationMin ?? 0) * 60000
  );
  const fmt = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${fmt.format(startDate)} - ${fmt.format(endDate)}`;
};

/* ================== Component ================== */
const AppointmentCalender = ({
  filters,
  role,
  barbers,
  services,
  handleFilterChange,
  isLoading,
  error,
  appointments,
  tabs,
  handleCancel,
  mutate,
}: AppointmentsTableProps) => {
  // desktop grid template
  console.log(role, services, handleFilterChange, handleCancel, mutate);
  const barberCount = useMemo(() => barbers?.length ?? 0, [barbers]);
  const gridTemplate = useMemo(
    () => `150px repeat(${barberCount}, minmax(120px, 1fr))`,
    [barberCount]
  );

  const { setSelected: selectApp } = useSelectedAppointment();
  const routerPush = useRouter().push;

  // hours range from availability
  const timeRange = useMemo<TimeRange>(() => {
    if (!barbers || barbers.length === 0) {
      return {
        startTime: "09:00",
        endTime: "17:00",
        hours: [
          "09:00",
          "10:00",
          "11:00",
          "12:00",
          "13:00",
          "14:00",
          "15:00",
          "16:00",
          "17:00",
        ],
      };
    }
    let earliestStart = "23:59",
      latestEnd = "00:00";
    for (const barber of barbers) {
      if (!barber.availability) continue;
      for (const day of barber.availability) {
        if (day.isEnabled && day.startTime && day.endTime) {
          if (day.startTime < earliestStart) earliestStart = day.startTime;
          if (day.endTime > latestEnd) latestEnd = day.endTime;
        }
      }
    }
    if (earliestStart === "23:59") earliestStart = "09:00";
    if (latestEnd === "00:00") latestEnd = "17:00";
    const startH = toHour(earliestStart),
      endH = toHour(latestEnd);
    const hours: string[] = [];
    for (let h = startH; h <= endH; h++) hours.push(`${pad2(h)}:00`);
    return { startTime: earliestStart, endTime: latestEnd, hours };
  }, [barbers]);

  // group by hour+barber (desktop)
  const groupedAppointments = useMemo<
    Record<string, Record<string, AppointmentProps[]>>
  >(() => {
    const grouped: Record<string, Record<string, AppointmentProps[]>> = {};
    for (const hour of timeRange.hours) {
      grouped[hour] = {};
      if (barbers) for (const b of barbers) grouped[hour][b?.id] = [];
    }
    if (appointments) {
      for (const appt of appointments) {
        if (!appt.startTime || !appt.barber?.id) continue;
        const d = tsToDate(appt.startTime);
        const hourKey = `${pad2(d.getHours())}:00`;
        if (!grouped[hourKey]) grouped[hourKey] = {};
        if (!grouped[hourKey][appt.barber.id])
          grouped[hourKey][appt.barber.id] = [];
        grouped[hourKey][appt.barber.id].push(appt);
      }
    }
    return grouped;
  }, [appointments, barbers, timeRange.hours]);

  // multi-day filter hint
  const isMultiDay = useMemo(() => {
    if (!filters?.from || !filters?.to) return false;
    const fromMs = new Date(filters.from).getTime();
    const toMs = new Date(filters.to).getTime();
    if (Number.isNaN(fromMs) || Number.isNaN(toMs)) return false;
    return toMs - fromMs > 24 * 60 * 60 * 1000;
  }, [filters?.from, filters?.to]);

  // mobile: flattened list, filtered and sorted
  const mobileItems = useMemo<AppointmentProps[]>(() => {
    let list = appointments ?? [];
    if (tabs && tabs !== "all") list = list.filter((a) => a.status === tabs);
    return [...list].sort((a, b) => {
      const ta = a.startTime ? tsToDate(a.startTime).getTime() : 0;
      const tb = b.startTime ? tsToDate(b.startTime).getTime() : 0;
      return ta - tb;
    });
  }, [appointments, tabs]);

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-gray-500">Loading calendar...</div>
      </div>
    );
  }

  if (error?.message) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-red-500">
          Error loading calendar: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex mt-4 flex-col">
      {/* ===== Desktop / Tablet grid (md and up) ===== */}
      <div className="hidden md:block">
        <div className="border border-gray-300 rounded-lg bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-max">
              {/* Header */}
              <div
                className="grid bg-gray-100 border-b border-gray-300"
                style={{ gridTemplateColumns: gridTemplate }}
              >
                <div className="p-3 lg:p-4 font-semibold text-gray-700 border-r border-gray-300 sticky left-0 bg-gray-100 z-10">
                  Time
                </div>
                {barbers?.map((barber) => (
                  <div
                    key={barber.id}
                    className="p-3 lg:p-4 text-center font-semibold text-gray-700 border-r border-gray-300 last:border-r-0 min-w-[120px]"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Image
                        src={barber.profileImage}
                        alt={barber.fullName}
                        width={28}
                        height={28}
                        className="rounded-full object-cover hidden lg:block"
                      />
                      <span className="truncate">{barber.fullName}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Rows */}
              {timeRange.hours.map((hour) => (
                <div
                  key={hour}
                  className="grid border-b border-gray-200 last:border-b-0"
                  style={{ gridTemplateColumns: gridTemplate }}
                >
                  <div className="p-3 lg:p-4 bg-gray-50 font-medium text-gray-700 border-r border-gray-300 flex items-center sticky left-0 z-10">
                    {hour}
                  </div>

                  {barbers?.map((barber) => {
                    const appts = groupedAppointments[hour]?.[barber?.id] ?? [];
                    return (
                      <div
                        key={`${hour}-${barber.id}`}
                        className="p-2 border-r border-gray-300 last:border-r-0 min-w-[120px]"
                      >
                        <div className="space-y-2">
                          {appts
                            ?.filter((p) =>
                              tabs === "all" ? true : tabs === p.status
                            )
                            .map((appointment) => {
                              const timeRangeStr = formatTimeRange(
                                appointment.startTime,
                                appointment.service?.duration
                              );
                              const statusBg =
                                appointment.status === "finished"
                                  ? "bg-green-500"
                                  : appointment.status === "cancelled"
                                  ? "bg-red-500"
                                  : appointment.status === "expired"
                                  ? "bg-orange-500"
                                  : "bg-blue-500";
                              const d = appointment.startTime
                                ? tsToDate(appointment.startTime)
                                : null;
                              const dateLabel = d
                                ? d.toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "2-digit",
                                  })
                                : "";

                              return (
                                <button
                                  key={appointment.id}
                                  type="button"
                                  className={`w-full p-2.5 lg:p-3 rounded border-l-4 ${getStatusColor(
                                    appointment.status
                                  )} hover:shadow-md transition-shadow flex flex-col gap-2`}
                                  onClick={() => {
                                    selectApp(appointment);
                                    routerPush("/dashboard/appointments/ff");
                                  }}
                                >
                                  <div className="flex items-center justify-between gap-2 min-w-0">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="text-xs lg:text-sm font-semibold whitespace-nowrap">
                                        {timeRangeStr}
                                      </span>
                                      <span className="text-xs lg:text-sm text-gray-700 truncate">
                                        {appointment.service?.name ?? "Service"}
                                      </span>
                                    </div>
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-white text-[10px] lg:text-xs ${statusBg}`}
                                    >
                                      {appointment.status}
                                    </span>
                                  </div>

                                  {isMultiDay && (
                                    <div className="text-[11px] font-semibold text-gray-500">
                                      {dateLabel}
                                    </div>
                                  )}
                                </button>
                              );
                            })}

                          {appts.length === 0 && (
                            <div className="h-12 lg:h-16 flex items-center justify-center text-gray-400 text-xs lg:text-sm">
                              Available
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== Mobile list (under md) ===== */}
      <div className="md:hidden">
        <div className="space-y-3">
          {mobileItems.length === 0 && (
            <div className="border border-dashed border-gray-300 rounded-lg p-4 text-sm text-gray-500 text-center">
              No appointments in this range.
            </div>
          )}

          {mobileItems.map((appointment) => {
            const statusBg =
              appointment.status === "finished"
                ? "bg-green-500"
                : appointment.status === "cancelled"
                ? "bg-red-500"
                : appointment.status === "expired"
                ? "bg-orange-500"
                : "bg-blue-500";

            const timeRangeStr = formatTimeRange(
              appointment.startTime,
              appointment.service?.duration
            );
            const d = appointment.startTime
              ? tsToDate(appointment.startTime)
              : null;
            const dateLabel = d
              ? d.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                })
              : "";

            return (
              <button
                key={appointment.id}
                type="button"
                className={`w-full text-left p-3 rounded border-l-4 ${getStatusColor(
                  appointment.status
                )} bg-white shadow-sm hover:shadow transition-shadow`}
                onClick={() => {
                  selectApp(appointment);
                  routerPush("/dashboard/appointments/ff");
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">
                      {appointment.service?.name ?? "Service"}
                    </div>
                    <div className="text-xs text-gray-600">{timeRangeStr}</div>
                    <div className="mt-1 flex items-center gap-2">
                      {appointment.barber?.profileImage ? (
                        <Image
                          src={appointment.barber.profileImage}
                          alt={appointment.barber.fullName}
                          width={20}
                          height={20}
                          className="rounded-full object-cover"
                        />
                      ) : null}
                      <span className="text-xs text-gray-700 truncate">
                        {appointment.barber?.fullName ?? "Barber"}
                      </span>
                    </div>
                    {isMultiDay && (
                      <div className="text-[11px] text-gray-500 mt-1">
                        {dateLabel}
                      </div>
                    )}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-white text-[10px] ${statusBg}`}
                  >
                    {appointment.status}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          Status Legend
        </h3>
        <div className="flex flex-wrap gap-3 sm:gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded" />
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded" />
            <span>Finished</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded" />
            <span>Cancelled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded" />
            <span>Expired</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCalender;
