"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const Preloader = () => {
  const loaderRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        // Remove loader after animation
        setTimeout(() => setIsVisible(false), 300); // give fade time
      },
    });

    tl.fromTo(
      loaderRef.current,
      { y: 0 },
      {
        y: "-100%",
        duration: 1,
        delay: 1.2,
        ease: "power4.inOut",
      }
    );
  }, []);

  if (!isVisible) return null;

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-[9999] bg-dark-purple flex items-center justify-center text-white text-2xl font-bold"
    >
      <div className="loader-logo">
        <span className="text-4xl animate-pulse">✨ Welcome ✨</span>
      </div>
    </div>
  );
};

export default Preloader;
