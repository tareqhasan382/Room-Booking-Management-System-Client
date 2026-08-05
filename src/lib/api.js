// ---------------------------------------------------------------------------
// API service layer.
// Calls the Next.js API routes (/api/...) which talk directly to MongoDB.
// Response shapes are `{ success, statusCode, message, data, token }` so the
// data hooks do not need to change.
// ---------------------------------------------------------------------------

const BASE = "/api";

const request = async (path, options = {}, token) => {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);
  if (!res.ok && !json) {
    throw new Error(`Request failed (${res.status})`);
  }
  return json || { success: false, message: `Request failed (${res.status})` };
};

const buildQuery = (params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      qs.set(key, String(value));
    }
  });
  const s = qs.toString();
  return s ? `?${s}` : "";
};

// ----------------------------- Rooms --------------------------------------

export const getRooms = (params) => request(`/rooms${buildQuery(params)}`);

export const getRoom = (id) => request(`/rooms/${id}`);

export const createRoom = (payload, token) =>
  request("/rooms", { method: "POST", body: JSON.stringify(payload) }, token);

export const updateRoom = (id, payload, token) =>
  request(`/rooms/${id}`, { method: "PATCH", body: JSON.stringify(payload) }, token);

export const deleteRoom = (id, token) =>
  request(`/rooms/${id}`, { method: "DELETE" }, token);

// ----------------------------- Auth ---------------------------------------

export const signUp = ({ name, email, password }) =>
  request("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });

export const signIn = ({ email, password }) =>
  request("/auth/signin", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

// ----------------------------- Bookings -----------------------------------

export const getBookings = (token) => request("/bookings", {}, token);

export const getAllBookings = (token) => request("/bookings/all", {}, token);

export const getBooking = (id, token) => request(`/bookings/${id}`, {}, token);

export const createBooking = (payload, token) =>
  request("/bookings", { method: "POST", body: JSON.stringify(payload) }, token);

export const cancelBooking = (id, token) =>
  request(`/bookings/${id}`, { method: "DELETE" }, token);

export const payBooking = (id, payload, token) =>
  request(`/bookings/${id}/pay`, { method: "POST", body: JSON.stringify(payload) }, token);

export const createCheckoutSession = (bookingId, token) =>
  request("/payments/checkout", { method: "POST", body: JSON.stringify({ bookingId }) }, token);

export const verifyPaymentSession = (sessionId, token) =>
  request(`/payments/verify?session_id=${encodeURIComponent(sessionId)}`, {}, token);

/** Fetches the PDF invoice as a Blob using the auth header. */
export const downloadInvoice = async (id, token) => {
  const res = await fetch(`${BASE}/bookings/${id}/invoice`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(json?.message || `Invoice download failed (${res.status})`);
  }
  return res.blob();
};

// ----------------------------- Reviews ------------------------------------

export const getReviews = (roomId) =>
  request(`/reviews${buildQuery({ roomId })}`);

export const createReview = (payload, token) =>
  request("/reviews", { method: "POST", body: JSON.stringify(payload) }, token);

export const updateReview = (id, payload, token) =>
  request(`/reviews/${id}`, { method: "PATCH", body: JSON.stringify(payload) }, token);

export const deleteReview = (id, token) =>
  request(`/reviews/${id}`, { method: "DELETE" }, token);

// ----------------------------- Users ---------------------------------------

export const getAllUsers = (token) => request("/users", {}, token);

export const updateUserRole = (id, payload, token) =>
  request(`/users/${id}`, { method: "PATCH", body: JSON.stringify(payload) }, token);

// ----------------------------- Profile -------------------------------------

export const updateProfile = (payload, token) =>
  request("/users/me", { method: "PATCH", body: JSON.stringify(payload) }, token);

export const changePassword = (payload, token) =>
  request("/users/me/password", { method: "POST", body: JSON.stringify(payload) }, token);

// ----------------------------- Admin ---------------------------------------

export const updateBookingStatus = (id, payload, token) =>
  request(`/bookings/${id}`, { method: "PATCH", body: JSON.stringify(payload) }, token);

export const getAdminAnalytics = (token) => request("/admin/analytics", {}, token);

export const getAdminLogs = (params = {}, token) =>
  request(`/admin/logs${buildQuery(params)}`, {}, token);

export const getAdminPayments = (params = {}, token) =>
  request(`/admin/payments${buildQuery(params)}`, {}, token);

// ----------------------------- Uploads -------------------------------------

/**
 * Uploads a base64 image data URL to Cloudinary and returns the stored URL.
 * `folder` must be one of "rbm/avatars" or "rbm/rooms".
 */
export const uploadImage = (dataUrl, folder = "rbm/images", token) =>
  request("/upload", { method: "POST", body: JSON.stringify({ dataUrl, folder }) }, token);
