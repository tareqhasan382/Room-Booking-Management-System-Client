"use client";
import Link from "next/link";
import { useEffect } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { usePathname } from "next/navigation";
import { useAuth } from "@/Hooks/AuthProvider";
import {
  Home,
  UserRound,
  CalendarDays,
  LayoutDashboard,
  LogIn,
  UserPlus,
  LogOut,
} from "lucide-react";
import Logo from "./Logo";

const SideBar = ({ showNav, setShowNav }) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const menuItems = user
    ? [
        { name: "Home", id: "home", link: "/", icon: Home },
        { name: "Profile", id: "profile", link: "/profile", icon: UserRound },
        { name: "My Bookings", id: "order", link: "/order", icon: CalendarDays },
        ...(user.role === "ADMIN"
          ? [
              {
                name: "Admin Dashboard",
                id: "admin",
                link: "/admin",
                icon: LayoutDashboard,
              },
            ]
          : []),
      ]
    : [
        { name: "Home", id: "home", link: "/", icon: Home },
        { name: "Sign In", id: "sign-in", link: "/sign-in", icon: LogIn },
        { name: "Register", id: "sign-up", link: "/sign-up", icon: UserPlus },
      ];

  useEffect(() => {
    setShowNav(false);
  }, [pathname, setShowNav]);

  const currentYear = new Date().getFullYear();

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/60 transition-opacity duration-500 md:hidden ${
        showNav ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={() => setShowNav(false)}
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        className={`absolute top-0 left-0 h-full w-[80%] max-w-xs overflow-y-auto no-scrollbar flex flex-col bg-white dark:bg-gray-900 dark:text-white text-gray-900 shadow-2xl transition-transform duration-500 ${
          showNav ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 p-5 border-b border-slate-200 dark:border-slate-700">
          <Link href="/" className="flex items-center min-w-0">
            <Logo className="h-10 w-auto" />
          </Link>
          <button
            onClick={() => setShowNav(false)}
            aria-label="Close menu"
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <AiOutlineClose size={24} />
          </button>
        </div>

        {/* User info */}
        {user && (
          <div className="px-5 py-4 flex items-center gap-3 border-b border-slate-200 dark:border-slate-700">
            <span className="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center font-bold text-lg text-sky-600 dark:text-sky-300 overflow-hidden shrink-0">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name}
                  className="object-cover w-full h-full"
                />
              ) : (
                user.name?.[0] || "U"
              )}
            </span>
            <div className="min-w-0">
              <p className="font-bold truncate">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="px-3 py-4">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.link;
              return (
                <Link
                  key={item.id}
                  href={item.link}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? "bg-sky-500 text-white"
                      : "text-gray-700 dark:text-gray-200 hover:bg-sky-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="mt-auto px-5 pb-6">
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setShowNav(false);
                }}
                className="w-full flex items-center gap-3 text-red-500 font-medium text-sm px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
              >
                <LogOut className="w-5 h-5" /> Sign Out
              </button>
            ) : (
              <Link
                href="/sign-in"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 text-white font-bold text-sm"
              >
                <LogIn className="w-4 h-4" /> Login / Register
              </Link>
            )}
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
              Room Booking &amp; Management © {currentYear}
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default SideBar;
