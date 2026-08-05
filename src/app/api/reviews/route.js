import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Review } from "@/lib/models/Review";
import { Room } from "@/lib/models/Room";
import { Booking } from "@/lib/models/Booking";
import { getAuthUser } from "@/lib/auth";
import { recomputeRoomRating } from "@/lib/reviews";
import { createActivityLog } from "@/lib/activityLog";

// GET /api/reviews?roomId=xxx — public list of reviews for a room
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get("roomId");

    await connectDB();
    const filter = roomId ? { roomId } : {};
    const reviews = await Review.find(filter)
      .populate("userId", "name image")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: "Reviews retrieved successfully",
      total: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error("get reviews error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}

// POST /api/reviews — create or update the caller's review for a room.
// Only guests with a non-cancelled booking for the room may review it.
export async function POST(request) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: please sign in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { roomId, rating, title, comment } = body || {};

    if (!roomId) {
      return NextResponse.json(
        { success: false, message: "roomId is required" },
        { status: 400 }
      );
    }
    const stars = Number(rating);
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
      return NextResponse.json(
        { success: false, message: "Rating must be a whole number between 1 and 5" },
        { status: 400 }
      );
    }
    if (!comment || !String(comment).trim()) {
      return NextResponse.json(
        { success: false, message: "Please write a review comment" },
        { status: 400 }
      );
    }

    await connectDB();

    const room = await Room.findById(roomId);
    if (!room) {
      return NextResponse.json(
        { success: false, message: "Room not found" },
        { status: 404 }
      );
    }

    // Verified-guest rule: must hold (or have held) a non-cancelled booking.
    const hasBooking = await Booking.exists({
      userId: auth.userId,
      roomId,
      status: { $in: ["CONFIRMED", "PENDING", "COMPLETED"] },
    });
    const verified = Boolean(hasBooking);
    if (!verified) {
      return NextResponse.json(
        {
          success: false,
          message: "You can only review a room you have booked. Complete a booking first.",
        },
        { status: 403 }
      );
    }

    const review = await Review.findOneAndUpdate(
      { roomId, userId: auth.userId },
      {
        $set: {
          rating: stars,
          title: String(title || "").trim(),
          comment: String(comment).trim(),
          verified,
        },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    await recomputeRoomRating(roomId);

    createActivityLog({
      auth,
      action: "review.created",
      entity: "review",
      entityId: review._id,
      description: `Review posted for ${room.title} — ${stars} star(s)`,
      meta: { reviewId: review._id, roomId, rating: stars },
    }).catch(() => {});

    return NextResponse.json(
      {
        success: true,
        statusCode: 200,
        message: "Review submitted successfully",
        data: review,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("create review error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
