"use client";
import { useAuth } from "@/Hooks/AuthProvider";
import { useBookings, useCancelBooking } from "@/Hooks/useBookings";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useRef } from "react";
import { format, differenceInCalendarDays } from "date-fns";
import { useToast } from "@/components/ui/ToastProvider";
import { Skeleton } from "@/components/ui/Skeleton";
import { downloadInvoice, verifyPaymentSession } from "@/lib/api";
import PaymentModal from "@/components/PaymentModal";
import {
  CalendarX2,
  PackageOpen,
  Clock,
  Users,
  Printer,
  Eye,
  X,
  CreditCard,
  FileDown,
  Loader2,
} from "lucide-react";
import { parseFlexible, formatTimeDisplay } from "@/lib/date";

const STATUS_TABS = ["All", "CONFIRMED", "PENDING", "CANCELLED", "COMPLETED"];

const statusStyles = {
  CONFIRMED: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
  COMPLETED: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
};

const paymentStyles = {
  PAID: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200",
  UNPAID: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  REFUNDED: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200",
};

const printReceipt = (order) => {
  const checkIn = parseFlexible(order.checkInDate);
  const checkOut = parseFlexible(order.checkOutDate);
  const fmt = (d, withTime) =>
    d instanceof Date
      ? `${format(d, "EEEE, MMMM d, yyyy")}${withTime ? "" : ""}`
      : "";
  const win = window.open("", "_blank", "width=720,height=900");
  if (!win) return;
  win.document.write(`<!doctype html>
<html>
<head>
  <title>Booking Receipt ${order._id}</title>
  <style>
    body{font-family:Arial,Helvetica,sans-serif;color:#111;max-width:640px;margin:0 auto;padding:40px 24px}
    h1{font-size:22px;margin:0 0 4px}.muted{color:#666;font-size:13px}
    .brand{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #0ea5e9;padding-bottom:12px;margin-bottom:24px}
    .section{border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin-bottom:16px}
    .section h2{font-size:13px;text-transform:uppercase;letter-spacing:.05em;color:#0ea5e9;margin:0 0 12px}
    .row{display:flex;justify-content:space-between;padding:4px 0;font-size:14px}
    .row.total{border-top:2px solid #0ea5e9;margin-top:8px;padding-top:10px;font-weight:700;font-size:16px}
    .tag{display:inline-block;padding:2px 10px;border-radius:999px;font-size:12px;font-weight:600}
    table{width:100%;font-size:14px} td{padding:4px 0;vertical-align:top}
    .center{text-align:center;color:#666;font-size:12px;margin-top:24px}
  </style>
</head>
<body>
  <div class="brand">
    <div><h1>Room Booking & Management</h1><div class="muted">Booking Receipt</div></div>
    <div class="tag" style="background:#dcfce7;color:#15803d">${order.status}</div>
  </div>

  <div class="section">
    <h2>Booking</h2>
    <div class="row"><span class="muted">Booking ID</span><span>${order._id}</span></div>
    <div class="row"><span class="muted">Room</span><span>${order.roomId?.title || "—"}</span></div>
    <div class="row"><span class="muted">Category</span><span>${order.roomId?.category || "—"}</span></div>
    <div class="row"><span class="muted">Check-in</span><span>${fmt(checkIn)} · ${formatTimeDisplay(order.checkInTime)}</span></div>
    <div class="row"><span class="muted">Check-out</span><span>${fmt(checkOut)} · ${formatTimeDisplay(order.checkOutTime)}</span></div>
    <div class="row"><span class="muted">Guests</span><span>${order.guests || 1}</span></div>
  </div>

  <div class="section">
    <h2>Guest</h2>
    <div class="row"><span class="muted">Name</span><span>${order.contactName || order.userId?.name || "—"}</span></div>
    <div class="row"><span class="muted">Email</span><span>${order.contactEmail || order.userId?.email || "—"}</span></div>
    <div class="row"><span class="muted">Phone</span><span>${order.contactPhone || "—"}</span></div>
    ${order.specialRequests ? `<div class="row"><span class="muted">Requests</span><span>${order.specialRequests}</span></div>` : ""}
  </div>

  <div class="section">
    <h2>Payment</h2>
    <div class="row"><span class="muted">Nights</span><span>${order.nights || "—"}</span></div>
    <div class="row"><span class="muted">Subtotal</span><span>$${(order.subtotal ?? 0).toFixed(2)}</span></div>
    <div class="row"><span class="muted">Taxes &amp; fees</span><span>$${(order.tax ?? 0).toFixed(2)}</span></div>
    <div class="row total"><span>Total</span><span>$${(order.totalAmount ?? 0).toFixed(2)}</span></div>
    <div class="row" style="margin-top:8px"><span class="muted">Payment</span><span>${order.paymentStatus || "UNPAID"}</span></div>
  </div>

  <p class="center">Thank you for choosing Room Booking &amp; Management.<br/>For help call +880 1989-342794 or email support@roombook.com</p>
  <script>window.onload=function(){window.print()}</script>
</body>
</html>`);
  win.document.close();
};

const Order = () => {
  const { token, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const cancelMutation = useCancelBooking(token);
  const [confirmId, setConfirmId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [receipt, setReceipt] = useState(null);
  const [payBooking, setPayBooking] = useState(null);
  const [downloading, setDownloading] = useState(null);
  const verifiedRef = useRef(false);

  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
    }
  }, [token, router]);

  const { isLoading, error, data: orders = [], refetch } = useBookings(token);

  // Handle the redirect back from Stripe Checkout.
  useEffect(() => {
    if (!token || !searchParams || verifiedRef.current) return;
    const checkout = searchParams.get("checkout");
    const sessionId = searchParams.get("session_id");
    if (checkout === "success" && sessionId) {
      verifiedRef.current = true;
      (async () => {
        try {
          const res = await verifyPaymentSession(sessionId, token);
          if (res?.success) {
            toast.success("Payment confirmed — booking is now paid!");
          } else {
            toast.info(res?.message || "Payment could not be confirmed yet.");
          }
        } catch (err) {
          toast.error(err?.message || "Could not confirm payment.");
        } finally {
          refetch();
          router.replace("/order");
        }
      })();
    }
  }, [token, searchParams, toast, refetch, router]);

  const handleDownloadInvoice = async (booking) => {
    setDownloading(booking._id);
    try {
      const blob = await downloadInvoice(booking._id, token);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${booking._id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Invoice downloaded");
    } catch (err) {
      toast.error(err?.message || "Failed to download invoice");
    } finally {
      setDownloading(null);
    }
  };

  const filtered = useMemo(() => {
    if (statusFilter === "All") return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  const handleCancel = async (booking) => {
    setConfirmId(null);
    try {
      const result = await cancelMutation.mutateAsync(booking._id);
      if (result?.success) {
        toast.success(`Booking for "${booking.roomId?.title}" cancelled.`);
      }
    } catch (err) {
      toast.error(`Failed to cancel: ${err?.message || err}`);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {user ? `Signed in as ${user.name}` : "Sign in required"} ·{" "}
            {orders.length} booking{orders.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                statusFilter === s
                  ? "bg-sky-500 border-sky-500 text-white"
                  : "border-slate-300 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:border-sky-400"
              }`}
            >
              {s === "All" ? "All" : s[0] + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-36 rounded-xl" />
          ))}
        </div>
      )}

      {error && (
        <div className="font-bold text-red-400">Error: {String(error)}</div>
      )}

      {!isLoading && !error && orders.length === 0 && (
        <div className="w-full py-20 flex flex-col items-center text-center bg-slate-50 dark:bg-slate-800 rounded-2xl">
          <PackageOpen className="w-16 h-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold">No bookings yet</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">
            Browse our rooms and book your first stay.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg transition-colors"
          >
            Explore Rooms
          </button>
        </div>
      )}

      {!isLoading && !error && orders.length > 0 && filtered.length === 0 && (
        <div className="w-full py-16 text-center text-gray-500 dark:text-gray-400">
          No {statusFilter === "All" ? "" : statusFilter.toLowerCase() + " "}bookings
          found.
        </div>
      )}

      {!isLoading &&
        !error &&
        filtered.length > 0 &&
        filtered.map((order) => {
          const checkIn = parseFlexible(order.checkInDate);
          const checkOut = parseFlexible(order.checkOutDate);
          const nights =
            checkIn instanceof Date && checkOut instanceof Date
              ? differenceInCalendarDays(checkOut, checkIn)
              : order.nights || 1;
          const cancelled = order.status === "CANCELLED";

          return (
            <div
              key={order._id}
              className="flex flex-col md:flex-row bg-white dark:bg-slate-800 rounded-2xl shadow border border-slate-100 dark:border-slate-700 overflow-hidden mb-4"
            >
              <div className="relative md:w-44 h-40 md:h-auto shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={order.roomId?.picture}
                  alt={order.roomId?.title}
                  className="w-full h-full object-cover"
                />
                <span
                  className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold ${
                    statusStyles[order.status] || statusStyles.PENDING
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="flex-1 p-5">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-lg font-bold">{order.roomId?.title || "Room"}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Booking #{order._id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-sky-500">
                      ${(order.totalAmount ?? 0).toFixed(2)}
                    </p>
                    <span
                      className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        paymentStyles[order.paymentStatus] || paymentStyles.UNPAID
                      }`}
                    >
                      {order.paymentStatus || "UNPAID"}
                    </span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Check-in</p>
                    <p className="font-medium">
                      {checkIn instanceof Date ? format(checkIn, "MMM d, yyyy") : "—"}
                      <span className="block text-xs text-gray-500 dark:text-gray-400">
                        {formatTimeDisplay(order.checkInTime)}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Check-out</p>
                    <p className="font-medium">
                      {checkOut instanceof Date ? format(checkOut, "MMM d, yyyy") : "—"}
                      <span className="block text-xs text-gray-500 dark:text-gray-400">
                        {formatTimeDisplay(order.checkOutTime)}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Details</p>
                    <p className="font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {nights} night{nights === 1 ? "" : "s"}
                    </p>
                    <p className="font-medium flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {order.guests || 1} guest
                      {order.guests === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>

                {order.specialRequests && (
                  <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    Requests: {order.specialRequests}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-end gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                  {order.paymentStatus === "UNPAID" && !cancelled && (
                    <button
                      onClick={() => setPayBooking(order)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors shadow shadow-emerald-500/25"
                    >
                      <CreditCard className="w-3.5 h-3.5" /> Pay Now
                    </button>
                  )}
                  <button
                    onClick={() => handleDownloadInvoice(order)}
                    disabled={downloading === order._id}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    {downloading === order._id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <FileDown className="w-3.5 h-3.5" />
                    )}{" "}
                    Invoice
                  </button>
                  <button
                    onClick={() => setReceipt(order)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                  <button
                    onClick={() => printReceipt(order)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" /> Receipt
                  </button>
                  {!cancelled && confirmId !== order._id && (
                    <button
                      onClick={() => setConfirmId(order._id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-400 text-red-500 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                    >
                      <CalendarX2 className="w-3.5 h-3.5" /> Cancel
                    </button>
                  )}
                  {!cancelled && confirmId === order._id && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-500">Cancel this booking?</span>
                      <button
                        onClick={() => handleCancel(order)}
                        disabled={cancelMutation.isPending}
                        className="px-3 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 disabled:opacity-50"
                      >
                        {cancelMutation.isPending ? "Cancelling..." : "Yes"}
                      </button>
                      <button
                        onClick={() => setConfirmId(null)}
                        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        No
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

      {/* Receipt modal */}
      {receipt && (
        <div className="fixed inset-0 z-[95] bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-sky-500 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Booking Details</h2>
                <p className="text-xs opacity-80">#{receipt._id}</p>
              </div>
              <button
                onClick={() => setReceipt(null)}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex gap-4 mb-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={receipt.roomId?.picture}
                  alt={receipt.roomId?.title}
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <div>
                  <p className="font-bold text-lg">{receipt.roomId?.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {receipt.roomId?.category}
                  </p>
                  <span
                    className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      statusStyles[receipt.status] || statusStyles.PENDING
                    }`}
                  >
                    {receipt.status}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Check-in</span>
                  <span className="font-medium">
                    {receipt.checkInDate
                      ? format(parseFlexible(receipt.checkInDate), "MMM d, yyyy")
                      : "—"}{" "}
                    · {formatTimeDisplay(receipt.checkInTime)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Check-out</span>
                  <span className="font-medium">
                    {receipt.checkOutDate
                      ? format(parseFlexible(receipt.checkOutDate), "MMM d, yyyy")
                      : "—"}{" "}
                    · {formatTimeDisplay(receipt.checkOutTime)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Guest</span>
                  <span className="font-medium">
                    {receipt.contactName || receipt.userId?.name || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Guests</span>
                  <span className="font-medium">{receipt.guests || 1}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 dark:border-slate-600 pt-2.5 mt-2.5">
                  <span className="text-gray-500 dark:text-gray-400">
                    {receipt.nights || "—"} nights · ${receipt.roomId?.rent || 0}/night
                  </span>
                  <span className="font-medium">${(receipt.subtotal ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Taxes & fees</span>
                  <span className="font-medium">${(receipt.tax ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-600 pt-2.5 mt-2.5">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-xl text-sky-500">
                    ${(receipt.totalAmount ?? 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Payment</span>
                  <span className="font-medium">{receipt.paymentStatus || "UNPAID"}</span>
                </div>
              </div>

              <button
                onClick={() => printReceipt(receipt)}
                className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold transition-colors"
              >
                <Printer className="w-4 h-4" /> Print / Download Receipt
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Payment modal */}
      {payBooking && (
        <PaymentModal
          booking={payBooking}
          token={token}
          onClose={() => setPayBooking(null)}
          onSuccess={() => {
            setPayBooking(null);
            refetch();
          }}
        />
      )}
    </div>
  );
};

export default Order;
