import React from "react";
import CountUpNumber from "./CountUpNumber";
import Image from "next/image";

const Hero = () => {
  return (
    <section className="flex flex-col md:flex-row items-center gap-12 container w-full   py-10">
      <div className=" md:w-1/2">
        {/* heading  Explore Our Exquisite Hotel.  lg:text-5xl text-3xl font-bold mb-4*/}
        <h1 className="  lg:text-5xl text-3xl font-bold mb-4 ">
          Enjoy Your Dream Vocation
        </h1>
        <p className=" font-medium mb-12 ">
          Experience an Exquisite Hotel Immersed in Rich History and Timeless
          Elegance.
        </p>
        <button className="px-4 md:px-8 py-2 md:py-3 bg-[#0b0d1c] dark:bg-white dark:text-black rounded-lg shadow-sm text-white font-bold text-base md:text-xl hover:scale-110 duration-300 transition-transform">
          Get Started
        </button>
        <div className="flex justify-between mt-12 space-x-4">
          <div className="flex flex-col items-center">
            <p className="text-xs font-semibold lg:text-xl text-center">
              Basic Room
            </p>
            <CountUpNumber duration={2000} endValue={50} />
          </div>
          <div className="flex flex-col items-center">
            <p className="text-xs lg:text-xl font-semibold text-center">
              Luxury Room
            </p>
            <CountUpNumber duration={2000} endValue={120} />
          </div>
          <div className="flex flex-col items-center">
            <p className="text-xs lg:text-xl font-semibold text-center">
              Suite
            </p>
            <CountUpNumber duration={2000} endValue={60} />
          </div>
        </div>
      </div>
      {/* room */}
      <div className="md:w-1/2 grid grid-cols-1 lg:gap-8 gap-4">
        <div className="rounded-2xl w-full overflow-hidden h-48 bg-slate-400">
          <Image
            width={400}
            height={400}
            src="https://img2.10bestmedia.com/Images/Photos/378649/Park-Hyatt-New-York-Manhattan-Sky-Suite-Master-Bedroom-low-res_54_990x660.jpg"
            alt="hero-1"
            className="object-cover w-full h-full transition-transform transform hover:scale-105 duration-300 "
          />
        </div>
        <div className="grid grid-cols-2 lg:gap-8 gap-4 h-48">
          <div className="rounded-2xl overflow-hidden">
            <Image
              width={400}
              height={400}
              src="https://img2.10bestmedia.com/Images/Photos/378649/Park-Hyatt-New-York-Manhattan-Sky-Suite-Master-Bedroom-low-res_54_990x660.jpg"
              alt="hero-2"
              className="object-cover w-full h-full transition-transform transform hover:scale-105 duration-300"
            />
          </div>
          <div className="rounded-2xl overflow-hidden">
            <Image
              width={400}
              height={400}
              src="https://img2.10bestmedia.com/Images/Photos/378649/Park-Hyatt-New-York-Manhattan-Sky-Suite-Master-Bedroom-low-res_54_990x660.jpg"
              alt="hero-3"
              className="object-cover w-full h-full transition-transform transform hover:scale-105 duration-300"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
