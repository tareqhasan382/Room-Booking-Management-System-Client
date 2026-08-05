import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { getAuthUser, isAdmin } from "@/lib/auth";
import { createActivityLog } from "@/lib/activityLog";

// PATCH /api/users/[id] — update a user's role (admin only)
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
    const { role } = body || {};

    if (!role || !["ADMIN", "USER"].includes(role)) {
      return NextResponse.json(
        { success: false, message: "Role must be ADMIN or USER" },
        { status: 400 }
      );
    }

    // Never let an admin demote themselves (prevents lockout).
    if (String(params.id) === String(auth.userId)) {
      return NextResponse.json(
        { success: false, message: "You cannot change your own role" },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findByIdAndUpdate(
      params.id,
      { role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    createActivityLog({
      auth,
      action: "user.role_changed",
      entity: "user",
      entityId: user._id,
      description: `Role changed — ${user.name || user.email} is now ${user.role}`,
      meta: { userId: user._id, targetEmail: user.email, role: user.role },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: "User role updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("update user role error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
