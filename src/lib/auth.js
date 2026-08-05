import jwt from "jsonwebtoken";
import { User } from "./models/User";

const SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15d";

if (!SECRET) {
  throw new Error("Please define JWT_SECRET in .env.local");
}

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request) {
  const header = request.headers.get("authorization") || "";
  if (header.startsWith("Bearer ")) return header.slice(7);
  return header || null;
}

/**
 * Reads the Authorization header and returns the decoded payload
 * or null when the token is missing/invalid.
 */
export async function getAuthUser(request) {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  return payload;
}

/**
 * Loads the full user document from the DB for a given request.
 * Returns null when unauthenticated or the user no longer exists.
 */
export async function loadAuthUser(request) {
  const payload = await getAuthUser(request);
  if (!payload?.userId) return null;
  return User.findById(payload.userId).select("-password").lean();
}

export function isAdmin(payload) {
  return payload?.role === "ADMIN";
}
