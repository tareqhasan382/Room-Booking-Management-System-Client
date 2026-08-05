"use client";
import { useAuth } from "@/Hooks/AuthProvider";
import { useRoom } from "@/Hooks/useRoom";
import { useCreateBooking } from "@/Hooks/useBookings";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { format, differenceInCalendarDays } from "date-fns";
import { useToast } from "@/components/ui/ToastProvider";
import Rating from "@/components/ui/Rating";
import { PageSkeleton } from "@/components/ui/Skeleton";
import RoomReviews from "@/components/Reviews/RoomReviews";
import { parseFlexible, formatTimeDisplay } from "@/lib/date";
import CustomSelect from "@/components/ui/CustomSelect";
import {
  CalendarCheck,
  Clock,
  Users,
  BedDouble,
  Ruler,
  Minus,
  Plus,
  CreditCard,
  ShieldCheck,
  Info,
  Sparkles,
} from "lucide-react";

const TAX_RATE = 0.08;
const CHECKIN_TIMES = ["12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
const CHECKOUT_TIMES = ["08:00", "09:00", "10:00", "11:00", "12:00"];

const inputCls =
  "w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-shadow";

const selectCls = "w-full";

const RoomDetails = ({ roomId }) => {
  const { user, token } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const bookingMutation = useCreateBooking(token);

  const { isLoading, error, data: room } = useRoom(roomId);

  const [dateRange, setDateRange] = useState([
    { startDate: new Date(), endDate: new Date(), key: "selection" },
  ]);
  const [checkInTime, setCheckInTime] = useState("14:00");
  const [checkOutTime, setCheckOutTime] = useState("11:00");
  const [guests, setGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    if (user) {
      setContact({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const disabledDates = useMemo(() => {
    const dates = (room?.unavailableDates || [])
      .map(parseFlexible)
      .filter((d) => d instanceof Date);
    return dates;
  }, [room]);

  const { startDate, endDate } = dateRange[0];

  const nights = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const diff = differenceInCalendarDays(endDate, startDate);
    return diff > 0 ? diff : 0;
  }, [startDate, endDate]);

  const subtotal = (room?.rent || 0) * nights;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  const isAvailable = useMemo(() => {
    if (!room?.unavailableDates?.length) return true;
    const blocked = new Set(
      room.unavailableDates
        .map(parseFlexible)
        .filter((d) => d instanceof Date)
        .map((d) => format(d, "MM/dd/yyyy"))
    );
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      if (blocked.has(format(d, "MM/dd/yyyy"))) return false;
    }
    return true;
  }, [room, startDate, endDate]);

  const capacityExceeded = guests > (room?.capacity || 1);

  const handleBooking = async () => {
    if (!user) {
      toast.info("Please sign in to book a room");
      router.push("/sign-in");
      return;
    }

    if (nights <= 0) {
      toast.error("Please select a valid date range (at least one night).");
      return;
    }
    if (!contact.name.trim() || !contact.email.trim()) {
      toast.error("Please provide your name and email.");
      return;
    }
    if (capacityExceeded) {
      toast.error(`This room sleeps up to ${room?.capacity} guests.`);
      return;
    }
    if (!isAvailable) {
      toast.error("The selected dates/times overlap with an existing booking.");
      return;
    }

    const payload = {
      roomId: room._id,
      date: {
        startDate: format(startDate, "MM/dd/yyyy"),
        endDate: format(endDate, "MM/dd/yyyy"),
      },
      checkInTime,
      checkOutTime,
      guests,
      contactName: contact.name.trim(),
      contactEmail: contact.email.trim(),
      contactPhone: contact.phone.trim(),
      specialRequests: specialRequests.trim(),
    };

    try {
      const result = await bookingMutation.mutateAsync(payload);
      if (result?.success) {
        toast.success("Room booked successfully!");
        router.push("/order");
      } else {
        toast.error(result?.message || "Booking failed, please try again.");
      }
    } catch (err) {
      toast.error(`Error during booking: ${err?.message || err}`);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center mx-auto lg:px-24 px-2 my-20">
        <h1 className="text-3xl font-bold mb-4">Room Details</h1>
        <PageSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex flex-col items-center mx-auto lg:px-24 px-2 my-20">
        <h1 className="text-3xl font-bold mb-4">Room Details</h1>
        <h1 className="text-xl font-bold text-red-400">Error: {error.message}</h1>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center mx-auto lg:px-24 px-2 my-20">
      {/* Header */}
      <div className="w-full lg:w-4/5 mb-8 text-center">
        <p className="text-sky-500 font-semibold tracking-wide uppercase text-sm mb-2">
          {room?.category} · {room?.beds}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold">{room?.title}</h1>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Rating value={room?.rating || 0} showValue />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({room?.reviews || 0} guest reviews)
          </span>
        </div>
      </div>

      <div className="w-full lg:w-4/5 flex flex-col lg:flex-row bg-white dark:bg-slate-800 shadow-xl rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
        {/* Room Image */}
        <div className="w-full lg:w-1/2 h-72 lg:h-auto relative">
          <Image
            width={800}
            height={600}
            src={room?.picture}
            alt={room?.title}
            className="w-full h-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 dark:bg-gray-900/80 text-xs font-bold uppercase tracking-wide shadow">
            {room?.category}
          </span>
          <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <p className="text-sm font-semibold drop-shadow">
              Hand-picked · {room?.capacity} guests · {room?.size} sqft
            </p>
          </div>
        </div>

        {/* Room Information */}
        <div className="w-full lg:w-1/2 p-6 md:p-8 flex flex-col justify-between">
          <div>
            <p className="text-gray-600 dark:text-gray-200 text-sm leading-relaxed mb-6">
              {room?.description}
            </p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-700 p-4 text-center">
                <Users className="w-5 h-5 text-sky-500 mx-auto mb-1" />
                <p className="text-lg font-bold">{room?.capacity}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Guests</p>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-700 p-4 text-center">
                <BedDouble className="w-5 h-5 text-sky-500 mx-auto mb-1" />
                <p className="text-lg font-bold leading-tight">{room?.beds}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Beds</p>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-700 p-4 text-center">
                <Ruler className="w-5 h-5 text-sky-500 mx-auto mb-1" />
                <p className="text-lg font-bold">{room?.size}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Sq Ft</p>
              </div>
            </div>

            <div className="flex items-baseline justify-between mb-5">
              <h3 className="text-lg font-medium">Facilities</h3>
              <p className="text-lg text-gray-700 dark:text-white">
                <span className="text-2xl font-bold text-sky-500">
                  ${room?.rent}
                </span>{" "}
                / night
              </p>
            </div>
            <ul className="flex flex-wrap gap-2 mb-4">
              {room?.facilities?.map((facility, index) => (
                <li
                  key={index}
                  className="px-3 py-1 rounded-full bg-sky-50 dark:bg-gray-600 text-sm text-sky-700 dark:text-sky-200 border border-sky-100 dark:border-transparent"
                >
                  {facility}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Booking Section */}
      <div className="w-full lg:w-4/5 mt-8 grid lg:grid-cols-5 gap-6">
        {/* Date + time picker */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow border border-slate-100 dark:border-slate-700">
          <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-sky-500" /> Select Your Stay
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Choose your check-in and check-out dates and times.
          </p>

          <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 mb-5">
            <DateRange
              editableDateInputs={true}
              onChange={(item) => setDateRange([item.selection])}
              moveRangeOnFirstSelection={false}
              ranges={dateRange}
              minDate={new Date()}
              disabledDates={disabledDates}
              rangeColors={["#0ea5e9"]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-sky-500" /> Check-in time
              </span>
              <CustomSelect
                value={checkInTime}
                onChange={setCheckInTime}
                options={CHECKIN_TIMES.map((t) => ({
                  value: t,
                  label: formatTimeDisplay(t),
                }))}
                ariaLabel="Check-in time"
                className={selectCls}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-sky-500" /> Check-out time
              </span>
              <CustomSelect
                value={checkOutTime}
                onChange={setCheckOutTime}
                options={CHECKOUT_TIMES.map((t) => ({
                  value: t,
                  label: formatTimeDisplay(t),
                }))}
                ariaLabel="Check-out time"
                className={selectCls}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium col-span-2">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-sky-500" /> Guests
                <span className="text-xs font-normal text-gray-400">
                  (max {room?.capacity || 1})
                </span>
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setGuests((g) => Math.max(1, g - 1))}
                  className="w-10 h-10 rounded-lg border border-slate-300 dark:border-slate-600 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-lg font-bold w-10 text-center">{guests}</span>
                <button
                  type="button"
                  onClick={() => setGuests((g) => Math.min(room?.capacity || 1, g + 1))}
                  className="w-10 h-10 rounded-lg border border-slate-300 dark:border-slate-600 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                  {guests > 1 ? "guests" : "guest"}
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Summary + contact */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow border border-slate-100 dark:border-slate-700">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-sky-500" /> Booking Summary
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-300">Check-in</span>
                <span className="font-medium">
                  {nights > 0
                    ? `${format(startDate, "EEE, MMM d")} · ${formatTimeDisplay(checkInTime)}`
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-300">Check-out</span>
                <span className="font-medium">
                  {nights > 0
                    ? `${format(endDate, "EEE, MMM d")} · ${formatTimeDisplay(checkOutTime)}`
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-300">
                  {nights} night{nights === 1 ? "" : "s"} × ${room?.rent}
                </span>
                <span className="font-medium">${subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-300">
                  Taxes & fees ({(TAX_RATE * 100).toFixed(0)}%)
                </span>
                <span className="font-medium">${tax}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 dark:border-slate-600 pt-3">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-2xl text-sky-500">${total}</span>
              </div>
            </div>

            {nights > 0 && !isAvailable && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded p-2 mt-4">
                These dates/times overlap with an existing booking.
              </p>
            )}
            {capacityExceeded && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded p-2 mt-4">
                Guest count exceeds this room&apos;s capacity.
              </p>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-sky-500" /> Your Details
            </h3>
            <div className="space-y-3">
              <label className="flex flex-col gap-1 text-sm font-medium">
                Full name *
                <input
                  type="text"
                  value={contact.name}
                  onChange={(e) => setContact({ ...contact, name: e.target.value })}
                  placeholder="Jane Doe"
                  className={inputCls}
                />
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex flex-col gap-1 text-sm font-medium">
                  Email *
                  <input
                    type="email"
                    value={contact.email}
                    onChange={(e) => setContact({ ...contact, email: e.target.value })}
                    placeholder="jane@example.com"
                    className={inputCls}
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium">
                  Phone
                  <input
                    type="tel"
                    value={contact.phone}
                    onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                    placeholder="+1 555 000 0000"
                    className={inputCls}
                  />
                </label>
              </div>
              <label className="flex flex-col gap-1 text-sm font-medium">
                Special requests
                <textarea
                  rows={2}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Early check-in, airport pickup, extra pillows..."
                  className={`${inputCls} resize-none`}
                />
              </label>
            </div>

            <button
              onClick={handleBooking}
              disabled={bookingMutation.isPending}
              className="mt-5 w-full px-6 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-600 active:scale-[0.99] text-white font-bold transition-all disabled:opacity-50 shadow-lg shadow-sky-500/25"
            >
              {bookingMutation.isPending ? "Booking..." : "Confirm Booking"}
            </button>
            {!user && (
              <p className="text-xs text-gray-500 dark:text-gray-300 mt-2 text-center">
                You will be redirected to sign in.
              </p>
            )}
            <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mt-3">
              <ShieldCheck className="w-3.5 h-3.5" /> Free cancellation · No hidden fees
            </p>
          </div>
        </div>
      </div>

      {/* Guest reviews */}
      <RoomReviews roomId={roomId} room={room} />
    </div>
  );
};

export default RoomDetails;
