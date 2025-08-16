"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Check } from "lucide-react";
import { useMarkMessagesRead, useMessages } from "./hook/useMessage";
import { BarberMessage } from "./action/action";
import { toDateSafe } from "@/lib/convertTimestamp";
import { Icon } from "@/constants/icons";
import TiltleDashboardPages from "./component/TiltleDashboardPages";
import BroadcastMessageDialog from "./component/BroadcastMessageDialogProps";
import { useSendEmail } from "@/hook/useSendEmail";
import { useSendNotification } from "../booking/hook/useAppointmentNotifcation";
import { useCustomerUsers } from "../users/hooks/useuserApi";

/** ─────────────────────────────────────────────────────────
 *  Helpers
 * ──────────────────────────────────────────────────────── */

const Skeleton = () => (
  <div className="animate-pulse border border-dark-purple rounded p-4 mb-6">
    <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
    <div className="h-3 bg-gray-200 rounded w-full" />
  </div>
);

/** ─────────────────────────────────────────────────────────
 *  MessageCard
 * ──────────────────────────────────────────────────────── */
function MessageCard({
  msg,
  onMark,
}: {
  msg: BarberMessage;
  onMark: () => void;
}) {
  const date = toDateSafe(msg.timestamp).toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <div className="border border-dark-purple rounded p-4 mb-6 space-y-3">
      {/* header row */}
      <div className="flex flex-wrap flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-8 text-sm">
        <div className="flex sm:items-center flex-col sm:flex-row gap-4 sm:gap-8 ">
          <div className="flex items-center  gap-1">
            <Icon name="user" />
            <span className="font-semibold">{msg.fullName}</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon name="appoitment" color="#480024" size={20} />{" "}
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon name="email" />

            {msg.email}
          </div>
        </div>
        {!msg.read && (
          <button
            onClick={onMark}
            className="flex items-center gap-1 text-xs text-dark-purple hover:underline"
          >
            <Check size={14} /> Mark as read
          </button>
        )}
      </div>

      {/* body */}
      <p className="border indent-2 border-dark-purple/70 rounded p-3 min-h-[90px] text-sm leading-relaxed">
        {msg.message}
      </p>
    </div>
  );
}

/** ─────────────────────────────────────────────────────────
 *  Page Component
 * ──────────────────────────────────────────────────────── */
export default function MessagesPage() {
  const { user } = useUser();
  const barberId = user?.id || "";
  const role = user?.publicMetadata.role || "barber";

  const [open, setopen] = useState(false);
  const { data = [], isLoading } = useMessages({
    scope: "all",
  });

  const { mutate } = useMarkMessagesRead();

  const [tab, setTab] = useState<"unread" | "read">("unread");

  const markOne = (id: string) => mutate({ scope: "message", id });
  const markAll = () => mutate({ scope: "barber", userId: barberId });
  const { mutate: sendEmail } = useSendEmail();
  const { mutate: sendNoti } = useSendNotification();
  const { data: users } = useCustomerUsers();
  const filtered = data.filter((m) => (tab === "unread" ? !m.read : m.read));

  const handleBroadcast = async (body: string, subject: string) => {
    if (!body.trim()) return;

    const html = `
      <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #ddd;border-radius:8px;overflow:hidden;font-family:'Segoe UI',sans-serif;box-shadow:0 4px 10px rgba(0,0,0,0.1)">
        <div style="background:#460028;color:#fff;padding:24px;text-align:center">
          <h1 style="margin:0;font-size:22px">📢 Announcement</h1>
          <p style="margin:8px 0 0;font-size:14px">from <strong>OAP Barber</strong></p>
        </div>
    
        <div style="padding:24px;font-size:16px;line-height:1.6;color:#333;background:#fefefe">
          <p style="white-space:pre-line;margin:0 0 24px;">${body}</p>
          
        </div>
    
        <div style="background:#fafafa;border-top:1px solid #eee;padding:16px;text-align:center;font-size:12px;color:#888">
          <p style="margin:4px 0">You're receiving this email because you have an account with OAP Barber.</p>
          <p style="margin:4px 0">© ${new Date().getFullYear()} OAP Barber</p>
        </div>
      </div>
    `;

    console.log(users);
    // optionally throttle / chunk if you have hundreds of users
    users?.forEach((u) => {
      // ① e-mail
      sendEmail(
        {
          to: u.email,
          subject,
          html,
          emailUser: u.email,
          from: "barbersystem72@gmail.com",
          message: "sfsad",
        },
        {
          onError: (e) => console.log(e),
          onSuccess: () => console.log("successs"),
        }
      );

      // ② in-app / push notification
      sendNoti(
        {
          userId: u.id,
          title: subject,
          barberId: "",
          message: body,
          type: "message-to-user",
        },
        {
          onError: (e) => console.log(e),
          onSuccess: () => console.log("successs noti"),
        }
      );
    });
  };
  if (role === "barber") {
    return (
      <div className="py-0 sm:py-0 max-w-5xl mx-auto">
        <TiltleDashboardPages title="Messages"></TiltleDashboardPages>
        <p className="text-error font-semibold mt-9 border-error text-2xl w-full">
          Only admins can view messages. Please contact an admin for access.
        </p>
      </div>
    );
  } else
    return (
      <div className=" py-0 sm:py-6 max-w-5xl mx-auto">
        <TiltleDashboardPages title="Messages">
          <BroadcastMessageDialog
            isOpen={open}
            onOpen={() => setopen((pre) => !pre)}
            onSubmit={handleBroadcast}
          />
        </TiltleDashboardPages>
        {/* Tabs */}
        <div className="flex gap-8 border-b border-gray-300 text-sm my-6">
          {["Not Read", "Read"].map((lbl, idx) => {
            const active =
              (idx === 0 && tab === "unread") || (idx === 1 && tab === "read");
            return (
              <button
                key={lbl}
                onClick={() => setTab(idx === 0 ? "unread" : "read")}
                className={`pb-2 ${
                  active ? "border-b-2 border-dark-purple font-semibold" : ""
                }`}
              >
                {lbl}
              </button>
            );
          })}
        </div>

        {/* Mark-all button */}
        {tab === "unread" && filtered.length > 0 && (
          <button
            onClick={markAll}
            className="mb-4 text-sm text-dark-purple hover:underline"
          >
            Mark all as read
          </button>
        )}

        {/* List / loading  */}
        {isLoading ? (
          <>
            <Skeleton />
            <Skeleton />
          </>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500">No messages.</p>
        ) : (
          filtered.map((msg) => (
            <MessageCard
              key={msg.id}
              msg={msg}
              onMark={() => markOne(msg.id)}
            />
          ))
        )}
      </div>
    );
}
