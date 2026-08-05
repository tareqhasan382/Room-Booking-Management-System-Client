import Order from "@/components/Order";
import { Suspense } from "react";
import React from "react";

export const metadata = {
  title: "My Bookings",
};

const page = () => {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center mx-auto">
      <Suspense fallback={null}>
        <Order />
      </Suspense>
    </div>
  );
};

export default page;
