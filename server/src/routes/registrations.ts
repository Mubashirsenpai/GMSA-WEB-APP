import { Router } from "express";
import { body, validationResult } from "express-validator";
import { prisma } from "../lib/prisma";
import { authMiddleware, requireRole } from "../middleware/auth";

const router = Router();

const userSelectForExport = {
  id: true,
  name: true,
  email: true,
  phone: true,
  whatsappContact: true,
  gender: true,
  level: true,
  programOfStudy: true,
};

// ----- Member registration (public register, secretary approve) -----
router.get("/members/pending", authMiddleware, requireRole("ADMIN", "SECRETARY"), async (req, res) => {
  const members = await prisma.member.findMany({
    where: { status: "PENDING" },
    include: { user: { select: { ...userSelectForExport } } },
  });
  res.json(members);
});

// Approved members list (for dashboard + CSV export)
router.get("/members/approved", authMiddleware, requireRole("ADMIN", "SECRETARY"), async (req, res) => {
  const members = await prisma.member.findMany({
    where: { status: "APPROVED" },
    include: { user: { select: userSelectForExport } },
    orderBy: { approvedAt: "desc" },
  });
  res.json(members);
});

router.patch("/members/:id", authMiddleware, requireRole("ADMIN", "SECRETARY"), body("status").isIn(["APPROVED", "REJECTED"]), async (req, res) => {
  const member = await prisma.member.update({
    where: { id: req.params.id },
    data: {
      status: req.body.status,
      approvedById: req.user!.userId,
      approvedAt: new Date(),
    },
  });
  res.json(member);
});

// ----- Madrasa sessions (PRO/Admin create; members register) -----
router.get("/madrasa/sessions", async (_req, res) => {
  const sessions = await prisma.madrasaSession.findMany({
    where: { isActive: true },
    orderBy: [{ dayOfWeek: "asc" }, { time: "asc" }],
  });
  res.json(sessions);
});

router.post("/madrasa/sessions", authMiddleware, requireRole("ADMIN", "PRO"), async (req, res) => {
  const { title, dayOfWeek, time, description } = req.body;
  const session = await prisma.madrasaSession.create({
    data: { title, dayOfWeek: Number(dayOfWeek), time, description: description || null },
  });
  res.status(201).json(session);
});

router.post("/madrasa/register", authMiddleware, body("sessionId").notEmpty(), async (req, res) => {
  const existing = await prisma.madrasaRegistration.findUnique({
    where: { sessionId_userId: { sessionId: req.body.sessionId, userId: req.user!.userId } },
  });
  if (existing) return res.status(400).json({ error: "Already registered for this session" });
  const reg = await prisma.madrasaRegistration.create({
    data: { sessionId: req.body.sessionId, userId: req.user!.userId },
  });
  res.status(201).json(reg);
});

router.get("/madrasa/pending", authMiddleware, requireRole("ADMIN", "SECRETARY"), async (req, res) => {
  const list = await prisma.madrasaRegistration.findMany({
    where: { status: "PENDING" },
    include: {
      session: true,
      user: { select: userSelectForExport },
    },
  });
  res.json(list);
});

// All madrasa registrations (approved) for dashboard + CSV
router.get("/madrasa/registrations", authMiddleware, requireRole("ADMIN", "SECRETARY", "PRO"), async (req, res) => {
  const list = await prisma.madrasaRegistration.findMany({
    where: { status: "APPROVED" },
    include: {
      session: true,
      user: { select: userSelectForExport },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(list);
});

router.patch("/madrasa/:id", authMiddleware, requireRole("ADMIN", "SECRETARY"), body("status").isIn(["APPROVED", "REJECTED"]), async (req, res) => {
  const reg = await prisma.madrasaRegistration.update({
    where: { id: req.params.id },
    data: { status: req.body.status },
  });
  res.json(reg);
});

// ----- Alumni registration -----
router.post(
  "/alumni",
  authMiddleware,
  [
    body("yearCompleted").optional().isInt(),
    body("occupation").optional().trim(),
    body("name").optional().trim(),
    body("phone").optional().trim(),
    body("whatsappContact").optional().trim(),
    body("gender").optional().isIn(["MALE", "FEMALE"]),
    body("programOfStudy").optional().trim(),
  ],
  async (req, res) => {
    const existing = await prisma.alumni.findUnique({ where: { userId: req.user!.userId } });
    if (existing) return res.status(400).json({ error: "Already registered as alumni" });
    const userId = req.user!.userId;
    const updateData: { name?: string; phone?: string; whatsappContact?: string; gender?: string; programOfStudy?: string } = {};
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.phone !== undefined) updateData.phone = req.body.phone || null;
    if (req.body.whatsappContact !== undefined) updateData.whatsappContact = req.body.whatsappContact || null;
    if (req.body.gender) updateData.gender = req.body.gender;
    if (req.body.programOfStudy !== undefined) updateData.programOfStudy = req.body.programOfStudy || null;
    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({ where: { id: userId }, data: updateData });
    }
    const alumni = await prisma.alumni.create({
      data: {
        userId,
        yearCompleted: req.body.yearCompleted ? Number(req.body.yearCompleted) : null,
        occupation: req.body.occupation,
      },
    });
    await prisma.user.update({ where: { id: userId }, data: { isAlumni: true } });
    res.status(201).json(alumni);
  }
);

router.get("/alumni/pending", authMiddleware, requireRole("ADMIN", "SECRETARY"), async (req, res) => {
  const list = await prisma.alumni.findMany({
    where: { status: "PENDING" },
    include: { user: { select: userSelectForExport } },
  });
  res.json(list);
});

// Approved alumni list for dashboard + CSV
router.get("/alumni/approved", authMiddleware, requireRole("ADMIN", "SECRETARY"), async (req, res) => {
  const list = await prisma.alumni.findMany({
    where: { status: "APPROVED" },
    include: { user: { select: userSelectForExport } },
    orderBy: { approvedAt: "desc" },
  });
  res.json(list);
});

router.patch("/alumni/:id", authMiddleware, requireRole("ADMIN", "SECRETARY"), body("status").isIn(["APPROVED", "REJECTED"]), async (req, res) => {
  const alumni = await prisma.alumni.update({
    where: { id: req.params.id },
    data: { status: req.body.status, approvedById: req.user!.userId, approvedAt: new Date() },
  });
  if (req.body.status === "APPROVED") {
    await prisma.user.update({ where: { id: alumni.userId }, data: { isAlumni: true } });
  }
  res.json(alumni);
});

// ----- Event registration approvals -----
router.get("/events/pending", authMiddleware, requireRole("ADMIN", "SECRETARY"), async (req, res) => {
  const list = await prisma.eventRegistration.findMany({
    where: { status: "PENDING" },
    include: {
      event: { select: { id: true, title: true, startAt: true } },
      user: { select: userSelectForExport },
    },
  });
  res.json(list);
});

// All event registrations (approved) for dashboard + CSV. Optional ?eventId= for one event.
router.get("/events/registrations", authMiddleware, requireRole("ADMIN", "SECRETARY", "PRO"), async (req, res) => {
  const eventId = req.query.eventId as string | undefined;
  const list = await prisma.eventRegistration.findMany({
    where: {
      status: "APPROVED",
      ...(eventId ? { eventId } : {}),
    },
    include: {
      event: { select: { id: true, title: true, startAt: true } },
      user: { select: userSelectForExport },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(list);
});

router.patch("/events/:id", authMiddleware, requireRole("ADMIN", "SECRETARY"), body("status").isIn(["APPROVED", "REJECTED"]), async (req, res) => {
  const reg = await prisma.eventRegistration.update({
    where: { id: req.params.id },
    data: { status: req.body.status },
  });
  res.json(reg);
});

export { router as registrationRoutes };
