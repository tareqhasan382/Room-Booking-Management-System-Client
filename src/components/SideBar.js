"use client";
import Link from "next/link";
import { useEffect } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { CiUser } from "react-icons/ci";
import { usePathname } from "next/navigation";
import { useAuth } from "@/Hooks/AuthProvider";
import { LogOut, LayoutDashboard } from "lucide-react";

const SideBar = ({ showNav, setShowNav }) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const menuItems = user
    ? [
        { name: "Home", id: "home", link: "/" },
        { name: "Profile", id: "profile", link: "/profile" },
        { name: "Order", id: "order", link: "/order" },
        ...(user.role === "ADMIN"
          ? [{ name: "Admin Dashboard", id: "admin", link: "/admin" }]
          : []),
      ]
    : [
        { name: "Home", id: "home", link: "/" },
        { name: "Sign In", id: "sign-in", link: "/sign-in" },
        { name: "Sign Up", id: "sign-up", link: "/sign-up" },
      ];

  useEffect(() => {
    setShowNav(false);
  }, [pathname, setShowNav]);

  const currentYear = new Date().getFullYear();

  return (
    <div
      className={`fixed top-0 text-black ${
        showNav ? "left-0" : "-left-[105%]"
      } h-screen w-screen bg-black bg-opacity-60 z-50 pb-6 flex flex-col justify-between md:hidden transition-all duration-500`}
    >
      <div
        className={`fixed top-0 z-50 text-black ${
          showNav ? "left-0" : "-left-[100%]"
        } h-full w-[75%] overflow-y-scroll no-scrollbar bg-white transition-all duration-500 pb-6 flex flex-col justify-between md:hidden`}
      >
        <div className="w-full flex flex-col">
          {/* Close Button */}
          <div className="flex items-center justify-between text-xl font-bold p-6">
            <div></div>
            <AiOutlineClose
              color="black"
              onClick={() => setShowNav(!showNav)}
              size={30}
              className="cursor-pointer"
            />
          </div>

          {/* User info */}
          {user && (
            <div className="px-6 pb-4 flex items-center gap-3 border-b border-slate-200">
              <span className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center font-bold text-lg text-sky-600 overflow-hidden">
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
              <div>
                <p className="font-bold">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
          )}

          {/* Navigation Menu */}
          <nav>
            <div className="space-y-4 pl-6 pt-4">
              {menuItems.map((menu, index) => (
                <Link key={index} href={menu.link}>
                  <div
                    className={`relative group flex items-center gap-2 ${
                      pathname === menu.link ? "text-sky-500 font-bold" : ""
                    }`}
                  >
                    <p>{menu?.name}</p>
                    <div className="w-full h-[1px] bg-slate-200 mt-4"></div>
                  </div>
                </Link>
              ))}
            </div>
          </nav>
        </div>

        {/* Footer */}
        <div className="pl-6 py-2">
          {user ? (
            <button
              onClick={() => {
                logout();
                setShowNav(false);
              }}
              className="flex items-center gap-2 text-red-500 font-medium"
            >
              <LogOut size={20} /> Sign Out
            </button>
          ) : (
            <Link href="/sign-in" className="flex items-center gap-2 font-medium">
              <CiUser size={20} /> login/register
            </Link>
          )}
        </div>
        <div className="w-full h-[1px] bg-slate-200"></div>
        <div className="pl-6 pt-2">
          <p>NEXTCEO Ltd. © {currentYear}</p>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
