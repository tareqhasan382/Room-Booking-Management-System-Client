import React from "react";
import RoomCart from "./RoomCart";
import Link from "next/link";
const Rooms = async () => {
  const data = await fetch("http://localhost:8000/api/v1/room/rooms", {
    cache: "no-store",
  });
  const rooms = (await data.json()) || {};
  return (
    <div className=" w-full h-auto flex flex-col  ">
      <h1 className=" text-xl font-bold ">Popular Rooms</h1>
      <div className=" w-full h-auto grid lg:grid-cols-3 lg:landscape:grid-cols-3 md:grid-cols-2 xs:grid-cols-1 landscape:grid-cols-2 gap-5 py-5 ">
        {rooms?.data &&
          rooms?.data.slice(0, 9).map((room) => (
            <Link key={room._id} href={`room/${room._id}`}>
              <RoomCart data={room} />
            </Link>
          ))}
      </div>
    </div>
  );
};

export default Rooms;
