import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { createActivityLog } from "@/lib/activityLog";

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password } = body || {};

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Name, email and password are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { success: false, statusCode: 400, message: "Email already exists", data: email },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ name, email, password: hashed });

    createActivityLog({
      action: "auth.signup",
      entity: "user",
      entityId: user._id,
      description: `New account created — ${user.name} (${user.email})`,
      meta: { userId: user._id, email: user.email, role: user.role },
    }).catch(() => {});

    return NextResponse.json(
      {
        success: true,
        statusCode: 200,
        message: "User registered successfully",
        data: { _id: user._id, name: user.name, email: user.email, role: user.role },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("signup error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
