import { Router, Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { prisma } from "../lib/prisma";
import { authMiddleware, requireRole } from "../middleware/auth";
import type { Server as SocketIOServer } from "socket.io";

const router = Router();
const LADIES_ROOM = "ladies-discussion";

/** Allow WOCOM, ADMIN, or any authenticated user who is female (for private ladies discussion) */
async function requireLadiesAccess(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: "Authentication required" });
  if (req.user.role === "ADMIN" || req.user.role === "WOCOM") return next();
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: { gender: true },
  });
  if (user?.gender === "FEMALE") return next();
  return res.status(403).json({ error: "Ladies-only access" });
}

function getIO(req: { app: { get: (k: string) => SocketIOServer | undefined } }): SocketIOServer | undefined {
  return req.app.get("io");
}

/** WOCOM/Admin: dashboard stats */
router.get("/stats", authMiddleware, requireRole("WOCOM", "ADMIN"), async (_req, res) => {
  try {
    const [programs, taalimSessions, discussionCount] = await Promise.all([
      prisma.ladiesProgram.count(),
      prisma.ladiesTaalimSession.count(),
      prisma.ladiesDiscussionMessage.count(),
    ]);
    res.json({
      ladiesPrograms: programs,
      ladiesTaalimSessions: taalimSessions,
      ladiesDiscussionMessages: discussionCount,
    });
  } catch (err) {
    console.error("WOCOM stats error:", err);
    res.status(500).json({ error: "Failed to load statistics" });
  }
});

// ---------- Ladies Programs (WOCOM/Admin) ----------
router.get("/programs", authMiddleware, requireRole("WOCOM", "ADMIN"), async (_req, res) => {
  const list = await prisma.ladiesProgram.findMany({
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { id: true, name: true } } },
  });
  res.json(list);
});

router.post(
  "/programs",
  authMiddleware,
  requireRole("WOCOM", "ADMIN"),
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("type").optional().isIn(["TAALIM", "OTHER"]),
    body("description").optional().trim(),
    body("scheduledAt").optional(),
    body("venue").optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const type = (req.body.type as "TAALIM" | "OTHER") || "TAALIM";
    const scheduledAt = req.body.scheduledAt ? new Date(req.body.scheduledAt) : null;
    const item = await prisma.ladiesProgram.create({
      data: {
        title: req.body.title.trim(),
        description: req.body.description?.trim() || null,
        type,
        scheduledAt,
        venue: req.body.venue?.trim() || null,
        createdById: req.user!.userId,
      },
      include: { createdBy: { select: { id: true, name: true } } },
    });
    res.status(201).json(item);
  }
);

router.put(
  "/programs/:id",
  authMiddleware,
  requireRole("WOCOM", "ADMIN"),
  [
    body("title").optional().trim().notEmpty(),
    body("type").optional().isIn(["TAALIM", "OTHER"]),
    body("description").optional().trim(),
    body("scheduledAt").optional(),
    body("venue").optional().trim(),
  ],
  async (req, res) => {
    const data: { title?: string; description?: string | null; type?: "TAALIM" | "OTHER"; scheduledAt?: Date | null; venue?: string | null } = {};
    if (req.body.title !== undefined) data.title = req.body.title.trim();
    if (req.body.description !== undefined) data.description = req.body.description?.trim() || null;
    if (req.body.type !== undefined) data.type = req.body.type;
    if (req.body.scheduledAt !== undefined) data.scheduledAt = req.body.scheduledAt ? new Date(req.body.scheduledAt) : null;
    if (req.body.venue !== undefined) data.venue = req.body.venue?.trim() || null;
    const item = await prisma.ladiesProgram.update({
      where: { id: req.params.id },
      data,
      include: { createdBy: { select: { id: true, name: true } } },
    });
    res.json(item);
  }
);

router.delete("/programs/:id", authMiddleware, requireRole("WOCOM", "ADMIN"), async (req, res) => {
  await prisma.ladiesProgram.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

// ---------- Ladies Ta'alim Sessions (WOCOM/Admin) ----------
router.get("/taalim", authMiddleware, requireRole("WOCOM", "ADMIN"), async (_req, res) => {
  const list = await prisma.ladiesTaalimSession.findMany({
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { id: true, name: true } } },
  });
  res.json(list);
});

router.post(
  "/taalim",
  authMiddleware,
  requireRole("WOCOM", "ADMIN"),
  [body("title").trim().notEmpty().withMessage("Title is required")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const scheduledAt = req.body.scheduledAt ? new Date(req.body.scheduledAt) : null;
    const item = await prisma.ladiesTaalimSession.create({
      data: {
        title: req.body.title.trim(),
        description: req.body.description?.trim() || null,
        scheduledAt,
        venue: req.body.venue?.trim() || null,
        createdById: req.user!.userId,
      },
      include: { createdBy: { select: { id: true, name: true } } },
    });
    res.status(201).json(item);
  }
);

router.put("/taalim/:id", authMiddleware, requireRole("WOCOM", "ADMIN"), async (req, res) => {
  const data: { title?: string; description?: string | null; scheduledAt?: Date | null; venue?: string | null } = {};
  if (req.body.title !== undefined) data.title = req.body.title.trim();
  if (req.body.description !== undefined) data.description = req.body.description?.trim() || null;
  if (req.body.scheduledAt !== undefined) data.scheduledAt = req.body.scheduledAt ? new Date(req.body.scheduledAt) : null;
  if (req.body.venue !== undefined) data.venue = req.body.venue?.trim() || null;
  const item = await prisma.ladiesTaalimSession.update({
    where: { id: req.params.id },
    data,
    include: { createdBy: { select: { id: true, name: true } } },
  });
  res.json(item);
});

router.delete("/taalim/:id", authMiddleware, requireRole("WOCOM", "ADMIN"), async (req, res) => {
  await prisma.ladiesTaalimSession.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

// ---------- Ladies Discussion (WOCOM/Admin or female users only) ----------
router.get("/discussion", authMiddleware, requireLadiesAccess, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const messages = await prisma.ladiesDiscussionMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { author: { select: { id: true, name: true } } },
    });
    res.json({ messages: messages.reverse() });
  } catch (e) {
    console.error("Ladies discussion GET:", e);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.post(
  "/discussion",
  authMiddleware,
  requireLadiesAccess,
  [body("body").trim().notEmpty().withMessage("Message is required").isLength({ max: 2000 })],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const msg = errors.array()[0];
        return res.status(400).json({ error: typeof msg === "object" && "msg" in msg ? msg.msg : "Invalid message" });
      }
      const bodyText = String(req.body.body).trim();
      const author = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: { id: true, name: true },
      });
      if (!author) return res.status(401).json({ error: "User not found" });

      const message = await prisma.ladiesDiscussionMessage.create({
        data: { authorId: author.id, body: bodyText },
        include: { author: { select: { id: true, name: true } } },
      });

      const io = getIO(req);
      if (io) {
        io.to(LADIES_ROOM).emit("ladies_message", {
          id: message.id,
          body: message.body,
          createdAt: message.createdAt.toISOString(),
          author: { id: message.author.id, name: message.author.name },
        });
      }

      res.status(201).json(message);
    } catch (e) {
      console.error("Ladies discussion POST:", e);
      res.status(500).json({ error: "Something went wrong" });
    }
  }
);

export { router as wocomRoutes };
