import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ActivityLog } from "@/lib/models/ActivityLog";
import { getAuthUser, isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/admin/logs?page=&limit=&action=&entity=&search=
// Admin-only, newest first.
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
    const action = searchParams.get("action");
    const entity = searchParams.get("entity");
    const search = searchParams.get("search")?.trim();

    const match = {};
    if (action) match.action = action;
    if (entity) match.entity = entity;
    if (search) {
      const q = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      match.$or = [{ actorEmail: q }, { actorName: q }, { description: q }];
    }

    await connectDB();
    const [total, logs] = await Promise.all([
      ActivityLog.countDocuments(match),
      ActivityLog.find(match)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: "Activity logs retrieved successfully",
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      data: logs,
    });
  } catch (error) {
    console.error("get activity logs error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
