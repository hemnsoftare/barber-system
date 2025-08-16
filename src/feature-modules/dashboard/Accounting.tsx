"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Users, Scissors, TrendingUp, PoundSterling } from "lucide-react";
import { useFilteredAppointments } from "../booking/hook/useAppointment";
import { useGetBarbers } from "../barber/hook.ts/useBarberApi";
import { useGetServices } from "../barber/hook.ts/useSerices";
import { convertToDate } from "@/lib/convertTimestamp";
import { useUser } from "@clerk/nextjs";

const Accounting = () => {
  const [selectedBarber, setSelectedBarber] = useState("All");
  const [selectedService, setSelectedService] = useState("All");
  const [selectedPeriod, setSelectedPeriod] = useState<
    "day" | "week" | "month" | "year"
  >("day");
  const { user } = useUser();
  const userId = user?.id;
  const role = user?.publicMetadata.role as "admin" | "barber";
  console.log(userId);
  const {
    data: appointments,
    // isLoading: loadApp,
    error,
  } = useFilteredAppointments({
    filters: {
      barberId: role === "admin" ? "All" : userId,
      serviceId: "All",
      status: "finished",
    },
  });
  const { data: barbers, isLoading: loadBarber } = useGetBarbers();
  const { data: services, isLoading: loadServices } = useGetServices();
  // Mock data - replace with your actual hooks
  if (error) {
    console.error("Error fetching appointments:", error);
    return (
      <div>
        Error loading appointments <p>{error.message}</p>{" "}
      </div>
    );
  }

  const filterAppointments = () => {
    const now = new Date();

    return appointments?.filter((app) => {
      const appDate = convertToDate(app.date); // safely converting timestamp
      const barberMatch =
        selectedBarber === "All" || app.barber.id === selectedBarber;
      const serviceMatch =
        selectedService === "All" || app.service.id === selectedService;

      // ⏱ Period filtering
      let withinPeriod = true;
      if (selectedPeriod === "day") {
        withinPeriod = appDate.toDateString() === now.toDateString();
      } else if (selectedPeriod === "week") {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay()); // Sunday
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6); // Saturday

        withinPeriod = appDate >= weekStart && appDate <= weekEnd;
      } else if (selectedPeriod === "month") {
        withinPeriod =
          appDate.getMonth() === now.getMonth() &&
          appDate.getFullYear() === now.getFullYear();
      } else if (selectedPeriod === "year") {
        withinPeriod = appDate.getFullYear() === now.getFullYear();
      }

      return (
        barberMatch && serviceMatch && withinPeriod && app.status === "finished"
      );
    });
  };

  const filteredAppointments = filterAppointments();

  const calculateStats = () => {
    const totalAppointments = filteredAppointments?.length ?? 0;
    const totalRevenue =
      filteredAppointments?.reduce((sum, app) => sum + app.service.price, 0) ??
      0;

    const averageRevenue =
      totalAppointments > 0 ? totalRevenue / totalAppointments : 0;

    return {
      totalRevenue,
      totalAppointments,
      averageRevenue,
      uniqueCustomers:
        new Set(filteredAppointments?.map((app) => app.user.email)).size ?? 0,
    };
  };

  const stats = calculateStats();

  const getChartData = () => {
    const serviceRevenue = services?.map((service) => {
      const serviceApps = filteredAppointments?.filter(
        (app) => app.service.id === service.id
      );
      const revenue = serviceApps?.reduce(
        (sum, app) => sum + app.service.price,
        0
      );
      return {
        name: service.name,
        revenue,
        appointments: serviceApps?.length,
      };
    });

    const barberRevenue = barbers?.map((barber) => {
      const barberApps = filteredAppointments?.filter(
        (app) => app.barber.id === barber.id
      );
      const revenue = barberApps?.reduce(
        (sum, app) => sum + app.service.price,
        0
      );
      return {
        name: barber.fullName,
        revenue,
        appointments: barberApps?.length,
      };
    });

    return { serviceRevenue, barberRevenue };
  };

  const { serviceRevenue, barberRevenue } = getChartData();

  const getCurrentPeriodData = () => {
    const now = new Date();
    const periods = {
      day: { label: "Today", date: now.toLocaleDateString() },
      week: {
        label: "This Week",
        date: `Week ${Math.ceil(now.getDate() / 7)}`,
      },
      month: {
        label: "This Month",
        date: now.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
      },
      year: { label: "This Year", date: now.getFullYear().toString() },
    };
    return periods[selectedPeriod];
  };

  const currentPeriod = getCurrentPeriodData();

  const COLORS = ["#480024", "#7c1e4a", "#a03366", "#c44882"];
  return (
    <div className="min-h-screen px-0 py-3 sm:p-6 lg:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-slide-down">
          <h1
            className="text-3xl sm:text-4xl font-bold text-dark-purple mb-2"
            style={{ fontSize: "28px" }}
          >
            Accounting Dashboard
          </h1>
          <p className="text-gray-400" style={{ fontSize: "20px" }}>
            {currentPeriod.label} - {currentPeriod.date}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-[2px] shadow-sm shadow-dark-purple p-6 mb-8 animate-slide-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label
                className="block text-gray-700 font-medium mb-2"
                style={{ fontSize: "16px" }}
              >
                Barber
              </label>
              {loadBarber ? (
                <p>load...</p>
              ) : (
                <select
                  value={selectedBarber}
                  disabled={role !== "admin"}
                  onChange={(e) => setSelectedBarber(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-[2px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#480024] transition-all duration-300"
                  style={{ fontSize: "16px" }}
                >
                  <option value="All">
                    {role === "admin" ? "All Barbers" : user?.fullName}
                  </option>
                  {barbers?.map((barber) => (
                    <option key={barber.id} value={barber.id}>
                      {barber.fullName}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label
                className="block text-gray-700 font-medium mb-2"
                style={{ fontSize: "16px" }}
              >
                Service
              </label>
              {loadServices ? (
                <p>loading ...</p>
              ) : (
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-[2px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#480024] transition-all duration-300"
                  style={{ fontSize: "16px" }}
                >
                  <option value="All">All Services</option>
                  {services?.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label
                className="block text-gray-700 font-medium mb-2"
                style={{ fontSize: "16px" }}
              >
                Period
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) =>
                  setSelectedPeriod(
                    e.target.value as "day" | "week" | "month" | "year"
                  )
                }
                className="w-full p-3 border border-gray-300 rounded-[2px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#480024] transition-all duration-300"
                style={{ fontSize: "16px" }}
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-[2px] shadow-sm shadow-dark-purple p-6 transform hover:scale-105 transition-transform duration-300 animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-gray-400 font-medium"
                  style={{ fontSize: "16px" }}
                >
                  Total Revenue
                </p>
                <p
                  className="text-2xl font-bold text-gray-900"
                  style={{ fontSize: "16px" }}
                >
                  ${stats.totalRevenue}
                </p>
              </div>
              <div className="p-3 bg-[#480024] rounded-[2px]">
                <PoundSterling className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2px] shadow-sm shadow-dark-purple p-6 transform hover:scale-105 transition-transform duration-300 animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-gray-400 font-medium"
                  style={{ fontSize: "16px" }}
                >
                  Appointments
                </p>
                <p
                  className="text-2xl font-bold text-gray-900"
                  style={{ fontSize: "16px" }}
                >
                  {stats.totalAppointments}
                </p>
              </div>
              <div className="p-3 bg-[#480024] rounded-[2px]">
                <Scissors className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2px] shadow-sm shadow-dark-purple p-6 transform hover:scale-105 transition-transform duration-300 animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-gray-400 font-medium"
                  style={{ fontSize: "16px" }}
                >
                  Avg Revenue
                </p>
                <p
                  className="text-2xl font-bold text-gray-900"
                  style={{ fontSize: "16px" }}
                >
                  ${stats.averageRevenue.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-[#480024] rounded-[2px]">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2px] shadow-sm shadow-dark-purple p-6 transform hover:scale-105 transition-transform duration-300 animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-gray-400 font-medium"
                  style={{ fontSize: "20px" }}
                >
                  Customers
                </p>
                <p
                  className="text-2xl font-bold text-gray-900"
                  style={{ fontSize: "20px" }}
                >
                  {stats.uniqueCustomers}
                </p>
              </div>
              <div className="p-3 bg-[#480024] rounded-[2px]">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1  lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-8 px-2 sm:px-4">
          {/* Service Revenue Chart */}
          <div className="bg-white rounded-xl shadow-sm shadow-dark-purple p-0 sm:p-0 lg:p-2 animate-slide-up">
            <h3 className="text-lg p-3 sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
              Revenue by Service
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={serviceRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#364153" }}
                />
                <YAxis tick={{ fontSize: 12, fill: "#364153" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #E5E7EB",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                />
                <Bar dataKey="revenue" fill="#480024" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Service Distribution Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm shadow-dark-purple p-0 sm:p-1 animate-slide-up">
            <h3 className="text-lg p-3 sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
              Service Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceRevenue}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent = 0 }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {serviceRevenue?.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #E5E7EB",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Barber Performance */}
        <div
          hidden={role === "barber"}
          className="bg-whitxe rounded-[2px] shadow-sm shadow-dark-purple px-3 py-4 sm:p-6 animate-slide-up"
        >
          <h3
            className="text-xl font-bold text-gray-900 mb-6"
            style={{ fontSize: "20px" }}
          >
            Barber Performance
          </h3>
          <ResponsiveContainer width="100%" className=" pl-0 mr-0" height={300}>
            <BarChart
              data={
                role === "admin"
                  ? barberRevenue?.map((barber) => ({
                      name: barber.name,
                      revenue: barber.revenue || 0,
                      appointments: barber.appointments || 0,
                    }))
                  : [
                      {
                        name: user?.fullName || "You",
                        revenue: barberRevenue?.[0]?.revenue || 0,
                        appointments: barberRevenue?.[0]?.appointments || 0,
                      },
                    ]
              }
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 20, fill: "#364153" }} />
              <YAxis tick={{ fontSize: 15, fill: "#364153" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E5E7EB",
                  borderRadius: "2px",
                  fontSize: "17px",
                }}
              />
              <Legend />
              <Bar
                dataKey="revenue"
                fill="#480024"
                name="Revenue ($)"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="appointments"
                fill="#7c1e4a"
                name="Appointments"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Appointments */}
        <div className="bg-white rounded-[2px] shadow-sm shadow-dark-purple p-6 mt-8 animate-slide-up">
          <h3
            className="text-xl font-bold text-gray-900 mb-6"
            style={{ fontSize: "20px" }}
          >
            Recent Appointments
          </h3>
          <div className="overflow-x-auto">
            {/* <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th
                    className="text-left p-3 text-gray-700 font-medium"
                    style={{ fontSize: "20px" }}
                  >
                    Customer
                  </th>
                  <th
                    className="text-left p-3 text-gray-700 font-medium"
                    style={{ fontSize: "20px" }}
                  >
                    Barber
                  </th>
                  <th
                    className="text-left p-3 text-gray-700 font-medium"
                    style={{ fontSize: "20px" }}
                  >
                    Service
                  </th>
                  <th
                    className="text-left p-3 text-gray-700 font-medium"
                    style={{ fontSize: "20px" }}
                  >
                    Price
                  </th>
                  <th
                    className="text-left p-3 text-gray-700 font-medium"
                    style={{ fontSize: "20px" }}
                  >
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {loadApp ? (
                  <p>loading ...</p>
                ) : (
                  filteredAppointments?.map((appointment) => (
                    <tr
                      key={appointment.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td
                        className="p-3 text-gray-900"
                        style={{ fontSize: "20px" }}
                      >
                        {appointment.user.fullName}
                      </td>
                      <td
                        className="p-3 text-gray-900"
                        style={{ fontSize: "20px" }}
                      >
                        {appointment.barber.fullName}
                      </td>
                      <td
                        className="p-3 text-gray-900"
                        style={{ fontSize: "20px" }}
                      >
                        {appointment.service.name}
                      </td>
                      <td
                        className="p-3 text-gray-900 font-medium"
                        style={{ fontSize: "20px" }}
                      >
                        ${appointment.service.price}
                      </td>
                      <td
                        className="p-3 text-gray-400"
                        style={{ fontSize: "20px" }}
                      >
                        {convertToDate(appointment?.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table> */}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-down {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-slide-down {
          animation: slide-down 0.8s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Accounting;
