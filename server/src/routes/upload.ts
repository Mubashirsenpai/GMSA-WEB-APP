import { Router } from "express";
import multer from "multer";
import { authMiddleware, requireRole } from "../middleware/auth";
import { uploadBuffer } from "../lib/cloudinary";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only JPEG, PNG, WebP and GIF images are allowed"));
  },
});

/** Upload a single image (e.g. cover for event or blog). Returns { url }. */
router.post(
  "/image",
  authMiddleware,
  requireRole("ADMIN", "PRO"),
  upload.single("file"),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No image file provided" });
    try {
      const result = await uploadBuffer(req.file.buffer, "gmsa/covers");
      res.json({ url: result.secure_url });
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "";
      const name = err && typeof err === "object" && "name" in err ? String((err as { name: string }).name) : "";
      if (msg && (msg.includes("API key") || msg.includes("401") || msg.includes("Invalid"))) {
        console.error("Cloudinary upload failed (check CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME in .env):", msg);
        return res.status(502).json({ error: "Image upload is not configured. Please set Cloudinary keys in server .env." });
      }
      if (name === "TimeoutError" || msg.includes("Timeout") || msg.includes("timeout") || msg.includes("ETIMEDOUT")) {
        console.error("Cloudinary upload timeout:", err);
        return res.status(504).json({ error: "Upload timed out. Please try again or use a smaller image." });
      }
      console.error("Upload error:", err);
      res.status(502).json({ error: "Image upload failed. Please try again." });
    }
  }
);

export { router as uploadRoutes };
