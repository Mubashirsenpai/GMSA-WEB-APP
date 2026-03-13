import { Router } from "express";
import multer from "multer";
import { prisma } from "../lib/prisma";
import { authMiddleware, requireRole } from "../middleware/auth";
import { uploadBuffer } from "../lib/cloudinary";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.get("/albums", async (_req, res) => {
  const albums = await prisma.galleryAlbum.findMany({
    orderBy: { createdAt: "desc" },
    include: { images: true },
  });
  res.json(albums);
});

router.get("/albums/:id", async (req, res) => {
  const album = await prisma.galleryAlbum.findUnique({
    where: { id: req.params.id },
    include: { images: true },
  });
  if (!album) return res.status(404).json({ error: "Album not found" });
  res.json(album);
});

router.post("/albums", authMiddleware, requireRole("ADMIN", "PRO"), async (req, res) => {
  const { name } = req.body;
  const album = await prisma.galleryAlbum.create({ data: { name: name || "New Album" } });
  res.status(201).json(album);
});

router.put("/albums/:id", authMiddleware, requireRole("ADMIN", "PRO"), async (req, res) => {
  const { name, coverImageUrl } = req.body;
  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = String(name).trim() || "New Album";
  if (coverImageUrl !== undefined) data.coverImageUrl = coverImageUrl || null;
  const album = await prisma.galleryAlbum.update({
    where: { id: req.params.id },
    data: data as { name?: string; coverImageUrl?: string | null },
  });
  res.json(album);
});

router.post(
  "/albums/:id/upload",
  authMiddleware,
  requireRole("ADMIN", "PRO"),
  upload.single("image"),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file" });
    const result = await uploadBuffer(req.file.buffer, "gmsa/gallery");
    const image = await prisma.gallery.create({
      data: {
        albumId: req.params.id,
        title: req.body.title || req.file.originalname,
        imageUrl: result.secure_url,
        uploadedById: req.user!.userId,
      },
    });
    res.status(201).json(image);
  }
);

export { router as galleryRoutes };
