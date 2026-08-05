import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Room } from "@/lib/models/Room";
import { getAuthUser, isAdmin } from "@/lib/auth";
import { createActivityLog } from "@/lib/activityLog";

// GET /api/rooms?search=&category=&minPrice=&maxPrice=&minGuests=&sort=&page=&limit=&checkIn=&checkOut=
// Server-side search, filter, sort and pagination.
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const category = searchParams.get("category");
    const minPrice = Number(searchParams.get("minPrice"));
    const maxPrice = Number(searchParams.get("maxPrice"));
    const minGuests = Number(searchParams.get("minGuests"));
    const sort = searchParams.get("sort") || "featured";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 9));
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");

    await connectDB();

    const match = {};

    if (category && category !== "All") match.category = category;

    if (Number.isFinite(minPrice) && minPrice > 0) match.rent = { ...(match.rent || {}), $gte: minPrice };
    if (Number.isFinite(maxPrice) && maxPrice > 0) match.rent = { ...(match.rent || {}), $lte: maxPrice };

    if (Number.isFinite(minGuests) && minGuests > 1) match.capacity = { $gte: minGuests };

    if (search) {
      const q = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      match.$or = [
        { title: q },
        { description: q },
        { facilities: { $elemMatch: q } },
      ];
    }

    const pipeline = [{ $match: match }];

    // Availability window filter: the room is only returned when none of its
    // unavailable (overnight) dates fall inside [checkIn, checkOut).
    if (checkIn && checkOut) {
      const from = new Date(`${checkIn}T00:00:00.000`);
      const to = new Date(`${checkOut}T00:00:00.000`);
      if (!isNaN(from) && !isNaN(to) && to > from) {
        pipeline.push({
          $addFields: {
            _conflicts: {
              $size: {
                $filter: {
                  input: { $ifNull: ["$unavailableDates", []] },
                  as: "d",
                  cond: {
                    $and: [{ $gte: ["$$d", from] }, { $lt: ["$$d", to] }],
                  },
                },
              },
            },
          },
        });
        pipeline.push({ $match: { _conflicts: 0 } });
        pipeline.push({ $project: { _conflicts: 0 } });
      }
    }

    // Counting pipeline (without sort/pagination).
    const countResult = await Room.aggregate([...pipeline, { $count: "total" }]);
    const total = countResult[0]?.total || 0;

    switch (sort) {
      case "price-asc":
        pipeline.push({ $sort: { rent: 1 } });
        break;
      case "price-desc":
        pipeline.push({ $sort: { rent: -1 } });
        break;
      case "rating":
        pipeline.push({ $sort: { rating: -1, reviews: -1 } });
        break;
      default:
        pipeline.push({ $sort: { createdAt: -1 } });
    }

    pipeline.push({ $skip: (page - 1) * limit }, { $limit: limit });

    const rooms = await Room.aggregate(pipeline);

    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: "Rooms retrieved successfully",
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      data: rooms,
    });
  } catch (error) {
    console.error("get rooms error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}

// POST /api/rooms — create a room (admin only)
export async function POST(request) {
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

    if (!title || !rent || !picture) {
      return NextResponse.json(
        { success: false, message: "Title, rent and picture are required" },
        { status: 400 }
      );
    }

    await connectDB();
    const room = await Room.create({
      title,
      rent: Number(rent),
      facilities: Array.isArray(facilities)
        ? facilities
        : String(facilities || "")
            .split(",")
            .map((f) => f.trim())
            .filter(Boolean),
      picture,
      category: category || "Basic",
      description: description || "",
      capacity: Number(capacity) || 2,
      size: Number(size) || 0,
      beds: beds || "1 Queen",
    });

    createActivityLog({
      auth,
      action: "room.created",
      entity: "room",
      entityId: room._id,
      description: `Room added — ${room.title} (${room.category}) · $${room.rent}/night`,
      meta: { roomId: room._id, title: room.title, rent: room.rent, category: room.category },
    }).catch(() => {});

    return NextResponse.json(
      { success: true, statusCode: 200, message: "Room created successfully", data: room },
      { status: 201 }
    );
  } catch (error) {
    console.error("create room error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
