import React from "react";
import THeadAppointment from "./THeadAppointment";
import AppointmentRow from "./AppointmentRow";
import AppointmentRowAccordion from "./AppointmentRowAccoudain";
import { AppointmentsTableProps } from "../type/type";

export default function AppointmentsTableDashboard({
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
  setSelected,
  mutate,
}: AppointmentsTableProps) {
  const filteredAppointments = appointments
    ?.filter((app) => {
      if (tabs === "all") return true;
      return app.status === tabs;
    })
    .sort((a, b) => {
      const timeA = a.startTime?.seconds ?? 0;
      const timeB = b.startTime?.seconds ?? 0;
      return timeA - timeB;
    });

  return (
    <table className="w-full bg-white mt-6 border text-sm">
      <THeadAppointment
        filters={{
          barberId: filters?.barberId || "",
          serviceId: filters?.serviceId || "",
        }}
        role={role}
        barbers={barbers}
        services={services}
        handleFilterChange={handleFilterChange}
      />
      <tbody>
        {isLoading && (
          <tr>
            <td colSpan={7} className="p-3 text-left">
              Loading...
            </td>
          </tr>
        )}
        {error && (
          <tr>
            <td colSpan={7} className="p-3 text-center text-red-500">
              {error.message}
            </td>
          </tr>
        )}
        {!isLoading && !error && filteredAppointments?.length === 0 && (
          <tr>
            <td colSpan={7} className="p-3 text-center">
              No appointments found.
            </td>
          </tr>
        )}

        {filteredAppointments?.map((app) => {
          const isFinished = app.status === "finished";

          return (
            <React.Fragment key={app.id}>
              <AppointmentRowAccordion
                role={role}
                app={app}
                isFinished={isFinished}
                handleCancel={handleCancel}
                setSelected={setSelected || ((a) => console.log(a))}
                mutate={(e) =>
                  mutate({
                    id: e.id,
                    status: isFinished ? "not-finished" : "finished",
                  })
                }
                appointments={appointments}
              />
              <AppointmentRow
                app={app}
                role={role}
                isFinished={isFinished}
                handleCancel={handleCancel}
                setSelected={setSelected || ((a) => console.log(a))}
                mutate={(e) =>
                  mutate({
                    id: e.id,
                    status: isFinished ? "not-finished" : "finished",
                  })
                }
                appointments={appointments}
              />
            </React.Fragment>
          );
        })}
      </tbody>
    </table>
  );
}
