import { Router, Request, Response, NextFunction } from "express";
import { body, query, validationResult } from "express-validator";
import { prisma } from "../lib/prisma";
import { authMiddleware, requireExecutive } from "../middleware/auth";
import type { Server as SocketIOServer } from "socket.io";

const router = Router();
router.use(authMiddleware);

const requireExecutiveWrap = (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(requireExecutive(req, res, next)).catch(next);
};

const ROOM = "executive-discussion";

function getIO(req: { app: { get: (k: string) => SocketIOServer | undefined } }): SocketIOServer | undefined {
  return req.app.get("io");
}

/** GET recent messages (executive only) */
router.get(
  "/",
  requireExecutiveWrap,
  [query("limit").optional().isInt({ min: 1, max: 100 })],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ error: "Invalid request" });
      const limit = Math.min(Number(req.query.limit) || 50, 100);
      const messages = await prisma.executiveDiscussionMessage.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
          author: { select: { id: true, name: true, position: true } },
        },
      });
      res.json({ messages: messages.reverse() });
    } catch (e) {
      console.error("Executive discussions GET:", e);
      res.status(500).json({ error: "Something went wrong" });
    }
  }
);

/** POST new message (executive only) and broadcast via socket */
router.post(
  "/",
  requireExecutiveWrap,
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
        select: { id: true, name: true, position: true },
      });
      if (!author) return res.status(401).json({ error: "User not found" });

      const message = await prisma.executiveDiscussionMessage.create({
        data: { authorId: author.id, body: bodyText },
        include: {
          author: { select: { id: true, name: true, position: true } },
        },
      });

      const io = getIO(req);
      if (io) {
        io.to(ROOM).emit("new_message", {
          id: message.id,
          body: message.body,
          createdAt: message.createdAt.toISOString(),
          author: { id: message.author.id, name: message.author.name, position: message.author.position },
        });
      }

      res.status(201).json(message);
    } catch (e) {
      console.error("Executive discussions POST:", e);
      res.status(500).json({ error: "Something went wrong" });
    }
  }
);

export { router as executiveDiscussionRoutes };
