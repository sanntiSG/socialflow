import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Get supported networks config
router.get('/supported', (req: Request, res: Response) => {
  const networks = [
    { id: 'instagram', name: 'Instagram', color: '#E1306C', icon: 'instagram', supportsVideo: true, supportsImage: true },
    { id: 'tiktok', name: 'TikTok', color: '#000000', icon: 'tiktok', supportsVideo: true, supportsImage: false },
    { id: 'youtube', name: 'YouTube', color: '#FF0000', icon: 'youtube', supportsVideo: true, supportsImage: false },
    { id: 'facebook', name: 'Facebook', color: '#1877F2', icon: 'facebook', supportsVideo: true, supportsImage: true },
    { id: 'twitter', name: 'X (Twitter)', color: '#000000', icon: 'twitter', supportsVideo: true, supportsImage: true },
    { id: 'linkedin', name: 'LinkedIn', color: '#0A66C2', icon: 'linkedin', supportsVideo: true, supportsImage: true },
  ];
  res.json({ networks });
});

export default router;
