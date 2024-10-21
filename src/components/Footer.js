import Image from "next/image";
import React from "react";
import { CiLocationOn } from "react-icons/ci";
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";
import { IoCallOutline, IoMailOpenOutline } from "react-icons/io5";
import logo from "../app/rtemisltd-logo.png";
const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className=" w-full h-auto ">
      <div className=")] w-full pt-8 px-4 md:px-6 flex flex-col md:flex-row justify-between md:justify-around gap-8">
        {/* Footer Section */}
        <div className="flex flex-col items-center md:items-start justify-center gap-4 text-center md:text-left">
          <Image
            width={300}
            height={300}
            alt="Logo"
            src={logo}
            className=" w-[160px] h-[50px] "
          />
          {/* className="w-[150px] md:w-[200px] h-16 object-cover px-1 " */}
          <p className="text-sm md:text-base">
            We are here to share our skills, techniques
          </p>
          <p className="text-sm md:text-base">
            and educational knowledge for the future.
          </p>
          <div className="flex items-center gap-4 text-2xl">
            <a href="https://www.facebook.com/tareqhasan211">
              <FaFacebook color="#00B5E2" />
            </a>

            <FaInstagram color="#E1306C" />
            <a href="https://www.linkedin.com/in/tareq-hasan-b5668b217">
              <FaLinkedin color="#00B5E2" />
            </a>

            <FaYoutube color="#CD201F" />
          </div>
        </div>

        {/* Policy Section */}
        <div className=" flex flex-col items-center md:items-start gap-4 text-center md:text-left">
          <p className=" font-bold text-lg md:text-2xl">Policy</p>
          <h4 className="text-sm md:text-base">About Us</h4>
          <h4 className="text-sm md:text-base">Refund Policy</h4>
          <h4 className="text-sm md:text-base">Terms and Condition</h4>
          <h4 className="text-sm md:text-base">Privacy Policy</h4>
        </div>

        {/* Quick Links Section */}
        <div className=" flex flex-col items-center md:items-start gap-4 text-center md:text-left">
          <p className=" font-bold text-lg md:text-2xl">Quick Links</p>
          <h4 className="text-sm md:text-base">Blogs</h4>
          <h4 className="text-sm md:text-base">Free Live Class</h4>
          <h4 className="text-sm md:text-base">Upcoming Live Class</h4>
          <h4 className="text-sm md:text-base">All Courses</h4>
        </div>

        {/* Contact Us Section */}
        <div className=" flex flex-col items-center md:items-start gap-4 text-center ">
          <p className=" font-bold text-lg md:text-2xl">Contact Us</p>
          <div className="flex flex-col gap-4">
            {/* Phone Number */}
            <div className=" flex items-center  gap-2 text-sm md:text-base">
              <IoCallOutline className="text-lg" />
              <a
                href="tel:+8801989342794"
                className="hover:text-[#00B5E2] select-all "
              >
                +880 1989-342794
              </a>
            </div>

            {/* Email */}
            <div className=" flex items-center  gap-2 text-sm md:text-base">
              <IoMailOpenOutline className="text-lg" />
              <a
                href="mailto:tareqhasan382@gmail.com"
                className="hover:text-[#00B5E2] select-all "
              >
                tareqhasan382@gmail.com
              </a>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-sm md:text-base">
              <CiLocationOn className="text-lg" />

              <span>
                Shewrapara Mirpur
                <br /> Dhaka Bangladesh
              </span>
            </div>
          </div>
        </div>
      </div>
      <h1 className=" my-6 text-center lg:text-base text-[12px] ">
        <span>Copyright © {currentYear} </span>
        <span className=" font-semibold ">Tareq Hasan</span>
        <span> All rights reserved.</span>
      </h1>
    </footer>
  );
};

export default Footer;
