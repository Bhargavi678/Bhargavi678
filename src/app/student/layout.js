"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  BookOpen,
  Trophy,
  LogOut,
  GraduationCap,
} from "lucide-react";

export default function StudentLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


  // 🔹 NEW: student profile state
  const [student, setStudent] = useState(null);

  const menu = [
    { name: "Dashboard", href: "/student/dashboard", icon: LayoutGrid },
    { name: "My Courses", href: "/student/courses", icon: BookOpen },
    { name: "Leaderboard", href: "/student/leaderboard", icon: Trophy },
  ];

  // 🔹 NEW: fetch logged-in student profile
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    fetch(`${BASE_URL}/api/student/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => setStudent(data))
      .catch(() => {});
  }, []);

  function handleLogout() {
    localStorage.removeItem("accessToken");
    router.replace("/login");
  }

  // 🔹 SAFE FALLBACKS (no UI break)
  const studentName = student?.full_name || "Student";
  const studentEmail = student?.email || "";
  const avatarLetter = studentName.charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ===== SIDEBAR ===== */}
      <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col">
        {/* LOGO */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-white/10">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="font-semibold text-lg">CRT Platform</p>
            <p className="text-xs text-gray-400">Student</p>
          </div>
        </div>

        {/* MENU */}
        <nav className="flex-1 px-3 mt-6 space-y-1">
          {menu.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition
                  ${
                    active
                      ? "bg-blue-600/20 text-blue-400"
                      : "text-gray-300 hover:bg-white/5"
                  }
                `}
              >
                <Icon
                  className={`h-5 w-5 ${
                    active ? "text-blue-400" : "text-gray-400"
                  }`}
                />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* ===== PROFILE + LOGOUT (DYNAMIC) ===== */}
        <div className="px-6 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded-full bg-slate-700 flex items-center justify-center">
              <span className="font-semibold">{avatarLetter}</span>
            </div>

            <div className="text-sm">
              <p className="font-medium">{studentName}</p>
              <p className="text-xs text-gray-400">{studentEmail}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-red-400 transition"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ===== MAIN AREA ===== */}
      <div className="flex-1 flex flex-col">
        {/* TOP BAR */}
        <header className="relative h-28 overflow-hidden border-b bg-black">
          <img
            src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f"
            alt="Student studying"
            className="absolute inset-0 h-full w-full object-cover pointer-events-none"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30 pointer-events-none" />

          <div className="relative z-20 h-full flex items-center justify-end px-8">
            <div
              onClick={() => router.push("/student/profile")}
              className="h-9 w-9 rounded-full bg-white flex items-center justify-center cursor-pointer hover:bg-gray-200 transition font-semibold text-gray-800"
            >
              {avatarLetter}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
