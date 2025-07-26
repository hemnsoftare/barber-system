"use client";

import { useHideHeader } from "@/hook/usehideHeader";
import Image from "next/image";
import Link from "next/link";
import { JSX, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const Hero = (): JSX.Element => {
  const hide = useHideHeader();

  // Refs for animation targets
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const title = titleRef.current;
    const description = descriptionRef.current;
    const button = buttonRef.current;
    const image = imageRef.current;

    if (!hero || !title || !description || !button) return;

    // Set initial states
    gsap.set([title, description, button], {
      opacity: 0,
      y: 50,
    });

    if (image) {
      gsap.set(image, {
        opacity: 0,
        scale: 1.1,
      });
    }

    // Create timeline for entrance animations
    const tl = gsap.timeline({
      delay: 0.2,
    });

    // Background image animation
    if (image) {
      tl.to(image, {
        opacity: 1,
        scale: 1,
        duration: 1.5,
        ease: "power2.out",
      });
    }

    // Title animation with stagger for words
    tl.to(
      title,
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
      },
      "-=1"
    );

    // Description animation
    tl.to(
      description,
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
      },
      "-=0.5"
    );

    // Button animation
    tl.to(
      button,
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
      },
      "-=0.3"
    );

    // Scroll-triggered animations
    ScrollTrigger.create({
      trigger: hero,
      start: "top center",
      end: "bottom center",
      onEnter: () => {
        gsap.to(title, {
          y: -10,
          duration: 0.6,
          ease: "power2.out",
        });
      },
      onLeave: () => {
        gsap.to(title, {
          y: 0,
          duration: 0.6,
          ease: "power2.out",
        });
      },
      onEnterBack: () => {
        gsap.to(title, {
          y: -10,
          duration: 0.6,
          ease: "power2.out",
        });
      },
      onLeaveBack: () => {
        gsap.to(title, {
          y: 0,
          duration: 0.6,
          ease: "power2.out",
        });
      },
    });

    // Parallax effect for background image
    if (image) {
      ScrollTrigger.create({
        trigger: hero,
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
        onUpdate: (self: ScrollTrigger) => {
          const progress = self.progress;
          gsap.to(image, {
            y: progress * -10,
            duration: 0.3,
            ease: "none",
          });
        },
      });
    }

    // Hover animation for button
    const buttonElement = button;

    const handleMouseEnter = (): void => {
      gsap.to(buttonElement, {
        scale: 1.05,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = (): void => {
      gsap.to(buttonElement, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    buttonElement.addEventListener("mouseenter", handleMouseEnter);
    buttonElement.addEventListener("mouseleave", handleMouseLeave);

    // Cleanup function
    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((trigger: ScrollTrigger) =>
        trigger.kill()
      );
      buttonElement.removeEventListener("mouseenter", handleMouseEnter);
      buttonElement.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [hide]);

  return (
    <section
      ref={heroRef}
      className="w-full lg:h-screen md:h-[549px]  h-[430px] flex justify-center  text-white overflow-hidden"
    >
      {!hide && (
        <Image
          src={"/images/bg-hero.png"}
          alt="image"
          priority
          ref={imageRef}
          width={1000}
          height={600}
          className="min-w-screen object-cover max-w-screen absolute top-0 md:h-[650px] lg:min-h-screen lg:max-h-screen left-0 h-[500px] z-[-1]"
        />
      )}

      {/* Content */}
      <div className="text-center px-4 lg:mt-32 mt-12 max-w-3xl">
        <h1
          ref={titleRef}
          className="text-3xl md:text-5xl font-extrabold leading-tight"
        >
          You{"'"}re <span className="text-light-blue">Not</span> Average <br />
          So Why Should Your <span className="text-light-blue">
            Haircut
          </span>{" "}
          Be?
        </h1>
        <div
          ref={descriptionRef}
          className="mt-6 text-sm md:text-lg text-gray-200"
        >
          <p className="lg:text-xl">
            Whether it{"'"}s a fresh fade, a sharp beard trim, or a classic cut,
            we tailor every detail to match your personality. Book your
            appointment today and experience the difference!
          </p>
        </div>
        <Link
          ref={buttonRef}
          href="/booking/serives"
          className="mt-8 inline-block bg-white text-dark-purple text-xl font-semibold px-6 py-3 rounded shadow md:hover:scale-95 transition"
        >
          Book an appointment
        </Link>
      </div>
    </section>
  );
};

export default Hero;
