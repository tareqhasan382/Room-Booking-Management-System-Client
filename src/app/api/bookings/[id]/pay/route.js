import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Booking } from "@/lib/models/Booking";
import { Payment } from "@/lib/models/Payment";
import { getAuthUser } from "@/lib/auth";
import { chargePayment } from "@/lib/payments";
import { sendPaymentReceipt } from "@/lib/email";
import { createActivityLog } from "@/lib/activityLog";

export const dynamic = "force-dynamic";

// POST /api/bookings/[id]/pay — pay for a booking with a card.
export async function POST(request, { params }) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: please sign in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { card } = body || {};

    await connectDB();
    const booking = await Booking.findById(params.id);
    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    const isOwner = String(booking.userId) === String(auth.userId);
    const isAdminUser = auth.role === "ADMIN";
    if (!isOwner && !isAdminUser) {
      return NextResponse.json(
        { success: false, message: "You can only pay for your own bookings" },
        { status: 403 }
      );
    }

    if (booking.status === "CANCELLED") {
      return NextResponse.json(
        { success: false, message: "This booking is cancelled and can no longer be paid for" },
        { status: 400 }
      );
    }
    if (booking.paymentStatus === "PAID") {
      return NextResponse.json(
        { success: false, message: "This booking is already paid" },
        { status: 400 }
      );
    }

    if (!card || typeof card !== "object") {
      return NextResponse.json(
        { success: false, message: "Card details are required" },
        { status: 400 }
      );
    }

    const result = await chargePayment({
      amount: booking.totalAmount || 0,
      currency: "USD",
      card,
    });

    if (!result.success) {
      // Record the failed attempt for the audit trail.
      await Payment.create({
        bookingId: booking._id,
        userId: booking.userId,
        roomId: booking.roomId,
        amount: booking.totalAmount || 0,
        currency: "USD",
        status: "FAILED",
        transactionId: `failed_${Date.now()}`,
        cardLast4: String(card.number || "").replace(/\D/g, "").slice(-4),
        cardBrand: result.cardBrand || "",
      });
      createActivityLog({
        auth,
        action: "payment.failed",
        entity: "payment",
        entityId: booking._id,
        description: `Payment failed — ${booking.roomId ? "booking" : ""} ${booking._id}`,
        meta: {
          bookingId: booking._id,
          amount: booking.totalAmount || 0,
          provider: result.provider || "sandbox",
          reason: result.message,
          cardLast4: String(card.number || "").replace(/\D/g, "").slice(-4),
        },
      }).catch(() => {});
      return NextResponse.json(
        { success: false, message: result.message || "Payment failed" },
        { status: 402 }
      );
    }

    const payment = await Payment.create({
      bookingId: booking._id,
      userId: booking.userId,
      roomId: booking.roomId,
      amount: result.amount,
      currency: result.currency,
      method: "card",
      provider: result.provider || "sandbox",
      status: "SUCCEEDED",
      transactionId: result.transactionId,
      providerRef: result.transactionId,
      cardLast4: result.cardLast4,
      cardBrand: result.cardBrand,
      paidAt: new Date(),
    });

    booking.paymentStatus = "PAID";
    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate("userId", "name email phone")
      .populate("roomId");

    sendPaymentReceipt(
      payment.toObject(),
      populated.toObject()
    ).catch(() => {});
    createActivityLog({
      auth,
      action: "payment.succeeded",
      entity: "payment",
      entityId: payment._id,
      description: `Payment received — ${populated.roomId?.title || "Room"} · $${payment.amount.toFixed(2)} · ${payment.transactionId}`,
      meta: {
        bookingId: booking._id,
        paymentId: payment._id,
        amount: payment.amount,
        currency: payment.currency,
        provider: payment.provider,
        transactionId: payment.transactionId,
        cardBrand: payment.cardBrand,
        cardLast4: payment.cardLast4,
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: "Payment successful — your booking is confirmed",
      data: { booking: populated, payment },
    });
  } catch (error) {
    console.error("pay booking error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
