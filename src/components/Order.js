"use client";
import { BASEURL } from "@/app/page";
import { useAuth } from "@/Hooks/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const Order = () => {
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
      return;
    }
  }, [token, router]);

  const { isLoading, error, data } = useQuery({
    queryKey: ["bookData"],
    queryFn: () => fetch(`${BASEURL}/book/books`).then((res) => res.json()),
    refetchInterval: 1000,
  });

  const orders = Array.isArray(data?.data) ? data?.data : [];

  if (isLoading) {
    return <div className=" text-xl font-bold ">Loading...</div>;
  }

  if (error) {
    return (
      <div className=" font-xl font-bold text-red-400 ">Error: {error}</div>
    );
  }
  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Order History</h1>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-200 p-2">Order ID</th>
              <th className="border border-gray-200 p-2">User Name</th>
              <th className="border border-gray-200 p-2">Room Name</th>
              <th className="border border-gray-200 p-2">Start Date</th>
              <th className="border border-gray-200 p-2">End Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="text-center">
                <td className="border border-gray-200 p-2">{order._id}</td>
                <td className="border border-gray-200 p-2">
                  {order.userId.name}
                </td>
                <td className="border border-gray-200 p-2">
                  {order.roomId.title}
                </td>
                <td className="border border-gray-200 p-2">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="border border-gray-200 p-2">
                  {new Date(order.updatedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Order;
