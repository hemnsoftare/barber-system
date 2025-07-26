"use client";
import React from "react";
import { useGetAllAppointments } from "../booking/useAppointment";
import { useGetBarbers } from "../barber/hook.ts/useBarberApi";
import Link from "next/link";
import { useFilterReviews } from "../users/hooks/useReviw";

const HomePage = () => {
  const { data: appointments = [] } = useGetAllAppointments();
  const { data: barbers = [] } = useGetBarbers();
  const { data: reviews } = useFilterReviews({ isAll: true });
  const upcoming = appointments.filter((a) => a.status === "not-finished");
  const past = appointments.filter((a) => a.status !== "not-finished");

  const Card = ({
    title,
    count,
    link,
  }: {
    title: string;
    count: string;
    link: string;
    type?: "barber";
  }) => (
    <div className="bg-dark-purple text-white p-4 flex flex-col rounded-[2px] w-[250px] shadow-md">
      <h3 className="text-md font-bold mb-1">{title}</h3>
      <p className="text-sm text-grey-500 mb-4"> {count}</p>
      <Link
        href={link}
        className="bg-white text-dark-purple px-6 py-1 text-sm self-end hover:bg-gray-200 transition-all"
      >
        View All
      </Link>
    </div>
  );

  return (
    <div className="sm:p-8  py-8 px-4 space-y-10">
      <div>
        <h2 className="text-xl font-bold mb-4 text-dark-purple">
          Appointments
        </h2>
        <div className="flex gap-6 flex-wrap">
          <Card
            title="Upcoming appointments :"
            count={`${upcoming.length} Appointments`}
            link="/dashboard/appointments"
          />
          <Card
            title="Past appointments :"
            count={`${past.length} Appointments`}
            link="/dashboard/appointments"
          />
        </div>
      </div>
      <Link href={"booking/schedule"}>Go to Booking Schedule</Link>
      <div>
        <h2 className="text-xl font-bold mb-4 text-dark-purple">Barbers</h2>
        <div className="flex gap-6 flex-wrap">
          <Card
            title="Total barbers :"
            count={`${barbers.length} Barbers`}
            link="/dashboard/barbers"
            type="barber"
          />
        </div>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-4 text-dark-purple">Reviews</h2>
        <div className="flex gap-6 flex-wrap">
          <Card
            title="Total Reviews :"
            count={`${reviews?.length} Reviews`}
            link="/dashboard/review"
            type="barber"
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
