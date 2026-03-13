import { Router } from "express";
import { body, validationResult } from "express-validator";
import { prisma } from "../lib/prisma";
import { authMiddleware, requireRole, optionalAuth } from "../middleware/auth";
import { initializeTransaction, verifyTransaction } from "../lib/paystack";

const router = Router();
// Use first origin for Paystack callback (FRONTEND_URL can be "url1,url2" for CORS)
const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:3000").split(",").map((u) => u.trim())[0] || "http://localhost:3000";

/** Initialize Paystack payment: create donation (pending) and return Paystack authorization URL */
router.post(
  "/initialize",
  optionalAuth,
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("amount").isFloat({ min: 0.01 }).withMessage("Amount must be at least GHS 0.01"),
    body("projectType").isIn(["WEEKLY_PROJECT", "MASJID_RENOVATION", "FIISABIDILLAH"]),
    body("donorReference").optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const first = errors.array()[0];
      const msg = typeof first === "object" && first?.msg ? String(first.msg) : "Validation failed";
      return res.status(400).json({ error: msg, errors: errors.array() });
    }
    const userId = req.user?.userId ?? null;
    const amount = Number(req.body.amount);
    const projectType = req.body.projectType;
    const donorName = String(req.body.name).trim();
    const donorReference = req.body.donorReference ? String(req.body.donorReference).trim() : null;
    // Paystack requires an email; use system email when donor does not provide one
    const email = (process.env.DONATION_EMAIL || "donations@gmsa-uds.org").trim();

    const donation = await prisma.donation.create({
      data: {
        userId: userId ?? undefined,
        amount,
        projectType,
        donorName,
        donorReference,
        reference: null, // set after Paystack returns ref
        status: "pending",
      },
    });

    const callbackUrl = `${frontendUrl}/donate/success?reference=${donation.id}`;
    const result = await initializeTransaction({
      email,
      amount,
      reference: donation.id,
      callback_url: callbackUrl,
      metadata: { donationId: donation.id, projectType, donorName, donorReference: donorReference || "" },
    });

    if (!result) {
      await prisma.donation.update({
        where: { id: donation.id },
        data: { status: "failed" },
      });
      return res.status(502).json({ error: "Payment provider unavailable. Please try again later." });
    }

    await prisma.donation.update({
      where: { id: donation.id },
      data: { reference: result.reference },
    });

    res.status(201).json({
      authorization_url: result.authorization_url,
      reference: result.reference,
      donationId: donation.id,
    });
  }
);

/** Verify Paystack transaction and update donation status (called by frontend after redirect) */
router.get("/verify", async (req, res) => {
  const reference = req.query.reference as string;
  if (!reference) return res.status(400).json({ error: "Missing reference" });

  const donation = await prisma.donation.findUnique({
    where: { id: reference },
  });
  if (!donation) return res.status(404).json({ error: "Donation not found" });
  if (donation.status === "completed") {
    return res.json({ status: "completed", donation: { id: donation.id, amount: donation.amount, projectType: donation.projectType } });
  }

  const verification = await verifyTransaction(reference);
  if (!verification) {
    return res.status(502).json({ error: "Could not verify payment" });
  }

  const newStatus = verification.status === "success" ? "completed" : "failed";
  await prisma.donation.update({
    where: { id: donation.id },
    data: { status: newStatus },
  });

  res.json({
    status: newStatus,
    donation: { id: donation.id, amount: donation.amount, projectType: donation.projectType },
  });
});

/** Legacy: record donation without Paystack (manual/other methods) */
router.post(
  "/",
  optionalAuth,
  [
    body("amount").isFloat({ min: 0.01 }),
    body("projectType").isIn(["WEEKLY_PROJECT", "MASJID_RENOVATION", "FIISABIDILLAH"]),
    body("donorName").optional().trim(),
    body("donorReference").optional().trim(),
    body("reference").optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const userId = req.user?.userId ?? null;
    const donation = await prisma.donation.create({
      data: {
        userId: userId ?? undefined,
        amount: Number(req.body.amount),
        projectType: req.body.projectType,
        donorName: req.body.donorName?.trim() || undefined,
        donorReference: req.body.donorReference?.trim() || undefined,
        reference: req.body.reference,
        status: "pending",
      },
    });
    res.status(201).json({
      id: donation.id,
      amount: donation.amount,
      projectType: donation.projectType,
      message: "Donation recorded. Complete payment with your preferred method.",
    });
  }
);

router.get("/", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  const donations = await prisma.donation.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });
  res.json(donations);
});

router.patch("/:id/status", authMiddleware, requireRole("ADMIN"), body("status").isIn(["pending", "completed", "failed"]), async (req, res) => {
  const donation = await prisma.donation.update({
    where: { id: req.params.id },
    data: { status: req.body.status },
  });
  res.json(donation);
});

export { router as donationRoutes };
