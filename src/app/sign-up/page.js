import SignUp from "@/components/SignUp";
import React from "react";

export const metadata = {
  title: "Sign Up",
};

const page = () => {
  return (
    <div className="relative w-full min-h-[calc(100vh-90px)] flex flex-col items-center justify-center py-14 px-4 overflow-hidden bg-gradient-to-br from-sky-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-sky-200/40 dark:bg-sky-900/20 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-amber-200/40 dark:bg-amber-900/10 blur-3xl" />
      <SignUp />
    </div>
  );
};

export default page;
