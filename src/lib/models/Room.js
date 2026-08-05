import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    rent: { type: Number, required: true },
    facilities: { type: [String], required: true },
    picture: { type: String, required: true },
    unavailableDates: { type: [Date], default: [] },
    category: {
      type: String,
      enum: ["Basic", "Luxury", "Suite"],
      default: "Basic",
    },
    description: { type: String, default: "" },
    capacity: { type: Number, default: 2 },
    size: { type: Number, default: 0 },
    beds: { type: String, default: "1 Queen" },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Room =
  mongoose.models.Room || mongoose.model("Room", roomSchema);
