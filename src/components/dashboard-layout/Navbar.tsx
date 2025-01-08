"use client";

import Image from "next/image";
import { useAuth } from "~/context/auth/AuthContext";

const Navbar = () => {
  const { user } = useAuth();

  return (
    <div className="flex items-center justify-between p-4">
      {/* SEARCH BAR */}
      <div className="hidden items-center gap-2 rounded-full px-2 text-xs ring-[1.5px] ring-gray-300 md:flex">
        <Image src="/images/search.png" alt="" width={14} height={14} />
        <input
          type="text"
          placeholder="Search..."
          className="w-[200px] bg-transparent p-2 outline-none"
        />
      </div>
      {/* ICONS AND USER */}
      <div className="flex w-full items-center justify-end gap-6">
        <div className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white">
          <Image src="/images/message.png" alt="" width={20} height={20} />
        </div>
        <div className="relative flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white">
          <Image src="/images/announcement.png" alt="" width={20} height={20} />
          <div className="absolute -right-3 -top-3 flex h-5 w-5 items-center justify-center rounded-full bg-purple-500 text-xs text-white">
            1
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium leading-3">John Doe</span>
          <span className="text-right text-[10px] text-gray-500">
            {user?.role}
          </span>
        </div>
        <Image
          src="/images/avatar.png"
          alt=""
          width={36}
          height={36}
          className="rounded-full"
        />
        {/*<UserButton />*/}
      </div>
    </div>
  );
};

export default Navbar;
