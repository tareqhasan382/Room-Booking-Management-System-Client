import Image from "next/image";
import React from "react";
import Rating from "@/components/ui/Rating";
import { BedDouble, Ruler, Users, ArrowRight } from "lucide-react";

const RoomCart = ({ data }) => {
  const {
    title,
    rent,
    facilities,
    picture,
    category,
    capacity,
    beds,
    size,
    rating,
    reviews,
    description,
  } = data;

  return (
    <div className="group w-full bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl border border-slate-100 dark:border-slate-700 transition-all duration-300 hover:-translate-y-1.5 flex flex-col h-full">
      <div className="relative w-full h-52 overflow-hidden">
        <Image
          width={500}
          height={340}
          src={picture}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 dark:bg-gray-900/80 text-xs font-bold uppercase tracking-wide shadow">
          {category}
        </span>
        <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white">
          <Rating value={rating || 0} />
          <span className="text-xs font-medium drop-shadow">
            ({reviews || 0})
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <div>
          <h2 className="text-lg font-bold leading-tight line-clamp-1">
            {title}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
            {description || "A comfortable room designed for a great stay."}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-300">
          {capacity && (
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4 text-sky-500" /> {capacity} guests
            </span>
          )}
          {beds && (
            <span className="flex items-center gap-1">
              <BedDouble className="w-4 h-4 text-sky-500" /> {beds}
            </span>
          )}
          {size && (
            <span className="flex items-center gap-1">
              <Ruler className="w-4 h-4 text-sky-500" /> {size} sqft
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {facilities?.slice(0, 3).map((facility, index) => (
            <span
              key={index}
              className="px-2 py-0.5 rounded bg-sky-50 dark:bg-gray-700 text-sky-700 dark:text-sky-200 text-xs"
            >
              {facility}
            </span>
          ))}
          {facilities?.length > 3 && (
            <span className="px-2 py-0.5 rounded text-gray-500 dark:text-gray-400 text-xs">
              +{facilities.length - 3} more
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
          <p className="text-sm text-gray-700 dark:text-white font-medium">
            <span className="text-2xl font-bold text-sky-500">${rent}</span>{" "}
            <span className="text-gray-500 dark:text-gray-400">/ night</span>
          </p>
          <span className="flex items-center gap-1 text-sm font-semibold text-sky-500 group-hover:gap-2 transition-all">
            Book now <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default RoomCart;
