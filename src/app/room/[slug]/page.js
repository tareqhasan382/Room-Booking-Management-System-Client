import RoomDetails from "@/components/RoomDetails";
import React from "react";

export async function generateMetadata({ params }) {
  return { title: `Room ${params?.slug ? "Details" : ""}` };
}

const page = async ({ params }) => {
  const id = params?.slug;
  return <RoomDetails roomId={id} />;
};

export default page;
