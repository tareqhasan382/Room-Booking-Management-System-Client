"use client";
import React, { useState } from "react";
import CountUpNumber from "./CountUpNumber";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Loader2, Star, ShieldCheck, Clock } from "lucide-react";
import { useRooms } from "@/Hooks/useRooms";
import CustomSelect from "@/components/ui/CustomSelect";

const CATEGORIES = ["All", "Basic", "Luxury", "Suite"];

const Hero = () => {
  const { data, isLoading } = useRooms({ limit: 50 });
  const rooms = data?.rooms || [];
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "All");

  const count = (cat) => rooms.filter((r) => r.category === cat).length;

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (category !== "All") params.set("category", category);
    const qs = params.toString();
    document
      .getElementById("rooms")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    router.push(`/?${qs}`, { scroll: false });
  };

  const heroImages = rooms?.slice(0, 3) || [];

  return (
    <section className="w-full relative overflow-hidden">
      {/* decorative background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-sky-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900" />
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-sky-200/40 dark:bg-sky-900/20 blur-3xl -z-10" />
      <div className="absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-amber-200/40 dark:bg-amber-900/10 blur-3xl -z-10" />

      <div className="flex flex-col lg:flex-row items-center gap-12 w-full py-14">
        <div className="lg:w-1/2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-300 text-xs font-semibold mb-5">
            <Star className="w-3.5 h-3.5" /> Rated 4.8/5 by 1,200+ guests
          </span>
          <h1 className="lg:text-5xl text-4xl font-extrabold leading-tight mb-4">
            Enjoy Your Dream{" "}
            <span className="text-sky-500">Vacation</span>
          </h1>
          <p className="font-medium text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Experience an exquisite hotel immersed in rich hospitality. Hand-picked
            rooms, transparent pricing and a seamless booking experience.
          </p>

          {/* Search / filter bar */}
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-3 mb-6 bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-lg shadow-sky-900/5 border border-slate-100 dark:border-slate-700"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search rooms, e.g. Deluxe, Suite..."
                className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-gray-700 outline-none focus:border-sky-500 transition-colors"
              />
            </div>
            <CustomSelect
              value={category}
              onChange={setCategory}
              options={CATEGORIES}
              ariaLabel="Filter by category"
              className="w-full sm:w-40"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl transition-colors shadow-md shadow-sky-500/30"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() =>
                document
                  .getElementById("rooms")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              className="px-6 py-3 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-xl shadow-sm font-bold hover:scale-[1.03] duration-300 transition-transform"
            >
              Explore Rooms
            </button>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              Secure booking
              <span className="mx-1">·</span>
              <Clock className="w-4 h-4 text-sky-500" />
              24/7 support
            </div>
          </div>

          <div className="flex justify-between mt-10 max-w-sm">
            <div className="flex flex-col items-center">
              <p className="text-xs font-semibold lg:text-base text-center">
                Basic Room
              </p>
              {isLoading ? (
                <CountUpNumber duration={1000} endValue={0} />
              ) : (
                <CountUpNumber duration={1500} endValue={count("Basic")} />
              )}
            </div>
            <div className="flex flex-col items-center">
              <p className="text-xs lg:text-base font-semibold text-center">
                Luxury Room
              </p>
              {isLoading ? (
                <CountUpNumber duration={1000} endValue={0} />
              ) : (
                <CountUpNumber duration={1500} endValue={count("Luxury")} />
              )}
            </div>
            <div className="flex flex-col items-center">
              <p className="text-xs lg:text-base font-semibold text-center">
                Suite
              </p>
              {isLoading ? (
                <CountUpNumber duration={1000} endValue={0} />
              ) : (
                <CountUpNumber duration={1500} endValue={count("Suite")} />
              )}
            </div>
          </div>
        </div>

        {/* room images */}
        <div className="lg:w-1/2 w-full grid grid-cols-1 gap-4">
          {isLoading ? (
            <div className="w-full h-48 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : heroImages.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 rounded-2xl overflow-hidden h-48 shadow-xl">
                <Image
                  width={800}
                  height={400}
                  src={heroImages[0]?.picture}
                  alt="hero-1"
                  className="object-cover w-full h-full transition-transform transform hover:scale-105 duration-300"
                />
              </div>
              <div className="rounded-2xl overflow-hidden h-40 shadow-xl">
                <Image
                  width={400}
                  height={300}
                  src={heroImages[1]?.picture}
                  alt="hero-2"
                  className="object-cover w-full h-full transition-transform transform hover:scale-105 duration-300"
                />
              </div>
              <div className="rounded-2xl overflow-hidden h-40 shadow-xl">
                <Image
                  width={400}
                  height={300}
                  src={heroImages[2]?.picture}
                  alt="hero-3"
                  className="object-cover w-full h-full transition-transform transform hover:scale-105 duration-300"
                />
              </div>
            </div>
          ) : (
            <div className="w-full h-48 rounded-2xl bg-slate-200 dark:bg-slate-700" />
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
