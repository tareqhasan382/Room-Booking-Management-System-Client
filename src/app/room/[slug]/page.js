import RoomDetails from "@/components/RoomDetails";
import React from "react";

const page = async ({ params }) => {
  const id = params?.slug;
  // const data = await fetch(`http://localhost:8000/api/v1/room/room/${id}`, {
  //   cache: "no-store",
  // });
  // const room = await data.json();

  return <RoomDetails roomId={id} />;
};

export default page;
