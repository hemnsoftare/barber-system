import { Icons } from "./icons";

const sidebarItems: {
  label: string;
  icon: keyof typeof Icons;
  path: string;
}[] = [
  { label: "Dashboard", icon: "dashboard", path: "/" },
  { label: "Appointments", icon: "appoitment", path: "/appointments" },
  { label: "Barbers", icon: "barber", path: "/barbers" },
  { label: "Availability", icon: "appoitment", path: "/availability" },
  { label: "Gallery", icon: "gallery", path: "/gallery" },
  {
    label: "Accounting",
    icon: "accounting",
    path: "/accounting",
  },

  {
    label: "Services",
    icon: "services",
    path: "/services",
  },
  {
    label: "Users",
    icon: "user",
    path: "/users",
  },
  { label: "Reviews", icon: "review", path: "/review" },
  { label: "Messages", icon: "messages", path: "/messages" },
  { label: "Notifications", icon: "notification", path: "/notifications" },
  { label: "Sign out", icon: "logout", path: "/" },
];

export { sidebarItems };
