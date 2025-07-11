import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/constants/icons";
import Image from "next/image";
const HeaderDropdown = ({
  fullName,
  profileImage,
}: {
  fullName: string;
  profileImage: string;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="border-0 outline-none right-0">
        <Icon
          name="user"
          className="w-6 h-6 text-white border rounded-full px-1 py-1 box-content"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]">
        <DropdownMenuLabel className="flex items-center gap-3">
          <Image
            src={profileImage}
            alt="pro image"
            width={40}
            height={40}
            className="size-[40px] rounded-lg"
          />
          <h2 className="text-black capitalize">{fullName}</h2>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex border-b-2 rounded-none mt-2 border-grey-300 md:hover:bg-grey-300 transition-all duration-300 focus:scale-90 items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon size={22} name="user" />
            <span className="text-[14px]">Profile</span>
          </div>
          <Icon size={22} name="next" className="text-grey-700" />
        </DropdownMenuItem>
        <DropdownMenuItem className="flex border-b-2 rounded-none mt-2 border-grey-300 md:hover:bg-grey-300 transition-all duration-300 focus:scale-90 items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon size={22} name="mangeAccount" />
            <span className="text-[14px]">Manage Account</span>
          </div>
          <Icon size={22} name="next" className="text-grey-700" />
        </DropdownMenuItem>
        <DropdownMenuItem className="flex border-b-2 rounded-none mt-2 border-grey-300 md:hover:bg-grey-300 transition-all duration-300 focus:scale-90 items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon size={22} name="oclock_history" />
            <span className="text-[14px]">Past appointments</span>
          </div>
          <Icon size={22} name="next" className="text-grey-700" />
        </DropdownMenuItem>
        <DropdownMenuItem className="flex border-b-2 rounded-none mt-2 border-grey-300 md:hover:bg-grey-300 transition-all duration-300 focus:scale-90 items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon size={20} color="#989898" name="notification" />
            <span className="text-[14px]">Notification</span>
          </div>
          <Icon size={22} name="next" className="text-grey-700" />
        </DropdownMenuItem>
        <DropdownMenuItem className="flex border-b-2 rounded-none mt-2 border-grey-300 md:hover:bg-grey-300 transition-all duration-300 focus:scale-90 items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon size={22} name="bookmark" />
            <span className="text-[14px]">Saved images</span>
          </div>
          <Icon size={22} name="next" className="text-grey-700" />
        </DropdownMenuItem>
        <DropdownMenuItem className="flex text-error items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon size={22} name="logout" />
            <span className="text-[14px]">Sign out</span>
          </div>
          <Icon size={22} name="next" className="text-grey-700" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HeaderDropdown;
