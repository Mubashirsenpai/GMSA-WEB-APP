import { Router } from "express";
import multer from "multer";
import { body, validationResult } from "express-validator";
import { prisma } from "../lib/prisma";
import { authMiddleware, requireRole } from "../middleware/auth";
import { uploadBuffer } from "../lib/cloudinary";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.get("/", async (_req, res) => {
  const timetables = await prisma.prayerTimetable.findMany({
    orderBy: { periodStart: "desc" },
  });
  res.json(timetables);
});

router.get("/:id", async (req, res) => {
  const tt = await prisma.prayerTimetable.findUnique({
    where: { id: req.params.id },
  });
  if (!tt) return res.status(404).json({ error: "Timetable not found" });
  res.json(tt);
});

router.post(
  "/",
  authMiddleware,
  requireRole("ADMIN", "PRO"),
  upload.single("file"),
  [
    body("title").trim().notEmpty(),
    body("periodStart").isISO8601(),
    body("periodEnd").isISO8601(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    if (!req.file) return res.status(400).json({ error: "File required" });
    const result = await uploadBuffer(req.file.buffer, "gmsa/timetables");
    const tt = await prisma.prayerTimetable.create({
      data: {
        title: req.body.title,
        fileUrl: result.secure_url,
        periodStart: new Date(req.body.periodStart),
        periodEnd: new Date(req.body.periodEnd),
        uploadedById: req.user!.userId,
      },
    });
    res.status(201).json(tt);
  }
);

router.put("/:id", authMiddleware, requireRole("ADMIN", "PRO"), async (req, res) => {
  const allowed = ["title", "periodStart", "periodEnd"];
  const data: Record<string, unknown> = {};
  for (const k of allowed) {
    if (req.body[k] !== undefined) data[k] = req.body[k];
  }
  if (data.periodStart) data.periodStart = new Date(data.periodStart as string);
  if (data.periodEnd) data.periodEnd = new Date(data.periodEnd as string);
  const tt = await prisma.prayerTimetable.update({
    where: { id: req.params.id },
    data: data as any,
  });
  res.json(tt);
});

router.delete("/:id", authMiddleware, requireRole("ADMIN", "PRO"), async (req, res) => {
  await prisma.prayerTimetable.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export { router as timetableRoutes };
