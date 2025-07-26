import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";
import Link from "next/link";
import { CiMenuFries } from "react-icons/ci";

export function SheetDemo({ role }: { role?: "barber" | "admin" }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <CiMenuFries className="md:hidden" color="white" size={29} />
      </SheetTrigger>

      <SheetContent side="top" className="bg-[#1E1E1E] border-0 text-white">
        <SheetHeader>
          <Image
            src={"/images/logo-no-background.png"}
            alt="logo"
            width={51}
            height={58}
            priority
            className="md:w-[51px] w-11 h-13 md:h-[58px]"
          />
        </SheetHeader>

        <div className="flex pb-12 md:hidden flex-col items-center text-lg justify-center gap-7">
          {[
            { text: "Home", path: "/" },
            { text: "Booking", path: "/booking/services" },
            { text: "Gallery", path: "/gallery" },
            { text: "Services", path: "/services" },
            { text: "Contact us", path: "/contact-us" },
            { text: "About", path: "/about-us" },
            ...(role === "admin"
              ? [{ text: "Dashboard", path: "/dashboard" }]
              : []),
          ].map(({ text, path }, i) => (
            <SheetClose asChild key={i}>
              <Link
                href={path}
                className="hover:text-gray-400 duration-200 transition-all focus:border-b border-white focus:scale-90"
              >
                {text}
              </Link>
            </SheetClose>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
