import Profile from "@/components/Profile";
import React from "react";

export const metadata = {
  title: "My Profile",
};

const page = () => {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center lg:px-24 px-2 mx-auto">
      <Profile />
    </div>
  );
};

export default page;
