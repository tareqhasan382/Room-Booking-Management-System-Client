import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Booking } from "@/lib/models/Booking";
import { getAuthUser } from "@/lib/auth";
import { createStripeCheckoutSession, getPaymentProvider, GATEWAY } from "@/lib/payments";

export const dynamic = "force-dynamic";

// GET /api/payments/checkout — gateway configuration for the client UI
export async function GET(request) {
  const auth = await getAuthUser(request);
  return NextResponse.json({
    success: true,
    statusCode: 200,
    message: "Payment gateway configuration",
    data: {
      gateway: getPaymentProvider(),
      authenticated: Boolean(auth),
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || null,
    },
  });
}

// POST /api/payments/checkout — start Stripe Checkout for a booking
export async function POST(request) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: please sign in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bookingId } = body || {};
    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: "bookingId is required" },
        { status: 400 }
      );
    }

    if (GATEWAY !== "stripe") {
      return NextResponse.json(
        {
          success: false,
          message: "Stripe is not configured. Set STRIPE_SECRET_KEY in your environment.",
        },
        { status: 400 }
      );
    }

    await connectDB();
    const booking = await Booking.findById(bookingId)
      .populate("roomId")
      .populate("userId", "name email");
    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    const isOwner =
      String(booking.userId?._id || booking.userId) === String(auth.userId);
    if (!isOwner && auth.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "You can only pay for your own bookings" },
        { status: 403 }
      );
    }
    if (booking.status === "CANCELLED") {
      return NextResponse.json(
        { success: false, message: "This booking is cancelled" },
        { status: 400 }
      );
    }
    if (booking.paymentStatus === "PAID") {
      return NextResponse.json(
        { success: false, message: "This booking is already paid" },
        { status: 400 }
      );
    }

    const session = await createStripeCheckoutSession({
      booking,
      guest: { email: booking.contactEmail || booking.userId?.email },
    });

    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: "Checkout session created",
      data: {
        url: session.url,
        sessionId: session.id,
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        gateway: getPaymentProvider(),
      },
    });
  } catch (error) {
    console.error("create checkout error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to start checkout" },
      { status: 500 }
    );
  }
}
