import path from "path";
import fs from "fs";
import http from "http";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Server as SocketServer } from "socket.io";
import { prisma } from "./lib/prisma";
import { authRoutes } from "./routes/auth";
import { userRoutes } from "./routes/users";
import { executiveRoutes } from "./routes/executives";
import { executiveDiscussionRoutes } from "./routes/executiveDiscussions";
import { announcementRoutes } from "./routes/announcements";
import { eventRoutes } from "./routes/events";
import { galleryRoutes } from "./routes/gallery";
import { timetableRoutes } from "./routes/timetables";
import { khutbahRoutes } from "./routes/khutbah";
import { learningRoutes } from "./routes/learning";
import { blogRoutes } from "./routes/blogs";
import { suggestionRoutes } from "./routes/suggestions";
import { donationRoutes } from "./routes/donations";
import { registrationRoutes } from "./routes/registrations";
import { smsRoutes } from "./routes/sms";
import { uploadRoutes } from "./routes/upload";
import { adminRoutes } from "./routes/admin";
import { proRoutes } from "./routes/pro";
import { secretaryRoutes } from "./routes/secretary";
import { wocomRoutes } from "./routes/wocom";
import { coursesRoutes } from "./routes/courses";
import { imamRoutes } from "./routes/imam";

// .env paths to try (cwd when run from server/, or server/ when run from root)
const envPaths = [
  path.join(process.cwd(), ".env"),
  path.join(__dirname, "..", ".env"),
  path.join(process.cwd(), "server", ".env"),
];
const isDev = process.env.NODE_ENV !== "production";

// 1) Load PAYSTACK_SECRET_KEY directly from file first (avoids dotenv/tsx quirks)
function loadPaystackKeyFromFile(): void {
  const prefix = "PAYSTACK_SECRET_KEY=";
  for (const envPath of envPaths) {
    if (!fs.existsSync(envPath)) continue;
    try {
      const content = fs.readFileSync(envPath, "utf8").replace(/\uFEFF/g, "");
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (trimmed.startsWith(prefix)) {
          const value = trimmed.slice(prefix.length).trim().replace(/^["']|["']$/g, "").replace(/\r$/, "");
          if (value.length > 10 && value.startsWith("sk_")) {
            process.env.PAYSTACK_SECRET_KEY = value;
            if (isDev) console.log("[env] PAYSTACK_SECRET_KEY set from file");
            return;
          }
        }
      }
    } catch (_) {}
  }
}
loadPaystackKeyFromFile();

// 2) Load rest of .env via dotenv
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: true });
    if (isDev) console.log("[env] Loaded .env from:", envPath);
    break;
  }
}

// 3) If still missing, try parsing file again (in case dotenv overwrote it)
if (!process.env.PAYSTACK_SECRET_KEY?.startsWith("sk_")) {
  loadPaystackKeyFromFile();
}
if (isDev) {
  const p = process.env.PAYSTACK_SECRET_KEY;
  console.log("[env] PAYSTACK_SECRET_KEY:", p ? "set" : "NOT SET");
}

// Print uncaught errors and promise rejections to the terminal
process.on("uncaughtException", (err) => {
  console.error("\n--- UNCAUGHT EXCEPTION ---");
  console.error(err?.stack || err);
  console.error("---------------------------\n");
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("\n--- UNHANDLED REJECTION ---");
  console.error("Reason:", reason);
  console.error("Promise:", promise);
  console.error("----------------------------\n");
});

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((o) => o.trim())
  : ["http://localhost:3000", "http://localhost:3001"];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// Log every request to the terminal
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/executives", executiveRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/timetables", timetableRoutes);
app.use("/api/khutbah", khutbahRoutes);
app.use("/api/learning-materials", learningRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/suggestions", suggestionRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/sms", smsRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/pro", proRoutes);
app.use("/api/secretary", secretaryRoutes);
app.use("/api/wocom", wocomRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/imam", imamRoutes);
app.use("/api/executive/discussions", executiveDiscussionRoutes);

app.get("/", (_req, res) =>
  res.json({
    ok: true,
    message: "GMSA UDS Nyankpala API",
    docs: "Use /api/* endpoints. Health: /api/health",
  })
);
app.get("/api/health", (_req, res) => res.json({ ok: true }));

const httpServer = http.createServer(app);
const io = new SocketServer(httpServer, {
  cors: { origin: allowedOrigins, credentials: true },
  path: "/socket.io",
});

const EXECUTIVE_ROOM = "executive-discussion";
const LADIES_ROOM = "ladies-discussion";
io.on("connection", (socket) => {
  const token =
    (socket.handshake.auth as { token?: string })?.token ||
    (socket.handshake.query?.token as string) ||
    "";
  if (!token) {
    socket.disconnect(true);
    return;
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: string };
    prisma.user
      .findUnique({
        where: { id: payload.userId },
        select: { isExecutive: true, gender: true },
      })
      .then((user) => {
        if (!user) {
          socket.disconnect(true);
          return;
        }
        const canExecutive = payload.role === "ADMIN" || user.isExecutive;
        const canLadies = payload.role === "ADMIN" || payload.role === "WOCOM" || user.gender === "FEMALE";
        if (canExecutive) socket.join(EXECUTIVE_ROOM);
        if (canLadies) socket.join(LADIES_ROOM);
        if (!canExecutive && !canLadies) socket.disconnect(true);
      })
      .catch(() => socket.disconnect(true));
  } catch {
    socket.disconnect(true);
  }
});

app.set("io", io);

// Global error handler – prints errors to the terminal and returns JSON
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("\n--- ERROR ---");
  console.error(err?.stack || err?.message || err);
  console.error("-------------\n");
  res.status(err?.status || 500).json({
    error: err?.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && err?.stack && { stack: err.stack }),
  });
});

httpServer.listen(PORT, () => {
  console.log(`GMSA Server running on http://localhost:${PORT}`);
  const paystackKey = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (paystackKey?.startsWith("sk_")) {
    console.log("Paystack: configured (donations will redirect to Paystack).");
  } else if (paystackKey) {
    console.log("Paystack: invalid key (use secret key sk_test_ or sk_live_, not pk_). Donations may fail.");
  } else {
    console.log("Paystack: not configured (set PAYSTACK_SECRET_KEY in server/.env for donations).");
  }
  const smsUrl = process.env.SMS_API_URL;
  const smsKey = process.env.SMS_API_KEY;
  if (smsUrl && smsKey) {
    console.log(`SMS: configured (provider URL: ${smsUrl}).`);
  } else if (smsUrl || smsKey) {
    console.log("SMS: partially configured (set both SMS_API_URL and SMS_API_KEY in server/.env).");
  } else {
    console.log("SMS: not configured (set SMS_API_URL and SMS_API_KEY in server/.env for real sending; currently logs only).");
  }
  console.log("Errors will be printed to this terminal.\n");
});
