import { Router } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";
import { Role } from "@prisma/client";

const router = Router();
const JWT_SECRET = (process.env.JWT_SECRET || "") as string;
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || "7d";

router.post(
  "/register",
  [
    body("email").isEmail().normalizeEmail().withMessage("Please enter a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("name").trim().notEmpty().withMessage("Full name is required"),
    body("username").trim().notEmpty().withMessage("Username is required"),
    body("phone").trim().notEmpty().withMessage("Phone or WhatsApp is required"),
    body("whatsappContact").optional().trim(),
    body("gender").isIn(["MALE", "FEMALE"]).withMessage("Gender is required"),
    body("programOfStudy").trim().notEmpty().withMessage("Program of study is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const first = errors.array()[0];
      const msg = typeof first === "object" && first?.msg ? String(first.msg) : "Validation failed";
      return res.status(400).json({ error: msg, errors: errors.array() });
    }

    const { email, password, name, username, phone, whatsappContact, gender, programOfStudy } = req.body;
    const usernameVal = String(username).trim();
    const phoneVal = String(phone).trim();
    const whatsappVal = typeof whatsappContact === "string" ? whatsappContact.trim() : "";
    const programVal = String(programOfStudy).trim();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: "This email is already registered. Try logging in." });
    const existingUsername = await prisma.user.findFirst({ where: { username: usernameVal } });
    if (existingUsername) return res.status(400).json({ error: "This username is already taken. Choose another." });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        username: usernameVal,
        passwordHash,
        name,
        phone: phoneVal || null,
        whatsappContact: whatsappVal || null,
        gender: gender || null,
        programOfStudy: programVal || null,
        level: null,
        role: Role.MEMBER,
      },
    });

    const member = await prisma.member.create({
      data: { userId: user.id, status: "PENDING" },
    });

    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      memberStatus: member.status,
      message: "Account created. Please sign in.",
    });
  }
);

router.post(
  "/login",
  [body("username").trim().notEmpty().withMessage("Username or email is required"), body("password").notEmpty().withMessage("Password is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const first = errors.array()[0];
        const msg = typeof first === "object" && first?.msg ? String(first.msg) : "Username and password are required";
        return res.status(400).json({ error: msg });
      }

      const { username, password } = req.body;
      const value = String(username).trim();
      const emailMatch = value.includes("@")
        ? await prisma.user.findUnique({ where: { email: value.toLowerCase() } })
        : null;
      const user = emailMatch ?? (value ? await prisma.user.findFirst({ where: { username: value } }) : null);
      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return res.status(401).json({ error: "Invalid username or password." });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET as jwt.Secret,
        { expiresIn: JWT_EXPIRES } as jwt.SignOptions
      );
      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isExecutive: user.isExecutive,
          isAlumni: user.isAlumni,
        },
        token,
      });
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({ error: "Something went wrong. Please try again." });
    }
  }
);

router.get("/me", authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      whatsappContact: true,
      gender: true,
      level: true,
      programOfStudy: true,
      role: true,
      isExecutive: true,
      isAlumni: true,
      position: true,
      avatarUrl: true,
      memberProfile: { select: { status: true } },
      alumniProfile: { select: { status: true } },
    },
  });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

export { router as authRoutes };
