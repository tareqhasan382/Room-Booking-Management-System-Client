import { addDays } from "date-fns";
import { Booking } from "./models/Booking";
import { Room } from "./models/Room";

/**
 * The overnight dates a stay occupies: from check-in day up to (but excluding)
 * check-out day, so the checkout day stays available for a later same-day
 * check-in. Each returned date is a midnight Date.
 */
export function getNightDates(checkIn, checkOut) {
  const dates = [];
  const start = new Date(checkIn);
  start.setHours(0, 0, 0, 0);
  const endDay = new Date(checkOut);
  endDay.setHours(0, 0, 0, 0);
  let current = new Date(start);
  while (current < endDay) {
    dates.push(new Date(current));
    current = addDays(current, 1);
  }
  return dates;
}

/**
 * Recomputes a room's unavailableDates from its non-cancelled bookings.
 * Used inside the booking transaction so the calendar always matches the
 * bookings that actually hold the nights.
 */
export async function rebuildUnavailableDates(roomId, session = null) {
  const bookings = await Booking.find({
    roomId,
    status: { $ne: "CANCELLED" },
  })
    .session(session)
    .select("checkInDate checkOutDate");

  const set = new Set();
  for (const b of bookings) {
    for (const d of getNightDates(b.checkInDate, b.checkOutDate)) {
      set.add(new Date(d).setHours(0, 0, 0, 0));
    }
  }

  await Room.updateOne(
    { _id: roomId },
    { $set: { unavailableDates: [...set].map((t) => new Date(t)) } }
  ).session(session || null);
}
