"use client";
import { useAuth } from "@/Hooks/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useRooms } from "@/Hooks/useRooms";
import {
  createRoom,
  deleteRoom,
  getAllBookings,
  getAllUsers,
  getAdminAnalytics,
  getAdminLogs,
  getAdminPayments,
  updateRoom,
  updateBookingStatus,
  updateUserRole,
} from "@/lib/api";
import { useToast } from "@/components/ui/ToastProvider";
import { Skeleton } from "@/components/ui/Skeleton";
import ImageUploader from "@/components/ui/ImageUploader";
import CustomSelect from "@/components/ui/CustomSelect";
import { formatDisplay, formatTimeDisplay } from "@/lib/date";
import {
  BedDouble,
  CalendarDays,
  CheckCircle2,
  DollarSign,
  Plus,
  Trash2,
  Users as UsersIcon,
  X,
  ShieldAlert,
  Check,
  Ban,
  Activity,
  BarChart3,
  Star,
  Shield,
  ShieldCheck,
  ReceiptText,
  ScrollText,
  Landmark,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const TABS = ["Overview", "Analytics", "Rooms", "Bookings", "Users", "Billing", "Logs"];

const statusStyles = {
  CONFIRMED: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
  COMPLETED: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
};

const PIE_COLORS = {
  CONFIRMED: "#10b981",
  PENDING: "#f59e0b",
  CANCELLED: "#ef4444",
  COMPLETED: "#3b82f6",
};

const paymentStatusStyles = {
  SUCCEEDED: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200",
  REFUNDED: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200",
};

const LOG_ACTION_STYLES = {
  "payment.succeeded": "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
  "payment.failed": "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
  "booking.created": "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-200",
  "booking.cancelled": "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
  "booking.updated": "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200",
  "room.created": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200",
  "room.updated": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200",
  "room.deleted": "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
  "user.role_changed": "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200",
  "review.created": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200",
  "review.updated": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200",
  "review.deleted": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200",
  "auth.signup": "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
};

const Pagination = ({ page, totalPages, onChange }) => (
  <div className="flex items-center justify-center gap-3 mt-4">
    <button
      onClick={() => onChange(Math.max(1, page - 1))}
      disabled={page <= 1}
      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
    >
      <ChevronLeft className="w-4 h-4" /> Prev
    </button>
    <span className="text-sm text-gray-500 dark:text-gray-400">
      Page {page} of {totalPages || 1}
    </span>
    <button
      onClick={() => onChange(page + 1)}
      disabled={page >= (totalPages || 1)}
      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
    >
      Next <ChevronRight className="w-4 h-4" />
    </button>
  </div>
);

const RevenueChartCard = ({ data, loading }) => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6 border border-slate-100 dark:border-slate-700">
    <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
      <BarChart3 className="w-5 h-5 text-sky-500" /> Revenue (last 14 days)
    </h3>
    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
      Daily paid revenue from the payments ledger
    </p>
    {loading ? (
      <Skeleton className="w-full h-64 rounded-xl" />
    ) : (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
            <XAxis dataKey="date" fontSize={11} tickLine={false} />
            <YAxis fontSize={11} tickLine={false} width={60} />
            <Tooltip
              formatter={(value) => [`$${Number(value).toFixed(2)}`, "Revenue"]}
            />
            <Bar dataKey="amount" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )}
  </div>
);

const emptyRoom = {
  title: "",
  category: "Basic",
  rent: "",
  capacity: 2,
  facilities: "",
  picture: "",
  description: "",
};

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [tab, setTab] = useState("Overview");
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [form, setForm] = useState(emptyRoom);

  useEffect(() => {
    if (!token) {
      router.push("/sign-in");
      return;
    }
    if (user && user.role !== "ADMIN") {
      toast.error("Admin access required");
      router.push("/");
    }
  }, [token, user, router, toast]);

  const { data: roomsData, isLoading: roomsLoading } = useRooms({ limit: 50 });
  const rooms = useMemo(() => roomsData?.rooms || [], [roomsData]);

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["allBookings"],
    queryFn: async () => {
      const json = await getAllBookings(token);
      return Array.isArray(json?.data) ? json.data : [];
    },
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["allUsers"],
    queryFn: async () => {
      const json = await getAllUsers(token);
      return Array.isArray(json?.data) ? json.data : [];
    },
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["adminAnalytics"],
    queryFn: async () => {
      const json = await getAdminAnalytics(token);
      return json?.data || null;
    },
  });

  const [paymentsPage, setPaymentsPage] = useState(1);
  const [paymentFilter, setPaymentFilter] = useState("All");
  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ["adminPayments", paymentsPage, paymentFilter],
    queryFn: async () => {
      const json = await getAdminPayments(
        {
          page: paymentsPage,
          limit: 15,
          ...(paymentFilter !== "All" ? { provider: paymentFilter } : {}),
        },
        token
      );
      return json || {};
    },
  });

  const [logsPage, setLogsPage] = useState(1);
  const [logFilter, setLogFilter] = useState("All");
  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ["adminLogs", logsPage, logFilter],
    queryFn: async () => {
      const json = await getAdminLogs(
        {
          page: logsPage,
          limit: 20,
          ...(logFilter !== "All" ? { action: logFilter } : {}),
        },
        token
      );
      return json || {};
    },
  });

  const stats = useMemo(() => {
    const confirmed = bookings.filter((b) => b.status === "CONFIRMED");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const occupiedToday = bookings.filter(
      (b) =>
        (b.status === "CONFIRMED" || b.status === "PENDING") &&
        new Date(b.checkInDate) < tomorrow &&
        new Date(b.checkOutDate) >= today
    ).length;
    const occupancy =
      rooms.length > 0
        ? Math.min(100, Math.round((occupiedToday / rooms.length) * 100))
        : 0;
    const totals = analytics?.totals || {};
    return {
      rooms: totals.rooms ?? rooms.length,
      bookings: totals.bookings ?? bookings.length,
      confirmed: confirmed.length,
      users: totals.users ?? users.length,
      revenue: totals.revenue ?? 0,
      occupancy,
      avgRating: totals.avgRating ?? 0,
    };
  }, [rooms, bookings, users, analytics]);

  const statusMutation = useMutation({
    mutationFn: ({ id, payload }) => updateBookingStatus(id, payload, token),
    onSuccess: (res) => {
      if (res?.success) {
        toast.success("Booking updated");
        queryClient.invalidateQueries({ queryKey: ["allBookings"] });
        queryClient.invalidateQueries({ queryKey: ["rooms"] });
        queryClient.invalidateQueries({ queryKey: ["adminAnalytics"] });
      }
    },
    onError: (err) => toast.error(err?.message || "Failed to update booking"),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }) => updateUserRole(id, { role }, token),
    onSuccess: (res) => {
      if (res?.success) {
        toast.success("Role updated");
        queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      }
    },
    onError: (err) => toast.error(err?.message || "Failed to update role"),
  });

  const setStatus = (booking, status) => {
    if (
      status === "CANCELLED" &&
      !window.confirm(
        `Cancel booking "${booking.roomId?.title}" for ${booking.userId?.name}?`
      )
    )
      return;
    statusMutation.mutate({ id: booking._id, payload: { status } });
  };

  const togglePayment = (booking) => {
    const next = booking.paymentStatus === "PAID" ? "UNPAID" : "PAID";
    statusMutation.mutate({ id: booking._id, payload: { paymentStatus: next } });
  };

  const toggleRole = (u) => {
    const next = u.role === "ADMIN" ? "USER" : "ADMIN";
    roleMutation.mutate({ id: u._id, role: next });
  };

  const openAddForm = () => {
    setEditingRoom(null);
    setForm(emptyRoom);
    setShowForm(true);
  };

  const openEditForm = (room) => {
    setEditingRoom(room);
    setForm({
      title: room.title,
      category: room.category,
      rent: room.rent,
      capacity: room.capacity,
      facilities: room.facilities?.join(", ") || "",
      picture: room.picture,
      description: room.description || "",
    });
    setShowForm(true);
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        rent: Number(form.rent),
        capacity: Number(form.capacity),
      };
      if (editingRoom) {
        const res = await updateRoom(editingRoom._id, payload, token);
        if (res.success) toast.success("Room updated");
      } else {
        const res = await createRoom(payload, token);
        if (res.success) toast.success("Room added");
      }
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["adminAnalytics"] });
      setShowForm(false);
    } catch (err) {
      toast.error(err?.message || "Failed to save room");
    }
  };

  const handleDeleteRoom = async (room) => {
    if (!window.confirm(`Delete "${room.title}"?`)) return;
    try {
      await deleteRoom(room._id, token);
      toast.success("Room deleted");
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["adminAnalytics"] });
    } catch (err) {
      toast.error(err?.message || "Failed to delete room");
    }
  };

  if (user?.role !== "ADMIN") {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center">
        <ShieldAlert className="w-14 h-14 text-red-400 mb-4" />
        <h1 className="text-2xl font-bold">Access Restricted</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          This page is only available to administrators.
        </p>
      </div>
    );
  }

  const statusPieData = analytics
    ? Object.entries(analytics.bookingsByStatus || {}).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage rooms, bookings, users and analytics
          </p>
        </div>
        {tab === "Rooms" && (
          <button
            onClick={openAddForm}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Room
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
              tab === t
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white"
                : "border-slate-300 dark:border-slate-600 hover:border-gray-900 dark:hover:border-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "Overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard
              icon={<BedDouble className="w-6 h-6" />}
              label="Total Rooms"
              value={stats.rooms}
              color="bg-sky-100 text-sky-600 dark:bg-sky-900 dark:text-sky-300"
            />
            <StatCard
              icon={<CalendarDays className="w-6 h-6" />}
              label="Total Bookings"
              value={stats.bookings}
              color="bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300"
            />
            <StatCard
              icon={<CheckCircle2 className="w-6 h-6" />}
              label="Confirmed"
              value={stats.confirmed}
              color="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
            />
            <StatCard
              icon={<Activity className="w-6 h-6" />}
              label="Occupancy (today)"
              value={`${stats.occupancy}%`}
              color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300"
            />
            <StatCard
              icon={<UsersIcon className="w-6 h-6" />}
              label="Total Users"
              value={stats.users}
              color="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"
            />
            <StatCard
              icon={<DollarSign className="w-6 h-6" />}
              label="Paid Revenue"
              value={`$${(stats.revenue || 0).toLocaleString()}`}
              color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300"
            />
          </div>
          <RevenueChartCard
            data={analytics?.revenueLast14Days}
            loading={analyticsLoading}
          />
        </div>
      )}

      {/* Analytics */}
      {tab === "Analytics" && (
        <div className="space-y-6">
          {analyticsLoading && (
            <div className="space-y-3">
              <Skeleton className="w-full h-64 rounded-2xl" />
              <Skeleton className="w-full h-40 rounded-2xl" />
            </div>
          )}

          {!analyticsLoading && analytics && (
            <>
              {/* Revenue trend */}
              <RevenueChartCard data={analytics.revenueLast14Days} />

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Status distribution */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6 border border-slate-100 dark:border-slate-700">
                  <h3 className="text-lg font-bold mb-4">Bookings by Status</h3>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusPieData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={45}
                          outerRadius={80}
                          paddingAngle={3}
                          label
                        >
                          {statusPieData.map((entry) => (
                            <Cell
                              key={entry.name}
                              fill={PIE_COLORS[entry.name] || "#64748b"}
                            />
                          ))}
                        </Pie>
                        <Legend />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top rooms */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6 border border-slate-100 dark:border-slate-700">
                  <h3 className="text-lg font-bold mb-4">Top Rooms by Revenue</h3>
                  {analytics.topRooms?.length === 0 && (
                    <p className="text-sm text-gray-400 py-8 text-center">
                      No revenue yet
                    </p>
                  )}
                  <div className="space-y-3">
                    {analytics.topRooms?.map((room, i) => (
                      <div
                        key={room._id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700"
                      >
                        <span className="w-7 h-7 rounded-lg bg-sky-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{room.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {room.bookings} booking{room.bookings === 1 ? "" : "s"} ·{" "}
                            {room.category}
                          </p>
                        </div>
                        <p className="font-bold text-emerald-500">
                          ${(room.revenue || 0).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent bookings */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6 border border-slate-100 dark:border-slate-700">
                <h3 className="text-lg font-bold mb-4">Recent Bookings</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-900 text-left">
                        <th className="p-3">Guest</th>
                        <th className="p-3">Room</th>
                        <th className="p-3">Check-in</th>
                        <th className="p-3">Total</th>
                        <th className="p-3">Payment</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.recentBookings?.map((b) => (
                        <tr
                          key={b._id}
                          className="border-t border-gray-200 dark:border-gray-700"
                        >
                          <td className="p-3">{b.userId?.name || "—"}</td>
                          <td className="p-3">{b.roomId?.title || "—"}</td>
                          <td className="p-3 whitespace-nowrap">
                            {formatDisplay(b.checkInDate)}
                          </td>
                          <td className="p-3 font-semibold">
                            ${(b.totalAmount || 0).toFixed(2)}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                b.paymentStatus === "PAID"
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200"
                                  : b.paymentStatus === "REFUNDED"
                                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200"
                                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                              }`}
                            >
                              {b.paymentStatus || "UNPAID"}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                statusStyles[b.status] || statusStyles.PENDING
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Billing */}
      {tab === "Billing" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <ReceiptText className="w-5 h-5 text-sky-500" /> Payments &amp; Billing
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Every payment record with transaction ID and gateway details
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Provider:</span>
              {["All", "stripe", "sandbox"].map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPaymentFilter(p);
                    setPaymentsPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                    paymentFilter === p
                      ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white"
                      : "border-slate-300 dark:border-slate-600 hover:border-gray-900 dark:hover:border-white"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {paymentsLoading && <Skeleton className="w-full h-72 rounded-2xl" />}

          {!paymentsLoading && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow border border-slate-100 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-900 text-left">
                      <th className="p-3">Transaction</th>
                      <th className="p-3">Guest</th>
                      <th className="p-3">Room</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Gateway</th>
                      <th className="p-3">Card</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentsData?.data?.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-gray-400">
                          No payments found
                        </td>
                      </tr>
                    )}
                    {paymentsData?.data?.map((p) => (
                      <tr
                        key={p._id}
                        className="border-t border-slate-100 dark:border-slate-700"
                      >
                        <td className="p-3">
                          <p className="font-mono text-xs font-semibold">{p.transactionId || "—"}</p>
                          {p.providerRef && p.providerRef !== p.transactionId && (
                            <p className="font-mono text-[10px] text-gray-400 truncate max-w-[180px]" title={p.providerRef}>
                              {p.providerRef}
                            </p>
                          )}
                          <p className="text-[10px] text-gray-400">#{p.bookingId?._id || p.bookingId || ""}</p>
                        </td>
                        <td className="p-3">
                          <p className="font-medium">{p.userId?.name || "—"}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{p.userId?.email}</p>
                        </td>
                        <td className="p-3">
                          <p className="font-medium">{p.roomId?.title || "—"}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{p.roomId?.category}</p>
                        </td>
                        <td className="p-3 font-bold">
                          ${(p.amount || 0).toFixed(2)}{" "}
                          <span className="text-[10px] text-gray-400 font-normal">{p.currency}</span>
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                            <Landmark className="w-3 h-3" /> {p.provider}
                          </span>
                        </td>
                        <td className="p-3 text-xs text-gray-500 dark:text-gray-400">
                          {p.cardBrand ? `${p.cardBrand} •••• ${p.cardLast4}` : "—"}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              paymentStatusStyles[p.status] || paymentStatusStyles.PENDING
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3 text-xs text-gray-500 dark:text-gray-400">
                          {p.paidAt || p.createdAt
                            ? formatDisplay(p.paidAt || p.createdAt)
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={paymentsPage}
                totalPages={paymentsData?.totalPages}
                onChange={setPaymentsPage}
              />
            </div>
          )}
        </div>
      )}

      {/* Logs */}
      {tab === "Logs" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <ScrollText className="w-5 h-5 text-sky-500" /> Activity Logs
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                All admin-relevant activity across the platform, newest first
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500 dark:text-gray-400">Action:</span>
              <CustomSelect
                value={logFilter}
                onChange={(v) => {
                  setLogFilter(v);
                  setLogsPage(1);
                }}
                options={["All", "payment.succeeded", "payment.failed", "booking.created", "booking.cancelled", "booking.updated", "room.created", "room.updated", "room.deleted", "user.role_changed", "review.created", "auth.signup"]}
                ariaLabel="Filter logs by action"
                className="min-w-[190px]"
              />
            </div>
          </div>

          {logsLoading && <Skeleton className="w-full h-72 rounded-2xl" />}

          {!logsLoading && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow border border-slate-100 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-900 text-left">
                      <th className="p-3">When</th>
                      <th className="p-3">Actor</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logsData?.data?.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-400">
                          No activity recorded yet
                        </td>
                      </tr>
                    )}
                    {logsData?.data?.map((log) => (
                      <tr
                        key={log._id}
                        className="border-t border-slate-100 dark:border-slate-700"
                      >
                        <td className="p-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="p-3">
                          <p className="font-medium">{log.actorName || "System"}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{log.actorEmail}</p>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              LOG_ACTION_STYLES[log.action] ||
                              "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3">
                          <p className="text-slate-700 dark:text-slate-200">{log.description}</p>
                          {log.meta?.transactionId && (
                            <p className="font-mono text-[10px] text-gray-400">
                              txn: {log.meta.transactionId}
                            </p>
                          )}
                          {log.meta?.sessionId && (
                            <p className="font-mono text-[10px] text-gray-400 truncate max-w-[240px]" title={log.meta.sessionId}>
                              session: {log.meta.sessionId}
                            </p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={logsPage}
                totalPages={logsData?.totalPages}
                onChange={setLogsPage}
              />
            </div>
          )}
        </div>
      )}

      {/* Rooms */}
      {tab === "Rooms" && (
        <div className="rounded-lg shadow bg-white dark:bg-gray-800 overflow-x-auto">
          {roomsLoading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="w-full h-12" />
              <Skeleton className="w-full h-12" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-900 text-left">
                  <th className="p-3">Room</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Rent/Night</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr
                    key={room._id}
                    className="border-t border-gray-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={room.picture}
                          alt={room.title}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <span className="font-semibold">{room.title}</span>
                      </div>
                    </td>
                    <td className="p-3">{room.category}</td>
                    <td className="p-3">${room.rent}</td>
                    <td className="p-3">{(room.rating || 0).toFixed(1)} ★</td>
                    <td className="p-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditForm(room)}
                          className="px-3 py-1.5 rounded border border-sky-400 text-sky-500 text-xs font-semibold hover:bg-sky-50 dark:hover:bg-sky-950"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(room)}
                          className="px-3 py-1.5 rounded border border-red-400 text-red-500 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Bookings */}
      {tab === "Bookings" && (
        <div className="rounded-lg shadow bg-white dark:bg-gray-800 overflow-x-auto">
          {bookingsLoading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="w-full h-12" />
              <Skeleton className="w-full h-12" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-900 text-left">
                  <th className="p-3">Guest</th>
                  <th className="p-3">Room</th>
                  <th className="p-3">Stay</th>
                  <th className="p-3">Guests</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  return (
                    <tr
                      key={b._id}
                      className="border-t border-gray-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="p-3">
                        <p className="font-medium">{b.userId?.name || "—"}</p>
                        <p className="text-xs text-gray-500">{b.userId?.email || ""}</p>
                      </td>
                      <td className="p-3">
                        <p>{b.roomId?.title || "—"}</p>
                        <p className="text-xs text-gray-500">{b.roomId?.category || ""}</p>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <p>
                          {formatDisplay(b.checkInDate)} ·{" "}
                          {formatTimeDisplay(b.checkInTime)}
                        </p>
                        <p className="text-xs text-gray-500">
                          → {formatDisplay(b.checkOutDate)} ·{" "}
                          {formatTimeDisplay(b.checkOutTime)}
                        </p>
                        {b.specialRequests && (
                          <p
                            className="text-xs text-amber-600 dark:text-amber-400 mt-1 max-w-[180px] truncate"
                            title={b.specialRequests}
                          >
                            {b.specialRequests}
                          </p>
                        )}
                      </td>
                      <td className="p-3">{b.guests || 1}</td>
                      <td className="p-3 font-semibold">
                        ${(b.totalAmount ?? 0).toFixed(2)}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => togglePayment(b)}
                          title="Toggle payment status"
                          className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                            b.paymentStatus === "PAID"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200"
                              : b.paymentStatus === "REFUNDED"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {b.paymentStatus || "UNPAID"}
                        </button>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            statusStyles[b.status] || statusStyles.PENDING
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end gap-1.5 flex-wrap">
                          {b.status === "PENDING" && (
                            <button
                              onClick={() => setStatus(b, "CONFIRMED")}
                              disabled={statusMutation.isPending}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-green-400 text-green-600 text-xs font-semibold hover:bg-green-50 dark:hover:bg-green-950 disabled:opacity-50"
                            >
                              <Check className="w-3 h-3" /> Confirm
                            </button>
                          )}
                          {(b.status === "CONFIRMED" || b.status === "PENDING") && (
                            <>
                              <button
                                onClick={() => setStatus(b, "COMPLETED")}
                                disabled={statusMutation.isPending}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-blue-400 text-blue-600 text-xs font-semibold hover:bg-blue-50 dark:hover:bg-blue-950 disabled:opacity-50"
                              >
                                <CheckCircle2 className="w-3 h-3" /> Done
                              </button>
                              <button
                                onClick={() => setStatus(b, "CANCELLED")}
                                disabled={statusMutation.isPending}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-red-400 text-red-500 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-50"
                              >
                                <Ban className="w-3 h-3" /> Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Users */}
      {tab === "Users" && (
        <div className="rounded-lg shadow bg-white dark:bg-gray-800 overflow-x-auto">
          {usersLoading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="w-full h-12" />
              <Skeleton className="w-full h-12" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-900 text-left">
                  <th className="p-3">User</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Role</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u._id}
                    className="border-t border-gray-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={u.image}
                          alt={u.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="font-semibold">{u.name}</span>
                      </div>
                    </td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">{u.phone || "—"}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${
                          u.role === "ADMIN"
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200"
                            : "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-200"
                        }`}
                      >
                        {u.role === "ADMIN" ? (
                          <ShieldCheck className="w-3 h-3" />
                        ) : (
                          <Shield className="w-3 h-3" />
                        )}
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end">
                        {u._id !== user._id && (
                          <button
                            onClick={() => toggleRole(u)}
                            disabled={roleMutation.isPending}
                            className="px-3 py-1.5 rounded border border-amber-400 text-amber-600 text-xs font-semibold hover:bg-amber-50 dark:hover:bg-amber-950 disabled:opacity-50"
                          >
                            {u.role === "ADMIN" ? "Demote to User" : "Promote to Admin"}
                          </button>
                        )}
                        {u._id === user._id && (
                          <span className="text-xs text-gray-400 self-center">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Add/Edit Room Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[90] bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {editingRoom ? "Edit Room" : "Add New Room"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="space-y-4">
              <label className="flex flex-col gap-1 text-sm font-medium">
                Title *
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="p-2.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-700 outline-none focus:border-sky-500"
                  required
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-1 text-sm font-medium">
                  Category
                  <CustomSelect
                    value={form.category}
                    onChange={(v) => setForm({ ...form, category: v })}
                    options={["Basic", "Luxury", "Suite"]}
                    ariaLabel="Room category"
                    className="w-full"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium">
                  Rent / night ($) *
                  <input
                    type="number"
                    min="1"
                    value={form.rent}
                    onChange={(e) => setForm({ ...form, rent: e.target.value })}
                    className="p-2.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-700 outline-none focus:border-sky-500"
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium">
                  Capacity
                  <input
                    type="number"
                    min="1"
                    value={form.capacity}
                    onChange={(e) =>
                      setForm({ ...form, capacity: e.target.value })
                    }
                    className="p-2.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-700 outline-none focus:border-sky-500"
                  />
                </label>
                <div className="sm:col-span-2">
                  <ImageUploader
                    value={form.picture}
                    onChange={(url) => setForm({ ...form, picture: url })}
                    folder="rbm/rooms"
                    label="Room image"
                  />
                </div>
              </div>

              <label className="flex flex-col gap-1 text-sm font-medium">
                Facilities (comma separated)
                <input
                  type="text"
                  value={form.facilities}
                  onChange={(e) =>
                    setForm({ ...form, facilities: e.target.value })
                  }
                  placeholder="Free WiFi, Air Conditioning, TV"
                  className="p-2.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-700 outline-none focus:border-sky-500"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm font-medium">
                Description
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                  className="p-2.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-gray-700 outline-none focus:border-sky-500 resize-none"
                />
              </label>

              <button
                type="submit"
                className="w-full px-6 py-3 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold transition-colors"
              >
                {editingRoom ? "Save Changes" : "Add Room"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg shadow p-4 flex items-center gap-4">
    <span className={`p-3 rounded-lg ${color}`}>{icon}</span>
    <div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  </div>
);

export default AdminDashboard;
