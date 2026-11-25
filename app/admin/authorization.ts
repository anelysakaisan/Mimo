import { cookies } from "next/headers";
import { getChatGPTUser } from "../chatgpt-auth";

const COOKIE_NAME = "mimo_admin_session";
const encoder = new TextEncoder();

async function hmac(value: string) {
  const secret = process.env.MIMOCHERRY_SESSION_SECRET;
  if (!secret) return "";
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function validSecondFactor(userId: string) {
  const session = (await cookies()).get(COOKIE_NAME)?.value;
  if (!session) return false;
  const [id, expires, signature] = session.split(".");
  if (id !== userId || !expires || Number(expires) < Date.now() || !signature) return false;
  return signature === await hmac(`${id}.${expires}`);
}

export async function ownerIdentity(requireSecondFactor = true) {
  const authenticatedUser = await getChatGPTUser();
  const ownerEmail = process.env.MIMOCHERRY_OWNER_EMAIL?.trim().toLowerCase();
  const user = authenticatedUser ?? (process.env.NODE_ENV === "development" && ownerEmail ? {
    userId: "local-owner", displayName: "Proprietária Mimo Cherry", email: ownerEmail, fullName: "Proprietária Mimo Cherry",
  } : null);
  if (!user) return { ok: false as const, reason: "login" as const, status: 401, user: null };
  if (!ownerEmail || user.email.toLowerCase() !== ownerEmail) return { ok: false as const, reason: "forbidden" as const, status: 403, user };
  if (requireSecondFactor && !await validSecondFactor(user.userId)) return { ok: false as const, reason: "second-factor" as const, status: 401, user };
  return { ok: true as const, reason: "authorized" as const, status: 200, user };
}

export async function verifyAccessCode(code: string, userId: string) {
  const expected = process.env.MIMOCHERRY_ACCESS_CODE;
  if (!expected || code.length < 6 || code.length > 64) return false;
  const [providedHash, expectedHash] = await Promise.all([hmac(`code:${code}`), hmac(`code:${expected}`)]);
  if (!providedHash || providedHash !== expectedHash) return false;
  const expires = Date.now() + 30 * 60 * 1000;
  const value = `${userId}.${expires}`;
  (await cookies()).set(COOKIE_NAME, `${value}.${await hmac(value)}`, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 30 * 60 });
  return true;
}
