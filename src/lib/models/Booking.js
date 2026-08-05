import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    // checkInDate / checkOutDate store the full instant (date + time).
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    // Human-readable time selectors in 24h "HH:mm" format.
    checkInTime: { type: String, default: "14:00" },
    checkOutTime: { type: String, default: "11:00" },
    guests: { type: Number, default: 1, min: 1, max: 20 },
    contactName: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
    contactPhone: { type: String, default: "" },
    specialRequests: { type: String, default: "" },
    nights: { type: Number, default: 1, min: 1 },
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ["UNPAID", "PAID", "REFUNDED"],
      default: "UNPAID",
    },
    status: {
      type: String,
      enum: ["CONFIRMED", "PENDING", "CANCELLED", "COMPLETED"],
      default: "CONFIRMED",
    },
  },
  { timestamps: true }
);

export const Booking =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
