"use client";
import React, { useRef, useState } from "react";
import { Play, Volume2, VolumeX } from "lucide-react";

interface VideoHeroProps {
  title: string;
  videoSrc?: string;
}
export default function VideoHero({
  title,
  videoSrc = "/video/All_Over_OAP.mp4",
}: VideoHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hover, setHover] = useState(false);

  const togglePlay = async () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await videoRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.error("Video play failed:", err);
      }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="relative  w-[330px] mx-auto">
      {/* 🔸 Card wrapper */}
      <div
        className="group relative w-full h-[200px] overflow-hidden rounded-sm border border-white/5 shadow-lg cursor-pointer"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={togglePlay}
      >
        {/* 🔸 Video */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted={isMuted}
          loop
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>

        {/* 🔸 Gradient overlay (subtle when playing) */}
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            isPlaying ? "bg-black/25" : "bg-black/65"
          }`}
        />

        {/* 🔸 Title + play hint */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute inset-0" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="relative z-10 w-15 h-15 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white/30 hover:scale-110 group-hover:scale-110"
            >
              <Play size={32} className="text-white fill-white ml-1" />
            </button>
          </div>
        )}
        <h1 className="text-white font-extrabold text-xl absolute bottom-2 left-2 drop-shadow-lg">
          {title}
        </h1>
        {/* 🔸 Controls (fade in on hover OR when paused) */}
        {(hover || !isPlaying) && (
          <div className="absolute bottom-3  right-3 flex items-center justify-center gap-4">
            {/* Play / Pause */}

            {/* Mute / Un-mute */}
            <button
              className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/30 transition"
              onClick={toggleMute}
            >
              {isMuted ? (
                <VolumeX size={20} className="text-white" />
              ) : (
                <Volume2 size={20} className="text-white" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* 🔸 Outer glow on hover */}
      <div className="absolute inset-0 rounded-xl blur-lg bg-gradient-to-r from-purple-500/30 to-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
}
