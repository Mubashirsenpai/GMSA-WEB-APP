import { Router } from "express";
import multer from "multer";
import { body, validationResult } from "express-validator";
import { prisma } from "../lib/prisma";
import { authMiddleware, requireRole } from "../middleware/auth";
import { uploadBuffer } from "../lib/cloudinary";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB for PDFs etc.

/** Public: list all courses (with material count) */
router.get("/", async (_req, res) => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: { select: { id: true, name: true } },
        _count: { select: { materials: true } },
      },
    });
    res.json(courses);
  } catch (err) {
    console.error("GET /courses error:", err);
    res.status(500).json({ error: "Failed to load courses" });
  }
});

/** Public: get one course with materials (for review and download) */
router.get("/:id", async (req, res) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        createdBy: { select: { id: true, name: true } },
        materials: { orderBy: { order: "asc" } },
      },
    });
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.json(course);
  } catch (err) {
    console.error("GET /courses/:id error:", err);
    res.status(500).json({ error: "Failed to load course" });
  }
});

/** Imam/Admin: create course (cover image via form or separate upload) */
router.post(
  "/",
  authMiddleware,
  requireRole("IMAM", "ADMIN"),
  upload.single("coverImage"),
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description").optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    let coverImageUrl: string | null = null;
    if (req.file) {
      try {
        const result = await uploadBuffer(req.file.buffer, "gmsa/courses");
        coverImageUrl = result.secure_url;
      } catch (e) {
        console.error("Course cover upload error:", e);
        return res.status(502).json({ error: "Cover image upload failed" });
      }
    }
    const course = await prisma.course.create({
      data: {
        title: req.body.title.trim(),
        description: req.body.description?.trim() || null,
        coverImageUrl,
        createdById: req.user!.userId,
      },
      include: { createdBy: { select: { id: true, name: true } }, materials: true },
    });
    res.status(201).json(course);
  }
);

/** Imam/Admin: update course */
router.put(
  "/:id",
  authMiddleware,
  requireRole("IMAM", "ADMIN"),
  upload.single("coverImage"),
  [body("title").optional().trim().notEmpty(), body("description").optional().trim()],
  async (req, res) => {
    const existing = await prisma.course.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Course not found" });
    const data: { title?: string; description?: string | null; coverImageUrl?: string | null } = {};
    if (req.body.title !== undefined) data.title = req.body.title.trim();
    if (req.body.description !== undefined) data.description = req.body.description?.trim() || null;
    if (req.file) {
      try {
        const result = await uploadBuffer(req.file.buffer, "gmsa/courses");
        data.coverImageUrl = result.secure_url;
      } catch (e) {
        console.error("Course cover upload error:", e);
        return res.status(502).json({ error: "Cover image upload failed" });
      }
    }
    const course = await prisma.course.update({
      where: { id: req.params.id },
      data,
      include: { createdBy: { select: { id: true, name: true } }, materials: { orderBy: { order: "asc" } } },
    });
    res.json(course);
  }
);

/** Imam/Admin: delete course */
router.delete("/:id", authMiddleware, requireRole("IMAM", "ADMIN"), async (req, res) => {
  await prisma.course.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

/** Imam/Admin: add material to course (file optional for placeholder) */
router.post(
  "/:courseId/materials",
  authMiddleware,
  requireRole("IMAM", "ADMIN"),
  upload.single("file"),
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("order").optional().isInt({ min: 0 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const course = await prisma.course.findUnique({ where: { id: req.params.courseId } });
    if (!course) return res.status(404).json({ error: "Course not found" });
    let fileUrl: string | null = null;
    if (req.file) {
      try {
        const result = await uploadBuffer(req.file.buffer, "gmsa/course-materials");
        fileUrl = result.secure_url;
      } catch (e) {
        console.error("Material upload error:", e);
        return res.status(502).json({ error: "File upload failed" });
      }
    }
    const order = req.body.order != null ? Number(req.body.order) : 0;
    const material = await prisma.courseMaterial.create({
      data: {
        courseId: req.params.courseId,
        title: req.body.title.trim(),
        fileUrl,
        order,
      },
    });
    res.status(201).json(material);
  }
);

/** Imam/Admin: update material */
router.put(
  "/:courseId/materials/:materialId",
  authMiddleware,
  requireRole("IMAM", "ADMIN"),
  upload.single("file"),
  [body("title").optional().trim().notEmpty(), body("order").optional().isInt({ min: 0 })],
  async (req, res) => {
    const material = await prisma.courseMaterial.findFirst({
      where: { id: req.params.materialId, courseId: req.params.courseId },
    });
    if (!material) return res.status(404).json({ error: "Material not found" });
    const data: { title?: string; fileUrl?: string | null; order?: number } = {};
    if (req.body.title !== undefined) data.title = req.body.title.trim();
    if (req.body.order !== undefined) data.order = Number(req.body.order);
    if (req.file) {
      try {
        const result = await uploadBuffer(req.file.buffer, "gmsa/course-materials");
        data.fileUrl = result.secure_url;
      } catch (e) {
        console.error("Material upload error:", e);
        return res.status(502).json({ error: "File upload failed" });
      }
    }
    const updated = await prisma.courseMaterial.update({
      where: { id: req.params.materialId },
      data,
    });
    res.json(updated);
  }
);

/** Imam/Admin: delete material */
router.delete("/:courseId/materials/:materialId", authMiddleware, requireRole("IMAM", "ADMIN"), async (req, res) => {
  const material = await prisma.courseMaterial.findFirst({
    where: { id: req.params.materialId, courseId: req.params.courseId },
  });
  if (!material) return res.status(404).json({ error: "Material not found" });
  await prisma.courseMaterial.delete({ where: { id: req.params.materialId } });
  res.status(204).send();
});

export { router as coursesRoutes };
