import { connectDB } from "./db";
import { ActivityLog } from "./models/ActivityLog";
import { User } from "./models/User";

/**
 * Writes an entry to the admin activity log. Never throws — logging is a
 * best-effort side effect, so a failure can never break the main request.
 *
 * @param {object} entry
 * @param {object|null} entry.auth   decoded JWT payload (userId/email/role)
 * @param {string} entry.action      e.g. "booking.created"
 * @param {string} entry.entity      e.g. "booking"
 * @param {string} [entry.entityId]
 * @param {string} [entry.description]
 * @param {object} [entry.meta]      extra structured data
 */
export async function createActivityLog({
  auth = null,
  action,
  entity = "",
  entityId,
  description = "",
  meta = {},
}) {
  try {
    let actorName = "";
    if (auth?.userId) {
      const user = await User.findById(auth.userId).select("name").lean();
      actorName = user?.name || "";
    }
    await connectDB();
    await ActivityLog.create({
      userId: auth?.userId,
      actorName,
      actorEmail: auth?.email || "",
      actorRole: auth?.role || "USER",
      action,
      entity,
      entityId,
      description,
      meta,
    });
  } catch (err) {
    console.error("create activity log error:", err);
  }
}
