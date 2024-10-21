import Order from "@/components/Order";
import React from "react";

const page = () => {
  //h-full py-20
  return (
    <div className=" w-full min-h-screen  flex flex-col items-center justify-center mx-auto ">
      <Order />
    </div>
  );
};

export default page;
