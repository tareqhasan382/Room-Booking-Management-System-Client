"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";

const Profile = () => {
  // const [user, setUser] = useState(null);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);

  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     try {
  //       setLoading(true);
  //       const response = await fetch(
  //         "http://localhost:8000/api/v1/user/profile"
  //       );
  //       if (!response.ok) {
  //         throw new Error("Failed to fetch user data");
  //       }
  //       const data = await response.json();
  //       setUser(data?.user);
  //       setError(null);
  //     } catch (err) {
  //       setError(err.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchUserData();
  // }, []);

  // if (loading) {
  //   return <div>Loading...</div>;
  // }

  // if (error) {
  //   return <div>Error: {error}</div>;
  // }

  return (
    <div className="w-full h-full max-w-md mx-auto shadow-md shadow-slate-500 rounded-lg p-6">
      <div className="flex items-center space-x-4">
        <Image
          width={300}
          height={300}
          src="https://static.vecteezy.com/system/resources/previews/021/548/095/original/default-profile-picture-avatar-user-avatar-icon-person-icon-head-icon-profile-picture-icons-default-anonymous-user-male-and-female-businessman-photo-placeholder-social-network-avatar-portrait-free-vector.jpg"
          alt="User Profile"
          className="w-24 h-24 rounded-full object-cover"
        />
        <div>
          <h2 className="text-2xl font-semibold">User Name</h2>
          <p className="text-gray-600 dark:text-slate-200 ">
            user@example.com{" "}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-medium">About Me</h3>
        <p className="text-gray-700 dark:text-slate-200 mt-2">
          User bio goes here.
        </p>
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-medium">Additional Info</h3>
        <p className="text-gray-700 dark:text-slate-200 mt-2">
          Location: Not provided
        </p>
        <p className="text-gray-700 dark:text-slate-200">Joined: N/A</p>
      </div>
    </div>
  );
};

export default Profile;
