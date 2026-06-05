import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import type { SessionUser } from "../types/index.js";
import type { UserDocument } from "../models/User.js";

const TOKEN_TTL = "7d";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(user: UserDocument): string {
  const payload: SessionUser = {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
  };
  return jwt.sign(payload, env.jwtSecret, { expiresIn: TOKEN_TTL });
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, env.jwtSecret) as SessionUser;
  } catch {
    return null;
  }
}

export function toSessionUser(user: UserDocument): SessionUser {
  return { id: user._id.toString(), email: user.email, name: user.name };
}
