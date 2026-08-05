import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Booking } from "@/lib/models/Booking";
import { Room } from "@/lib/models/Room";
import { NightReservation } from "@/lib/models/NightReservation";
import { getAuthUser, isAdmin } from "@/lib/auth";
import { rebuildUnavailableDates } from "@/lib/availability";
import { sendCancellationNotice } from "@/lib/email";
import { createActivityLog } from "@/lib/activityLog";

export const dynamic = "force-dynamic";

const isOwnerOrAdmin = (booking, auth) => {
  const ownerId = booking.userId?._id ? booking.userId._id : booking.userId;
  return String(ownerId) === String(auth.userId) || isAdmin(auth);
};

// GET /api/bookings/[id] — a single booking (owner or admin)
export async function GET(request, { params }) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: please sign in" },
        { status: 401 }
      );
    }

    await connectDB();
    const booking = await Booking.findById(params.id)
      .populate("userId", "name email phone")
      .populate("roomId");
    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }
    if (!isOwnerOrAdmin(booking, auth)) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: "Booking retrieved successfully",
      data: booking,
    });
  } catch (error) {
    console.error("get booking error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}

// DELETE /api/bookings/[id] — cancel a booking (owner or admin)
export async function DELETE(request, { params }) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: please sign in" },
        { status: 401 }
      );
    }

    await connectDB();
    const booking = await Booking.findById(params.id);
    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    if (!isOwnerOrAdmin(booking, auth)) {
      return NextResponse.json(
        { success: false, message: "You can only cancel your own bookings" },
        { status: 403 }
      );
    }

    if (booking.status === "CANCELLED") {
      return NextResponse.json({
        success: true,
        statusCode: 200,
        message: "Booking is already cancelled",
        data: booking,
      });
    }

    booking.status = "CANCELLED";
    if (booking.paymentStatus === "PAID") {
      booking.paymentStatus = "REFUNDED";
    }
    await booking.save();

    // Release the nights this booking held and resync the calendar.
    await NightReservation.deleteMany({ bookingId: booking._id });
    if (booking.roomId) {
      await rebuildUnavailableDates(booking.roomId);
    }

    const populated = await Booking.findById(booking._id)
      .populate("userId", "name email phone")
      .populate("roomId");
    sendCancellationNotice(populated.toObject()).catch(() => {});
    createActivityLog({
      auth,
      action: "booking.cancelled",
      entity: "booking",
      entityId: booking._id,
      description: `Booking cancelled — ${populated.roomId?.title || "Room"}`,
      meta: {
        refunded: booking.paymentStatus === "REFUNDED",
        roomId: booking.roomId,
        totalAmount: booking.totalAmount,
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: "Booking cancelled successfully",
      data: populated,
    });
  } catch (error) {
    console.error("cancel booking error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}

// PATCH /api/bookings/[id] — update status / payment (admin only)
export async function PATCH(request, { params }) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: please sign in" },
        { status: 401 }
      );
    }
    if (!isAdmin(auth)) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, paymentStatus } = body || {};

    await connectDB();
    const booking = await Booking.findById(params.id);
    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    if (status && !["CONFIRMED", "PENDING", "CANCELLED", "COMPLETED"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      );
    }
    if (paymentStatus && !["UNPAID", "PAID", "REFUNDED"].includes(paymentStatus)) {
      return NextResponse.json(
        { success: false, message: "Invalid payment status" },
        { status: 400 }
      );
    }

    const prevStatus = booking.status;
    if (status) booking.status = status;
    if (paymentStatus) booking.paymentStatus = paymentStatus;

    // Cancelling via the admin panel also releases the nights.
    if (status === "CANCELLED" && prevStatus !== "CANCELLED" && booking.roomId) {
      await NightReservation.deleteMany({ bookingId: booking._id });
      await rebuildUnavailableDates(booking.roomId);
    }

    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate("userId", "name email phone")
      .populate("roomId");

    if (status === "CANCELLED" && prevStatus !== "CANCELLED") {
      sendCancellationNotice(populated.toObject()).catch(() => {});
    }

    createActivityLog({
      auth,
      action: "booking.updated",
      entity: "booking",
      entityId: booking._id,
      description: `Booking updated by admin — ${populated.roomId?.title || "Room"}`,
      meta: {
        prevStatus,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        roomId: booking.roomId,
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: "Booking updated successfully",
      data: populated,
    });
  } catch (error) {
    console.error("update booking error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
