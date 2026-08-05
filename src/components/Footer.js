import React from "react";
import { CiLocationOn } from "react-icons/ci";
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";
import { IoCallOutline, IoMailOpenOutline } from "react-icons/io5";
import Link from "next/link";
import Logo from "./Logo";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="w-full h-auto">
      <div className="w-full pt-8 px-4 md:px-6 flex flex-col md:flex-row justify-between md:justify-around gap-8">
        {/* Brand Section */}
        <div className="flex flex-col items-center md:items-start justify-center gap-4 text-center md:text-left">
          <Logo className="w-[180px] h-auto" />
          <p className="text-sm md:text-base max-w-xs">
            Book your perfect room in seconds. Hand-picked rooms, transparent
            pricing and a seamless booking experience.
          </p>
          <div className="flex items-center gap-4 text-2xl">
            <a href="https://www.facebook.com/tareqhasan211" aria-label="Facebook">
              <FaFacebook color="#00B5E2" />
            </a>
            <a href="#" aria-label="Instagram">
              <FaInstagram color="#E1306C" />
            </a>
            <a href="https://www.linkedin.com/in/tareq-hasan-b5668b217" aria-label="LinkedIn">
              <FaLinkedin color="#00B5E2" />
            </a>
            <a href="#" aria-label="YouTube">
              <FaYoutube color="#CD201F" />
            </a>
          </div>
        </div>

        {/* Policy Section */}
        <div className="flex flex-col items-center md:items-start gap-4 text-center md:text-left">
          <p className="font-bold text-lg md:text-2xl">Policies</p>
          <Link href="/" className="text-sm md:text-base hover:text-sky-500">
            About Us
          </Link>
          <Link href="/" className="text-sm md:text-base hover:text-sky-500">
            Refund Policy
          </Link>
          <Link href="/" className="text-sm md:text-base hover:text-sky-500">
            Terms and Conditions
          </Link>
          <Link href="/" className="text-sm md:text-base hover:text-sky-500">
            Privacy Policy
          </Link>
        </div>

        {/* Quick Links Section */}
        <div className="flex flex-col items-center md:items-start gap-4 text-center md:text-left">
          <p className="font-bold text-lg md:text-2xl">Explore</p>
          <Link href="/" className="text-sm md:text-base hover:text-sky-500">
            Home
          </Link>
          <Link href="/#rooms" className="text-sm md:text-base hover:text-sky-500">
            Rooms
          </Link>
          <Link href="/profile" className="text-sm md:text-base hover:text-sky-500">
            Profile
          </Link>
          <Link href="/order" className="text-sm md:text-base hover:text-sky-500">
            My Bookings
          </Link>
        </div>

        {/* Contact Us Section */}
        <div className="flex flex-col items-center md:items-start gap-4 text-center">
          <p className="font-bold text-lg md:text-2xl">Contact Us</p>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm md:text-base">
              <IoCallOutline className="text-lg" />
              <a href="tel:+8801989342794" className="hover:text-[#00B5E2] select-all">
                +880 1989-342794
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm md:text-base">
              <IoMailOpenOutline className="text-lg" />
              <a href="mailto:support@roombook.com" className="hover:text-[#00B5E2] select-all">
                support@roombook.com
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm md:text-base">
              <CiLocationOn className="text-lg" />
              <span>
                Shewrapara Mirpur
                <br /> Dhaka, Bangladesh
              </span>
            </div>
          </div>
        </div>
      </div>
      <h1 className="my-6 text-center lg:text-base text-[12px]">
        <span>Copyright © {currentYear} </span>
        <span className="font-semibold">Room Booking &amp; Management</span>
        <span> All rights reserved.</span>
      </h1>
      <div className="h-1 bg-gradient-to-r from-sky-400 via-cyan-400 to-amber-400" />
    </footer>
  );
};

export default Footer;
