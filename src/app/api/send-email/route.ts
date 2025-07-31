// // API Route: /api/send-email/route.ts
// import { NextResponse } from "next/server";
// import nodemailer from "nodemailer";

// export async function POST(req: Request) {
//   try {
//     const { to, from, subject, message, emailUser, html } = await req.json();
//     console.log("Received email request:", { to, from, subject, message });
//     // Validate required fields
//     if (!to || !subject || !message || !from) {
//       return NextResponse.json(
//         { success: false, error: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     // Check environment variables
//     if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
//       console.error("Missing email credentials");
//       return NextResponse.json(
//         { success: false, error: "Server configuration error" },
//         { status: 500 }
//       );
//     }

//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.MAIL_USER,
//         pass: process.env.MAIL_PASS,
//       },
//     });

//     await transporter.sendMail({
//       from: `"Booking System" <${process.env.MAIL_USER}>`, // always this!
//       to,
//       replyTo: from, // this is the trick
//       subject,
//       text: message,
//       html: html
//         ? html
//         : `
//      <div style="border:1px solid #eee; border-radius:8px; padding:16px; max-width:400px; font-family:sans-serif;">
//        <h2 style="color:#480024; margin-bottom:8px;">New Message</h2>
//        <p><strong>User Email:</strong> ${emailUser}</p>
//        <div style="margin-top:12px;">
//           <h4 style="margin-bottom:4px;">Message:</h4>
//           <div style="background:#f9f9f9; padding:10px; border-radius:4px;">
//             ${message.replace(/\n/g, "<br>")}
//           </div>
//        </div>
//      </div>
//   `,
//     });

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("Email sending error:", error);

//     // Return more specific error information
//     const errorMessage =
//       error instanceof Error ? error.message : "Unknown error";
//     return NextResponse.json(
//       { success: false, error: errorMessage },
//       { status: 500 }
//     );
//   }
// }
