import { Router } from "express";
import multer from "multer";
import { body, validationResult } from "express-validator";
import { prisma } from "../lib/prisma";
import { authMiddleware, requireRole } from "../middleware/auth";
import { uploadBuffer } from "../lib/cloudinary";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.get("/", async (_req, res) => {
  const items = await prisma.khutbahMaterial.findMany({
    orderBy: { date: "desc" },
  });
  res.json(items);
});

router.get("/:id", async (req, res) => {
  const item = await prisma.khutbahMaterial.findUnique({
    where: { id: req.params.id },
  });
  if (!item) return res.status(404).json({ error: "Khutbah material not found" });
  res.json(item);
});

router.post(
  "/",
  authMiddleware,
  requireRole("ADMIN", "IMAM"),
  upload.single("file"),
  [body("title").trim().notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    if (!req.file) return res.status(400).json({ error: "File required" });
    const result = await uploadBuffer(req.file.buffer, "gmsa/khutbah");
    const item = await prisma.khutbahMaterial.create({
      data: {
        title: req.body.title,
        description: req.body.description,
        fileUrl: result.secure_url,
        date: req.body.date ? new Date(req.body.date) : null,
        uploadedById: req.user!.userId,
      },
    });
    res.status(201).json(item);
  }
);

router.put("/:id", authMiddleware, requireRole("ADMIN", "IMAM"), async (req, res) => {
  const allowed = ["title", "description", "date"];
  const data: Record<string, unknown> = {};
  for (const k of allowed) {
    if (req.body[k] !== undefined) data[k] = req.body[k];
  }
  if (data.date !== undefined) data.date = data.date ? new Date(data.date as string) : null;
  const item = await prisma.khutbahMaterial.update({
    where: { id: req.params.id },
    data: data as any,
  });
  res.json(item);
});

router.delete("/:id", authMiddleware, requireRole("ADMIN", "IMAM"), async (req, res) => {
  await prisma.khutbahMaterial.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export { router as khutbahRoutes };
