import AdminDashboard from "@/components/AdminDashboard";
import React from "react";

export const metadata = {
  title: "Admin Dashboard",
};

const page = () => {
  return (
    <div className="w-full min-h-screen flex flex-col items-center mx-auto">
      <AdminDashboard />
    </div>
  );
};

export default page;
