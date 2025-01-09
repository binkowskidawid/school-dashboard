import Menu from "~/components/dashboard-layout/Menu";
import Navbar from "~/components/dashboard-layout/Navbar";
import Image from "next/image";
import Link from "next/link";
import { type ReactNode } from "react";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="flex h-screen">
      {/* LEFT */}
      <div className="w-[14%] p-4 md:w-[8%] lg:w-[16%] xl:w-[14%]">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 lg:justify-start"
        >
          <Image src="/images/school.png" alt="logo" width={32} height={32} />
          <span className="hidden font-bold lg:block">School Dash.</span>
        </Link>
        <Menu />
      </div>
      {/* RIGHT */}
      <div className="flex w-[86%] flex-col overflow-scroll bg-[#F7F8FA] md:w-[92%] lg:w-[84%] xl:w-[86%]">
        <Navbar />
        {children}
      </div>
    </div>
  );
}
