// api/apps/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import type { AppointmentProps } from "@/feature-modules/booking/action";
import { sendEmail } from "@/hook/useSendEmail";
import { convertToDate } from "@/lib/convertTimestamp";
import { sendNotification } from "@/feature-modules/booking/actionNotifcation";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  console.log("in apps");

  console.log(" in get");
  try {
    const q = query(
      collection(db, "appointments"),
      where("status", "==", "not-finished"),
      where("user.fullName", "==", "admin farhad"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    const appointments: AppointmentProps[] = snapshot.docs.map((d) => {
      const data = d.data() as unknown as AppointmentProps;

      return { ...data, id: d.id };
    });
    await Promise.all(
      appointments.map((app) => {
        console.log(app);
        sendEmail({
          from: "barbersystem72@gmail.com", // receiver
          to: app.user.email || "", // sender
          subject: "Appointment Reminder",
          message: `${app.user.fullName} booked "${
            app.service.name
          }"  on ${convertToDate(app?.date).toDateString()} at ${
            app.startTime
          }.`,
          html: `
<div style="margin:0;padding:24px;font-family:Inter,Segoe UI,Arial,sans-serif;">   
  <div style="max-width:560px;margin:0 auto;">     
    <div style="background:#ffffff;border-radius:20px;padding:32px;box-shadow:0 8px 32px rgba(72,0,36,0.12);border:2px solid rgba(72,0,36,0.08);overflow:hidden;position:relative;">        
      
      <!-- Decorative header gradient -->
      <div style="position:absolute;top:0;left:0;right:0;height:6px;background:linear-gradient(90deg, #480024 0%, #6d1b4a 50%, #480024 100%);"></div>
      
      <!-- Brand / Header -->       
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;margin-top:8px;">         
        
        <div>           
          <h2 style="margin:0;font-size:22px;line-height:1.3;color:#480024;font-weight:800;letter-spacing:.3px;">             
            Appointment Reminder           
          </h2>           
          <div style="font-size:13px;color:#8b5a6b;line-height:1.2;margin-top:4px;font-weight:500;">             
            Your beauty appointment is confirmed ✨           
          </div>         
        </div>       
      </div>        

      <!-- Greeting -->       
      <p style="margin:0 0 24px 0;color:#4a4a4a;font-size:16px;line-height:1.6;">         
        Hello <strong style="color:#480024;">${
          app.user.fullName || "Beautiful"
        }</strong>, your appointment details are below. We can't wait to pamper you! 💅       
      </p>        

      <!-- Booking Details Card -->       
    <div style="background:linear-gradient(135deg, rgba(72,0,36,0.03) 0%, rgba(72,0,36,0.08) 100%);border-radius:16px;padding:24px;border:2px solid rgba(72,0,36,0.12);margin-bottom:28px;position:relative;">
  <h3 style="margin:0 0 16px 0;color:#480024;font-size:16px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Appointment Details</h3>

  <!-- Row utility: label has fixed width + margin-right; value sits after with space -->
  <div style="display:flex;align-items:center;padding:10px 0;border-bottom:1px solid rgba(72,0,36,0.1);">
    <span style="color:#6b6b6b;font-size:14px;font-weight:500;min-width:120px;margin-right:16px;">Service</span>
    <strong style="color:#480024;font-size:15px;font-weight:600;">${
      app.service?.name || "Beauty Service"
    }</strong>
  </div>

  <div style="display:flex;align-items:center;padding:10px 0;border-bottom:1px solid rgba(72,0,36,0.1);">
    <span style="color:#6b6b6b;font-size:14px;font-weight:500;min-width:120px;margin-right:16px;">Date</span>
    <strong style="color:#480024;font-size:15px;font-weight:600;">${
      app?.date ? convertToDate(app?.date).toDateString() : "To be confirmed"
    }</strong>
  </div>

  <div style="display:flex;align-items:center;padding:10px 0;border-bottom:1px solid rgba(72,0,36,0.1);">
    <span style="color:#6b6b6b;font-size:14px;font-weight:500;min-width:120px;margin-right:16px;">Time</span>
    <strong style="color:#480024;font-size:15px;font-weight:600;">
      ${convertToDate(app.startTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}
    </strong>
  </div>

  <div style="display:flex;align-items:center;padding:10px 0;">
    <span style="color:#6b6b6b;font-size:14px;font-weight:500;min-width:120px;margin-right:16px;">Barber</span>
    <strong style="color:#480024;font-size:15px;font-weight:600;">${
      app.barber?.fullName || "Our expert team"
    }</strong>
  </div>
</div>
  

      <!-- CTA -->       
      <div style="text-align:center;margin-bottom:24px;">         
        <a href="${
          (process.env.NEXT_PUBLIC_BASE_URL || "#") + "/appointments/history"
        }"            
           style="background:linear-gradient(135deg, #480024 0%, #6d1b4a 100%);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px;display:inline-block;box-shadow:0 4px 16px rgba(72,0,36,0.3);transition:all 0.3s ease;border:none;">           
          View My Appointments         
        </a>       
      </div>        

      <!-- Additional Info -->
      <div style="background:rgba(72,0,36,0.05);border-radius:12px;padding:16px;margin-bottom:20px;border-left:4px solid #480024;">
        <p style="margin:0;color:#480024;font-size:14px;font-weight:600;margin-bottom:4px;">💡 Preparation Tips</p>
        <p style="margin:0;color:#666;font-size:13px;line-height:1.5;">Please arrive 5 minutes early. If you need to reschedule, contact us at least 24 hours in advance.</p>
      </div>

      <!-- Footer -->       
      <p style="margin:0;color:#8b5a6b;font-size:13px;text-align:center;line-height:1.6;font-style:italic;">         
        Questions? We're here to help make your experience perfect! 🌸       
      </p>     
    </div>      

    <p style="text-align:center;color:#a0a0a0;font-size:11px;margin-top:20px;font-weight:500;">       
      © ${new Date().getFullYear()} Beauty System. Crafted with love ♥     
    </p>   
  </div> 
</div>


  `,
          emailUser: app.user.email || "",
        });

        sendNotification({
          barberId: "",
          message: `Hi ${
            app.user.fullName || "there"
          }, this is a reminder for your appointment on ${convertToDate(
            app.date
          ).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })} at ${convertToDate(app.startTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })} (Asia/Baghdad) for ${app.service.name} (${
            app.service.price
          } £) with ${app.barber?.fullName || "our team"}.`,

          title: "Reminder",
          type: "reminder",
          appointmentId: app.id,
          userId: app.user.id || "",
        });

        updateDoc(doc(db, "appointments", app.id || ""), {
          status: "expired",
          updatedAt: new Date(), // Firestore stores JS Date fine
        });
      })
    );

    return NextResponse.json(
      { ok: true, count: appointments.length, appointments },
      { status: 200 }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
