import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma";

export interface AuthPayload {
  userId: string;
  email: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
    } catch {}
  }
  next();
}

/** Require authenticated user who is either ADMIN or has isExecutive true */
export async function requireExecutive(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: "Authentication required" });
  if (req.user.role === "ADMIN") return next();
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: { isExecutive: true },
  });
  if (user?.isExecutive) return next();
  return res.status(403).json({ error: "Executive access only" });
}
