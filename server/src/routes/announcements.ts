import { Router } from "express";
import { body, validationResult } from "express-validator";
import { prisma } from "../lib/prisma";
import { authMiddleware, requireRole } from "../middleware/auth";

const router = Router();

router.get("/", async (req, res) => {
  const announcements = await prisma.announcement.findMany({
    orderBy: [{ priority: "desc" }, { publishedAt: "desc" }],
    include: { author: { select: { name: true } } },
  });
  res.json(announcements);
});

router.get("/:id", async (req, res) => {
  const ann = await prisma.announcement.findUnique({
    where: { id: req.params.id },
    include: { author: { select: { name: true } } },
  });
  if (!ann) return res.status(404).json({ error: "Announcement not found" });
  res.json(ann);
});

router.post(
  "/",
  authMiddleware,
  requireRole("ADMIN", "PRO"),
  [body("title").trim().notEmpty(), body("body").trim().notEmpty(), body("priority").optional().isInt(), body("coverImageUrl").optional().trim()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const ann = await prisma.announcement.create({
      data: {
        title: req.body.title,
        body: req.body.body,
        coverImageUrl: req.body.coverImageUrl?.trim() || null,
        priority: req.body.priority ?? 0,
        authorId: req.user!.userId,
      },
    });
    res.status(201).json(ann);
  }
);

router.put("/:id", authMiddleware, requireRole("ADMIN", "PRO"), async (req, res) => {
  const allowed = ["title", "body", "priority", "coverImageUrl"];
  const data: Record<string, unknown> = {};
  for (const k of allowed) {
    if (req.body[k] !== undefined) data[k] = k === "coverImageUrl" ? (req.body[k]?.trim() || null) : req.body[k];
  }
  const ann = await prisma.announcement.update({
    where: { id: req.params.id },
    data: data as any,
  });
  res.json(ann);
});

router.delete("/:id", authMiddleware, requireRole("ADMIN", "PRO"), async (req, res) => {
  await prisma.announcement.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export { router as announcementRoutes };
