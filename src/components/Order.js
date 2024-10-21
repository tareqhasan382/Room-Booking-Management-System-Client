"use client";
import React, { useState, useEffect } from "react";

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8000/api/v1/orders");
        if (!response.ok) {
          throw new Error("Failed to fetch order data");
        }
        const data = await response.json();
        setOrders(data?.orders || []);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, []);

  if (loading) {
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
              <th className="border border-gray-200 p-2">User ID</th>
              <th className="border border-gray-200 p-2">Room ID</th>
              <th className="border border-gray-200 p-2">Start Date</th>
              <th className="border border-gray-200 p-2">End Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="text-center">
                <td className="border border-gray-200 p-2">{order._id}</td>
                <td className="border border-gray-200 p-2">{order.userId}</td>
                <td className="border border-gray-200 p-2">{order.roomId}</td>
                <td className="border border-gray-200 p-2">
                  {new Date(order.startDate).toLocaleDateString()}
                </td>
                <td className="border border-gray-200 p-2">
                  {new Date(order.endDate).toLocaleDateString()}
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
