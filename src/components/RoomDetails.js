"use client";
import { BASEURL } from "@/app/page";
import { useAuth } from "@/Hooks/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { format, differenceInDays } from "date-fns";
const RoomDetails = ({ roomId }) => {
  const { user } = useAuth();
  const router = useRouter();

  // State for the selected date range
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const { isLoading, error, data } = useQuery({
    queryKey: ["roomData"],
    queryFn: () =>
      fetch(`${BASEURL}/room/room/${roomId}`).then((res) => res.json()),
    refetchInterval: 1000,
  });
  const disabledDates = data?.data.unavailableDates;
  // Booking handler with date range

  const alldates = {
    startDate: format(dateRange[0].startDate, "MM/dd/yyyy"),
    endDate: format(dateRange[0].endDate, "MM/dd/yyyy"),
  };
  /////==========================
  const { startDate, endDate } = alldates;

  // Validation for date selection
  const days = differenceInDays(endDate, startDate) + 1;
  console.log("days:", days);
  const bookingHandler = async (bookingData) => {
    try {
      if (!user) {
        router.push("/sign-in");
        return;
      }

      if (!days === null || !days) {
        window.alert("Please select a valid date range.");
        return;
      }
      const bookData = {
        userId: user._id,
        roomId: bookingData._id,
        date: alldates,
      };

      const res = await fetch(`${BASEURL}/book/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookData),
      });

      const data = await res.json();
      if (data.success) {
        window.alert("Booked in successfully!");
        // router.push("/");
      }
    } catch (error) {
      window.alert(`Error during booking: ${error}`);
    }
  };

  return (
    <div className="w-full flex flex-col items-center mx-auto lg:px-24 px-2 my-20">
      <h1 className="text-3xl font-bold mb-4">Room Details</h1>
      {isLoading && (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <h1 className="text-xl font-bold">Loading...</h1>
        </div>
      )}
      {error && (
        <h1 className="text-xl font-bold text-red-400">
          Error: {error?.message}
        </h1>
      )}
      {!isLoading && !error && (
        <div className="w-full lg:w-3/4 flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-700 shadow-lg rounded-lg overflow-hidden">
          {/* Room Image */}
          <div className="w-full lg:w-1/2 h-64 lg:h-auto">
            <Image
              width={400}
              height={400}
              src={data?.data?.picture}
              alt={data?.data?.title}
              className="w-full h-full object-cover"
              priority
            />
          </div>

          {/* Room Information */}
          <div className="w-full lg:w-1/2 p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-semibold mb-2">
                {data?.data?.title}
              </h2>
              <p className="text-lg text-gray-700 dark:text-white mb-4">
                Rent: ${data?.data.rent} per hour
              </p>

              <h3 className="text-xl font-medium mb-2">Facilities:</h3>
              <ul className="list-disc list-inside text-gray-600 dark:text-white mb-4">
                {data?.data.facilities?.map((facility, index) => (
                  <li key={index}>{facility}</li>
                ))}
              </ul>

              {/* Date Range Picker */}
              <div className="w-full bg-white border rounded-lg shadow-lg mb-4">
                <DateRange
                  editableDateInputs={true}
                  onChange={(item) => setDateRange([item.selection])}
                  moveRangeOnFirstSelection={false}
                  ranges={dateRange}
                  minDate={new Date()}
                  className="date"
                  disabledDates={disabledDates}
                />
              </div>

              {/* Booking Button */}
              <button
                onClick={() => bookingHandler(data?.data)}
                className="px-4 py-2 rounded bg-black text-white dark:bg-white dark:text-black"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomDetails;
