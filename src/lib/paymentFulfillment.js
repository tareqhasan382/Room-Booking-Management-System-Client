import { Payment } from "./models/Payment";
import { Booking } from "./models/Booking";
import { sendPaymentReceipt } from "./email";

/**
 * Marks a booking as paid and records the successful payment.
 * Shared by the Stripe verification route and the webhook so both paths are
 * idempotent (a repeat call is a no-op).
 */
export async function fulfillPayment({
  bookingId,
  amount,
  currency = "USD",
  transactionId,
  providerRef = "",
  cardLast4 = "",
  cardBrand = "",
  provider = "stripe",
}) {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error("Booking not found");
  if (booking.paymentStatus === "PAID") {
    const existing = await Payment.findOne({ bookingId }).sort({ createdAt: -1 });
    return { booking, payment: existing, alreadyPaid: true };
  }

  const payment = await Payment.create({
    bookingId: booking._id,
    userId: booking.userId,
    roomId: booking.roomId,
    amount,
    currency,
    method: "card",
    provider,
    status: "SUCCEEDED",
    transactionId,
    providerRef,
    cardLast4,
    cardBrand,
    paidAt: new Date(),
  });

  booking.paymentStatus = "PAID";
  await booking.save();

  const populated = await Booking.findById(booking._id)
    .populate("userId", "name email phone")
    .populate("roomId");

  sendPaymentReceipt(payment.toObject(), populated.toObject()).catch(() => {});

  return { booking: populated, payment, alreadyPaid: false };
}
