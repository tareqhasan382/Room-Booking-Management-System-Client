import { NextResponse } from "next/server";
import { differenceInCalendarDays } from "date-fns";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Booking } from "@/lib/models/Booking";
import { Room } from "@/lib/models/Room";
import { NightReservation } from "@/lib/models/NightReservation";
import { getAuthUser } from "@/lib/auth";
import { combineDateTime, parseFlexible } from "@/lib/date";
import { getNightDates, rebuildUnavailableDates } from "@/lib/availability";
import { generateInvoicePdf } from "@/lib/invoice";
import { sendBookingConfirmation } from "@/lib/email";
import { createActivityLog } from "@/lib/activityLog";

export const dynamic = "force-dynamic";

const TAX_RATE = 0.08;
const MAX_NIGHTS = 30;

class BookingConflictError extends Error {}

// GET /api/bookings — the authenticated user's bookings
export async function GET(request) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: please sign in" },
        { status: 401 }
      );
    }

    await connectDB();
    const bookings = await Booking.find({ userId: auth.userId })
      .populate("userId", "name email")
      .populate("roomId")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: "Bookings retrieved successfully",
      total: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("get bookings error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}

// POST /api/bookings — create a booking.
// Race-safe: the overlap check, booking insert and night-ledger inserts run
// inside a transaction; the unique (room, night) index makes a concurrent
// booking for an overlapping night fail with E11000 instead of sneaking in.
export async function POST(request) {
  let session;
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: please sign in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      roomId,
      date,
      checkInTime = "14:00",
      checkOutTime = "11:00",
      guests = 1,
      contactName,
      contactEmail,
      contactPhone,
      specialRequests,
    } = body || {};

    if (!roomId || !date?.startDate || !date?.endDate) {
      return NextResponse.json(
        { success: false, message: "roomId, startDate and endDate are required" },
        { status: 400 }
      );
    }

    const checkIn = combineDateTime(parseFlexible(date.startDate), checkInTime);
    const checkOut = combineDateTime(parseFlexible(date.endDate), checkOutTime);

    if (
      !(checkIn instanceof Date) ||
      !(checkOut instanceof Date) ||
      checkOut <= checkIn
    ) {
      return NextResponse.json(
        { success: false, message: "Check-out must be after check-in" },
        { status: 400 }
      );
    }

    const nights = differenceInCalendarDays(checkOut, checkIn);
    if (nights < 1) {
      return NextResponse.json(
        { success: false, message: "Please select at least one night" },
        { status: 400 }
      );
    }
    if (nights > MAX_NIGHTS) {
      return NextResponse.json(
        { success: false, message: `Maximum stay is ${MAX_NIGHTS} nights` },
        { status: 400 }
      );
    }

    if (checkIn < new Date()) {
      return NextResponse.json(
        { success: false, message: "Check-in date cannot be in the past" },
        { status: 400 }
      );
    }

    const guestCount = Math.max(1, Math.min(20, Number(guests) || 1));

    await connectDB();

    let booking;
    session = await mongoose.startSession();

    await session.withTransaction(
      async () => {
        const room = await Room.findById(roomId).session(session);
        if (!room) {
          throw Object.assign(new Error("Room not found"), { code: "ROOM_NOT_FOUND" });
        }

        if (guestCount > (room.capacity || 1)) {
          throw Object.assign(
            new Error(`This room sleeps up to ${room.capacity} guests`),
            { code: "CAPACITY" }
          );
        }

        // Fast-path interval overlap check (friendly error before the ledger).
        const overlapping = await Booking.findOne({
          roomId,
          status: { $ne: "CANCELLED" },
          checkInDate: { $lt: checkOut },
          checkOutDate: { $gt: checkIn },
        }).session(session);
        if (overlapping) {
          throw new BookingConflictError(
            "The selected dates/times overlap with an existing booking"
          );
        }

        const subtotal = Math.round(room.rent * nights * 100) / 100;
        const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
        const totalAmount = Math.round((subtotal + tax) * 100) / 100;

        const created = await Booking.create(
          [
            {
              userId: auth.userId,
              roomId,
              checkInDate: checkIn,
              checkOutDate: checkOut,
              checkInTime,
              checkOutTime,
              guests: guestCount,
              contactName: contactName || "",
              contactEmail: contactEmail || "",
              contactPhone: contactPhone || "",
              specialRequests: specialRequests || "",
              nights,
              subtotal,
              tax,
              totalAmount,
              status: "CONFIRMED",
              paymentStatus: "UNPAID",
            },
          ],
          { session }
        );
        booking = created[0];

        // Authoritative guard: reserve each overnight night. A concurrent
        // booking for any of these nights fails here with a duplicate key.
        try {
          await NightReservation.insertMany(
            getNightDates(checkIn, checkOut).map((nightDate) => ({
              roomId,
              nightDate,
              bookingId: booking._id,
            })),
            { session }
          );
        } catch (err) {
          if (err?.code === 11000) {
            throw new BookingConflictError(
              "The selected dates/times overlap with an existing booking"
            );
          }
          throw err;
        }

        await rebuildUnavailableDates(roomId, session);
      },
      {
        readConcern: { level: "snapshot" },
        writeConcern: { w: "majority" },
      }
    );

    const populated = await Booking.findById(booking._id)
      .populate("userId", "name email")
      .populate("roomId");

    // Side effects run off the critical path so a mail/PDF hiccup never fails
    // the booking itself.
    sendBookingConfirmation(populated.toObject()).catch(() => {});
    createActivityLog({
      auth,
      action: "booking.created",
      entity: "booking",
      entityId: booking._id,
      description: `New booking — ${populated.roomId?.title || "Room"} · ${nights} night(s) · $${(booking.totalAmount || 0).toFixed(2)}`,
      meta: {
        roomId,
        nights,
        totalAmount: booking.totalAmount,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        paymentStatus: "UNPAID",
      },
    }).catch(() => {});

    return NextResponse.json(
      { success: true, statusCode: 200, message: "Booking created successfully", data: populated },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof BookingConflictError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 409 }
      );
    }
    if (error?.code === "ROOM_NOT_FOUND") {
      return NextResponse.json(
        { success: false, message: "Room not found" },
        { status: 404 }
      );
    }
    if (error?.code === "CAPACITY") {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }
    console.error("create booking error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  } finally {
    if (session) await session.endSession();
  }
}
