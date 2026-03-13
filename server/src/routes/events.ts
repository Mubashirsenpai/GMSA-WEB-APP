import { Router } from "express";
import { body, validationResult } from "express-validator";
import { prisma } from "../lib/prisma";
import { authMiddleware, requireRole } from "../middleware/auth";

const router = Router();

router.get("/", async (req, res) => {
  const events = await prisma.event.findMany({
    orderBy: { startAt: "desc" },
  });
  res.json(events);
});

router.get("/:id", async (req, res) => {
  const event = await prisma.event.findUnique({
    where: { id: req.params.id },
    include: { registrations: { include: { user: { select: { name: true, email: true } } } } },
  });
  if (!event) return res.status(404).json({ error: "Event not found" });
  res.json(event);
});

router.post(
  "/",
  authMiddleware,
  requireRole("ADMIN", "PRO"),
  [
    body("title").trim().notEmpty(),
    body("description").optional({ checkFalsy: true }).trim(),
    body("venue").optional({ checkFalsy: true }).trim(),
    body("startAt").notEmpty().withMessage("Start date & time is required").isISO8601().withMessage("Invalid start date format"),
    body("endAt").optional({ checkFalsy: true }).isISO8601(),
    body("imageUrl").optional({ checkFalsy: true }).trim(),
    body("registrationRequired").optional().isBoolean(),
    body("maxAttendees").optional().isInt(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const first = errors.array()[0];
      const msg = typeof first === "object" && first?.msg ? String(first.msg) : "Validation failed";
      return res.status(400).json({ error: msg, errors: errors.array() });
    }
    const event = await prisma.event.create({
      data: {
        title: req.body.title.trim(),
        description: req.body.description || null,
        venue: req.body.venue || null,
        startAt: new Date(req.body.startAt),
        endAt: req.body.endAt ? new Date(req.body.endAt) : null,
        imageUrl: req.body.imageUrl || null,
        registrationRequired: req.body.registrationRequired ?? false,
        maxAttendees: req.body.maxAttendees ?? null,
      },
    });
    res.status(201).json(event);
  }
);

router.put("/:id", authMiddleware, requireRole("ADMIN", "PRO"), async (req, res) => {
  const allowed = ["title", "description", "venue", "startAt", "endAt", "imageUrl", "registrationRequired", "maxAttendees"];
  const data: Record<string, unknown> = {};
  for (const k of allowed) {
    if (req.body[k] !== undefined) data[k] = req.body[k];
  }
  if (data.startAt) data.startAt = new Date(data.startAt as string);
  if (data.endAt) data.endAt = data.endAt ? new Date(data.endAt as string) : null;
  const event = await prisma.event.update({ where: { id: req.params.id }, data: data as any });
  res.json(event);
});

router.delete("/:id", authMiddleware, requireRole("ADMIN", "PRO"), async (req, res) => {
  await prisma.event.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

router.post("/:id/register", authMiddleware, async (req, res) => {
  const event = await prisma.event.findUnique({ where: { id: req.params.id } });
  if (!event) return res.status(404).json({ error: "Event not found" });
  const existing = await prisma.eventRegistration.findUnique({
    where: { eventId_userId: { eventId: req.params.id, userId: req.user!.userId } },
  });
  if (existing) return res.status(400).json({ error: "Already registered" });
  const reg = await prisma.eventRegistration.create({
    data: { eventId: req.params.id, userId: req.user!.userId },
  });
  res.status(201).json(reg);
});

export { router as eventRoutes };
