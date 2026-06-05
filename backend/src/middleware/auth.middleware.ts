import type { NextFunction, Request, Response } from "express";

import { verifyToken } from "../lib/auth.js";
import type { SessionUser } from "../types/index.js";

export type AuthedRequest = Request & { user?: SessionUser };

export function getToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return req.cookies?.reevo_token ?? null;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const token = getToken(req);
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const user = verifyToken(token);
  if (!user) {
    res.status(401).json({ error: "Invalid session" });
    return;
  }
  req.user = user;
  next();
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie("reevo_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}
