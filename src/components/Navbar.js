/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useState, useEffect } from "react";
import { IoMenuSharp } from "react-icons/io5";
import Link from "next/link";
import logo from "../app/rtemisltd-logo.png";
import SideBar from "./SideBar";
import Image from "next/image";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const [showNav, setShowNav] = useState(false);
  const [activeMenu, setActiveMenu] = useState("home");
  const pathname = usePathname();

  const menuItems = [
    { name: "Home", id: "home", link: "/" },
    { name: "Profile", id: "profile", link: "/profile" },
    { name: "Order", id: "order", link: "/order" },
    { name: "Sign In", id: "sign-in", link: "/sign-in" },
  ];

  useEffect(() => {
    const activeItem = menuItems.find((item) => item.link === pathname);
    setActiveMenu(activeItem ? activeItem.id : "home");
  }, [pathname]);

  const handleMenuClick = (id) => {
    setActiveMenu(id);
  };

  return (
    <nav className="min-w-full h-full lg:px-24 px-2 flex items-center justify-between shadow shadow-[#69b2c5] bg-white dark:bg-gray-900 dark:text-white text-black">
      <div className=" w-[200px] h-[80px] py-2">
        <Link href="/" className="  text-3xl font-bold">
          <Image
            src={logo}
            alt="nextceoltd_logo"
            width={200}
            height={200}
            className=" "
          />
        </Link>
      </div>

      <ul className="max-md:hidden flex justify-center lg:space-x-8 space-x-2">
        {menuItems.map((item) => (
          <li key={item.id} className="w-full h-full">
            <Link href={item.link}>
              <button
                className={`relative hover:text-sky-500 w-full h-full whitespace-nowrap lg:text-xl text-sm`}
                onClick={() => handleMenuClick(item.id)}
              >
                {item.name}
                <span
                  className={`absolute left-0 bottom-0 w-full h-1 transition-transform duration-300 transform scale-x-0 ${
                    activeMenu === item.id ? "scale-x-100 bg-sky-500" : ""
                  } hover:scale-x-100 hover:bg-sky-500`}
                ></span>
              </button>
            </Link>
          </li>
        ))}
      </ul>
      <div className="flex gap-4 items-center">
        <ThemeToggle />

        <span className="md:hidden overflow-hidden pr-3">
          <IoMenuSharp
            size={30}
            className="cursor-pointer transition ease-in duration-150"
            onClick={() => setShowNav(!showNav)}
          />
        </span>
        <div className="-top-[80px]">
          <SideBar showNav={showNav} setShowNav={setShowNav} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
