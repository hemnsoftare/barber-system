"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  useGetFilterNotifications,
  useMarkNotificationsRead,
} from "../users/hooks/useNotifaction";
import { useUser } from "@clerk/nextjs";
import NotificationCard from "../users/components/NotificationCard";
import TiltleDashboardPages from "./component/TiltleDashboardPages";
import NotificationSkeleton from "@/components/layout/NotificationSkeleton";
import gsap from "gsap";
import { useGetBarbers } from "../barber/hook.ts/useBarberApi";
import { Barber } from "../barber/type";
import { Notification } from "../booking/type";
import { IoMdArrowDropdown } from "react-icons/io";
export default function Notifcation() {
  const { user } = useUser();
  const userId = user?.id || "";
  const role = user?.publicMetadata.role as "admin" | "barber";
  const isAdmin = role === "admin";

  type NotificationQuery =
    | { scope: "all" }
    | { scope: "barber"; barberId: string };

  const notificationQuery: NotificationQuery = isAdmin
    ? { scope: "all" }
    : { scope: "barber", barberId: userId };
  const {
    data: notiData = [],
    isLoading,
    error,
  } = useGetFilterNotifications(notificationQuery);

  const { data: barbersData = [], isLoading: loadingWithBarber } =
    useGetBarbers();

  const [noti, setNoti] = useState<Notification[]>([]);
  const [currentBarber, setCurrentBarber] = useState<Barber | null>(null);
  const [tab, setTab] = useState<"unread" | "read">("unread");
  useEffect(() => {
    setNoti(notiData);
  }, [notiData]);

  const { mutate } = useMarkNotificationsRead();

  const markOne = (id: string) => {
    if (!id) return;
    setNoti((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    mutate({ id, scope: "notification" });
  };

  const markAll = () => {
    mutate({ userId, scope: "user" });
    setNoti((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    cardsRef.current = [];
  }, [notiData, tab, currentBarber]);

  useEffect(() => {
    const validElements = cardsRef.current.filter(Boolean);
    if (!validElements.length) return;

    gsap.from(validElements, {
      opacity: 0,
      y: 30,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out",
    });
  }, [notiData, tab, currentBarber]);

  const handleMarkAll = () => {
    if (isAdmin && currentBarber) {
      noti.forEach((n) => {
        if (!n.read && n.id) markOne(n.id);
      });
    } else {
      markAll();
    }
  };
  const [open, setOpen] = useState(false);
  const handleBarberChange = (selectedId: string) => {
    const barber = barbersData.find((b) => b.id === selectedId) || null;
    setCurrentBarber(barber);
  };

  if (error) {
    return (
      <div>
        <TiltleDashboardPages title="Notifications: Error" />
        <p>Something went wrong 😢</p>
      </div>
    );
  }

  return (
    <div>
      <TiltleDashboardPages
        key={tab + currentBarber?.fullName}
        title={`Notifications`}
      />

      {isAdmin && !loadingWithBarber && (
        <>
          <br />
          <br />
          <div className="mb-4 flex items-center gap-4">
            <div className="relative w-full sm:w-[200px]">
              <button
                onClick={() => setOpen(!open)}
                className="border-2 border-dark-purple flex items-center justify-between w-full rounded px-3 py-2 text-left"
              >
                <span> {currentBarber?.fullName || "All Barbers"}</span>
                <IoMdArrowDropdown
                  size={20}
                  className={open ? "transform rotate-180" : ""}
                />
              </button>

              <div
                className={`absolute left-0 top-full z-50 w-full mt-1 bg-white border border-dark-purple rounded shadow-lg overflow-hidden shadow-gray-200 text-grey-700 transition-all duration-300 ${
                  open
                    ? "max-h-60 opacity-100 scale-100"
                    : "max-h-0 opacity-0 scale-95"
                }`}
              >
                <div
                  onClick={() => {
                    handleBarberChange("");
                    setOpen(false);
                  }}
                  className="px-3 py-2 justify-between border-b  transition-all duration-200 hover:bg-gray-100 cursor-pointer"
                >
                  <span>All Barbers</span>
                </div>
                {barbersData.map((barber) => (
                  <div
                    key={barber.id}
                    onClick={() => {
                      handleBarberChange(barber?.id || "");
                      setOpen(false);
                    }}
                    className="px-3 py-2 border-b last:border-b-0 transition-all duration-200 hover:bg-gray-100 cursor-pointer"
                  >
                    {barber.fullName}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      <div className="flex gap-8 border-b mt-5 border-gray-300 text-sm mb-6">
        <button
          onClick={() => {
            setTab("unread");
          }}
          className={`pb-2 ${
            tab === "unread"
              ? "border-b-2 border-dark-purple font-semibold"
              : ""
          }`}
        >
          Unread :{" "}
          <span className="">
            {isAdmin && currentBarber
              ? noti.filter((n) => !n.read && n.barberId === currentBarber.id)
                  .length
              : noti.filter(
                  (n) => !n.read && (isAdmin || n.barberId === userId)
                ).length}
          </span>
        </button>
        <button
          onClick={() => {
            setTab("read");
          }}
          className={`pb-2 ${
            tab === "read" ? "border-b-2 border-dark-purple font-semibold" : ""
          }`}
        >
          Read{" : "}
          {
            <span className="">
              {isAdmin && currentBarber
                ? noti.filter((n) => n.read && n.barberId === currentBarber.id)
                    .length
                : noti.filter(
                    (n) => n.read && (isAdmin || n.barberId === userId)
                  ).length}
            </span>
          }
        </button>
      </div>

      {tab === "unread" && noti.length > 0 && (
        <button
          onClick={handleMarkAll}
          className="text-gray-500 my-5 hover:text-blue-600 focus:text-blue-600 transition-colors text-sm"
        >
          Mark all as read
        </button>
      )}

      {isLoading ? (
        <>
          <NotificationSkeleton />
          <NotificationSkeleton />
          <NotificationSkeleton />
        </>
      ) : noti.length === 0 ? (
        <p className="text-lg font-bold text-dark-purple my-4 w-full text-center">
          No notifications found.
        </p>
      ) : (
        noti
          ?.filter((n) => (tab === "unread" ? !n.read : n.read))
          .filter((notification) => {
            if (isAdmin && currentBarber) {
              return notification.barberId === currentBarber.id;
            }
            return notification.barberId === userId || isAdmin;
          })
          .map((notification, index) => (
            <div
              key={notification.id}
              ref={(el) => {
                if (el) cardsRef.current[index] = el;
              }}
              className="notification-card"
            >
              <NotificationCard
                notification={notification}
                onClick={() => markOne(notification?.id || "")}
              />
            </div>
          ))
      )}
    </div>
  );
}
