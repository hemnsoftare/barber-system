"use client";

import { useHideHeader } from "@/hook/usehideHeader";
import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  const hide = useHideHeader();
  return (
    <section className=" w-full h-screen flex   justify-center text-white overflow-hidden">
      {!hide && (
        <Image
          src={"/images/bg-hero.png"}
          alt="image"
          fill
          priority
          className="min-w-screen max-w-screen absolute top-0 left-0 min-h-screen z-[-1] max-h-screen "
        />
      )}
      {/* Background Image */}
      {/* <Image
        src="/images/bg-hero.png"
        alt="Barber hero"
        fill
        priority
        className="object-cover brightness-[0.4] z-[-1]"
      /> */}

      {/* Content */}
      <div className="text-center px-4 mt-12 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
          You’re <span className="text-light-blue">Not</span> Average <br />
          So Why Should Your <span className="text-light-blue">
            Haircut
          </span>{" "}
          Be?
        </h1>
        <div className="mt-6 text-lg text-gray-200">
          <p>
            {" "}
            Whether it’s a fresh fade, a sharp beard trim, or a classic cut, we
            tailor every{" "}
          </p>
          <p>
            {" "}
            detail to match your personality. Book your appointment today and
          </p>{" "}
          experience the difference!
        </div>
        <Link
          href="/booking/serives"
          className="mt-8 inline-block bg-white text-dark-purple text-xl font-semibold  px-6 py-3 rounded shadow md:hover:scale-95 transition"
        >
          Book an appointment
        </Link>
      </div>
    </section>
  );
};

export default Hero;
