import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import Post from '../models/Post';
import { upload } from '../utils/cloudinary';
import { publishPost } from '../services/publisher';
import multer from 'multer';

const router = Router();

// Upload media (for scheduled posts only)
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});

// Create post
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const {
      mediaUrl,
      mediaPublicId,
      mediaType,
      mediaMimeType,
      networks,
      globalText,
      scheduledAt,
      publishNow,
      title,
    } = req.body;

    const post = await Post.create({
      userId: user._id,
      mediaUrl,
      mediaPublicId,
      mediaType,
      mediaMimeType,
      networks: networks || [],
      globalText,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      publishNow: publishNow || false,
      status: scheduledAt ? 'scheduled' : (publishNow ? 'publishing' : 'draft'),
      title,
    });

    // Publish immediately if requested
    if (publishNow) {
      publishPost(post._id.toString(), user._id.toString())
        .catch(err => console.error('Error publicando:', err));
    }

    res.status(201).json({ post });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error creando publicación' });
  }
});

// Upload file to cloudinary (for scheduled)
router.post('/upload', requireAuth, upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file as any;
    if (!file) return res.status(400).json({ error: 'No se recibió archivo' });

    res.json({
      url: file.path,
      publicId: file.filename,
      type: file.mimetype.startsWith('video/') ? 'video' : 'image',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all posts for user
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { status, page = 1, limit = 20 } = req.query;

    const query: any = { userId: user._id };
    if (status) query.status = status;

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Post.countDocuments(query);

    res.json({ posts, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single post
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const post = await Post.findOne({ _id: req.params.id, userId: user._id });
    if (!post) return res.status(404).json({ error: 'Publicación no encontrada' });
    res.json({ post });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update post
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, userId: user._id, status: { $in: ['draft', 'scheduled'] } },
      req.body,
      { new: true }
    );
    if (!post) return res.status(404).json({ error: 'Publicación no encontrada o no editable' });
    res.json({ post });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete post
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const post = await Post.findOneAndDelete({ _id: req.params.id, userId: user._id });
    if (!post) return res.status(404).json({ error: 'Publicación no encontrada' });
    res.json({ message: 'Publicación eliminada' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
