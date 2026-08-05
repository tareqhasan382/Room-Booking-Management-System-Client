import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Booking } from "@/lib/models/Booking";
import { getAuthUser } from "@/lib/auth";
import { generateInvoicePdf } from "@/lib/invoice";

export const dynamic = "force-dynamic";

// GET /api/bookings/[id]/invoice — returns the PDF invoice (owner or admin)
export async function GET(request, { params }) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: please sign in" },
        { status: 401 }
      );
    }

    await connectDB();
    const booking = await Booking.findById(params.id)
      .populate("userId", "name email phone")
      .populate("roomId");
    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    const ownerId = booking.userId?._id ? booking.userId._id : booking.userId;
    const isOwner = String(ownerId) === String(auth.userId);
    const isAdminUser = auth.role === "ADMIN";
    if (!isOwner && !isAdminUser) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    const pdf = await generateInvoicePdf(booking);

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${booking._id}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("generate invoice error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate invoice" },
      { status: 500 }
    );
  }
}
