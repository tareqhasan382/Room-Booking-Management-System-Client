"use client";
import { useEffect, useState } from "react";
import { IoMenuSharp } from "react-icons/io5";
import Link from "next/link";
import Logo from "./Logo";
import SideBar from "./SideBar";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/Hooks/AuthProvider";
import { useToast } from "@/components/ui/ToastProvider";
import { ChevronDown, LogOut, UserRound, LayoutDashboard } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [showNav, setShowNav] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { name: "Home", id: "home", link: "/" },
    { name: "Profile", id: "profile", link: "/profile" },
    { name: "Order", id: "order", link: "/order" },
  ];

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    toast.success("Signed out successfully");
    router.push("/");
  };

  return (
    <nav className="relative min-w-full h-full lg:px-24 px-2 flex items-center justify-between shadow-sm shadow-[#69b2c5]/30 bg-white dark:bg-gray-900 dark:text-white text-black">
      <span className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 via-cyan-400 to-amber-400" />
      <div className="w-[200px] h-[80px] py-2 flex items-center">
        <Link href="/" className="text-3xl font-bold flex items-center">
          <Logo className="h-[58px] w-auto" />
        </Link>
      </div>

      <div className="max-md:hidden flex justify-center lg:space-x-8 space-x-2">
        <ul className="flex justify-center lg:space-x-8 space-x-2">
          {menuItems.map((item) => (
            <li key={item.id} className="w-full h-full">
              <Link href={item.link}>
                <span
                  className={`relative inline-flex items-center hover:text-sky-500 w-full h-full whitespace-nowrap lg:text-xl text-sm cursor-pointer py-2 ${
                    pathname === item.link ? "text-sky-500" : ""
                  }`}
                >
                  {item.name}
                  <span
                    className={`absolute left-0 bottom-0 w-full h-1 transition-transform duration-300 transform scale-x-0 ${
                      pathname === item.link ? "scale-x-100 bg-sky-500" : ""
                    } hover:scale-x-100 hover:bg-sky-500`}
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {user ? (
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              className="relative flex items-center gap-2 bg-sky-500 text-white px-3 py-2 rounded whitespace-nowrap lg:text-sm text-sm hover:bg-sky-600 transition-colors"
            >
              <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-bold uppercase overflow-hidden">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name}
                    width={28}
                    height={28}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  user.name?.[0] || "U"
                )}
              </span>
              <span className="max-lg:hidden">{user.name}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  userMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden">
                <Link
                  href="/profile"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-slate-100 dark:hover:bg-gray-700"
                >
                  <UserRound className="w-4 h-4" /> Profile
                </Link>
                <Link
                  href="/order"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-slate-100 dark:hover:bg-gray-700"
                >
                  <LogOut className="w-4 h-4" /> My Orders
                </Link>
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-slate-100 dark:hover:bg-gray-700"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/sign-in">
            <button className="relative bg-sky-400 hover:bg-sky-500 text-white px-3 py-2 rounded w-full h-full whitespace-nowrap lg:text-xl text-sm transition-colors">
              Sign In
            </button>
          </Link>
        )}
      </div>

      <div className="flex gap-4 items-center">
        <ThemeToggle />

        <span className="md:hidden overflow-hidden pr-3">
          <IoMenuSharp
            size={30}
            className="cursor-pointer transition ease-in duration-150"
            onClick={() => setShowNav(!showNav)}
          />
        </span>
        <SideBar showNav={showNav} setShowNav={setShowNav} />
      </div>
    </nav>
  );
};

export default Navbar;
