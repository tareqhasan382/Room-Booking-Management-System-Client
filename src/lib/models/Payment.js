import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD" },
    method: { type: String, default: "card" },
    provider: { type: String, default: "sandbox" },
    status: {
      type: String,
      enum: ["PENDING", "SUCCEEDED", "FAILED", "REFUNDED"],
      default: "PENDING",
    },
    transactionId: { type: String, default: "" },
    providerRef: { type: String, default: "" },
    cardLast4: { type: String, default: "" },
    cardBrand: { type: String, default: "" },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

export const Payment =
  mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
