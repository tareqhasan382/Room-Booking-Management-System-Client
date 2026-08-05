import mongoose from "mongoose";
import { Room } from "./models/Room";
import { Review } from "./models/Review";

/**
 * Recomputes a room's average rating + review count from its reviews.
 * Rooms with no reviews fall back to a 0 rating / 0 count.
 */
export async function recomputeRoomRating(roomId) {
  const agg = await Review.aggregate([
    { $match: { roomId: new mongoose.Types.ObjectId(roomId) } },
    {
      $group: {
        _id: null,
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const row = agg[0];
  await Room.findByIdAndUpdate(roomId, {
    rating: row ? Math.round(row.avg * 10) / 10 : 0,
    reviews: row ? row.count : 0,
  });

  return row ? { rating: Math.round(row.avg * 10) / 10, reviews: row.count } : { rating: 0, reviews: 0 };
}
