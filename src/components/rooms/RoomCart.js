import Image from "next/image";
import React from "react";

const RoomCart = ({ data }) => {
  const { title, rent, facilities, picture } = data;
  return (
    <div className=" w-full h-[400px] bg-slate-100 dark:bg-slate-700 rounded transform transition-transform duration-300 hover:scale-103 hover:translate-y-[-6px]">
      <Image
        width={400}
        height={400}
        src="https://cache.marriott.com/marriottassets/marriott/LASJW/lasjw-suite-0084-hor-clsc.jpg?interpolation=progressive-bilinear&"
        alt={title}
        className="w-full rounded-t h-[60%] object-cover"
      />
      <div className="p-4">
        <h2 className="text-lg font-bold mb-1 ">{title}</h2>
        <p className="text-sm text-gray-700 dark:text-white mb-2 font-medium ">
          Rent: ${rent} per hour
        </p>
        <p className="text-sm text-gray-700 dark:text-white font-medium ">
          Facility:
        </p>
        <ul className="text-sm text-gray-600 dark:text-white w-full grid grid-cols-2">
          {facilities.map((facility, index) => (
            <li key={index} className=" w-full ">
              - {facility}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RoomCart;
