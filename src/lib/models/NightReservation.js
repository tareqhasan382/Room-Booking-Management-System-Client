import mongoose from "mongoose";

const nightReservationSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    nightDate: { type: Date, required: true }, // midnight of an overnight date
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
  },
  { timestamps: true }
);

// The atomic guard against double booking: only one reservation may exist for
// a (room, night) pair. Two concurrent bookings for an overlapping night will
// race to insert this document and exactly one wins — the loser aborts with a
// duplicate-key (E11000) error, which the API surfaces as a 409.
nightReservationSchema.index({ roomId: 1, nightDate: 1 }, { unique: true });

export const NightReservation =
  mongoose.models.NightReservation ||
  mongoose.model("NightReservation", nightReservationSchema);
