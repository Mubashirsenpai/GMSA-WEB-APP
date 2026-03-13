import { Router } from "express";
import { body, validationResult } from "express-validator";
import { prisma } from "../lib/prisma";
import { authMiddleware, requireRole } from "../middleware/auth";

const router = Router();

router.get("/", async (req, res) => {
  const academicYear = typeof req.query.academicYear === "string" ? req.query.academicYear.trim() : null;
  const where = academicYear ? { academicYear } : {};
  const executives = await prisma.executive.findMany({
    where,
    orderBy: { order: "asc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          position: true,
          avatarUrl: true,
          programOfStudy: true,
          level: true,
          phone: true,
          email: true,
        },
      },
    },
  });
  res.json(executives);
});

/** GET distinct academic years for filter dropdown (e.g. ["2026/2027", "2025/2026"]) */
router.get("/years", async (_req, res) => {
  const rows = await prisma.executive.findMany({
    where: { academicYear: { not: null } },
    select: { academicYear: true },
    distinct: ["academicYear"],
  });
  const years = (rows.map((r) => r.academicYear).filter(Boolean) as string[]).sort().reverse();
  res.json(years);
});

router.post(
  "/",
  authMiddleware,
  requireRole("ADMIN"),
  [
    body("userId").notEmpty().withMessage("User is required"),
    body("position").trim().notEmpty().withMessage("Position is required"),
    body("academicYear").trim().notEmpty().withMessage("Academic year (e.g. 2026/2027) is required"),
    body("order").optional().isInt(),
    body("tenureStart").optional().isISO8601(),
    body("tenureEnd").optional().isISO8601(),
    body("avatarUrl").trim().notEmpty().withMessage("Photo is required"),
    body("programOfStudy").trim().notEmpty().withMessage("Program of study is required"),
    body("phone").trim().notEmpty().withMessage("Phone is required"),
    body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Valid email is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const first = errors.array()[0];
        const msg = typeof first === "object" && first?.msg ? String(first.msg) : "All fields are required";
        return res.status(400).json({ error: msg });
      }
      const avatarUrl = String(req.body.avatarUrl).trim();
      const programOfStudy = String(req.body.programOfStudy).trim();
      const phone = String(req.body.phone).trim();
      const email = String(req.body.email).trim();
      const academicYear = String(req.body.academicYear).trim();
      const userData = { isExecutive: true, position: req.body.position, avatarUrl, programOfStudy, phone, email };
      await prisma.user.update({
        where: { id: req.body.userId },
        data: userData,
      });
      const tenureStart = req.body.tenureStart ? new Date(req.body.tenureStart) : new Date();
      const exec = await prisma.executive.create({
        data: {
          userId: req.body.userId,
          position: req.body.position,
          academicYear,
          order: req.body.order ?? 0,
          tenureStart,
          tenureEnd: req.body.tenureEnd ? new Date(req.body.tenureEnd) : null,
        },
      });
      res.status(201).json(exec);
    } catch (err: unknown) {
      const code = err && typeof err === "object" && "code" in err ? (err as { code: string }).code : "";
      if (code === "P2002") {
        return res.status(400).json({ error: "This user is already on the executive board." });
      }
      console.error("Executive create error:", err);
      return res.status(500).json({ error: "Could not add executive. Please try again." });
    }
  }
);

router.put("/:id", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  const { position, order, tenureStart, tenureEnd, academicYear, avatarUrl, programOfStudy, phone, email } = req.body;
  const exec = await prisma.executive.findUnique({ where: { id: req.params.id } });
  if (!exec) return res.status(404).json({ error: "Executive not found" });
  const execData: { position?: string; order?: number; academicYear?: string; tenureStart?: Date; tenureEnd?: Date | null } = {};
  if (position !== undefined) execData.position = position;
  if (order !== undefined) execData.order = Number(order);
  if (academicYear !== undefined) execData.academicYear = typeof academicYear === "string" ? academicYear.trim() || null : null;
  if (tenureStart !== undefined) execData.tenureStart = new Date(tenureStart);
  if (tenureEnd !== undefined) execData.tenureEnd = tenureEnd ? new Date(tenureEnd) : null;
  if (Object.keys(execData).length > 0) {
    await prisma.executive.update({ where: { id: req.params.id }, data: execData });
  }
  const userData: Record<string, unknown> = {};
  if (avatarUrl !== undefined && typeof avatarUrl === "string") userData.avatarUrl = avatarUrl.trim() || null;
  if (programOfStudy !== undefined) userData.programOfStudy = typeof programOfStudy === "string" ? programOfStudy.trim() || null : null;
  if (phone !== undefined) userData.phone = typeof phone === "string" ? phone.trim() || null : null;
  if (email !== undefined) userData.email = typeof email === "string" ? email.trim() || null : null;
  if (Object.keys(userData).length > 0) {
    await prisma.user.update({
      where: { id: exec.userId },
      data: userData,
    });
  }
  const updated = await prisma.executive.findUnique({
    where: { id: req.params.id },
    include: { user: { select: { id: true, name: true, position: true, avatarUrl: true, programOfStudy: true, level: true, phone: true, email: true } } },
  });
  res.json(updated);
});

router.delete("/:id", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  const exec = await prisma.executive.findUnique({ where: { id: req.params.id } });
  if (exec) {
    await prisma.user.update({ where: { id: exec.userId }, data: { isExecutive: false, position: null } });
    await prisma.executive.delete({ where: { id: req.params.id } });
  }
  res.status(204).send();
});

export { router as executiveRoutes };
