// Icons import
import { RxDashboard } from "react-icons/rx";
import { AiOutlineMessage } from "react-icons/ai";
import { FiLogOut, FiEdit3, FiPhoneCall, FiTwitter } from "react-icons/fi";
import { PiNewspaper, PiClockCounterClockwise } from "react-icons/pi";
import { IoAlarmOutline, IoCloseSharp, IoTrashOutline } from "react-icons/io5";
import { LuClock4 } from "react-icons/lu";
import { GoStarFill } from "react-icons/go";
import { LiaQuoteLeftSolid } from "react-icons/lia";
import { TbMail } from "react-icons/tb";
import { HiOutlineUser } from "react-icons/hi2";
import { SlSocialFacebook } from "react-icons/sl";
import { BsInstagram, BsWhatsapp } from "react-icons/bs";
import { FaRegBookmark, FaBookmark, FaRegCopyright } from "react-icons/fa6";
import { CiBank, CiSearch } from "react-icons/ci";
import { MdOutlineManageAccounts } from "react-icons/md";
import { GrFormNext } from "react-icons/gr";
import React from "react";
import Image from "next/image";

// Type for React-based icon components
type IconComponentType = React.ComponentType<{
  className?: string;
  size?: number;
  onClick?: () => void;
  [key: string]: unknown;
}>;

// Helper function to convert hex color to CSS filter
export const hexToFilter = (hex: string): string => {
  // Remove # if present
  hex = hex.replace("#", "");

  // Convert hex to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Convert to HSL for better filter calculation
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const diff = max - min;

  let h = 0;
  if (diff !== 0) {
    switch (max) {
      case rNorm:
        h = ((gNorm - bNorm) / diff) % 6;
        break;
      case gNorm:
        h = (bNorm - rNorm) / diff + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / diff + 4;
        break;
    }
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;

  const l = (max + min) / 2;
  const s = diff === 0 ? 0 : diff / (1 - Math.abs(2 * l - 1));

  // Create CSS filter
  const brightness = Math.round(l * 100);
  const saturate = Math.round(s * 100);
  const hueRotate = h;

  return `brightness(0) saturate(100%) invert(${
    brightness > 50 ? 100 : 0
  }%) sepia(100%) saturate(${saturate}%) hue-rotate(${hueRotate}deg) brightness(${brightness}%)`;
};

// Icon map (React icons + image paths)
export const Icons = {
  dashboard: RxDashboard,
  messages: AiOutlineMessage,
  next: GrFormNext,
  review: GoStarFill,
  mangeAccount: MdOutlineManageAccounts,
  logout: FiLogOut,
  edit: FiEdit3,
  news: PiNewspaper,
  delete: IoTrashOutline,
  reminder: IoAlarmOutline, // Added icon for reminder
  clock: LuClock4,
  star: GoStarFill,
  quote: LiaQuoteLeftSolid,
  email: TbMail,
  close: IoCloseSharp,
  search: CiSearch,
  phone: FiPhoneCall,
  facebook: SlSocialFacebook,
  user: HiOutlineUser,
  instagram: BsInstagram,
  twitter: FiTwitter,
  whatsapp: BsWhatsapp,
  bookmark: FaRegBookmark,
  bookmark_filled: FaBookmark,
  oclock_history: PiClockCounterClockwise,
  accounting: CiBank,
  copyRight: FaRegCopyright,
  services: MdOutlineManageAccounts, // changed from image to icon
  // image icons
  appoitment: "/icons/Appoitment.png",
  barber: "/icons/barber.png",
  bear: "/icons/bear.png",
  comb: "/icons/comb.png",
  full_service: "/icons/full-services.png",
  gallery: "/icons/gallery.png",
  hair_cut: "/icons/hear-cut.png",
  notification: "/icons/notification.png",
  maqas: "/icons/scissors.png",
  image_upload: "/icons/image-upload.png",
} as const;

// Props for the Icon component
interface IconProps {
  name: keyof typeof Icons;
  size?: number;
  className?: string;
  color?: string; // Color for images (hex, rgb, or CSS color names)
  imageColorMode?: "filter" | "overlay" | "none"; // How to apply color to images
  onClick?: () => void;
  [key: string]: unknown;
}

// Icon component
export const Icon: React.FC<IconProps> = ({
  name,
  className = "",
  onClick,
  size = 24,
  color,
  imageColorMode = "filter",
  ...props
}) => {
  const IconComponent = Icons[name];

  if (typeof IconComponent === "string") {
    // Handle image icons with optional color
    const getImageStyle = (): React.CSSProperties => {
      if (!color || imageColorMode === "none") {
        return {};
      }

      switch (imageColorMode) {
        case "filter":
          // Use CSS filter to change color (works best with monochrome images)
          if (color.startsWith("#")) {
            return { filter: hexToFilter(color) };
          } else {
            // For named colors or rgb values, use a simple invert + hue-rotate approach
            return {
              filter: `brightness(0) saturate(100%) invert(100%) sepia(100%) saturate(10000%) hue-rotate(0deg)`,
            };
          }
        case "overlay":
          // Use background color with mix-blend-mode (experimental)
          return {
            backgroundColor: color,
            mixBlendMode: "multiply" as const,
          };
        default:
          return {};
      }
    };

    const style = getImageStyle();

    return (
      <div
        className={`inline-block ${className}`}
        onClick={onClick}
        style={{ width: size, height: size }}
      >
        <Image
          src={IconComponent}
          alt={name}
          width={size}
          height={size}
          style={style}
          {...props}
        />
      </div>
    );
  }

  // React icon component
  const Component = IconComponent as IconComponentType;
  return (
    <Component
      className={className}
      size={size}
      onClick={onClick}
      style={{ color }} // React icons support color directly
      {...props}
    />
  );
};

// Usage examples:
/*
// Default image (no color change)
<Icon name="barber" size={32} />

// Image with color filter
<Icon name="barber" size={32} color="#ff0000" />

// Image with custom color mode
<Icon name="barber" size={32} color="#blue" imageColorMode="overlay" />

// Disable color change for images
<Icon name="barber" size={32} color="#red" imageColorMode="none" />

// React icons with color (works as before)
<Icon name="dashboard" size={32} color="#green" />
*/
