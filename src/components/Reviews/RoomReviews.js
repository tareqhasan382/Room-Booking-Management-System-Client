"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/Hooks/AuthProvider";
import {
  useReviews,
  useCreateReview,
  useUpdateReview,
  useDeleteReview,
} from "@/Hooks/useReviews";
import { useToast } from "@/components/ui/ToastProvider";
import Rating from "@/components/ui/Rating";
import { format } from "date-fns";
import { parseFlexible } from "@/lib/date";
import {
  Star,
  MessageSquareQuote,
  BadgeCheck,
  Pencil,
  Trash2,
  Send,
  Loader2,
} from "lucide-react";

const STAR_LABELS = ["Poor", "Fair", "Good", "Very good", "Excellent"];

const inputCls =
  "w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-shadow";

const RoomReviews = ({ roomId, room }) => {
  const { user, token } = useAuth();
  const toast = useToast();
  const { isLoading, error, data: reviews = [] } = useReviews(roomId);

  const createMutation = useCreateReview(token);
  const updateMutation = useUpdateReview(token);
  const deleteMutation = useDeleteReview(token);

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [editingId, setEditingId] = useState(null);

  const myReview = reviews.find((r) => r.userId?._id === user?._id);

  // Pre-fill the form when the current user already has a review.
  useEffect(() => {
    if (myReview) {
      setRating(myReview.rating);
      setTitle(myReview.title || "");
      setComment(myReview.comment || "");
      setEditingId(myReview._id);
    } else {
      setRating(5);
      setTitle("");
      setComment("");
      setEditingId(null);
    }
  }, [myReview]);

  const handleSubmit = async () => {
    if (!user) {
      toast.info("Please sign in to leave a review");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please write a comment.");
      return;
    }
    try {
      if (editingId) {
        const res = await updateMutation.mutateAsync({
          id: editingId,
          roomId,
          payload: { rating, title: title.trim(), comment: comment.trim() },
        });
        if (res?.success) toast.success("Review updated!");
      } else {
        const res = await createMutation.mutateAsync({
          roomId,
          rating,
          title: title.trim(),
          comment: comment.trim(),
        });
        if (res?.success) {
          toast.success("Review submitted — thank you!");
        } else {
          toast.error(res?.message || "Could not submit review.");
        }
      }
    } catch (err) {
      toast.error(err?.message || "Could not submit review.");
    }
  };

  const handleDelete = async (review) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      const res = await deleteMutation.mutateAsync({ id: review._id, roomId });
      if (res?.success) toast.success("Review deleted");
      else toast.error(res?.message || "Could not delete review");
    } catch (err) {
      toast.error(err?.message || "Could not delete review");
    }
  };

  const isBusy =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <div className="w-full lg:w-4/5 mt-8">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 shadow border border-slate-100 dark:border-slate-700">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="flex-1">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <MessageSquareQuote className="w-5 h-5 text-sky-500" /> Guest Reviews
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Read what guests say about this room.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-3xl font-bold text-sky-500">
                {(room?.rating || 0).toFixed(1)}
              </p>
              <Rating value={room?.rating || 0} />
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {room?.reviews || 0} review{(room?.reviews || 0) === 1 ? "" : "s"}
            </div>
          </div>
        </div>

        {/* Review form */}
        {user && (
          <div className="rounded-xl bg-slate-50 dark:bg-slate-700 p-4 mb-6">
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHoverRating(n)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-0.5"
                >
                  <Star
                    className={`w-6 h-6 transition-colors ${
                      (hoverRating || rating) >= n
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300 dark:text-slate-500"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                {STAR_LABELS[(hoverRating || rating) - 1]}
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Review title (optional)"
              className={`${inputCls} mb-2`}
            />
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              className={`${inputCls} resize-none mb-3`}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">
                {editingId ? "You can update your review any time." : "Reviews are shown after you've booked this room."}
              </p>
              <button
                onClick={handleSubmit}
                disabled={isBusy}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold transition-colors disabled:opacity-50"
              >
                {isBusy ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {editingId ? "Update Review" : "Submit Review"}
              </button>
            </div>
          </div>
        )}

        {/* List */}
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="h-24 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse"
              />
            ))}
          </div>
        )}

        {error && <p className="text-red-400 text-sm">Error: {String(error)}</p>}

        {!isLoading && !error && reviews.length === 0 && (
          <div className="text-center py-10 text-gray-400 dark:text-gray-500">
            No reviews yet{user ? " — be the first to share your experience" : ""}.
          </div>
        )}

        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="border border-slate-100 dark:border-slate-700 rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 text-white flex items-center justify-center font-bold uppercase shrink-0">
                    {(review.userId?.name || "G")[0]}
                  </div>
                  <div>
                    <p className="font-semibold flex items-center gap-1.5">
                      {review.userId?.name || "Guest"}
                      {review.verified && (
                        <span
                          className="flex items-center gap-0.5 text-[10px] text-emerald-500 font-bold"
                          title="Verified guest"
                        >
                          <BadgeCheck className="w-3.5 h-3.5" /> Verified
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">
                      {review.createdAt
                        ? format(parseFlexible(review.createdAt), "MMM d, yyyy")
                        : ""}
                    </p>
                  </div>
                </div>
                {review.userId?._id === user?._id && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditingId(review._id);
                        setRating(review.rating);
                        setTitle(review.title || "");
                        setComment(review.comment || "");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950 transition-colors"
                      title="Edit review"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(review)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                      title="Delete review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-2 flex items-center gap-1">
                <Rating value={review.rating} />
              </div>
              {review.title && (
                <p className="mt-1.5 font-semibold">{review.title}</p>
              )}
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoomReviews;
