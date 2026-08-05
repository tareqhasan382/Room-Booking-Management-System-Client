import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Payment } from "@/lib/models/Payment";
import { getAuthUser, isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/admin/payments?page=&limit=&provider=&status=
// Admin billing view: every payment record with transaction + gateway info.
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

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 30));
    const provider = searchParams.get("provider");
    const status = searchParams.get("status");

    const match = {};
    if (provider) match.provider = provider;
    if (status) match.status = status;

    await connectDB();

    const [total, payments, summary] = await Promise.all([
      Payment.countDocuments(match),
      Payment.find(match)
        .populate("userId", "name email")
        .populate("roomId", "title category")
        .populate("bookingId", "checkInDate checkOutDate status")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Payment.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            amount: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    const summaryByStatus = {};
    summary.forEach((s) => {
      summaryByStatus[s._id] = { count: s.count, amount: s.amount };
    });

    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: "Payments retrieved successfully",
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      data: payments,
      summary: summaryByStatus,
    });
  } catch (error) {
    console.error("get payments error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
