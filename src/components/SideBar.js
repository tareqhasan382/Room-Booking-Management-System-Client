import Link from "next/link";
import { AiOutlineClose } from "react-icons/ai";
import { CiUser } from "react-icons/ci";

const SideBar = ({ showNav, setShowNav }) => {
  const menuItems = [
    { name: "Home", id: "home", link: "/" },
    { name: "Profile", id: "profile", link: "/profile" },
    { name: "Order", id: "order", link: "/order" },
    { name: "Sign In", id: "sign-in", link: "/sign-in" },
  ];
  const currentYear = new Date().getFullYear();
  return (
    <div
      className={`fixed top-0 text-black ${
        showNav ? "left-0" : "-left-[105%]"
      } h-screen w-screen bg-black bg-opacity-60 z-50 pb-6 flex flex-col justify-between md:hidden`}
    >
      <div
        className={`fixed top-0 z-50 text-black ${
          showNav ? "left-0" : "-left-[100%]"
        } h-full w-[75%] overflow-y-scroll no-scrollbar bg-white z-50 transition-all duration-500 pb-6 flex flex-col justify-between md:hidden`}
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
          <div className="w-full h-[1px] bg-slate-200"></div>

          {/* Navigation Menu */}
          <nav>
            <div className="space-y-4 pl-3 pt-4 z-30">
              {menuItems.map((menu, index) => (
                <Link key={index} href={menu.link}>
                  <div
                    className="relative group"
                    onClick={() => setShowNav(!showNav)}
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
        <div className="pl-3 py-2 flex gap-3 items-center">
          <span>
            <CiUser size={20} />
          </span>
          <h1 className="capitalize font-medium">login/register</h1>
        </div>
        <div className="w-full h-[1px] bg-slate-200"></div>
        <div className="pl-3">
          <p>NEXTCEO Ltd. © {currentYear}</p>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
