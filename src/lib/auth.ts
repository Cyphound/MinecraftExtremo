import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "extremo_session";
const SESSION_PAYLOAD = "minecraft-extremo:v1";

function signature(password: string) {
  return createHmac("sha256", password).update(SESSION_PAYLOAD).digest("hex");
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function passwordIsConfigured() {
  return Boolean(process.env.APP_PASSWORD);
}

export function verifyPassword(candidate: string) {
  const expected = process.env.APP_PASSWORD;
  return Boolean(expected && safeEqual(candidate, expected));
}

export async function createSession() {
  const password = process.env.APP_PASSWORD;
  if (!password) throw new Error("APP_PASSWORD no está configurada.");
  (await cookies()).set(COOKIE_NAME, signature(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    priority: "high",
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE_NAME);
}

export async function hasValidSession() {
  const password = process.env.APP_PASSWORD;
  const current = (await cookies()).get(COOKIE_NAME)?.value;
  return Boolean(password && current && safeEqual(current, signature(password)));
}

export async function assertSession() {
  if (!(await hasValidSession())) throw new Error("No autorizado.");
}
