"use client";
import HeroAllPage from "@/components/layout/HeroAllPage";
import Input from "@/components/layout/Input";
import { Icon } from "@/constants/icons";
import React, { useEffect, useRef, useState } from "react";
import { useAddMessage } from "./hooks/useReviw";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSendEmail } from "@/hook/useSendEmail";
import { useSendNotification } from "../booking/useAppointmentNotifcation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const ContactUS = () => {
  const { user, isSignedIn } = useUser();
  const [message, setmeeage] = useState<string>();
  const { mutate } = useAddMessage();
  const router = useRouter().push;
  const { mutate: sendEmail } = useSendEmail();
  const { mutate: sendNotification } = useSendNotification();
  const handleSubmit = () => {
    if (!isSignedIn) {
      toast.error("You must be signed in to send a message", {
        style: {
          backgroundColor: "#ffe4e6",
          color: "#b91c1c",
          border: "1px solid #fca5a5",
        },
        action: {
          label: "Login",
          onClick: () => {
            router("/sign-in");
          },
        },
      });

      return;
    }

    if (!message || message.length < 10) {
      toast.error("Message too short", {
        description: "Please write at least 10 characters.",
        style: {
          backgroundColor: "#fef3c7",
          color: "#92400e",
          border: "1px solid #fcd34d",
        },
      });
      return;
    }

    mutate({
      userId: user?.id,
      email: user?.emailAddresses[0].emailAddress,
      fullName: user?.fullName || "n/n",
      message: message,
    });

    setmeeage("");
    toast.success("Message sent successfully!", {
      style: {
        backgroundColor: "#dcfce7",
        color: "#166534",
        border: "1px solid #86efac",
      },
    });
    sendNotification({
      userId: "admin", // or system ID
      title: "New Contact Message",
      message: `${user.fullName} sent a new message.`,
      barberId: "",
      type: "message",
    });

    // 📧 Send Email to System Inbox
    sendEmail({
      to: "barbersystem72@gmail.com", // or your system inbox
      from: user.emailAddresses[0].emailAddress,
      emailUser: user.emailAddresses[0].emailAddress,
      subject: `New Contact from ${user.fullName}`,
      message: message,
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; background: #fdfdfd; border: 1px solid #ddd; border-radius: 8px; animation: fadeIn 1s ease-in-out;">
        <h2 style="color: #3b0764; font-size: 22px; margin-bottom: 16px;">📩 New Message Received</h2>
    
        <div style="margin-bottom: 12px;">
          <p style="margin: 4px 0;"><strong>From:</strong> ${user.fullName}</p>
          <p style="margin: 4px 0;"><strong>Email:</strong> ${user.emailAddresses[0].emailAddress}</p>
        </div>
    
        <div style="margin-top: 20px;">
          <p style="margin-bottom: 8px; font-weight: bold;">Message:</p>
          <div style="padding: 12px; background: #f9f9f9; border-left: 4px solid #3b0764; font-size: 14px; line-height: 1.5;">
            ${message}
          </div>
        </div>
    
        <p style="margin-top: 24px; font-size: 13px; color: #666;">Sent via Contact System</p>
      </div>
    
      <style>
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      </style>
    `,
    });
    setmeeage("");
  };
  // Refs
  const contactInfoRef = useRef(null);
  const mapRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate contact info
      if (contactInfoRef.current) {
        gsap.fromTo(
          contactInfoRef.current,
          { opacity: 0, x: -50 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: contactInfoRef.current,
              start: "top 90%",
            },
          }
        );
      }

      // Animate map
      if (mapRef.current) {
        gsap.fromTo(
          mapRef.current,
          { opacity: 0, scale: 0.95 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: mapRef.current,
              start: "top 85%",
            },
          }
        );
      }

      // Animate form
      if (formRef.current) {
        gsap.fromTo(
          formRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: formRef.current,
              start: "top 85%",
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div>
      <HeroAllPage
        title="CONTACT US"
        image="/images/contactUs.png"
        subTitle="Reach out to book your next fresh cut or ask us anything."
      />
      <div
        ref={contactInfoRef}
        className="w-full flex sm:flex-row flex-col items-start gap-4  ms:items-center my-24 justify-between"
      >
        <div>
          <h2 className="text-dark-purple font-semibold">Location</h2>
          <p className="text-gray-900">5 Mere Green Road, Mere Green,</p>
          <p className="text-gray-900">Sutton Coldfield B75 5BL</p>
        </div>{" "}
        <div>
          <h2 className="text-dark-purple font-semibold">Phone number</h2>
          <p className="text-gray-900">+44 121 285 5006</p>
        </div>{" "}
        <div>
          <h2 className="text-dark-purple font-semibold">Working hours</h2>
          <p className="text-gray-900">Mon to Sat : 09:00 AM - 07:00 PM</p>
          <p className="text-gray-900">Sun : 10:00 AM - 05:00 PM</p>
        </div>{" "}
      </div>
      {/* google map */}
      <div ref={mapRef} className="w-full">
        <div className="w-full sm:h-96 h-72 rounded-[2px] overflow-hidden shadow-dark-purple/50 shadow-sm">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2426.1234567890123!2d-1.8234567890123456!3d52.56789012345678!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4870bcd1234567890%3A0x1234567890abcdef!2s5%20Mere%20Green%20Rd%2C%20Mere%20Green%2C%20Sutton%20Coldfield%20B75%205BL%2C%20UK!5e0!3m2!1sen!2suk!4v1234567890123!5m2!1sen!2suk"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
          ></iframe>
        </div>
      </div>

      <div
        ref={formRef}
        className="flex items-start my-12 w-full  flex-col sm:flex-row justify-between "
      >
        <div className="w-full sm:w-1/2">
          <h1 className="text-dark-purple  w-full font-semibold">
            Get in touch!
          </h1>
          <p className="  w-full sm:w-3/4 sm:mt-0 mt-6 text-justify indent-1.5 md:max-w-[550px]">
            Have a question or need more details? Fill out the form below, and
            we’ll get back to you as soon as possible. We’re here to help with
            any inquiries! You can also connect with us on social media:
          </p>
          <div className="text-dark-purple cursor-move font-semibold flex mt-6 items-center gap-2">
            <Icon name="facebook" size={18} className="font-bold" />{" "}
            <span>Facebook</span>
          </div>
          <div className="text-dark-purple cursor-move font-semibold flex items-center gap-2">
            <Icon name="instagram" size={18} className="font-bold" />{" "}
            <span>Instagram</span>
          </div>
          <div className="text-dark-purple cursor-move font-semibold flex items-center gap-2">
            <Icon name="twitter" size={18} className="font-bold" />{" "}
            <span>Twitter</span>
          </div>{" "}
          <div className="text-dark-purple cursor-move font-semibold flex items-center gap-2">
            <Icon name="whatsapp" size={18} className="font-bold" />{" "}
            <span>Whastapp</span>
          </div>
        </div>
        <div className="flex items-center  md:w-1/2 w-full sm:mt-0 mt-6 justify-center flex-col gap-2">
          <Input
            isTextArea
            label="Your message"
            placeholder="Your message"
            onChange={(e) => setmeeage(e.target.value)}
            cols={60}
            rows={6}
            value={message}
            className="w-full"
          />
          <button
            onClick={handleSubmit}
            className="text-white px-6 py-2 bg-dark-purple rounded-none "
          >
            Send the message
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactUS;
