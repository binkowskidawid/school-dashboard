"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "~/context/auth/AuthContext";

const menuItems = [
  {
    title: "MENU",
    items: [
      {
        icon: "/home.png",
        label: "Home",
        href: "/",
        visible: ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
      },
      {
        icon: "/teacher.png",
        label: "Teachers",
        href: "/list/teachers",
        visible: ["ADMIN", "TEACHER"],
      },
      {
        icon: "/student.png",
        label: "Students",
        href: "/list/students",
        visible: ["ADMIN", "TEACHER"],
      },
      {
        icon: "/parent.png",
        label: "Parents",
        href: "/list/parents",
        visible: ["ADMIN", "TEACHER"],
      },
      {
        icon: "/subject.png",
        label: "Subjects",
        href: "/list/subjects",
        visible: ["ADMIN"],
      },
      {
        icon: "/class.png",
        label: "Classes",
        href: "/list/classes",
        visible: ["ADMIN", "TEACHER"],
      },
      {
        icon: "/lesson.png",
        label: "Lessons",
        href: "/list/lessons",
        visible: ["ADMIN", "TEACHER"],
      },
      {
        icon: "/exam.png",
        label: "Exams",
        href: "/list/exams",
        visible: ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
      },
      {
        icon: "/assignment.png",
        label: "Assignments",
        href: "/list/assignments",
        visible: ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
      },
      {
        icon: "/result.png",
        label: "Results",
        href: "/list/results",
        visible: ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
      },
      {
        icon: "/attendance.png",
        label: "Attendance",
        href: "/list/attendance",
        visible: ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
      },
      {
        icon: "/calendar.png",
        label: "Events",
        href: "/list/events",
        visible: ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
      },
      {
        icon: "/message.png",
        label: "Messages",
        href: "/list/messages",
        visible: ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
      },
      {
        icon: "/announcement.png",
        label: "Announcements",
        href: "/list/announcements",
        visible: ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
      },
    ],
  },
  {
    title: "OTHER",
    items: [
      {
        icon: "/profile.png",
        label: "Profile",
        href: "/profile",
        visible: ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
      },
      {
        icon: "/setting.png",
        label: "Settings",
        href: "/settings",
        visible: ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
      },
      {
        icon: "/logout.png",
        label: "Logout",
        href: "/logout",
        visible: ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
      },
    ],
  },
];

const Menu = () => {
  const { user } = useAuth();
  const role = user?.role;

  return (
    <div className="mt-4 text-sm">
      {menuItems.map((i) => (
        <div className="flex flex-col gap-2" key={i.title}>
          <span className="my-4 hidden font-light text-gray-400 lg:block">
            {i.title}
          </span>
          {i.items.map((item) => {
            if (item.visible.includes(role ?? "")) {
              return (
                <Link
                  href={item.href}
                  key={item.label}
                  className="hover:bg-lamaSkyLight flex items-center justify-center gap-4 rounded-md py-2 text-gray-500 md:px-2 lg:justify-start"
                >
                  <Image
                    src={`/images${item.icon}`}
                    alt=""
                    width={20}
                    height={20}
                  />
                  <span className="hidden lg:block">{item.label}</span>
                </Link>
              );
            }
          })}
        </div>
      ))}
    </div>
  );
};

export default Menu;
