import { NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/db";
import { fulfillPayment } from "@/lib/paymentFulfillment";
import { createActivityLog } from "@/lib/activityLog";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// POST /api/webhooks/stripe — verifies Stripe events server-side.
// Production uses this to mark bookings paid; the verify route covers local
// dev where the webhook can't be reached by Stripe.
export async function POST(request) {
  try {
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json(
        { success: false, message: "Missing stripe-signature header" },
        { status: 400 }
      );
    }
    if (!SECRET || !process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { success: false, message: "Stripe webhook secret not configured" },
        { status: 400 }
      );
    }

    const body = await request.text();
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, SECRET);
    } catch (err) {
      console.error("stripe webhook signature error:", err.message);
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 400 }
      );
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;
      if (bookingId) {
        await connectDB();
        const { payment, alreadyPaid } = await fulfillPayment({
          bookingId,
          amount: (session.amount_total || 0) / 100,
          currency: (session.currency || "usd").toUpperCase(),
          transactionId: session.payment_intent || session.id,
          providerRef: session.id,
          provider: "stripe",
        });
        if (!alreadyPaid) {
          createActivityLog({
            auth: {
              userId: session.metadata?.userId,
              email: session.customer_email || "stripe-webhook",
              role: "SYSTEM",
            },
            action: "payment.succeeded",
            entity: "payment",
            entityId: payment?._id,
            description: `Stripe webhook payment received — $${((session.amount_total || 0) / 100).toFixed(2)} · ${session.payment_intent || session.id}`,
            meta: {
              bookingId,
              paymentId: payment?._id,
              amount: (session.amount_total || 0) / 100,
              currency: session.currency,
              provider: "stripe",
              transactionId: session.payment_intent || session.id,
              sessionId: session.id,
            },
          }).catch(() => {});
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("stripe webhook error:", error);
    return NextResponse.json(
      { success: false, message: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
