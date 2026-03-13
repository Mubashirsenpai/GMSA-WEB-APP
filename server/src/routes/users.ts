import { Router } from "express";
import { body, query, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { authMiddleware, requireRole } from "../middleware/auth";
import { Role } from "@prisma/client";

const router = Router();
router.use(authMiddleware);
router.use(requireRole("ADMIN"));

router.post(
  "/",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("name").trim().notEmpty(),
    body("role").isIn(["ADMIN", "PRO", "SECRETARY", "WOCOM", "IMAM", "MEMBER"]),
    body("phone").optional().trim(),
    body("gender").optional().isIn(["MALE", "FEMALE"]),
    body("level").optional().trim(),
    body("isExecutive").optional().isBoolean(),
    body("position").optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password, name, role, phone, gender, level, isExecutive, position } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: role as Role,
        phone: phone || null,
        gender: gender || null,
        level: level || null,
        isExecutive: !!isExecutive,
        position: position && String(position).trim() ? String(position).trim() : null,
      },
    });
    if (role === "MEMBER") {
      await prisma.member.create({ data: { userId: user.id, status: "PENDING" } });
    }
    if (isExecutive && (position && String(position).trim())) {
      await prisma.executive.create({
        data: {
          userId: user.id,
          position: String(position).trim(),
          order: 0,
          tenureStart: new Date(),
        },
      });
    }
    res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      level: user.level,
      gender: user.gender,
      isExecutive: user.isExecutive,
      position: user.position,
    });
  }
);

router.get("/", async (req, res) => {
  const { role, search, page = "1", limit = "20" } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const where: any = {};
  if (role) where.role = role;
  if (search)
    where.OR = [
      { name: { contains: String(search), mode: "insensitive" } },
      { email: { contains: String(search), mode: "insensitive" } },
    ];
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: Number(limit),
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        level: true,
        gender: true,
        isExecutive: true,
        isAlumni: true,
        position: true,
        programOfStudy: true,
        whatsappContact: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);
  res.json({ users, total });
});

router.patch("/:id/role", body("role").isIn(["ADMIN", "PRO", "SECRETARY", "WOCOM", "IMAM", "MEMBER"]), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { role: req.body.role as Role },
  });
  res.json(user);
});

/** Add or remove user from executive board. Body: { isExecutive: boolean, position?: string, avatarUrl?: string } */
router.patch(
  "/:id/executive",
  [
    body("isExecutive").custom((v) => v === true || v === false || v === "true" || v === "false").withMessage("isExecutive must be true or false"),
    body("position").optional().trim(),
    body("avatarUrl").optional().trim().isURL(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const msg = errors.array().map((e: any) => e.msg || e.message).join("; ");
      return res.status(400).json({ error: msg });
    }
    const userId = req.params.id;
    const isExecutive = req.body.isExecutive === true || req.body.isExecutive === "true";
    const position = req.body.position;
    const avatarUrl = req.body.avatarUrl && String(req.body.avatarUrl).trim() ? String(req.body.avatarUrl).trim() : undefined;

    const existing = await prisma.executive.findUnique({ where: { userId } });

    try {
      if (isExecutive) {
        const pos = position && String(position).trim() ? String(position).trim() : "Executive";
        await prisma.user.update({
          where: { id: userId },
          data: { isExecutive: true, position: pos, ...(avatarUrl != null && { avatarUrl }) },
        });
        if (existing) {
          await prisma.executive.update({
            where: { id: existing.id },
            data: { position: pos },
          });
        } else {
          await prisma.executive.create({
            data: { userId, position: pos, order: 0, tenureStart: new Date() },
          });
        }
        console.log("[executive PATCH] Added/updated executive:", userId, pos);
      } else {
        await prisma.user.update({
          where: { id: userId },
          data: { isExecutive: false, position: null },
        });
        if (existing) await prisma.executive.delete({ where: { id: existing.id } });
        console.log("[executive PATCH] Removed from board:", userId);
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, isExecutive: true, position: true },
      });
      res.json(user);
    } catch (err) {
      console.error("[executive PATCH] Error:", err);
      res.status(500).json({ error: "Failed to update executive status" });
    }
  }
);

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  if (id === req.user!.userId) {
    return res.status(400).json({ error: "You cannot delete your own account" });
  }
  await prisma.user.delete({ where: { id } });
  res.status(204).send();
});

export { router as userRoutes };
