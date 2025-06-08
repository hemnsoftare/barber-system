"use client";
import Link from "next/link";
import {
  UserButton,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  useUser,
} from "@clerk/nextjs";
import { useCreateUser } from "@/feature-modules/users/hooks/useuserApi";
import { useEffect } from "react";
export default function Home() {
  const { user } = useUser();
  const { mutate } = useCreateUser();
  useEffect(() => {
    if (user) {
      console.log(user);
      mutate({
        email: user?.emailAddresses[0].emailAddress || "adf",
        fullName: user?.fullName || "",
        phone: "3242342423",
        role: "user",
        image: user?.imageUrl || "",
      });
    }
  }, [user, mutate]);
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg p-4">
        <h1>{"user?.fullName"}</h1>
        <div className="container mx-auto flex justify-between items-center">
          <button
            onClick={() => {}}
            className="text-2xl font-bold text-gray-800"
          >
            Barber Management
          </button>

          <div className="flex items-center space-x-4">
            <Link
              href="/appointments"
              className="text-gray-600 hover:text-gray-800"
            >
              Appointments
            </Link>
            <Link
              href="/services"
              className="text-gray-600 hover:text-gray-800"
            >
              Services
            </Link>
            <Link href="/staff" className="text-error hover:text-gray-800">
              Staff
            </Link>

            {/* Auth Area */}
            <SignedOut>
              <SignInButton>
                <button className="text-sm text-blue-600 hover:underline">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="text-sm text-green-600 hover:underline">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Professional Barber Services
            </h2>
            <p className="text-gray-600 mb-6">
              Book your appointment today and experience the best in grooming
              services.
            </p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
              Book Appointment
            </button>
          </div>
          <div className="relative h-[400px]"></div>
        </div>

        {/* Services Section */}
        <section className="mt-16">
          <h3 className="text-2xl font-bold text-gray-800 mb-8">
            Our Services
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {["Haircut", "Beard Trim", "Hair Styling"].map((service) => (
              <div key={service} className="bg-white p-6 rounded-lg shadow-md">
                <h4 className="text-xl font-semibold mb-2">{service}</h4>
                <p className="text-gray-600">
                  Professional {service.toLowerCase()} services by expert
                  barbers.
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>© 2024 Barber Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
