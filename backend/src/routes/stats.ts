import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import Post from '../models/Post';

const router = Router();

router.get('/dashboard', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const userId = user._id;

    const [total, scheduled, published, failed, recent, byNetwork] = await Promise.all([
      Post.countDocuments({ userId }),
      Post.countDocuments({ userId, status: 'scheduled' }),
      Post.countDocuments({ userId, status: 'published' }),
      Post.countDocuments({ userId, status: 'failed' }),
      Post.find({ userId }).sort({ createdAt: -1 }).limit(5),
      Post.aggregate([
        { $match: { userId } },
        { $unwind: '$networks' },
        { $group: { _id: '$networks.network', count: { $sum: 1 }, published: { $sum: { $cond: [{ $eq: ['$networks.status', 'published'] }, 1, 0] } } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    // Posts por día (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const postsByDay = await Post.aggregate([
      { $match: { userId, createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      stats: { total, scheduled, published, failed, draft: total - scheduled - published - failed },
      recent,
      byNetwork,
      postsByDay,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
