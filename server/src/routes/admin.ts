import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware, requireRole } from "../middleware/auth";

const router = Router();

/** Admin-only: return counts for dashboard statistics */
router.get("/stats", authMiddleware, requireRole("ADMIN"), async (_req, res) => {
  try {
    const [
      users,
      executives,
      events,
      announcements,
      blogPosts,
      galleryAlbums,
      timetables,
      khutbahMaterials,
      learningMaterials,
      pendingMembers,
      pendingAlumni,
      approvedMembers,
      suggestions,
      donations,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.executive.count(),
      prisma.event.count(),
      prisma.announcement.count(),
      prisma.blogPost.count(),
      prisma.galleryAlbum.count(),
      prisma.prayerTimetable.count(),
      prisma.khutbahMaterial.count(),
      prisma.learningMaterial.count(),
      prisma.member.count({ where: { status: "PENDING" } }),
      prisma.alumni.count({ where: { status: "PENDING" } }),
      prisma.member.count({ where: { status: "APPROVED" } }),
      prisma.suggestion.count(),
      prisma.donation.count(),
    ]);

    res.json({
      users,
      executives,
      events,
      announcements,
      blogPosts,
      galleryAlbums,
      timetables,
      khutbahMaterials,
      learningMaterials,
      pendingMembers,
      pendingAlumni,
      pendingApprovals: pendingMembers + pendingAlumni,
      approvedMembers,
      suggestions,
      donations,
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ error: "Failed to load statistics" });
  }
});

export { router as adminRoutes };
