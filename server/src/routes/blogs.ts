import { Router } from "express";
import { body, validationResult } from "express-validator";
import { prisma } from "../lib/prisma";
import { authMiddleware, requireRole, optionalAuth } from "../middleware/auth";

const router = Router();

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

router.get("/", async (req, res) => {
  const posts = await prisma.blogPost.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: "desc" },
    include: {
      author: { select: { id: true, name: true } },
      _count: { select: { likes: true, comments: true, reshares: true } },
    },
  });
  res.json(posts);
});

router.get("/:id", optionalAuth, async (req, res) => {
  const post = await prisma.blogPost.findFirst({
    where: { OR: [{ id: req.params.id }, { slug: req.params.id }] },
    include: {
      author: { select: { id: true, name: true } },
      comments: { include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
      _count: { select: { likes: true, reshares: true } },
    },
  });
  if (!post) return res.status(404).json({ error: "Post not found" });
  let userLiked = false;
  let userReshared = false;
  if (req.user) {
    const [like, reshare] = await Promise.all([
      prisma.blogLike.findUnique({ where: { postId_userId: { postId: post.id, userId: req.user!.userId } } }),
      prisma.blogReshare.findUnique({ where: { postId_userId: { postId: post.id, userId: req.user!.userId } } }),
    ]);
    userLiked = !!like;
    userReshared = !!reshare;
  }
  res.json({ ...post, userLiked, userReshared });
});

router.post(
  "/",
  authMiddleware,
  requireRole("ADMIN", "PRO"),
  [body("title").trim().notEmpty(), body("body").trim().notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const slug = slugify(req.body.title) + "-" + Date.now();
    const post = await prisma.blogPost.create({
      data: {
        title: req.body.title,
        slug,
        body: req.body.body,
        authorId: req.user!.userId,
        coverImageUrl: req.body.coverImageUrl,
        publishedAt: req.body.publish ? new Date() : null,
      },
    });
    res.status(201).json(post);
  }
);

router.put("/:id", authMiddleware, requireRole("ADMIN", "PRO"), async (req, res) => {
  const allowed = ["title", "body", "coverImageUrl", "publish"];
  const data: Record<string, unknown> = {};
  for (const k of allowed) {
    if (req.body[k] !== undefined) data[k] = req.body[k];
  }
  if (data.publish === true) data.publishedAt = new Date();
  delete data.publish;
  const post = await prisma.blogPost.update({
    where: { id: req.params.id },
    data: data as any,
  });
  res.json(post);
});

router.delete("/:id", authMiddleware, requireRole("ADMIN", "PRO"), async (req, res) => {
  await prisma.blogPost.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

router.post("/:id/like", authMiddleware, async (req, res) => {
  await prisma.blogLike.upsert({
    where: { postId_userId: { postId: req.params.id, userId: req.user!.userId } },
    create: { postId: req.params.id, userId: req.user!.userId },
    update: {},
  });
  const count = await prisma.blogLike.count({ where: { postId: req.params.id } });
  res.json({ liked: true, count });
});

router.delete("/:id/like", authMiddleware, async (req, res) => {
  await prisma.blogLike.deleteMany({
    where: { postId: req.params.id, userId: req.user!.userId },
  });
  const count = await prisma.blogLike.count({ where: { postId: req.params.id } });
  res.json({ liked: false, count });
});

router.post("/:id/comment", authMiddleware, body("body").trim().notEmpty(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const comment = await prisma.blogComment.create({
    data: { postId: req.params.id, userId: req.user!.userId, body: req.body.body },
    include: { user: { select: { name: true } } },
  });
  res.status(201).json(comment);
});

router.post("/:id/reshare", authMiddleware, async (req, res) => {
  await prisma.blogReshare.upsert({
    where: { postId_userId: { postId: req.params.id, userId: req.user!.userId } },
    create: { postId: req.params.id, userId: req.user!.userId },
    update: {},
  });
  const count = await prisma.blogReshare.count({ where: { postId: req.params.id } });
  res.json({ reshared: true, count });
});

export { router as blogRoutes };
