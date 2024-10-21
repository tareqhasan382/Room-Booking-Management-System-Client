"use client";
import React from "react";
import RoomCart from "./RoomCart";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BASEURL } from "@/app/page";

const Rooms = () => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["roomData"],
    queryFn: () => fetch(`${BASEURL}/room/rooms`).then((res) => res.json()),
    refetchInterval: 1000,
  });

  const rooms = Array.isArray(data?.data) ? data?.data : [];

  return (
    <div className=" w-full h-auto flex flex-col  ">
      <h1 className=" text-xl font-bold ">Popular Rooms</h1>
      {isLoading && (
        <div className=" w-full h-full flex flex-col items-center justify-center ">
          <h1 className=" w-full text-center text-xl font-bold  ">
            Loading...
          </h1>
        </div>
      )}
      {error && (
        <div className=" w-full h-full flex flex-col items-center justify-center ">
          <h1 className=" text-xl font-bold text-red-500 ">{error.message}</h1>
        </div>
      )}
      <div className=" w-full h-auto grid lg:grid-cols-3 lg:landscape:grid-cols-3 md:grid-cols-2 xs:grid-cols-1 landscape:grid-cols-2 gap-5 py-5 ">
        {!isLoading &&
          !error &&
          rooms &&
          rooms?.slice(0, 9).map((room) => (
            <Link key={room._id} href={`room/${room._id}`}>
              <RoomCart data={room} />
            </Link>
          ))}
      </div>
    </div>
  );
};

export default Rooms;
