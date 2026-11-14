import type { FastifyReply } from "fastify";
import type { UserRole } from "@allaboard/types";

const COOKIE_NAME = "access_token";
const MAX_AGE_SEC = 60 * 60 * 24;

export async function issueAuthToken(
  reply: FastifyReply,
  userId: string,
  role: UserRole,
): Promise<string> {
  const token = await reply.jwtSign({
    sub: userId,
    role,
  });
  void reply.setCookie(COOKIE_NAME, token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE_SEC,
  });
  return token;
}

export function clearAuthCookie(reply: FastifyReply): void {
  void reply.clearCookie(COOKIE_NAME, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
