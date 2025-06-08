import { SignUp } from "@clerk/nextjs";
import Image from "next/image";

export default function Page() {
  return (
    <div className="flex relative xl:py-12 lg:py-6  justify-center items-center min-h-screen overflow-hidden">
      <Image
        src={"/images/bg-sign-in.jpg"}
        alt="Barber Shop"
        fill
        className="object-cover blur-s brightness-50"
        style={{ zIndex: -1 }}
        priority
      />
      {/* Backdrop overlay */}
      <div className="absolute " style={{ zIndex: 0 }} />
      <div className="  z-10">
        <SignUp
          appearance={{
            elements: {
              rootBox: {
                width: "100%",
                boxShadow: "0 15px 35px -8px rgba(0, 0, 0, 0.25)",
                borderRadius: "12px", // Reduced from 16px
                backdropFilter: "blur(50px)",
                backgroundColor: "transparent",
                color: "#ffffff",
              },
              card: {
                backgroundColor: "transparent",
                width: "100%",
                borderColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: "12px", // Reduced from 16px
                boxShadow: "0 15px 35px -8px rgba(0, 0, 0, 0.25)",
                padding: "1.1rem 1.4rem", // Reduced from 2rem
                boxSizing: "border-box",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(20px)",
              },
              footerActionLink: {
                color: "#ffffff", // White color for "Forgot password?"
                fontSize: "13px", // Reduced from 14px
                width: "100%",
                lineHeight: "18px", // Reduced from 20px
                textDecoration: "none",
                textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
                "&:hover": {
                  textDecoration: "underline",
                  color: "#ffffff",
                },
              },
              headerTitle: {
                widows: "100%",
                fontSize: "20px", // Reduced from 22px
                lineHeight: "28px", // Reduced from 32px
                fontWeight: "700",
                color: "#ffffff",
                marginBottom: "0rem", // Reduced from 0.5rem
                textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                "@media (max-width: 768px)": {
                  fontSize: "16px", // Reduced from 18px
                },
              },
              headerSubtitle: {
                width: "100%",
                fontSize: "14px", // Reduced from 16px
                lineHeight: "20px", // Reduced from 24px
                color: "rgba(255, 255, 255, 0.8)",
                marginBottom: "0.15rem", // Reduced from 2rem
                textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
                "@media (max-width: 768px)": {
                  fontSize: "12px", // Reduced from 13px
                },
              },
              formFieldLabel: {
                width: "100%",
                fontSize: "13px", // Reduced from 14px
                lineHeight: "2px", // Reduced from 20px
                fontWeight: "600",
                color: "#ffffff",
                marginBottom: "0.4rem", // Reduced from 0.5rem
                textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
              },
              formFieldInput: {
                width: "100%",
                border: "3px solid rgba(255, 255, 255, 0.3)", // Reduced from 5px
                backgroundColor: "transparent",
                backdropFilter: "blur(10px)",
                outline: "2px solid rgba(255, 255, 255, 0.3)", // Reduced from 3px
                fontSize: "14px", // Reduced from 16px
                lineHeight: "20px", // Reduced from 24px
                padding: "0.625rem 1rem", // Reduced from 0.875rem 1.25rem
                color: "#ffffff",
                "&::placeholder": {
                  color: "rgba(255, 255, 255, 0.6)",
                },
                "&:focus": {
                  outline: "2px solid white",
                  outlineOffset: "1px", // Reduced from 2px
                  backgroundColor: "transparent",
                  backdropFilter: "blur(110px)",
                  boxShadow: "0 0 0 2px rgba(255, 255, 255, 0.1)", // Reduced from 3px
                },
              },
              formButtonPrimary: {
                width: "100%",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                color: "white",
                borderRadius: "10px", // Reduced from 12px
                fontSize: "14px", // Reduced from 16px
                lineHeight: "1px", // Reduced from 24px
                fontWeight: "600",
                padding: "0.65rem 1.5rem", // Reduced from 0.875rem 2rem
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)", // Reduced shadow
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  transform: "translateY(-1px)", // Reduced from -2px
                  boxShadow: "0 12px 25px rgba(0, 0, 0, 0.3)", // Reduced shadow
                },
                "&:focus": {
                  outline: "1px solid rgba(255, 255, 255, 0.5)",
                  outlineOffset: "1px", // Reduced from 2px
                },
              },
              formButtonSecondary: {
                width: "100%",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                color: "#ffffff",
                borderColor: "rgba(255, 255, 255, 0.3)",
                borderRadius: "10px", // Reduced from 12px
                fontSize: "14px", // Reduced from 16px
                lineHeight: "20px", // Reduced from 24px
                fontWeight: "500",
                padding: "0.75rem 1.5rem", // Reduced from 0.875rem 2rem
                border: "1px solid rgba(255, 255, 255, 0.3)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  color: "#ffffff",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)", // Reduced shadow
                },
                "&:focus": {
                  outline: "2px solid rgba(255, 255, 255, 0.3)",
                  outlineOffset: "1px", // Reduced from 2px
                },
              },
              socialButtonsBlockButton: {
                width: "100%",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                color: "#ffffff",
                borderColor: "rgba(255, 255, 255, 0.3)",
                borderRadius: "10px", // Reduced from 12px
                fontSize: "14px", // Reduced from 16px
                lineHeight: "20px", // Reduced from 24px
                fontWeight: "500",
                padding: "0.75rem 1rem", // Reduced from 0.875rem 1.25rem
                border: "1px solid rgba(255, 255, 255, 0.3)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  color: "#ffffff",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)", // Reduced shadow
                },
                "&:focus": {
                  outline: "2px solid rgba(255, 255, 255, 0.3)",
                  outlineOffset: "1px", // Reduced from 2px
                  backdropFilter: "blur(110px)",
                },
              },
              dividerLine: {
                width: "100%",
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                height: "1px",
                margin: "0.1rem 0", // Reduced from 1.5rem
              },
              dividerText: {
                fontSize: "13px", // Reduced from 14px
                lineHeight: "1px", // Reduced from 20px
                color: "rgba(255, 255, 255, 0.8)",
                backgroundColor: "rgba(0, 0, 0, 0.2)",
                backdropFilter: "blur(10px)",
                padding: "0.375rem 0.75rem", // Reduced from 0.5rem 1rem
                borderRadius: "6px", // Reduced from 8px
                textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
              },
              footerActionText: {
                fontSize: "13px", // Reduced from 14px
                lineHeight: "18px", // Reduced from 20px
                color: "rgba(255, 255, 255, 0.7)",
                textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
              },
              footer: {
                display: "none",
              },
              identityPreviewText: {
                fontSize: "13px", // Reduced from 14px
                // Reduced from 20px
                color: "#FFFFFF",
                textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
              },
              identityPreviewEditButton: {
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: "11px", // Reduced from 12px
                lineHeight: "14px", // Reduced from 16px
                textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
                "&:hover": {
                  textDecoration: "underline",
                  color: "#ffffff",
                },
              },
              formFieldErrorText: {
                fontSize: "11px", // Reduced from 12px
                lineHeight: "14px", // Reduced from 16px
                color: "#ff6b6b",
                marginTop: "0.4rem", // Reduced from 0.25rem
                textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
              },
              alertError: {
                backgroundColor: "rgba(255, 107, 107, 0.2)",
                backdropFilter: "blur(10px)",
                color: "#ffffff",
                borderRadius: "10px", // Reduced from 12px
                padding: "0.75rem 1rem", // Reduced from 1rem 1.25rem
                fontSize: "13px", // Reduced from 14px
                lineHeight: "18px", // Reduced from 20px
                marginBottom: "0.2rem", // Reduced from 1.5rem
                border: "1px solid rgba(255, 107, 107, 0.4)",
                textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
              },
            },
          }}
        />
      </div>
    </div>
  );
}
