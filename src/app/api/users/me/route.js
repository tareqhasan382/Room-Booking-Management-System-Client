import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// PATCH /api/users/me — update the signed-in user's profile
export async function PATCH(request) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: please sign in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, phone, address, image } = body || {};

    await connectDB();
    const user = await User.findById(auth.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (name !== undefined) user.name = String(name).trim() || user.name;
    if (phone !== undefined) user.phone = String(phone).trim();
    if (address !== undefined) user.address = String(address).trim();
    if (image !== undefined) user.image = String(image).trim() || undefined;

    await user.save();

    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: "Profile updated successfully",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image || null,
        phone: user.phone || "",
        address: user.address || "",
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("update profile error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
