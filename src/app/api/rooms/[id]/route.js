import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Room } from "@/lib/models/Room";
import { Review } from "@/lib/models/Review";
import { getAuthUser, isAdmin } from "@/lib/auth";
import { createActivityLog } from "@/lib/activityLog";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const room = await Room.findById(params.id);
    if (!room) {
      return NextResponse.json(
        { success: false, message: "Room not found" },
        { status: 404 }
      );
    }

    const reviews = await Review.find({ roomId: params.id })
      .populate("userId", "name image")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: "Room retrieved successfully",
      data: { ...room.toObject(), reviewsList: reviews },
    });
  } catch (error) {
    console.error("get room error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}

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
    const { title, rent, facilities, picture, category, description, capacity, size, beds } = body || {};

    await connectDB();
    const room = await Room.findByIdAndUpdate(
      params.id,
      {
        ...(title !== undefined && { title }),
        ...(rent !== undefined && { rent: Number(rent) }),
        ...(facilities !== undefined && {
          facilities: Array.isArray(facilities)
            ? facilities
            : String(facilities)
                .split(",")
                .map((f) => f.trim())
                .filter(Boolean),
        }),
        ...(picture !== undefined && { picture }),
        ...(category !== undefined && { category }),
        ...(description !== undefined && { description }),
        ...(capacity !== undefined && { capacity: Number(capacity) }),
        ...(size !== undefined && { size: Number(size) }),
        ...(beds !== undefined && { beds }),
      },
      { new: true, runValidators: true }
    );

    if (!room) {
      return NextResponse.json(
        { success: false, message: "Room not found" },
        { status: 404 }
      );
    }

    createActivityLog({
      auth,
      action: "room.updated",
      entity: "room",
      entityId: room._id,
      description: `Room updated — ${room.title} (${room.category}) · $${room.rent}/night`,
      meta: { roomId: room._id, title: room.title, rent: room.rent, category: room.category },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: "Room updated successfully",
      data: room,
    });
  } catch (error) {
    console.error("update room error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
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
    const room = await Room.findByIdAndDelete(params.id);
    if (!room) {
      return NextResponse.json(
        { success: false, message: "Room not found" },
        { status: 404 }
      );
    }
    createActivityLog({
      auth,
      action: "room.deleted",
      entity: "room",
      entityId: params.id,
      description: `Room deleted — ${room.title}`,
      meta: { roomId: params.id, title: room.title },
    }).catch(() => {});
    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: "Room deleted successfully",
      data: room,
    });
  } catch (error) {
    console.error("delete room error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
