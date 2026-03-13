import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware, requireRole } from "../middleware/auth";

const router = Router();

/** PRO/Admin: return content counts for dashboard statistics */
router.get("/stats", authMiddleware, requireRole("PRO", "ADMIN"), async (_req, res) => {
  try {
    const [events, announcements, blogPosts, galleryAlbums, timetables] =
      await Promise.all([
        prisma.event.count(),
        prisma.announcement.count(),
        prisma.blogPost.count(),
        prisma.galleryAlbum.count(),
        prisma.prayerTimetable.count(),
      ]);

    res.json({
      events,
      announcements,
      blogPosts,
      galleryAlbums,
      timetables,
    });
  } catch (err) {
    console.error("PRO stats error:", err);
    res.status(500).json({ error: "Failed to load statistics" });
  }
});

export { router as proRoutes };
