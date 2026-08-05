import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Booking } from "@/lib/models/Booking";
import { getAuthUser } from "@/lib/auth";
import { verifyStripeSession } from "@/lib/payments";
import { fulfillPayment } from "@/lib/paymentFulfillment";
import { createActivityLog } from "@/lib/activityLog";

export const dynamic = "force-dynamic";

// GET /api/payments/verify?session_id=xxx — confirm a Stripe session after the
// user is redirected back to /order. Also powers the webhook-less dev flow.
export async function GET(request) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: please sign in" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "session_id is required" },
        { status: 400 }
      );
    }

    const result = await verifyStripeSession(sessionId);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: "Payment has not been completed", status: result.status },
        { status: 402 }
      );
    }

    await connectDB();
    const booking = await Booking.findById(result.bookingId);
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
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    const { booking: updated, payment, alreadyPaid } = await fulfillPayment({
      bookingId: booking._id,
      amount: result.amount,
      currency: result.currency?.toUpperCase() || "USD",
      transactionId: result.transactionId,
      providerRef: sessionId,
      cardLast4: result.cardLast4,
      cardBrand: result.cardBrand,
      provider: "stripe",
    });

    if (!alreadyPaid) {
      createActivityLog({
        auth,
        action: "payment.succeeded",
        entity: "payment",
        entityId: payment?._id,
        description: `Stripe payment received — $${result.amount.toFixed(2)} · ${result.transactionId}`,
        meta: {
          bookingId: booking._id,
          paymentId: payment?._id,
          amount: result.amount,
          currency: result.currency,
          provider: "stripe",
          transactionId: result.transactionId,
          sessionId,
          cardBrand: result.cardBrand,
          cardLast4: result.cardLast4,
        },
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: alreadyPaid ? "Payment was already confirmed" : "Payment confirmed",
      data: { booking: updated, payment, alreadyPaid },
    });
  } catch (error) {
    console.error("verify payment error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
