import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Booking } from "@/lib/models/Booking";
import { getAuthUser, isAdmin } from "@/lib/auth";

// GET /api/bookings/all — every booking (admin only)
export async function GET(request) {
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

    await connectDB();
    const bookings = await Booking.find()
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
    console.error("get all bookings error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
