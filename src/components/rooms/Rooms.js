"use client";
import React, { useEffect, useMemo, useState } from "react";
import RoomCart from "./RoomCart";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRooms } from "@/Hooks/useRooms";
import { RoomGridSkeleton } from "@/components/ui/Skeleton";
import { AlertCircle, Users, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";
import CustomSelect from "@/components/ui/CustomSelect";

const CATEGORIES = ["All", "Basic", "Luxury", "Suite"];
const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

const Rooms = () => {
  const searchParams = useSearchParams();
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [sort, setSort] = useState("featured");
  const [minGuests, setMinGuests] = useState(1);
  const [maxPrice, setMaxPrice] = useState(0);
  const [page, setPage] = useState(1);

  const search = searchParams.get("search") || "";

  const params = useMemo(() => {
    const p = { search, sort, page, limit: 9 };
    if (category !== "All") p.category = category;
    if (minGuests > 1) p.minGuests = minGuests;
    if (maxPrice > 0) p.maxPrice = maxPrice;
    return p;
  }, [search, category, sort, minGuests, maxPrice, page]);

  const { isLoading, error, data } = useRooms(params);
  const rooms = data?.rooms || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  // Reset to page 1 whenever the filters change.
  useEffect(() => {
    setPage(1);
  }, [search, category, sort, minGuests, maxPrice]);

  return (
    <div id="rooms" className="w-full h-auto flex flex-col scroll-mt-24 pt-6">
      {/* Header strip */}
      <div className="rounded-2xl bg-gradient-to-r from-sky-50 via-white to-sky-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 border border-slate-100 dark:border-slate-700 p-5 md:p-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Explore Our Rooms</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {total} room{total === 1 ? "" : "s"} available
            {search && ` for "${search}"`}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-600 text-sm">
            <Users className="w-4 h-4 text-sky-500 shrink-0" />
            <CustomSelect
              variant="bare"
              value={minGuests}
              onChange={(v) => setMinGuests(Number(v))}
              options={[1, 2, 3, 4, 5].map((g) => ({
                value: g,
                label: g === 1 ? "Any guests" : `${g}+ guests`,
              }))}
              ariaLabel="Minimum guests"
              className="min-w-[110px]"
            />
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-600 text-sm">
            <DollarSign className="w-4 h-4 text-sky-500" />
            <input
              type="number"
              min="0"
              value={maxPrice > 0 ? maxPrice : ""}
              onChange={(e) => setMaxPrice(Number(e.target.value) || 0)}
              placeholder="Max $/night"
              className="bg-transparent outline-none w-20 placeholder:text-gray-400"
              title="Maximum price per night"
            />
          </div>

          <CustomSelect
            value={sort}
            onChange={setSort}
            options={SORTS}
            ariaLabel="Sort rooms"
            className="min-w-[180px]"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              category === c
                ? "bg-sky-500 border-sky-500 text-white shadow-md shadow-sky-500/30"
                : "border-slate-300 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:border-sky-400"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {isLoading && <RoomGridSkeleton count={6} />}

      {error && (
        <div className="w-full py-16 flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
          <h1 className="text-xl font-bold text-red-500">{error.message}</h1>
        </div>
      )}

      {!isLoading && !error && rooms.length === 0 && (
        <div className="w-full py-16 text-center bg-slate-50 dark:bg-slate-800 rounded-2xl">
          <p className="text-xl font-semibold">No rooms match your filters.</p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Try a different keyword, category or price range.
          </p>
        </div>
      )}

      {!isLoading && !error && rooms.length > 0 && (
        <div className="w-full h-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-5">
          {rooms.map((room) => (
            <Link key={room._id} href={`room/${room._id}`}>
              <RoomCart data={room} />
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !error && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4 pb-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-medium disabled:opacity-40 hover:border-sky-400 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
            .reduce((acc, n, idx, arr) => {
              if (idx > 0 && n - arr[idx - 1] > 1) acc.push("…");
              acc.push(n);
              return acc;
            }, [])
            .map((n, i) =>
              n === "…" ? (
                <span key={`e${i}`} className="px-1 text-gray-400">
                  …
                </span>
              ) : (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-9 h-9 rounded-lg text-sm font-bold border transition-colors ${
                    page === n
                      ? "bg-sky-500 border-sky-500 text-white"
                      : "border-slate-300 dark:border-slate-600 hover:border-sky-400"
                  }`}
                >
                  {n}
                </button>
              )
            )}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-medium disabled:opacity-40 hover:border-sky-400 transition-colors"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Rooms;
