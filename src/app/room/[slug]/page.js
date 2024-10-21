import Image from "next/image";
import React from "react";

const page = async ({ params }) => {
  const id = params?.slug;
  let data = await fetch(`http://localhost:8000/api/v1/room/room/${id}`, {
    cache: "no-store",
  });
  let room = await data.json();

  return (
    <div className=" w-full flex flex-col items-center mx-auto lg:px-24 px-2 my-20 ">
      <h1 className="text-3xl font-bold mb-4  ">Room Details</h1>

      <div className="w-full lg:w-3/4 flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-700 shadow-lg rounded-lg overflow-hidden">
        {/* Room Image */}
        <div className="w-full lg:w-1/2 h-64 lg:h-auto">
          <Image
            width={400}
            height={400}
            src="https://cache.marriott.com/marriottassets/marriott/LASJW/lasjw-suite-0084-hor-clsc.jpg?interpolation=progressive-bilinear&"
            alt={room?.data.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Room Information */}
        <div className="w-full lg:w-1/2 p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-semibold mb-2">{room?.data.title}</h2>
            <p className="text-lg text-gray-700 dark:text-white mb-4 ">
              Rent: ${room?.data.rent} per hour
            </p>

            <h3 className="text-xl font-medium mb-2">Facilities:</h3>
            <ul className="list-disc list-inside text-gray-600 dark:text-white mb-4">
              {room?.data.facilities?.map((facility, index) => (
                <li key={index}>{facility}</li>
              ))}
            </ul>
            <button className=" px-4 py-2 rounded bg-black text-white dark:bg-white dark:text-black ">
              Confirm Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
