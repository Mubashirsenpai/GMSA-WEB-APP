import { Router } from "express";
import { body, validationResult } from "express-validator";
import { prisma } from "../lib/prisma";
import { authMiddleware, requireRole } from "../middleware/auth";

const router = Router();

router.post(
  "/",
  [body("name").trim().notEmpty(), body("email").isEmail().normalizeEmail(), body("message").trim().notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const suggestion = await prisma.suggestion.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        message: req.body.message,
        isPublic: req.body.isPublic === true,
      },
    });
    res.status(201).json({ id: suggestion.id, message: "Thank you for your suggestion!" });
  }
);

router.get("/", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  const suggestions = await prisma.suggestion.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json(suggestions);
});

export { router as suggestionRoutes };
