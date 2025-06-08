// Icons import
import { RxDashboard } from "react-icons/rx";
// Define proper types for the icon components
import { AiOutlineMessage } from "react-icons/ai";
import { FiLogOut } from "react-icons/fi";
import { PiNewspaper } from "react-icons/pi";
import { FiEdit3 } from "react-icons/fi";
import { IoTrashOutline } from "react-icons/io5";
import { LuClock4 } from "react-icons/lu";
import { GoStarFill } from "react-icons/go";
import { LiaQuoteLeftSolid } from "react-icons/lia";
import { TbMail } from "react-icons/tb";
import { FiPhoneCall } from "react-icons/fi";
import { HiOutlineUser } from "react-icons/hi2";
import { SlSocialFacebook } from "react-icons/sl";
import { BsInstagram } from "react-icons/bs";
import { FiTwitter } from "react-icons/fi";
import { BsWhatsapp } from "react-icons/bs";
import { FaRegBookmark } from "react-icons/fa6";
import { FaBookmark } from "react-icons/fa6";
import { PiClockCounterClockwise } from "react-icons/pi";
import { FaRegCopyright } from "react-icons/fa";
import Image from "next/image";
import { CiBank } from "react-icons/ci";
type IconComponentType = React.ComponentType<{
  className?: string;
  size?: number;
  onClick?: () => void;
  [key: string]: unknown;
}>;

// Icon map
export const Icons = {
  dashboard: RxDashboard,
  messages: AiOutlineMessage,
  logout: FiLogOut,
  edit: FiEdit3,
  news: PiNewspaper,
  delete: IoTrashOutline,
  clock: LuClock4,
  star: GoStarFill,
  quote: LiaQuoteLeftSolid,
  email: TbMail,
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

// Define the component props interface
interface IconProps {
  name: keyof typeof Icons;
  size?: number;
  className?: string;
  onClick?: () => void;
  [key: string]: unknown; // For additional props
}

export const Icon: React.FC<IconProps> = ({
  name,
  className = "",
  onClick,
  size = 24,
  ...props
}) => {
  const IconComponent = Icons[name];

  if (typeof IconComponent === "string") {
    // Image icon
    return (
      <Image
        src={IconComponent}
        alt={name}
        width={size}
        height={size}
        className={`${className}`}
        onClick={onClick}
        {...props}
      />
    );
  }

  // React component icon
  const Component = IconComponent as IconComponentType;
  return (
    <Component className={className} size={size} onClick={onClick} {...props} />
  );
};
