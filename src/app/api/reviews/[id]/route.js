import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Review } from "@/lib/models/Review";
import { getAuthUser, isAdmin } from "@/lib/auth";
import { recomputeRoomRating } from "@/lib/reviews";
import { createActivityLog } from "@/lib/activityLog";

// PATCH /api/reviews/[id] — edit the review (owner only)
export async function PATCH(request, { params }) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: please sign in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { rating, title, comment } = body || {};

    await connectDB();
    const review = await Review.findById(params.id);
    if (!review) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }
    if (String(review.userId) !== String(auth.userId)) {
      return NextResponse.json(
        { success: false, message: "You can only edit your own reviews" },
        { status: 403 }
      );
    }

    const stars = rating !== undefined ? Number(rating) : review.rating;
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
      return NextResponse.json(
        { success: false, message: "Rating must be a whole number between 1 and 5" },
        { status: 400 }
      );
    }

    review.rating = stars;
    if (title !== undefined) review.title = String(title).trim();
    if (comment !== undefined) {
      if (!String(comment).trim()) {
        return NextResponse.json(
          { success: false, message: "Please write a review comment" },
          { status: 400 }
        );
      }
      review.comment = String(comment).trim();
    }
    await review.save();

    await recomputeRoomRating(review.roomId);

    createActivityLog({
      auth,
      action: "review.updated",
      entity: "review",
      entityId: review._id,
      description: `Review updated — ${stars} star(s)`,
      meta: { reviewId: review._id, roomId: review.roomId, rating: stars },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: "Review updated successfully",
      data: review,
    });
  } catch (error) {
    console.error("update review error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews/[id] — remove the review (owner or admin)
export async function DELETE(request, { params }) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: please sign in" },
        { status: 401 }
      );
    }

    await connectDB();
    const review = await Review.findById(params.id);
    if (!review) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }
    if (String(review.userId) !== String(auth.userId) && !isAdmin(auth)) {
      return NextResponse.json(
        { success: false, message: "You can only delete your own reviews" },
        { status: 403 }
      );
    }

    const roomId = review.roomId;
    await Review.findByIdAndDelete(params.id);
    await recomputeRoomRating(roomId);

    createActivityLog({
      auth,
      action: "review.deleted",
      entity: "review",
      entityId: params.id,
      description: `Review deleted — ${review.rating} star(s)`,
      meta: { reviewId: params.id, roomId, rating: review.rating },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: "Review deleted successfully",
      data: { _id: params.id },
    });
  } catch (error) {
    console.error("delete review error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
