import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware, requireRole } from "../middleware/auth";

const router = Router();

/** Secretary/Admin: return registration-related counts for dashboard statistics */
router.get("/stats", authMiddleware, requireRole("SECRETARY", "ADMIN"), async (_req, res) => {
  try {
    const [
      pendingMembers,
      pendingAlumni,
      approvedMembers,
      eventRegistrations,
      madrasaRegistrations,
    ] = await Promise.all([
      prisma.member.count({ where: { status: "PENDING" } }),
      prisma.alumni.count({ where: { status: "PENDING" } }),
      prisma.member.count({ where: { status: "APPROVED" } }),
      prisma.eventRegistration.count(),
      prisma.madrasaRegistration.count({ where: { status: "APPROVED" } }),
    ]);

    const approvedAlumni = await prisma.alumni.count({ where: { status: "APPROVED" } });

    res.json({
      pendingMembers,
      pendingAlumni,
      pendingApprovals: pendingMembers + pendingAlumni,
      approvedMembers,
      approvedAlumni,
      eventRegistrations,
      madrasaRegistrations,
    });
  } catch (err) {
    console.error("Secretary stats error:", err);
    res.status(500).json({ error: "Failed to load statistics" });
  }
});

export { router as secretaryRoutes };
