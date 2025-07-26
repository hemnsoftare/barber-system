"use client";
import HeroAllPage from "@/components/layout/HeroAllPage";
import { useUser } from "@clerk/nextjs";
import React, { useState, useEffect } from "react";
import {
  useGetFilterNotifications,
  useMarkNotificationsRead,
} from "./hooks/useNotifaction";
import NotificationCard from "./components/NotificationCard";
import NotificationSkeleton from "@/components/layout/NotificationSkeleton";

const NotificationsPageUser = () => {
  const { user } = useUser();
  const {
    data: notiData,
    isLoading,
    error,
  } = useGetFilterNotifications({
    userId: user?.id || "",
    scope: "user",
  });

  const [noti, setNoti] = useState(notiData || []);
  console.log(noti);
  useEffect(() => {
    if (notiData) {
      console.log(notiData);
      setNoti(notiData);
    }
  }, [notiData]);

  const { mutate } = useMarkNotificationsRead();

  const handleMarkRead = (id: string) => {
    // Update local state immediately for UI responsiveness
    setNoti((prevNoti) =>
      prevNoti.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    // Call the API to update on server
    mutate({ id: id || "", scope: "notification" });
  };
  const handleMarkAllRead = () => {
    mutate({ userId: user?.id || "", scope: "user" });
    setNoti((prevNoti) => prevNoti.map((n) => ({ ...n, read: true })));
  };
  return (
    <div>
      <HeroAllPage title="Notification" />
      <div className="py-24">
        <button
          onClick={handleMarkAllRead}
          className="text-gray-500 my-5 hover:text-blue-600 focus:text-blue-600 focus:outline-none transition-colors"
        >
          Mark all as read
        </button>
        {isLoading ? (
          <>
            <NotificationSkeleton />
            <NotificationSkeleton />
            <NotificationSkeleton />
            <NotificationSkeleton />
          </>
        ) : error ? (
          <div>Something went wrong 😢</div>
        ) : noti.length === 0 ? (
          <div>No notifications found</div>
        ) : (
          // 1️⃣  sort: unread first; inside each group keep newest first
          [...noti]
            .sort((a, b) => {
              if (a.read === b.read) {
                return b.createdAt.seconds - a.createdAt.seconds; // newest first
              }
              return a.read ? 1 : -1; // unread (read=false) comes first
            })
            .map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onClick={() => handleMarkRead(notification.id || "")}
              />
            ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPageUser;
