import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware, requireRole } from "../middleware/auth";

const router = Router();

/** Imam/Admin: dashboard stats (khutbah, learning materials, courses) */
router.get("/stats", authMiddleware, requireRole("IMAM", "ADMIN"), async (_req, res) => {
  try {
    const [khutbahMaterials, learningMaterials, courses] = await Promise.all([
      prisma.khutbahMaterial.count(),
      prisma.learningMaterial.count(),
      prisma.course.count(),
    ]);
    res.json({
      khutbahMaterials,
      learningMaterials,
      courses,
    });
  } catch (err) {
    console.error("Imam stats error:", err);
    res.status(500).json({ error: "Failed to load statistics" });
  }
});

export { router as imamRoutes };
