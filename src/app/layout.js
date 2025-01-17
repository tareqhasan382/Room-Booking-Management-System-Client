import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TanStackProvider from "../../providers/TanStackProvider";
import { AuthProvider } from "@/Hooks/AuthProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Room Booking and Management System",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
      >
        <AuthProvider>
          <TanStackProvider>
            <div className=" flex flex-col min-h-screen w-full overflow-hidden">
              {/* Navbar */}
              <div className="w-full fixed top-0 z-50 h-[90px]">
                <Navbar />
              </div>

              {/* Main content area */}
              <div className="flex-grow pt-[90px] bg-white dark:bg-gray-900 dark:text-white text-black w-full select-none ">
                {children}
              </div>

              {/* Footer */}
              <div className="w-full lg:px-24 px-2 bg-white dark:bg-gray-900 dark:text-white text-black ">
                <div className=" w-full h-[2px] bg-slate-400  mt-5"></div>
                <Footer />
              </div>
            </div>
          </TanStackProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
