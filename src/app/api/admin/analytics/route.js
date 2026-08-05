import { NextResponse } from "next/server";
import { subDays, format, startOfDay } from "date-fns";
import { connectDB } from "@/lib/db";
import { Booking } from "@/lib/models/Booking";
import { Room } from "@/lib/models/Room";
import { User } from "@/lib/models/User";
import { Payment } from "@/lib/models/Payment";
import { getAuthUser, isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/admin/analytics — KPI + chart data for the admin dashboard
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

    const [rooms, users, totalBookings, revenueAgg, statusAgg, topRooms, recent] =
      await Promise.all([
        Room.countDocuments(),
        User.countDocuments(),
        Booking.countDocuments(),
        Booking.aggregate([
          {
            $match: {
              paymentStatus: "PAID",
              status: { $ne: "CANCELLED" },
            },
          },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]),
        Booking.aggregate([
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
        Booking.aggregate([
          { $match: { status: { $ne: "CANCELLED" } } },
          {
            $group: {
              _id: "$roomId",
              bookings: { $sum: 1 },
              revenue: { $sum: "$totalAmount" },
            },
          },
          { $sort: { revenue: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: "rooms",
              localField: "_id",
              foreignField: "_id",
              as: "room",
            },
          },
          {
            $project: {
              _id: 1,
              bookings: 1,
              revenue: 1,
              room: { $arrayElemAt: ["$room", 0] },
            },
          },
        ]),
        Booking.find()
          .populate("userId", "name email")
          .populate("roomId", "title category")
          .sort({ createdAt: -1 })
          .limit(8),
      ]);

    // Revenue per day for the last 14 days, driven by the payments ledger.
    const since = startOfDay(subDays(new Date(), 13));
    const paidPayments = await Payment.aggregate([
      { $match: { status: "SUCCEEDED", paidAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$paidAt" } },
          amount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);
    const byDay = {};
    paidPayments.forEach((r) => {
      byDay[r._id] = { amount: r.amount, count: r.count };
    });
    const revenueLast14Days = [];
    for (let i = 13; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const key = format(d, "yyyy-MM-dd");
      revenueLast14Days.push({
        date: format(d, "MMM d"),
        amount: byDay[key]?.amount || 0,
        count: byDay[key]?.count || 0,
      });
    }

    // Bookings per room category (non-cancelled).
    const categoryAgg = await Booking.aggregate([
      { $match: { status: { $ne: "CANCELLED" } } },
      {
        $lookup: {
          from: "rooms",
          localField: "roomId",
          foreignField: "_id",
          as: "room",
        },
      },
      {
        $group: {
          _id: { $arrayElemAt: ["$room.category", 0] },
          count: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const bookingsByStatus = {
      CONFIRMED: 0,
      PENDING: 0,
      CANCELLED: 0,
      COMPLETED: 0,
    };
    statusAgg.forEach((s) => {
      if (s._id in bookingsByStatus) bookingsByStatus[s._id] = s.count;
    });

    const paidRevenue = revenueAgg[0]?.total || 0;

    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: "Analytics retrieved successfully",
      data: {
        totals: {
          rooms,
          users,
          bookings: totalBookings,
          revenue: paidRevenue,
          avgRating: 0,
        },
        bookingsByStatus,
        revenueLast14Days,
        categoryBreakdown: categoryAgg,
        topRooms: topRooms.map((t) => ({
          _id: t._id,
          title: t.room?.title || "Room",
          category: t.room?.category || "—",
          bookings: t.bookings,
          revenue: t.revenue,
        })),
        recentBookings: recent,
      },
    });
  } catch (error) {
    console.error("get analytics error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
