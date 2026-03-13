import { Router } from "express";
import { body, validationResult } from "express-validator";
import { prisma } from "../lib/prisma";
import { authMiddleware, requireRole } from "../middleware/auth";
import { sendBulkSms } from "../services/sms";

const router = Router();
router.use(authMiddleware);

// Bulk send: ADMIN or PRO
router.post(
  "/send-bulk",
  requireRole("ADMIN", "PRO"),
  [
    body("message").trim().notEmpty().withMessage("Message is required"),
    body("filters").optional().isObject().withMessage("Filters must be an object"),
    body("filters.executives").optional().isBoolean(),
    body("filters.gender").optional().isIn(["MALE", "FEMALE"]),
    body("filters.level").optional().isString(),
    body("filters.alumni").optional().isBoolean(),
    body("filters.generalPublic").optional().isBoolean(),
  ],
  async (req, res) => {
    try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const first = errors.array()[0];
      const msg = typeof first === "object" && first?.msg ? String(first.msg) : "Invalid request";
      return res.status(400).json({ error: msg });
    }

    const { message, filters } = req.body;
    if (!filters || typeof filters !== "object") {
      return res.status(400).json({ error: "Select at least one filter" });
    }
    const where: any = {};
    if (filters.executives) where.isExecutive = true;
    if (filters.gender) where.gender = filters.gender;
    if (filters.level) where.level = filters.level;
    if (filters.alumni) where.isAlumni = true;
    if (filters.generalPublic) {
      // all users with phone
      where.phone = { not: null };
    }
    if (Object.keys(where).length === 0 && !filters.generalPublic) {
      return res.status(400).json({ error: "Select at least one filter" });
    }

    const users = await prisma.user.findMany({
      where: { ...where, phone: { not: null } },
      select: { phone: true },
    });
    const phones = [...new Set(users.map((u) => u.phone!).filter(Boolean))];
    if (phones.length === 0) {
      return res.status(400).json({ error: "No recipients found for the selected filters" });
    }

    const result = await sendBulkSms(phones, message);
    await prisma.smsLog.create({
      data: {
        recipientGroup: JSON.stringify(filters),
        recipientCount: phones.length,
        message,
        sentById: req.user!.userId,
      },
    });
    res.json({ sent: result.sent, failed: result.failed, total: phones.length });
    } catch (err) {
      console.error("Bulk SMS error:", err);
      res.status(500).json({ error: "Something went wrong while sending SMS" });
    }
  }
);

router.get("/logs", requireRole("ADMIN"), async (req, res) => {
  const logs = await prisma.smsLog.findMany({
    orderBy: { sentAt: "desc" },
    take: 50,
    include: { sentBy: { select: { name: true } } },
  });
  res.json(logs);
});

export { router as smsRoutes };
