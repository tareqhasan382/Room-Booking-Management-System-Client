import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { signToken } from "@/lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return NextResponse.json(
        { success: false, statusCode: 401, message: "Invalid email or password", data: null },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { success: false, statusCode: 401, message: "Invalid email or password", data: null },
        { status: 401 }
      );
    }

    const token = signToken({ userId: user._id, email: user.email, role: user.role });

    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: "Logged in successfully",
      token,
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
    console.error("signin error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
